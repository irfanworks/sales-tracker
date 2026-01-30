-- Sales Tracker: Schema + RLS
-- Jalankan di Supabase SQL Editor (Dashboard > SQL Editor)

-- 1. Tabel profiles (untuk role: admin / sales)
-- Bisa dibuat manual atau via trigger saat user baru sign up
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  role text not null default 'sales' check (role in ('admin', 'sales')),
  updated_at timestamptz default now()
);

-- Trigger: buat profile otomatis saat user baru
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.email),
    coalesce(new.raw_user_meta_data->>'role', 'sales')
  );
  return new;
end;
$$ language plpgsql security definer;

-- Hapus trigger lama jika ada, lalu buat baru
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Helper: cek role tanpa baca profiles lewat RLS (hindari infinite recursion)
create or replace function public.get_my_role()
returns text
language sql
security definer
stable
set search_path = public
as $$
  select role from public.profiles where id = auth.uid() limit 1;
$$;

-- RLS profiles
alter table public.profiles enable row level security;

create policy "Users can read own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile (limited)"
  on public.profiles for update
  using (auth.uid() = id);

-- Admin bisa baca semua profile (pakai get_my_role agar tidak rekursi)
create policy "Admin can read all profiles"
  on public.profiles for select
  using (public.get_my_role() = 'admin');

-- 2. Tabel customers
create table if not exists public.customers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  sector text not null check (sector in ('Data Center', 'Oil and Gas', 'Commercial', 'Industrial', 'Mining')),
  created_at timestamptz default now()
);

-- 2b. Tabel customer_pics (PIC per customer, optional)
create table if not exists public.customer_pics (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.customers(id) on delete cascade,
  nama_pic text,
  email text,
  no_hp text,
  jabatan text,
  created_at timestamptz default now()
);
alter table public.customer_pics enable row level security;
create policy "Authenticated can manage customer_pics" on public.customer_pics for all to authenticated using (true) with check (true);

alter table public.customers enable row level security;

-- Semua user yang login bisa baca (admin + sales)
create policy "Authenticated can read customers"
  on public.customers for select
  to authenticated
  using (true);

-- Semua user yang login bisa insert/update/delete (admin + sales)
create policy "Authenticated can insert customers"
  on public.customers for insert
  to authenticated
  with check (true);

create policy "Authenticated can update customers"
  on public.customers for update
  to authenticated
  using (true)
  with check (true);

create policy "Authenticated can delete customers"
  on public.customers for delete
  to authenticated
  using (true);

-- 3. Tabel projects
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  no_quote text not null,
  project_name text not null,
  customer_id uuid not null references public.customers(id) on delete restrict,
  value numeric not null default 0,
  status text,
  progress_type text not null check (progress_type in ('Budgetary', 'Tender', 'Win', 'Loss')),
  prospect text not null default 'Normal' check (prospect in ('Hot Prospect', 'Normal')),
  created_by uuid references auth.users(id) on delete set null,
  created_by_name text
);

-- 3b. Tabel project_updates (riwayat update per project)
create table if not exists public.project_updates (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  update_text text not null,
  created_at timestamptz default now(),
  created_by uuid references auth.users(id) on delete set null,
  created_by_name text
);
alter table public.project_updates enable row level security;
create policy "Authenticated can manage project_updates" on public.project_updates for all to authenticated using (true) with check (true);

alter table public.projects enable row level security;

-- Sales: bisa lihat semua project (kebijakan: sales bisa input, admin bisa edit semua)
-- Jika ingin sales hanya lihat milik sendiri, ganti policy SELECT jadi: created_by = auth.uid() or (select role from profiles where id = auth.uid()) = 'admin'
create policy "Authenticated can read projects"
  on public.projects for select
  to authenticated
  using (true);

-- Hanya authenticated bisa insert; created_by di-set oleh app atau default current user
create policy "Authenticated can insert projects"
  on public.projects for insert
  to authenticated
  with check (true);

-- Admin bisa update/delete semua; sales bisa update/delete milik sendiri (pakai get_my_role agar tidak rekursi)
create policy "Admin can update any project"
  on public.projects for update
  to authenticated
  using (public.get_my_role() = 'admin')
  with check (true);

create policy "Sales can update own project"
  on public.projects for update
  to authenticated
  using (
    (created_by = auth.uid() or created_by is null)
    and public.get_my_role() is distinct from 'admin'
  )
  with check (true);

create policy "Admin can delete any project"
  on public.projects for delete
  to authenticated
  using (public.get_my_role() = 'admin');

create policy "Sales can delete own project"
  on public.projects for delete
  to authenticated
  using (
    (created_by = auth.uid() or created_by is null)
    and public.get_my_role() is distinct from 'admin'
  );

-- Opsional: set created_by otomatis
create or replace function public.set_project_created_by()
returns trigger as $$
begin
  if new.created_by is null then
    new.created_by := auth.uid();
  end if;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists set_project_created_by_trigger on public.projects;
create trigger set_project_created_by_trigger
  before insert on public.projects
  for each row execute function public.set_project_created_by();
