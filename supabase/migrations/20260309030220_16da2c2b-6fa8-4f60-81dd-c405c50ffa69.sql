
-- 1. Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Anyone can read profiles
CREATE POLICY "Public read profiles" ON public.profiles
  FOR SELECT USING (true);

-- Users can update only their own profile
CREATE POLICY "Users update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Users can insert their own profile
CREATE POLICY "Users insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- 2. Create savings_boxes table
CREATE TABLE public.savings_boxes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT 'My Savings Box',
  description TEXT,
  goal_amount INTEGER NOT NULL DEFAULT 10000,
  slug TEXT NOT NULL UNIQUE,
  stripe_account_id TEXT,
  stripe_onboarding_complete BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.savings_boxes ENABLE ROW LEVEL SECURITY;

-- Anyone can read savings boxes
CREATE POLICY "Public read savings_boxes" ON public.savings_boxes
  FOR SELECT USING (true);

-- Only owner can insert
CREATE POLICY "Owner insert savings_boxes" ON public.savings_boxes
  FOR INSERT WITH CHECK (auth.uid() = owner_id);

-- Only owner can update
CREATE POLICY "Owner update savings_boxes" ON public.savings_boxes
  FOR UPDATE USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

-- Only owner can delete
CREATE POLICY "Owner delete savings_boxes" ON public.savings_boxes
  FOR DELETE USING (auth.uid() = owner_id);

-- 3. Add box_id to grid_cells
ALTER TABLE public.grid_cells ADD COLUMN box_id UUID REFERENCES public.savings_boxes(id) ON DELETE CASCADE;

-- 4. Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email));
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 5. Enable realtime for savings_boxes
ALTER PUBLICATION supabase_realtime ADD TABLE public.savings_boxes;
