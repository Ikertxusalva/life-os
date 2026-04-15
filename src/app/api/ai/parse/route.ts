import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { gemini } from '@/lib/gemini/client'
import { HABITS_PARSE_PROMPT } from '@/lib/gemini/prompts'
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

    const { text } = await request.json()

    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { error: 'Texto requerido' },
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

    recordRequest()

    const result = await gemini.generateContent(HABITS_PARSE_PROMPT(text))

    const responseText = result.response.text().trim()

    // Strip markdown code fences if present
    const jsonStr = responseText
      .replace(/^```json?\s*\n?/i, '')
      .replace(/\n?```\s*$/i, '')
      .trim()

    try {
      const parsed = JSON.parse(jsonStr)

      // Validate required fields
      if (!parsed.name || typeof parsed.name !== 'string') {
        throw new Error('Missing name')
      }

      return NextResponse.json({
        name: parsed.name,
        description: parsed.description ?? '',
        frequency: parsed.frequency ?? 'daily',
        target_count: parsed.target_count ?? 1,
        unit: parsed.unit ?? '',
        time_of_day: parsed.time_of_day ?? 'anytime',
      })
    } catch {
      return NextResponse.json(
        { error: 'No se pudo interpretar el texto' },
        { status: 422 }
      )
    }
  } catch (error) {
    console.error('Error en /api/ai/parse:', error)

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
