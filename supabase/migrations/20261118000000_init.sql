-- Perfiles de usuario vinculados a auth.users
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  avatar_url text,
  locale text not null default 'es' check (locale in ('es', 'en')),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Cada usuario ve su perfil"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Cada usuario actualiza su perfil"
  on public.profiles for update
  using (auth.uid() = id);

-- Crear el perfil automáticamente al registrarse
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (new.id, new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'avatar_url');
  return new;
end;
$$;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
