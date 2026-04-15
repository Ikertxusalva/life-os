'use client'

import { Button } from '@/components/ui/button'
import { HabitCard } from './habit-card'
import { Plus, Sparkles } from 'lucide-react'
import type { HabitWithStreak } from '@/types/habits'

interface HabitGridProps {
  habits: HabitWithStreak[]
  onToggle: (habitId: string) => void
  onOpenDetail: (habitId: string) => void
  onAddNew: () => void
}

export function HabitGrid({ habits, onToggle, onOpenDetail, onAddNew }: HabitGridProps) {
  if (habits.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <Sparkles className="h-12 w-12 text-muted-foreground/30 mb-4" />
        <h3 className="text-lg font-medium mb-1">Aún no tienes hábitos</h3>
        <p className="text-sm text-muted-foreground mb-4">Crea tu primer hábito para empezar a trackear tu progreso</p>
        <Button onClick={onAddNew}><Plus className="h-4 w-4 mr-2" /> Crear primer hábito</Button>
      </div>
    )
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {habits.map(habit => (
          <HabitCard key={habit.id} habit={habit} onToggle={onToggle} onOpenDetail={onOpenDetail} />
        ))}
      </div>
      <Button size="lg" className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg p-0" onClick={onAddNew}>
        <Plus className="h-6 w-6" />
        <span className="sr-only">Añadir hábito</span>
      </Button>
    </>
  )
}
