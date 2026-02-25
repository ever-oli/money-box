
-- Add stripe_session_id column for tracking pending payments
ALTER TABLE public.grid_cells ADD COLUMN IF NOT EXISTS stripe_session_id TEXT;

-- Drop existing restrictive policies and create permissive ones
DROP POLICY IF EXISTS "Allow public read access to grid_cells" ON public.grid_cells;
DROP POLICY IF EXISTS "Allow public select cell" ON public.grid_cells;

-- Permissive SELECT for everyone
CREATE POLICY "Allow public read" ON public.grid_cells FOR SELECT USING (true);

-- Permissive UPDATE for everyone
CREATE POLICY "Allow public update" ON public.grid_cells FOR UPDATE USING (true) WITH CHECK (true);

-- Allow inserts (for seeding)
CREATE POLICY "Allow public insert" ON public.grid_cells FOR INSERT WITH CHECK (true);

-- Allow deletes (for reset)
CREATE POLICY "Allow public delete" ON public.grid_cells FOR DELETE USING (true);
