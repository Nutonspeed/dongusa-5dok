-- Prevent admin downgrade migration
-- Date: 2025-08-20
-- Purpose: Block changing profiles.role from 'admin' to non-admin unless the
-- request is authorized via service_role (JWT claims). Also audit attempts.

begin;

create table if not exists admin_role_change_attempts (
  id uuid default gen_random_uuid() primary key,
  actor_id uuid,
  target_id uuid,
  old_role text,
  new_role text,
  reason text,
  claims jsonb,
  created_at timestamptz default now()
);

-- Helper: read a key from request.jwt.claims (set by PostgREST/Supabase)
create or replace function public.get_jwt_claim(key text)
returns text
language plpgsql
as $$
declare
  raw text;
  claims jsonb;
begin
  raw := current_setting('request.jwt.claims', true);
  if raw is null or raw = '' then
    return null;
  end if;
  claims := raw::jsonb;
  return claims->>key;
end;
$$;

-- Helper: true if the current request is using service_role
create or replace function public.is_service_role()
returns boolean
language plpgsql
as $$
declare
  role text;
begin
  role := public.get_jwt_claim('role');
  return coalesce(role, '') = 'service_role';
end;
$$;

-- Trigger: prevent downgrading admin role unless service_role is used
create or replace function public.prevent_admin_downgrade()
returns trigger
language plpgsql
as $$
declare
  actor uuid;
  raw text;
begin
  if tg_op = 'UPDATE' then
    if old.role = 'admin' and new.role is distinct from 'admin' then
      if not public.is_service_role() then
        raw := current_setting('request.jwt.claims', true);
        actor := nullif(public.get_jwt_claim('sub'), '')::uuid;
        insert into admin_role_change_attempts(actor_id, target_id, old_role, new_role, reason, claims)
        values (actor, new.id, old.role, new.role, 'blocked_downgrade_admin', coalesce(raw::jsonb, '{}'::jsonb));
        raise exception 'Downgrading admin role is not allowed';
      end if;
    end if;
  end if;
  return new;
end;
$$;

-- Recreate trigger idempotently
do $$
begin
  if exists (
    select 1
    from pg_trigger t
    join pg_class c on c.oid = t.tgrelid
    where c.relname = 'profiles' and t.tgname = 't_prevent_admin_downgrade'
  ) then
    execute 'drop trigger t_prevent_admin_downgrade on public.profiles';
  end if;
end;
$$;

create trigger t_prevent_admin_downgrade
before update on public.profiles
for each row
execute function public.prevent_admin_downgrade();

comment on function public.prevent_admin_downgrade() is
'Block changing profiles.role from admin to non-admin unless service_role';

comment on function public.is_service_role() is
'Check if request.jwt.claims has role=service_role';

commit;
