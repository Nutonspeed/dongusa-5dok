-- Fix RLS recursion on profiles by using SECURITY DEFINER helper
-- Date: 2025-08-20
-- Purpose: Replace self-referential policy with is_admin() function to
-- avoid "infinite recursion detected in policy for relation 'profiles'"

begin;

-- Helper function: check admin via SECURITY DEFINER to bypass RLS recursion
create or replace function public.is_admin(uid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = uid
      and p.role = 'admin'
  );
$$;

-- Ensure execution permission for authenticated users (and service role)
grant execute on function public.is_admin(uuid) to authenticated, anon;

-- Replace recursive admin policy on profiles
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
end;
$$;

-- Admins full access via helper function (no recursion)
create policy "Admins can manage profiles (func)"
on public.profiles
for all
to authenticated
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));

comment on function public.is_admin(uuid) is
'SECURITY DEFINER helper to check if auth.uid() is admin without RLS recursion';

comment on policy "Admins can manage profiles (func)" on public.profiles is
'Admins can fully access profiles using is_admin() helper to prevent recursion';

commit;
