import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { gemini } from '@/lib/gemini/client'
import { HABITS_INSIGHT_PROMPT } from '@/lib/gemini/prompts'
import { checkRateLimit, recordRequest } from '@/lib/gemini/rate-limit'

export async function POST(_request: NextRequest) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      )
    }

    const rateCheck = checkRateLimit()
    if (!rateCheck.allowed) {
      return NextResponse.json(
        {
          error: `Demasiadas solicitudes. Intenta de nuevo en ${rateCheck.retryAfter}s.`,
        },
        { status: 429 }
      )
    }

    const fourteenDaysAgo = new Date()
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14)

    const { data: habits, error: habitsError } = await supabase
      .from('habits')
      .select('id, name, description, frequency, target_count, unit, created_at')
      .eq('user_id', user.id)

    if (habitsError) {
      throw new Error(`Error al obtener hábitos: ${habitsError.message}`)
    }

    const habitIds = habits?.map((h) => h.id) ?? []

    if (habitIds.length === 0) {
      return NextResponse.json({
        insights: '• Aún no tienes hábitos registrados. ¡Crea tu primer hábito para empezar a recibir insights!',
      })
    }

    const { data: entries, error: entriesError } = await supabase
      .from('habit_entries')
      .select('id, habit_id, completed_at, value')
      .in('habit_id', habitIds)
      .gte('completed_at', fourteenDaysAgo.toISOString())
      .order('completed_at', { ascending: false })

    if (entriesError) {
      throw new Error(`Error al obtener entradas: ${entriesError.message}`)
    }

    const habitsWithEntries = habits.map((habit) => ({
      ...habit,
      entries: (entries ?? []).filter((e) => e.habit_id === habit.id),
      total_entries: (entries ?? []).filter((e) => e.habit_id === habit.id).length,
      completion_rate:
        habit.frequency === 'daily'
          ? `${Math.round(((entries ?? []).filter((e) => e.habit_id === habit.id).length / 14) * 100)}%`
          : undefined,
    }))

    const habitsJson = JSON.stringify(habitsWithEntries, null, 2)

    recordRequest()

    const result = await gemini.generateContent(HABITS_INSIGHT_PROMPT(habitsJson))

    const insights = result.response.text()

    return NextResponse.json({ insights })
  } catch (error) {
    console.error('Error en /api/ai/insight:', error)

    if (error instanceof Error && error.message.includes('RATE_LIMIT')) {
      return NextResponse.json(
        { error: 'Límite de la API de Gemini alcanzado. Intenta en unos minutos.' },
        { status: 429 }
      )
    }

    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
