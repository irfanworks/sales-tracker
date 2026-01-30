-- 1. Fix infinite recursion: gunakan fungsi SECURITY DEFINER untuk cek role
--    (policy tidak boleh SELECT dari profiles karena itu memicu RLS profiles lagi)
create or replace function public.get_my_role()
returns text
language sql
security definer
stable
set search_path = public
as $$
  select role from public.profiles where id = auth.uid() limit 1;
$$;

-- 2. Hapus policy profiles yang bikin rekursi, ganti pakai get_my_role()
drop policy if exists "Admin can read all profiles" on public.profiles;
create policy "Admin can read all profiles"
  on public.profiles for select
  using (public.get_my_role() = 'admin');

-- 3. Hapus policy projects yang baca profiles, ganti pakai get_my_role()
drop policy if exists "Admin can update any project" on public.projects;
create policy "Admin can update any project"
  on public.projects for update
  to authenticated
  using (public.get_my_role() = 'admin')
  with check (true);

drop policy if exists "Sales can update own project" on public.projects;
create policy "Sales can update own project"
  on public.projects for update
  to authenticated
  using (
    (created_by = auth.uid() or created_by is null)
    and public.get_my_role() is distinct from 'admin'
  )
  with check (true);

drop policy if exists "Admin can delete any project" on public.projects;
create policy "Admin can delete any project"
  on public.projects for delete
  to authenticated
  using (public.get_my_role() = 'admin');

drop policy if exists "Sales can delete own project" on public.projects;
create policy "Sales can delete own project"
  on public.projects for delete
  to authenticated
  using (
    (created_by = auth.uid() or created_by is null)
    and public.get_my_role() is distinct from 'admin'
  );

-- 4. Tambah kolom nama sales (yang input data) di projects
alter table public.projects
  add column if not exists created_by_name text;

-- 5. Backfill: isi created_by_name dari profiles untuk row yang sudah ada
update public.projects p
set created_by_name = coalesce(pr.full_name, pr.email, '')
from public.profiles pr
where p.created_by = pr.id and (p.created_by_name is null or p.created_by_name = '');