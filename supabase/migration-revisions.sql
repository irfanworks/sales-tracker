-- Revisi: Sector, PICs, Progress Type, Prospect, Project Updates
-- Jalankan di Supabase SQL Editor

-- 1. Customer: tambah sector (required)
alter table public.customers
  add column if not exists sector text;

-- Set default untuk row yang sudah ada
update public.customers set sector = 'Commercial' where sector is null;

alter table public.customers alter column sector set not null;
alter table public.customers drop constraint if exists customers_sector_check;
alter table public.customers add constraint customers_sector_check check (
  sector in ('Data Center', 'Oil and Gas', 'Commercial', 'Industrial', 'Mining')
);

-- 2. Tabel customer_pics (PIC per customer, optional fields)
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

create policy "Authenticated can read customer_pics"
  on public.customer_pics for select to authenticated using (true);
create policy "Authenticated can insert customer_pics"
  on public.customer_pics for insert to authenticated with check (true);
create policy "Authenticated can update customer_pics"
  on public.customer_pics for update to authenticated using (true) with check (true);
create policy "Authenticated can delete customer_pics"
  on public.customer_pics for delete to authenticated using (true);

-- 3. Projects: tambah prospect, ubah progress_type, hapus weekly_update
alter table public.projects add column if not exists prospect text default 'Normal';
update public.projects set prospect = 'Normal' where prospect is null;
alter table public.projects
  alter column prospect set not null,
  add constraint projects_prospect_check check (prospect in ('Hot Prospect', 'Normal'));

-- Hapus constraint lama progress_type lalu tambah baru (Budgetary, Tender, Win, Loss)
alter table public.projects drop constraint if exists projects_progress_type_check;
alter table public.projects add constraint projects_progress_type_check check (
  progress_type in ('Budgetary', 'Tender', 'Win', 'Loss')
);

alter table public.projects drop column if exists weekly_update;

-- 4. Tabel project_updates (riwayat update per project)
create table if not exists public.project_updates (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  update_text text not null,
  created_at timestamptz default now(),
  created_by uuid references auth.users(id) on delete set null,
  created_by_name text
);

alter table public.project_updates enable row level security;

create policy "Authenticated can read project_updates"
  on public.project_updates for select to authenticated using (true);
create policy "Authenticated can insert project_updates"
  on public.project_updates for insert to authenticated with check (true);
create policy "Authenticated can update project_updates"
  on public.project_updates for update to authenticated using (true) with check (true);
create policy "Authenticated can delete project_updates"
  on public.project_updates for delete to authenticated using (true);

-- 5. Backfill created_by_name dari profiles (agar kolom Sales tampil Display Name, bukan email)
update public.projects p
set created_by_name = coalesce(pr.full_name, pr.email, p.created_by_name)
from public.profiles pr
where p.created_by = pr.id and (p.created_by_name is null or p.created_by_name = '' or p.created_by_name like '%@%');
