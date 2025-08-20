-- Fix profiles RLS recursion by using JWT claims (no self-reference)
-- Date: 2025-08-20
-- Purpose:
--   - Remove self-referential admin policy on profiles causing recursion (42P17)
--   - Recreate policies using auth.jwt()->>'role' to avoid selecting profiles
--   - Keep user self-access policies
-- Notes:
--   - Service role already bypasses RLS, but we also allow claim 'service_role'
--   - anon should not be able to update; authenticated users can update own row
--   - Admins with JWT role=admin can manage all rows

begin;

-- 1) Clean up previous helper/policies that may cause recursion
do $$
begin
  if exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'profiles'
      and policyname = 'Admins can view all profiles'
  ) then
    execute 'drop policy "Admins can view all profiles" on public.profiles';
  end if;

  if exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'profiles'
      and policyname = 'Admins can manage profiles (func)'
  ) then
    execute 'drop policy "Admins can manage profiles (func)" on public.profiles';
  end if;

  if exists (
    select 1
    from pg_proc
    where proname = 'is_admin'
      and pg_function_is_visible(oid)
  ) then
    execute 'drop function if exists public.is_admin(uuid)';
  end if;
end;
$$;

-- 2) Ensure RLS is enabled
alter table public.profiles enable row level security;

-- 3) Recreate essential self-access policies
drop policy if exists "Users can view own profile" on public.profiles;
create policy "Users can view own profile"
on public.profiles
for select
to authenticated
using (auth.uid() = id);

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
on public.profiles
for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

-- 4) Admin policy using JWT role claim to avoid recursive SELECT on profiles
drop policy if exists "Admins can manage profiles (jwt)" on public.profiles;
create policy "Admins can manage profiles (jwt)"
on public.profiles
for all
to authenticated
using (
  coalesce(auth.jwt() ->> 'role','') in ('admin','service_role')
)
with check (
  coalesce(auth.jwt() ->> 'role','') in ('admin','service_role')
);

comment on policy "Admins can manage profiles (jwt)" on public.profiles is
'Admins (auth.jwt role=admin) can manage profiles without recursive lookups';

commit;
