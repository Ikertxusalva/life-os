'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { toggleHabitEntry, createHabit } from '@/app/(dashboard)/habits/actions'
import type {
  Habit,
  HabitWithStreak,
  HabitEntry,
  HabitStreak,
  CreateHabitInput,
} from '@/types/habits'

const supabase = createClient()

function getToday(): string {
  return new Date().toISOString().split('T')[0]
}

function getDateDaysAgo(days: number): string {
  const d = new Date()
  d.setDate(d.getDate() - days)
  return d.toISOString().split('T')[0]
}

async function fetchHabitsWithStreaks(): Promise<HabitWithStreak[]> {
  const today = getToday()

  // 1. Fetch all active, non-archived habits with life_areas join
  const { data: habits, error: habitsError } = await supabase
    .from('habits')
    .select('*, life_areas(name, color)')
    .eq('is_active', true)
    .eq('is_archived', false)
    .order('sort_order', { ascending: true })

  if (habitsError) throw habitsError
  if (!habits || habits.length === 0) return []

  const habitIds = habits.map((h: Habit) => h.id)

  // 2. Fetch today's entries for all habits in one query
  const { data: todayEntries, error: entriesError } = await supabase
    .from('habit_entries')
    .select('*')
    .in('habit_id', habitIds)
    .eq('entry_date', today)

  if (entriesError) throw entriesError

  const entriesByHabitId = new Map<string, HabitEntry>()
  for (const entry of todayEntries ?? []) {
    entriesByHabitId.set(entry.habit_id, entry)
  }

  // 3. Fetch streaks for each habit via RPC
  const streakPromises = habits.map(async (habit: Habit) => {
    const { data, error } = await supabase.rpc('get_habit_streak', {
      p_habit_id: habit.id,
    })

    if (error || !data) {
      return {
        current_streak: 0,
        longest_streak: 0,
        total_completions: 0,
      } as HabitStreak
    }

    // RPC may return a single row or array
    const row = Array.isArray(data) ? data[0] : data
    return {
      current_streak: row?.current_streak ?? 0,
      longest_streak: row?.longest_streak ?? 0,
      total_completions: row?.total_completions ?? 0,
    } as HabitStreak
  })

  const streaks = await Promise.all(streakPromises)

  // 4. Merge into HabitWithStreak[]
  return habits.map((habit: Habit, index: number) => ({
    ...habit,
    today_entry: entriesByHabitId.get(habit.id) ?? null,
    streak: streaks[index],
  }))
}

export function useHabits() {
  return useQuery<HabitWithStreak[]>({
    queryKey: ['habits'],
    queryFn: fetchHabitsWithStreaks,
  })
}

export function useHabit(id: string) {
  return useQuery({
    queryKey: ['habit', id],
    queryFn: async () => {
      // Fetch habit with life_areas
      const { data: habit, error: habitError } = await supabase
        .from('habits')
        .select('*, life_areas(name, color)')
        .eq('id', id)
        .single()

      if (habitError) throw habitError

      // Fetch entries for last 90 days
      const { data: entries, error: entriesError } = await supabase
        .from('habit_entries')
        .select('*')
        .eq('habit_id', id)
        .gte('entry_date', getDateDaysAgo(90))
        .order('entry_date', { ascending: false })

      if (entriesError) throw entriesError

      // Fetch streak
      const { data: streakData } = await supabase.rpc('get_habit_streak', {
        p_habit_id: id,
      })

      const streakRow = Array.isArray(streakData)
        ? streakData[0]
        : streakData
      const streak: HabitStreak = {
        current_streak: streakRow?.current_streak ?? 0,
        longest_streak: streakRow?.longest_streak ?? 0,
        total_completions: streakRow?.total_completions ?? 0,
      }

      const today = getToday()
      const todayEntry =
        entries?.find((e: HabitEntry) => e.entry_date === today) ?? null

      return {
        ...habit,
        streak,
        today_entry: todayEntry,
        entries: entries ?? [],
      } as HabitWithStreak & { entries: HabitEntry[] }
    },
    enabled: !!id,
  })
}

export function useToggleHabit() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      habitId,
      date,
    }: {
      habitId: string
      date: string
    }) => {
      const result = await toggleHabitEntry(habitId, date)
      if (result.error) throw new Error(result.error)
      return result.data
    },
    onMutate: async ({ habitId, date }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['habits'] })

      // Snapshot previous value
      const previousHabits = queryClient.getQueryData<HabitWithStreak[]>([
        'habits',
      ])

      // Optimistic update
      if (previousHabits) {
        queryClient.setQueryData<HabitWithStreak[]>(
          ['habits'],
          previousHabits.map((habit) => {
            if (habit.id !== habitId) return habit

            const wasCompleted = habit.today_entry?.completed ?? false
            const newCompleted = !wasCompleted

            return {
              ...habit,
              today_entry: habit.today_entry
                ? { ...habit.today_entry, completed: newCompleted }
                : ({
                    id: 'optimistic',
                    habit_id: habitId,
                    user_id: '',
                    entry_date: date,
                    completed: true,
                    value: null,
                    note: null,
                    energy_level: null,
                    context_tag: null,
                    skip_reason: null,
                    created_at: new Date().toISOString(),
                  } as unknown as HabitEntry),
              streak: habit.streak
                ? {
                    ...habit.streak,
                    current_streak: newCompleted
                      ? habit.streak.current_streak + 1
                      : Math.max(0, habit.streak.current_streak - 1),
                    total_completions: newCompleted
                      ? habit.streak.total_completions + 1
                      : Math.max(0, habit.streak.total_completions - 1),
                  }
                : undefined,
            }
          })
        )
      }

      return { previousHabits }
    },
    onError: (_err, _vars, context) => {
      // Roll back on error
      if (context?.previousHabits) {
        queryClient.setQueryData(['habits'], context.previousHabits)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['habits'] })
    },
  })
}

export function useCreateHabit() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: CreateHabitInput) => {
      const result = await createHabit(input)
      if (result.error) throw new Error(result.error)
      return result.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habits'] })
    },
  })
}
