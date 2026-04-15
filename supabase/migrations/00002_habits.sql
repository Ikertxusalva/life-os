-- ============================================
-- 00002_habits.sql — Habits Module
-- ============================================

CREATE TYPE public.habit_type AS ENUM ('binary', 'quantitative', 'negative', 'frequency');
CREATE TYPE public.frequency_period AS ENUM ('daily', 'weekly', 'monthly');

CREATE TABLE public.habits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  life_area_id UUID NOT NULL REFERENCES public.life_areas(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  habit_type public.habit_type NOT NULL DEFAULT 'binary',
  icon TEXT,
  color TEXT,
  frequency_period public.frequency_period NOT NULL DEFAULT 'daily',
  frequency_target INT NOT NULL DEFAULT 1,
  frequency_days INT[],
  unit TEXT,
  target_value NUMERIC,
  grace_days INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_archived BOOLEAN NOT NULL DEFAULT false,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.habits
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TABLE public.habit_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  habit_id UUID NOT NULL REFERENCES public.habits(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  entry_date DATE NOT NULL,
  completed BOOLEAN NOT NULL DEFAULT false,
  value NUMERIC,
  note TEXT,
  energy_level INT CHECK (energy_level BETWEEN 1 AND 5),
  context_tag TEXT,
  skip_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(habit_id, entry_date)
);

-- Streak calculation function
-- Walks entries backwards from today, respecting grace_days
CREATE OR REPLACE FUNCTION public.get_habit_streak(
  p_habit_id UUID,
  p_today DATE DEFAULT CURRENT_DATE
)
RETURNS TABLE(current_streak INT, longest_streak INT, total_completions INT)
AS $$
DECLARE
  v_grace_days INT;
  v_current INT := 0;
  v_longest INT := 0;
  v_total INT := 0;
  v_streak INT := 0;
  v_prev_date DATE;
  rec RECORD;
BEGIN
  SELECT grace_days INTO v_grace_days
  FROM public.habits WHERE id = p_habit_id;

  IF v_grace_days IS NULL THEN
    v_grace_days := 0;
  END IF;

  FOR rec IN
    SELECT entry_date, completed
    FROM public.habit_entries
    WHERE habit_id = p_habit_id AND completed = true
    ORDER BY entry_date DESC
  LOOP
    v_total := v_total + 1;

    IF v_prev_date IS NULL THEN
      -- First completed entry: is it recent enough?
      IF (p_today - rec.entry_date) <= (1 + v_grace_days) THEN
        v_streak := 1;
      ELSE
        v_streak := 0;
      END IF;
    ELSE
      IF (v_prev_date - rec.entry_date) <= (1 + v_grace_days) THEN
        v_streak := v_streak + 1;
      ELSE
        IF v_streak > v_longest THEN v_longest := v_streak; END IF;
        v_streak := 1;
      END IF;
    END IF;

    v_prev_date := rec.entry_date;
  END LOOP;

  IF v_streak > v_longest THEN v_longest := v_streak; END IF;
  v_current := v_streak;

  RETURN QUERY SELECT v_current, v_longest, v_total;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Indexes
CREATE INDEX idx_habit_entries_habit_date
  ON public.habit_entries(habit_id, entry_date DESC);

CREATE INDEX idx_habits_user_active
  ON public.habits(user_id) WHERE is_active = true;
