-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles: extend auth.users with role (admin | sales)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  role TEXT NOT NULL DEFAULT 'sales' CHECK (role IN ('admin', 'sales')),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Customers: master data (sales can add/edit/delete)
CREATE TABLE public.customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Projects: sales data
CREATE TABLE public.projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  no_quote TEXT NOT NULL,
  project_name TEXT NOT NULL,
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE RESTRICT,
  value NUMERIC NOT NULL DEFAULT 0,
  status TEXT,
  progress_type TEXT NOT NULL CHECK (progress_type IN ('Budgetary', 'Tender', 'Win', 'Lose')),
  prospect TEXT NOT NULL CHECK (prospect IN ('Hot Prospect', 'Normal')),
  weekly_update TEXT,
  sales_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Project updates history (untuk riwayat Project Update)
CREATE TABLE public.project_updates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Indexes
CREATE INDEX idx_projects_sales_id ON public.projects(sales_id);
CREATE INDEX idx_projects_customer_id ON public.projects(customer_id);
CREATE INDEX idx_projects_progress_type ON public.projects(progress_type);
CREATE INDEX idx_projects_prospect ON public.projects(prospect);
CREATE INDEX idx_project_updates_project_id ON public.project_updates(project_id);

-- Trigger: auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name', 'sales');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Helper: get current user role without triggering RLS (avoids infinite recursion)
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS TEXT
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid() LIMIT 1;
$$;

-- RLS: enable on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_updates ENABLE ROW LEVEL SECURITY;

-- Profiles: user can read own; admin can read all (use get_my_role to avoid recursion)
CREATE POLICY "Users can read own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Admins can read all profiles"
  ON public.profiles FOR SELECT
  USING (public.get_my_role() = 'admin');

CREATE POLICY "Users can update own profile (limited)"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Customers: sales can CRUD; admin can CRUD; everyone authenticated can read
CREATE POLICY "Authenticated can read customers"
  ON public.customers FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Sales can insert customers"
  ON public.customers FOR INSERT
  TO authenticated
  WITH CHECK (public.get_my_role() IN ('admin', 'sales'));

CREATE POLICY "Sales can update customers"
  ON public.customers FOR UPDATE
  TO authenticated
  USING (public.get_my_role() IN ('admin', 'sales'));

CREATE POLICY "Sales can delete customers"
  ON public.customers FOR DELETE
  TO authenticated
  USING (public.get_my_role() IN ('admin', 'sales'));

-- Projects: sales see own + can insert own; admin see/edit all
CREATE POLICY "Sales can read own projects"
  ON public.projects FOR SELECT
  TO authenticated
  USING (sales_id = auth.uid());

CREATE POLICY "Admin can read all projects"
  ON public.projects FOR SELECT
  TO authenticated
  USING (public.get_my_role() = 'admin');

CREATE POLICY "Sales can insert own projects"
  ON public.projects FOR INSERT
  TO authenticated
  WITH CHECK (sales_id = auth.uid());

CREATE POLICY "Sales can update own projects"
  ON public.projects FOR UPDATE
  TO authenticated
  USING (sales_id = auth.uid())
  WITH CHECK (sales_id = auth.uid());

CREATE POLICY "Admin can update any project"
  ON public.projects FOR UPDATE
  TO authenticated
  USING (public.get_my_role() = 'admin');

CREATE POLICY "Sales can delete own projects"
  ON public.projects FOR DELETE
  TO authenticated
  USING (sales_id = auth.uid());

CREATE POLICY "Admin can delete any project"
  ON public.projects FOR DELETE
  TO authenticated
  USING (public.get_my_role() = 'admin');

-- Project updates: read if can read project; insert if can update project
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
