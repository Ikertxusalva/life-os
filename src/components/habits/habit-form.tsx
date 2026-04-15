'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Slider } from '@/components/ui/slider'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { CreateHabitInput, HabitType, FrequencyPeriod } from '@/types/habits'

const HABIT_TYPES: { value: HabitType; label: string; desc: string }[] = [
  { value: 'binary', label: 'Sí/No', desc: 'Meditar, leer, no alcohol' },
  { value: 'quantitative', label: 'Cuantitativo', desc: 'Vasos de agua, páginas, minutos' },
  { value: 'negative', label: 'Negativo', desc: 'Registras cada vez que cedes' },
  { value: 'frequency', label: 'Frecuencia', desc: 'X veces por semana' },
]

const COLORS = ['emerald', 'red', 'blue', 'amber', 'purple', 'pink', 'cyan', 'orange']
const COLOR_CLASSES: Record<string, string> = {
  emerald: 'bg-emerald-500', red: 'bg-red-500', blue: 'bg-blue-500', amber: 'bg-amber-500',
  purple: 'bg-purple-500', pink: 'bg-pink-500', cyan: 'bg-cyan-500', orange: 'bg-orange-500',
}

const DAYS = ['L', 'M', 'X', 'J', 'V', 'S', 'D']

interface HabitFormProps {
  onSubmit: (data: CreateHabitInput) => Promise<void>
  defaultValues?: Partial<CreateHabitInput>
  lifeAreaId: string
}

export function HabitForm({ onSubmit, defaultValues, lifeAreaId }: HabitFormProps) {
  const [loading, setLoading] = useState(false)
  const [name, setName] = useState(defaultValues?.name ?? '')
  const [description, setDescription] = useState(defaultValues?.description ?? '')
  const [habitType, setHabitType] = useState<HabitType>(defaultValues?.habit_type ?? 'binary')
  const [frequencyPeriod, setFrequencyPeriod] = useState<FrequencyPeriod>(defaultValues?.frequency_period ?? 'daily')
  const [frequencyTarget, setFrequencyTarget] = useState(defaultValues?.frequency_target ?? 1)
  const [frequencyDays, setFrequencyDays] = useState<number[]>(defaultValues?.frequency_days ?? [])
  const [unit, setUnit] = useState(defaultValues?.unit ?? '')
  const [targetValue, setTargetValue] = useState(defaultValues?.target_value ?? 1)
  const [graceDays, setGraceDays] = useState(defaultValues?.grace_days ?? 0)
  const [icon, setIcon] = useState(defaultValues?.icon ?? '')
  const [color, setColor] = useState(defaultValues?.color ?? 'emerald')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await onSubmit({
        name, description: description || undefined, habit_type: habitType,
        icon: icon || undefined, color, frequency_period: frequencyPeriod,
        frequency_target: frequencyTarget,
        frequency_days: frequencyDays.length > 0 ? frequencyDays : undefined,
        unit: unit || undefined, target_value: habitType === 'quantitative' ? targetValue : undefined,
        grace_days: graceDays, life_area_id: lifeAreaId,
      })
    } finally { setLoading(false) }
  }

  const toggleDay = (day: number) => {
    setFrequencyDays(prev => prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day])
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name">Nombre del hábito *</Label>
        <Input id="name" value={name} onChange={e => setName(e.target.value)} placeholder="Meditar" required />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Descripción</Label>
        <Textarea id="description" value={description} onChange={e => setDescription(e.target.value)} placeholder="Opcional" rows={2} />
      </div>

      <div className="space-y-2">
        <Label>Tipo de hábito</Label>
        <div className="grid grid-cols-2 gap-2">
          {HABIT_TYPES.map(t => (
            <Card key={t.value} className={cn('cursor-pointer transition-all', habitType === t.value ? 'border-primary ring-1 ring-primary' : 'hover:border-muted-foreground/30')} onClick={() => setHabitType(t.value)}>
              <CardContent className="p-3">
                <p className="font-medium text-sm">{t.label}</p>
                <p className="text-xs text-muted-foreground">{t.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {habitType === 'quantitative' && (
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Unidad</Label>
            <Input value={unit} onChange={e => setUnit(e.target.value)} placeholder="minutos" />
          </div>
          <div className="space-y-2">
            <Label>Objetivo</Label>
            <Input type="number" min={1} value={targetValue} onChange={e => setTargetValue(Number(e.target.value))} />
          </div>
        </div>
      )}

      <div className="space-y-2">
        <Label>Frecuencia</Label>
        <Select value={frequencyPeriod} onValueChange={v => setFrequencyPeriod(v as FrequencyPeriod)}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="daily">Diario</SelectItem>
            <SelectItem value="weekly">Semanal</SelectItem>
            <SelectItem value="monthly">Mensual</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {(habitType === 'frequency' || frequencyPeriod === 'weekly') && (
        <div className="space-y-2">
          <Label>Días ({frequencyTarget}x por semana)</Label>
          <div className="flex gap-2">
            {DAYS.map((d, i) => (
              <Button key={d} type="button" variant={frequencyDays.includes(i + 1) ? 'default' : 'outline'} size="sm" className="w-9 h-9 p-0" onClick={() => toggleDay(i + 1)}>{d}</Button>
            ))}
          </div>
          <Input type="number" min={1} max={7} value={frequencyTarget} onChange={e => setFrequencyTarget(Number(e.target.value))} className="w-20" />
        </div>
      )}

      <div className="space-y-2">
        <Label>Días de gracia: {graceDays}</Label>
        <Slider value={[graceDays]} onValueChange={v => setGraceDays(v[0])} min={0} max={3} step={1} />
        <p className="text-xs text-muted-foreground">Si fallas {graceDays} día(s), la racha no se rompe</p>
      </div>

      <div className="space-y-2">
        <Label>Icono (emoji)</Label>
        <Input value={icon} onChange={e => setIcon(e.target.value)} placeholder="🧘" className="w-20" />
      </div>

      <div className="space-y-2">
        <Label>Color</Label>
        <div className="flex gap-2">
          {COLORS.map(c => (
            <button key={c} type="button" className={cn('w-8 h-8 rounded-full transition-all', COLOR_CLASSES[c], color === c ? 'ring-2 ring-offset-2 ring-offset-background ring-primary scale-110' : 'opacity-60 hover:opacity-100')} onClick={() => setColor(c)} />
          ))}
        </div>
      </div>

      <Button type="submit" className="w-full" disabled={loading || !name}>
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : defaultValues ? 'Guardar cambios' : 'Crear hábito'}
      </Button>
    </form>
  )
}
