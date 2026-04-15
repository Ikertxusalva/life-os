import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { gemini } from '@/lib/gemini/client'
import { CHAT_SYSTEM_PROMPT } from '@/lib/gemini/prompts'
import { checkRateLimit, recordRequest } from '@/lib/gemini/rate-limit'

export async function POST(request: NextRequest) {
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

    const { message } = await request.json()

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Mensaje requerido' },
        { status: 400 }
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

    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const { data: habits, error: habitsError } = await supabase
      .from('habits')
      .select('id, name, description, frequency, target_count, unit, created_at')
      .eq('user_id', user.id)

    if (habitsError) {
      throw new Error(`Error al obtener hábitos: ${habitsError.message}`)
    }

    const habitIds = habits?.map((h) => h.id) ?? []

    let entries: typeof entriesData = []
    let entriesData: Array<{
      id: string
      habit_id: string
      completed_at: string
      value: number | null
    }> = []

    if (habitIds.length > 0) {
      const { data, error: entriesError } = await supabase
        .from('habit_entries')
        .select('id, habit_id, completed_at, value')
        .in('habit_id', habitIds)
        .gte('completed_at', thirtyDaysAgo.toISOString())
        .order('completed_at', { ascending: false })

      if (entriesError) {
        throw new Error(`Error al obtener entradas: ${entriesError.message}`)
      }

      entries = data ?? []
    }

    const habitsWithEntries = habits?.map((habit) => ({
      ...habit,
      entries: entries.filter((e) => e.habit_id === habit.id),
      total_entries: entries.filter((e) => e.habit_id === habit.id).length,
    }))

    const habitsJson = JSON.stringify(habitsWithEntries, null, 2)

    recordRequest()

    const result = await gemini.generateContent({
      contents: [
        {
          role: 'user',
          parts: [{ text: message }],
        },
      ],
      systemInstruction: CHAT_SYSTEM_PROMPT(habitsJson),
    })

    const response = result.response.text()

    return NextResponse.json({ response })
  } catch (error) {
    console.error('Error en /api/ai/chat:', error)

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
