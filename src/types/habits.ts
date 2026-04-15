export type HabitType = 'binary' | 'quantitative' | 'negative' | 'frequency'
export type FrequencyPeriod = 'daily' | 'weekly' | 'monthly'

export interface Habit {
  id: string
  user_id: string
  life_area_id: string
  name: string
  description: string | null
  habit_type: HabitType
  icon: string | null
  color: string | null
  frequency_period: FrequencyPeriod
  frequency_target: number
  frequency_days: number[] | null
  unit: string | null
  target_value: number | null
  grace_days: number
  is_active: boolean
  is_archived: boolean
  sort_order: number
  created_at: string
  updated_at: string
  // Joined data
  life_areas?: { name: string; color: string }
}

export interface HabitEntry {
  id: string
  habit_id: string
  user_id: string
  entry_date: string
  completed: boolean
  value: number | null
  note: string | null
  energy_level: number | null
  context_tag: string | null
  skip_reason: string | null
  created_at: string
}

export interface HabitStreak {
  current_streak: number
  longest_streak: number
  total_completions: number
}

export interface HabitWithStreak extends Habit {
  streak?: HabitStreak
  today_entry?: HabitEntry | null
}

export interface CreateHabitInput {
  name: string
  description?: string
  habit_type: HabitType
  icon?: string
  color?: string
  frequency_period: FrequencyPeriod
  frequency_target: number
  frequency_days?: number[]
  unit?: string
  target_value?: number
  grace_days: number
  life_area_id: string
}

export interface LogEntryInput {
  habit_id: string
  entry_date: string
  completed: boolean
  value?: number
  note?: string
  energy_level?: number
  context_tag?: string
  skip_reason?: string
}
