'use client'

import { Check, Circle, Flame, ChevronRight } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import type { HabitWithStreak } from '@/types/habits'
import { cn } from '@/lib/utils'

const habitTypeLabels: Record<string, string> = {
  binary: 'Sí/No',
  quantitative: 'Cuantitativo',
  negative: 'Negativo',
  frequency: 'Frecuencia',
}

interface HabitCardProps {
  habit: HabitWithStreak
  onToggle: (habitId: string) => void
  onOpenDetail: (habitId: string) => void
}

export function HabitCard({ habit, onToggle, onOpenDetail }: HabitCardProps) {
  const isCompleted = habit.today_entry?.completed ?? false
  const currentValue = habit.today_entry?.value ?? 0
  const targetValue = habit.target_value ?? 1
  const progressPercent =
    habit.habit_type === 'quantitative'
      ? Math.min(100, (currentValue / targetValue) * 100)
      : 0

  const handleClick = () => {
    if (habit.habit_type === 'binary') {
      onToggle(habit.id)
    } else {
      onOpenDetail(habit.id)
    }
  }

  return (
    <TooltipProvider>
      <Card
        role="button"
        tabIndex={0}
        onClick={handleClick}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            handleClick()
          }
        }}
        className={cn(
          'group relative cursor-pointer transition-all duration-200',
          'hover:shadow-md hover:-translate-y-0.5',
          'border-l-4',
          isCompleted && 'bg-muted/40'
        )}
        style={{ borderLeftColor: habit.color ?? 'oklch(0.7 0.15 160)' }}
      >
        <CardContent className="p-4">
          {/* Header row */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              {/* Icon */}
              <span className="text-2xl shrink-0" aria-hidden="true">
                {habit.icon ?? '⭐'}
              </span>

              <div className="min-w-0">
                <h3 className="font-semibold text-sm leading-tight truncate">
                  {habit.name}
                </h3>
                <Badge variant="outline" className="mt-1 text-[10px] px-1.5 py-0">
                  {habitTypeLabels[habit.habit_type] ?? habit.habit_type}
                </Badge>
              </div>
            </div>

            {/* Completion indicator */}
            <Tooltip>
              <TooltipTrigger asChild>
                <div
                  className={cn(
                    'shrink-0 flex items-center justify-center w-8 h-8 rounded-full transition-colors',
                    isCompleted
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : 'bg-muted text-muted-foreground'
                  )}
                >
                  {isCompleted ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <Circle className="w-4 h-4" />
                  )}
                </div>
              </TooltipTrigger>
              <TooltipContent>
                {isCompleted ? 'Completado hoy' : 'Pendiente'}
              </TooltipContent>
            </Tooltip>
          </div>

          {/* Quantitative progress */}
          {habit.habit_type === 'quantitative' && (
            <div className="mt-3 space-y-1">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>
                  {currentValue} / {targetValue} {habit.unit ?? ''}
                </span>
                <span>{Math.round(progressPercent)}%</span>
              </div>
              <Progress value={progressPercent} className="h-1.5" />
            </div>
          )}

          {/* Footer: streak + arrow */}
          <div className="mt-3 flex items-center justify-between">
            {/* Streak */}
            {habit.streak && habit.streak.current_streak > 0 ? (
              <div className="flex items-center gap-1 text-xs font-medium text-amber-400">
                <Flame className="w-3.5 h-3.5" />
                <span>{habit.streak.current_streak}</span>
              </div>
            ) : (
              <div className="text-xs text-muted-foreground">Sin racha</div>
            )}

            <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  )
}
