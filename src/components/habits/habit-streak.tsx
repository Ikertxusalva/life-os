'use client'

import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { Flame, Trophy, Target, TrendingUp } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { HabitEntry, HabitStreak as HabitStreakType } from '@/types/habits'

interface HabitStreakProps {
  entries: HabitEntry[]
  streak: HabitStreakType
  graceDays: number
}

export function HabitStreak({ entries, streak, graceDays }: HabitStreakProps) {
  const weeks = 12
  const totalDays = weeks * 7

  const calendar = useMemo(() => {
    const today = new Date()
    const entryMap = new Map(entries.map(e => [e.entry_date, e]))
    const days = []

    for (let i = totalDays - 1; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split('T')[0]
      const entry = entryMap.get(dateStr)

      days.push({
        date: dateStr,
        completed: entry?.completed ?? false,
        skipped: !!entry?.skip_reason,
        value: entry?.value ?? null,
        dayLabel: date.toLocaleDateString('es-ES', { weekday: 'short' }),
      })
    }
    return days
  }, [entries, totalDays])

  const completionRate = entries.length > 0
    ? Math.round((entries.filter(e => e.completed).length / entries.length) * 100)
    : 0

  const stats = [
    { icon: Flame, label: 'Racha actual', value: streak.current_streak, color: 'text-orange-400' },
    { icon: Trophy, label: 'Mejor racha', value: streak.longest_streak, color: 'text-amber-400' },
    { icon: Target, label: 'Total', value: streak.total_completions, color: 'text-emerald-400' },
    { icon: TrendingUp, label: 'Tasa', value: `${completionRate}%`, color: 'text-blue-400' },
  ]

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {stats.map(s => (
          <Card key={s.label}>
            <CardContent className="p-3 flex items-center gap-3">
              <s.icon className={cn('h-5 w-5', s.color)} />
              <div>
                <p className="text-lg font-bold">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Últimas {weeks} semanas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-[3px]" style={{ gridTemplateColumns: `repeat(${weeks}, 1fr)`, gridTemplateRows: 'repeat(7, 1fr)' }}>
            {calendar.map((day, i) => (
              <Tooltip key={day.date}>
                <TooltipTrigger asChild>
                  <div className={cn(
                    'aspect-square rounded-sm min-w-[12px]',
                    day.completed ? 'bg-emerald-500' : day.skipped ? 'bg-amber-500/50' : 'bg-muted'
                  )} />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs">{day.date} — {day.completed ? 'Completado' : day.skipped ? 'Saltado' : 'Sin completar'}</p>
                </TooltipContent>
              </Tooltip>
            ))}
          </div>
          <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-emerald-500" /> Completado</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-amber-500/50" /> Saltado</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-muted" /> Sin completar</span>
            {graceDays > 0 && <span>| {graceDays} día(s) de gracia</span>}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
