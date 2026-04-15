-- ============================================
-- 00001_base.sql — Life Areas + Common Triggers
-- ============================================

-- Reusable updated_at trigger function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Central table: all modules reference this
CREATE TABLE public.life_areas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  slug TEXT NOT NULL,
  name TEXT NOT NULL,
  icon TEXT,
  color TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, slug)
);

CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.life_areas
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Auto-seed 8 life areas when a new user signs up
CREATE OR REPLACE FUNCTION public.seed_life_areas()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.life_areas (user_id, slug, name, icon, color, sort_order)
  VALUES
    (NEW.id, 'habits',       'Hábitos personales',       'target',      'emerald', 1),
    (NEW.id, 'health',       'Salud y fitness',          'heart-pulse', 'red',     2),
    (NEW.id, 'projects',     'Proyectos profesionales',  'briefcase',   'blue',    3),
    (NEW.id, 'finances',     'Metas financieras',        'landmark',    'amber',   4),
    (NEW.id, 'mindset',      'Mentalidad y emociones',   'brain',       'purple',  5),
    (NEW.id, 'relationship', 'Relación de pareja',       'heart',       'pink',    6),
    (NEW.id, 'social',       'Social y amistades',       'users',       'cyan',    7),
    (NEW.id, 'learning',     'Aprendizaje y formación',  'book-open',   'orange',  8);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created_seed_areas
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.seed_life_areas();
