'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'
import type { CreateHabitInput, LogEntryInput } from '@/types/habits'

const createHabitSchema = z.object({
  name: z.string().min(1, 'El nombre es obligatorio').max(100),
  description: z.string().max(500).optional(),
  habit_type: z.enum(['binary', 'quantitative', 'negative', 'frequency']),
  icon: z.string().max(10).optional(),
  color: z.string().max(20).optional(),
  frequency_period: z.enum(['daily', 'weekly', 'monthly']),
  frequency_target: z.number().int().min(1).max(31),
  frequency_days: z.array(z.number().int().min(0).max(6)).optional(),
  unit: z.string().max(30).optional(),
  target_value: z.number().positive().optional(),
  grace_days: z.number().int().min(0).max(7),
  life_area_id: z.string().uuid(),
})

const logEntrySchema = z.object({
  habit_id: z.string().uuid(),
  entry_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  completed: z.boolean(),
  value: z.number().optional(),
  note: z.string().max(500).optional(),
  energy_level: z.number().int().min(1).max(5).optional(),
  context_tag: z.string().max(50).optional(),
  skip_reason: z.string().max(200).optional(),
})

type ActionResult<T = unknown> = { error?: string; data?: T }

export async function createHabit(
  input: CreateHabitInput
): Promise<ActionResult> {
  const parsed = createHabitSchema.safeParse(input)
  if (!parsed.success) {
    return { error: parsed.error.errors.map((e) => e.message).join(', ') }
  }

  const supabase = await createClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return { error: 'No autenticado' }
  }

  const { data, error } = await supabase
    .from('habits')
    .insert({ ...parsed.data, user_id: user.id })
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/habits')
  return { data }
}

export async function updateHabit(
  id: string,
  input: Partial<CreateHabitInput>
): Promise<ActionResult> {
  const partialSchema = createHabitSchema.partial()
  const parsed = partialSchema.safeParse(input)
  if (!parsed.success) {
    return { error: parsed.error.errors.map((e) => e.message).join(', ') }
  }

  const supabase = await createClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return { error: 'No autenticado' }
  }

  const { data, error } = await supabase
    .from('habits')
    .update({ ...parsed.data, updated_at: new Date().toISOString() })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/habits')
  return { data }
}

export async function deleteHabit(id: string): Promise<ActionResult> {
  const supabase = await createClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return { error: 'No autenticado' }
  }

  const { error } = await supabase
    .from('habits')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/habits')
  return { data: { success: true } }
}

export async function toggleHabitEntry(
  habitId: string,
  date: string
): Promise<ActionResult> {
  const supabase = await createClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return { error: 'No autenticado' }
  }

  // Check if entry already exists for this habit + date
  const { data: existing, error: fetchError } = await supabase
    .from('habit_entries')
    .select('id, completed')
    .eq('habit_id', habitId)
    .eq('user_id', user.id)
    .eq('entry_date', date)
    .maybeSingle()

  if (fetchError) {
    return { error: fetchError.message }
  }

  let result

  if (existing) {
    // Toggle the completed status
    const { data, error } = await supabase
      .from('habit_entries')
      .update({ completed: !existing.completed })
      .eq('id', existing.id)
      .select()
      .single()

    if (error) return { error: error.message }
    result = data
  } else {
    // Insert new entry as completed
    const { data, error } = await supabase
      .from('habit_entries')
      .insert({
        habit_id: habitId,
        user_id: user.id,
        entry_date: date,
        completed: true,
      })
      .select()
      .single()

    if (error) return { error: error.message }
    result = data
  }

  revalidatePath('/habits')
  return { data: result }
}

export async function logHabitValue(
  input: LogEntryInput
): Promise<ActionResult> {
  const parsed = logEntrySchema.safeParse(input)
  if (!parsed.success) {
    return { error: parsed.error.errors.map((e) => e.message).join(', ') }
  }

  const supabase = await createClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return { error: 'No autenticado' }
  }

  const { habit_id, entry_date, ...rest } = parsed.data

  // Upsert: insert or update based on habit_id + user_id + entry_date
  const { data: existing } = await supabase
    .from('habit_entries')
    .select('id')
    .eq('habit_id', habit_id)
    .eq('user_id', user.id)
    .eq('entry_date', entry_date)
    .maybeSingle()

  let result

  if (existing) {
    const { data, error } = await supabase
      .from('habit_entries')
      .update(rest)
      .eq('id', existing.id)
      .select()
      .single()

    if (error) return { error: error.message }
    result = data
  } else {
    const { data, error } = await supabase
      .from('habit_entries')
      .insert({
        habit_id,
        user_id: user.id,
        entry_date,
        ...rest,
      })
      .select()
      .single()

    if (error) return { error: error.message }
    result = data
  }

  revalidatePath('/habits')
  return { data: result }
}
