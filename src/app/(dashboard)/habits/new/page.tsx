'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { createHabit } from '../actions'
import { HabitForm } from '@/components/habits/habit-form'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import type { CreateHabitInput } from '@/types/habits'

export default function NewHabitPage() {
  const router = useRouter()
  const [lifeAreaId, setLifeAreaId] = useState<string | null>(null)

  useEffect(() => {
    const fetchArea = async () => {
      const supabase = createClient()
      const { data } = await supabase
        .from('life_areas')
        .select('id')
        .eq('slug', 'habits')
        .single()
      if (data) setLifeAreaId(data.id)
    }
    fetchArea()
  }, [])

  const handleSubmit = async (input: CreateHabitInput) => {
    const result = await createHabit(input)
    if (!result.error) {
      router.push('/habits')
    }
  }

  if (!lifeAreaId) return <div className="flex items-center justify-center py-16 text-muted-foreground">Cargando...</div>

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/habits"><ArrowLeft className="h-4 w-4 mr-1" /> Volver</Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Nuevo hábito</CardTitle>
        </CardHeader>
        <CardContent>
          <HabitForm onSubmit={handleSubmit} lifeAreaId={lifeAreaId} />
        </CardContent>
      </Card>
    </div>
  )
}
