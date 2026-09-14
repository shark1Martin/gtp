-- Run this once in the Supabase SQL editor (Project -> SQL Editor -> New query)
-- for the "Guess the Porsche" quiz project.

-- Public profile row per user, auto-created on sign up. Holds the display
-- name shown on the leaderboard (we never expose auth.users.email directly).
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null check (
    char_length(trim(display_name)) between 1 and 30
    and display_name ~ '^[\x20-\x7E]+$'
  ),
  created_at timestamptz not null default now()
);

-- Case-insensitive uniqueness ("Max" and "max" collide).
create unique index profiles_display_name_key on public.profiles (lower(display_name));

alter table public.profiles enable row level security;

create policy "Profiles are publicly readable"
  on public.profiles for select
  using (true);

-- WITH CHECK is required here too (not just USING): without it, Postgres
-- would still fall back to USING for the post-update row, but being
-- explicit means a user can never move their profile onto someone else's id.
create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Creates a profile automatically whenever someone signs up, using the
-- display name they chose at sign-up (passed in as user metadata).
create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, new.raw_user_meta_data ->> 'display_name');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- One row per completed quiz run.
create table public.scores (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  correct_count int not null,
  total int not null,
  score int not null,
  created_at timestamptz not null default now()
);

alter table public.scores enable row level security;

create policy "Scores are publicly readable"
  on public.scores for select
  using (true);

create policy "Users can insert their own scores"
  on public.scores for insert
  with check (auth.uid() = user_id);

-- No update/delete policies: RLS default-denies both to every client (even
-- the row's own owner), so a submitted score is immutable and can't be
-- deleted through the API. Only the Supabase service role can touch it.

-- POINTS_PER_CORRECT (450) is duplicated from src/routes/index.tsx on
-- purpose: the client computes it, but the server independently re-checks
-- it so a direct REST API call can't submit a fabricated score.
alter table public.scores
  add constraint scores_range_check check (
    total between 1 and 20
    and correct_count between 0 and total
    and score = correct_count * 450
  );

create index scores_user_id_idx on public.scores (user_id);
create index scores_score_idx on public.scores (score desc);

-- Best score per user, for the leaderboard.
create view public.leaderboard as
select
  p.id as user_id,
  p.display_name,
  max(s.score) as best_score,
  count(s.id) as games_played,
  max(s.created_at) as last_played_at
from public.scores s
join public.profiles p on p.id = s.user_id
group by p.id, p.display_name
order by best_score desc;
