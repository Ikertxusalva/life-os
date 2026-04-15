-- ============================================
-- 00003_rls.sql — Row Level Security
-- ============================================

ALTER TABLE public.life_areas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.habit_entries ENABLE ROW LEVEL SECURITY;

-- life_areas policies
CREATE POLICY "Users can view own life_areas"
  ON public.life_areas FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own life_areas"
  ON public.life_areas FOR UPDATE
  USING (auth.uid() = user_id);

-- habits policies
CREATE POLICY "Users can CRUD own habits"
  ON public.habits FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- habit_entries policies
CREATE POLICY "Users can CRUD own habit_entries"
  ON public.habit_entries FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
