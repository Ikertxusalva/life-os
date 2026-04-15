'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Slider } from '@/components/ui/slider'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Check, Minus, Plus, Zap } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { HabitWithStreak } from '@/types/habits'

const ENERGY_LABELS = ['😴', '😐', '🙂', '😊', '🔥']
const CONTEXT_TAGS = ['normal', 'viaje', 'estrés', 'enfermo']

interface HabitCheckinProps {
  habits: HabitWithStreak[]
  onToggle: (habitId: string) => void
  onLogValue: (habitId: string, value: number) => void
  onComplete: (energyLevel: number, contextTag: string) => void
}

export function HabitCheckin({ habits, onToggle, onLogValue, onComplete }: HabitCheckinProps) {
  const [energy, setEnergy] = useState(3)
  const [contextTag, setContextTag] = useState('normal')
  const [values, setValues] = useState<Record<string, number>>({})

  const completed = habits.filter(h => h.today_entry?.completed).length
  const total = habits.length
  const progress = total > 0 ? (completed / total) * 100 : 0

  const updateValue = (habitId: string, delta: number, target: number) => {
    const current = values[habitId] ?? (habits.find(h => h.id === habitId)?.today_entry?.value ?? 0)
    const newVal = Math.max(0, Math.min(current + delta, target * 2))
    setValues(prev => ({ ...prev, [habitId]: newVal }))
    onLogValue(habitId, newVal)
  }

  return (
    <div className="space-y-4">
      {/* Progress */}
      <div className="space-y-1">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Check-in diario</span>
          <span className="font-medium">{completed}/{total} completados</span>
        </div>
        <div className="h-2 rounded-full bg-muted overflow-hidden">
          <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${progress}%` }} />
        </div>
      </div>

      {/* Habit cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {habits.map(habit => {
          const isCompleted = habit.today_entry?.completed
          const currentValue = values[habit.id] ?? (habit.today_entry?.value ?? 0)

          return (
            <Card key={habit.id} className={cn('transition-all', isCompleted && 'border-emerald-500/30 bg-emerald-500/5')}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <span className="text-xl">{habit.icon || '⭐'}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{habit.name}</p>
                    {habit.streak && habit.streak.current_streak > 0 && (
                      <p className="text-xs text-muted-foreground">🔥 {habit.streak.current_streak} días</p>
                    )}
                  </div>

                  {habit.habit_type === 'binary' || habit.habit_type === 'negative' ? (
                    <Button
                      variant={isCompleted ? 'default' : 'outline'}
                      size="sm"
                      className={cn('h-9 w-9 p-0', isCompleted && 'bg-emerald-600 hover:bg-emerald-700')}
                      onClick={() => onToggle(habit.id)}
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                  ) : habit.habit_type === 'quantitative' ? (
                    <div className="flex items-center gap-1">
                      <Button variant="outline" size="sm" className="h-8 w-8 p-0" onClick={() => updateValue(habit.id, -1, habit.target_value ?? 1)}>
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-16 text-center text-sm font-mono">
                        {currentValue}/{habit.target_value} {habit.unit}
                      </span>
                      <Button variant="outline" size="sm" className="h-8 w-8 p-0" onClick={() => updateValue(habit.id, 1, habit.target_value ?? 1)}>
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  ) : null}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Energy + Context */}
      <Card>
        <CardContent className="p-4 space-y-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-amber-400" />
              <span className="text-sm font-medium">Energía: {ENERGY_LABELS[energy - 1]}</span>
            </div>
            <Slider value={[energy]} onValueChange={v => setEnergy(v[0])} min={1} max={5} step={1} />
          </div>

          <div className="space-y-2">
            <span className="text-sm font-medium">Contexto</span>
            <div className="flex gap-2 flex-wrap">
              {CONTEXT_TAGS.map(tag => (
                <Badge key={tag} variant={contextTag === tag ? 'default' : 'outline'} className="cursor-pointer" onClick={() => setContextTag(tag)}>
                  {tag}
                </Badge>
              ))}
            </div>
          </div>

          <Button className="w-full" onClick={() => onComplete(energy, contextTag)}>
            Completar check-in
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
