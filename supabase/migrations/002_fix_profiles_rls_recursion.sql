-- Fix: infinite recursion in RLS when policies on profiles (or other tables) query profiles.
-- Use a SECURITY DEFINER function to get current user's role without triggering RLS.

CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS TEXT
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid() LIMIT 1;
$$;

-- Drop and recreate profiles policies that reference profiles
DROP POLICY IF EXISTS "Admins can read all profiles" ON public.profiles;
CREATE POLICY "Admins can read all profiles"
  ON public.profiles FOR SELECT
  USING (public.get_my_role() = 'admin');

-- Customers: replace profiles lookup with get_my_role()
DROP POLICY IF EXISTS "Sales can insert customers" ON public.customers;
CREATE POLICY "Sales can insert customers"
  ON public.customers FOR INSERT
  TO authenticated
  WITH CHECK (public.get_my_role() IN ('admin', 'sales'));

DROP POLICY IF EXISTS "Sales can update customers" ON public.customers;
CREATE POLICY "Sales can update customers"
  ON public.customers FOR UPDATE
  TO authenticated
  USING (public.get_my_role() IN ('admin', 'sales'));

DROP POLICY IF EXISTS "Sales can delete customers" ON public.customers;
CREATE POLICY "Sales can delete customers"
  ON public.customers FOR DELETE
  TO authenticated
  USING (public.get_my_role() IN ('admin', 'sales'));

-- Projects: replace profiles lookup with get_my_role()
DROP POLICY IF EXISTS "Admin can read all projects" ON public.projects;
CREATE POLICY "Admin can read all projects"
  ON public.projects FOR SELECT
  TO authenticated
  USING (public.get_my_role() = 'admin');

DROP POLICY IF EXISTS "Admin can update any project" ON public.projects;
CREATE POLICY "Admin can update any project"
  ON public.projects FOR UPDATE
  TO authenticated
  USING (public.get_my_role() = 'admin');

DROP POLICY IF EXISTS "Admin can delete any project" ON public.projects;
CREATE POLICY "Admin can delete any project"
  ON public.projects FOR DELETE
  TO authenticated
  USING (public.get_my_role() = 'admin');

-- Project updates: replace profiles lookup with get_my_role()
DROP POLICY IF EXISTS "Read project_updates if can read project" ON public.project_updates;
CREATE POLICY "Read project_updates if can read project"
  ON public.project_updates FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.projects pr
      WHERE pr.id = project_updates.project_id
      AND (pr.sales_id = auth.uid() OR public.get_my_role() = 'admin')
    )
  );

DROP POLICY IF EXISTS "Insert project_updates if can update project" ON public.project_updates;
CREATE POLICY "Insert project_updates if can update project"
  ON public.project_updates FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.projects pr
      WHERE pr.id = project_updates.project_id
      AND (pr.sales_id = auth.uid() OR public.get_my_role() = 'admin')
    )
  );
