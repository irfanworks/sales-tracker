-- Fix: Sales bisa edit project yang created_by null (supaya "Edit" tidak gagal)
-- Jalankan sekali di Supabase SQL Editor

-- Hapus policy lama lalu buat ulang dengan kondisi (created_by = auth.uid() OR created_by is null)
drop policy if exists "Sales can update own project" on public.projects;
create policy "Sales can update own project"
  on public.projects for update
  to authenticated
  using (
    (created_by = auth.uid() or created_by is null)
    and not exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  )
  with check (true);

drop policy if exists "Sales can delete own project" on public.projects;
create policy "Sales can delete own project"
  on public.projects for delete
  to authenticated
  using (
    (created_by = auth.uid() or created_by is null)
    and not exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );
