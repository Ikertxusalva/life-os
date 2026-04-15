'use client'

import { use } from 'react'
import { useRouter } from 'next/navigation'
import { useHabit } from '@/hooks/use-habits'
import { deleteHabit } from '../actions'
import { HabitStreak } from '@/components/habits/habit-streak'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Trash2, Loader2 } from 'lucide-react'
import Link from 'next/link'

const TYPE_LABELS: Record<string, string> = {
  binary: 'Sí/No',
  quantitative: 'Cuantitativo',
  negative: 'Negativo',
  frequency: 'Frecuencia',
}

const PERIOD_LABELS: Record<string, string> = {
  daily: 'Diario',
  weekly: 'Semanal',
  monthly: 'Mensual',
}

export default function HabitDetailPage({ params }: { params: Promise<{ habitId: string }> }) {
  const { habitId } = use(params)
  const router = useRouter()
  const { data: habit, isLoading } = useHabit(habitId)

  const handleDelete = async () => {
    if (!confirm('¿Eliminar este hábito? Esta acción no se puede deshacer.')) return
    await deleteHabit(habitId)
    router.push('/habits')
  }

  if (isLoading) return <div className="flex items-center justify-center py-16"><Loader2 className="h-6 w-6 animate-spin" /></div>
  if (!habit) return <div className="text-center py-16 text-muted-foreground">Hábito no encontrado</div>

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/habits"><ArrowLeft className="h-4 w-4 mr-1" /> Volver</Link>
        </Button>
        <Button variant="destructive" size="sm" onClick={handleDelete}>
          <Trash2 className="h-4 w-4 mr-1" /> Eliminar
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <span className="text-3xl">{habit.icon || '⭐'}</span>
            <div>
              <CardTitle className="text-xl">{habit.name}</CardTitle>
              {habit.description && <p className="text-sm text-muted-foreground mt-1">{habit.description}</p>}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">{TYPE_LABELS[habit.habit_type]}</Badge>
            <Badge variant="outline">{PERIOD_LABELS[habit.frequency_period]}</Badge>
            {habit.habit_type === 'quantitative' && <Badge variant="outline">{habit.target_value} {habit.unit}</Badge>}
            {habit.grace_days > 0 && <Badge variant="outline">{habit.grace_days} día(s) de gracia</Badge>}
          </div>
        </CardContent>
      </Card>

      {habit.streak && (
        <HabitStreak entries={habit.entries ?? []} streak={habit.streak} graceDays={habit.grace_days} />
      )}
    </div>
  )
}
