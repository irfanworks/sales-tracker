-- Customers: add sector
ALTER TABLE public.customers
  ADD COLUMN IF NOT EXISTS sector TEXT
  CHECK (sector IS NULL OR sector IN ('Data Center', 'Oil and Gas', 'Commercial', 'Industrial', 'Mining'));

-- Customer PICs: optional, multiple per customer
CREATE TABLE IF NOT EXISTS public.customer_pics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  nama TEXT,
  email TEXT,
  no_hp TEXT,
  jabatan TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_customer_pics_customer_id ON public.customer_pics(customer_id);

ALTER TABLE public.customer_pics ENABLE ROW LEVEL SECURITY;

-- Same access as customers: authenticated read; sales/admin can modify
CREATE POLICY "Authenticated can read customer_pics"
  ON public.customer_pics FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Sales can insert customer_pics"
  ON public.customer_pics FOR INSERT
  TO authenticated
  WITH CHECK (public.get_my_role() IN ('admin', 'sales'));

CREATE POLICY "Sales can update customer_pics"
  ON public.customer_pics FOR UPDATE
  TO authenticated
  USING (public.get_my_role() IN ('admin', 'sales'));

CREATE POLICY "Sales can delete customer_pics"
  ON public.customer_pics FOR DELETE
  TO authenticated
  USING (public.get_my_role() IN ('admin', 'sales'));

-- Profiles: add display_name (shown in Dashboard / Filter)
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS display_name TEXT;
