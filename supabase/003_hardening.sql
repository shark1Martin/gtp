-- Run this once in the Supabase SQL editor after 001 (schema.sql) and 002
-- (002_display_name.sql). Hardens RLS/constraints against a client calling
-- the REST API directly with the public anon key, bypassing the app's UI:
--   1. A user could otherwise submit a fabricated score (e.g. correct_count:
--      999999) since the insert policy only checked ownership, not values.
--   2. The profile update policy only had USING, not WITH CHECK.

drop policy "Users can update their own profile" on public.profiles;
create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- POINTS_PER_CORRECT (450) is duplicated from src/routes/index.tsx on
-- purpose: the client computes it, but the server independently re-checks
-- it so a direct REST API call can't submit a fabricated score.
alter table public.scores
  add constraint scores_range_check check (
    total between 1 and 20
    and correct_count between 0 and total
    and score = correct_count * 450
  );
