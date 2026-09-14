-- Run this once in the Supabase SQL editor for a project that already ran
-- schema.sql. Switches the profile-creation trigger to use the display name
-- chosen at sign-up (instead of deriving one from the email), and makes
-- display names required, non-blank, and unique (case-insensitive).

create or replace function public.handle_new_user()
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

-- Existing rows won't have a display name in user metadata, or may contain
-- non-ASCII characters that would now be rejected, so give them a
-- placeholder before the constraints below would otherwise reject them.
-- Safe no-op if this is a fresh project.
update public.profiles
set display_name = 'Player ' || substr(id::text, 1, 8)
where display_name is null
  or char_length(trim(display_name)) = 0
  or display_name !~ '^[\x20-\x7E]+$';

alter table public.profiles
  add constraint profiles_display_name_check
  check (
    char_length(trim(display_name)) between 1 and 30
    and display_name ~ '^[\x20-\x7E]+$'
  );

create unique index profiles_display_name_key on public.profiles (lower(display_name));
