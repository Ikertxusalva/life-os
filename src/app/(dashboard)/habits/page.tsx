'use client'

import Link from 'next/link'
import { useHabits, useToggleHabit } from '@/hooks/use-habits'
import type { HabitWithStreak } from '@/types/habits'

function getToday(): string {
  return new Date().toISOString().split('T')[0]
}

function FrequencyLabel({ habit }: { habit: HabitWithStreak }) {
  const labels: Record<string, string> = {
    daily: 'Diario',
    weekly: 'Semanal',
    monthly: 'Mensual',
  }
  const period = labels[habit.frequency_period] ?? habit.frequency_period
  if (habit.frequency_target > 1) {
    return (
      <span>
        {habit.frequency_target}x {period.toLowerCase()}
      </span>
    )
  }
  return <span>{period}</span>
}

function HabitCard({ habit }: { habit: HabitWithStreak }) {
  const toggle = useToggleHabit()
  const today = getToday()
  const isCompleted = habit.today_entry?.completed ?? false

  return (
    <div
      className={`rounded-xl border p-4 transition-all ${
        isCompleted
          ? 'border-green-300 bg-green-50 dark:border-green-800 dark:bg-green-950'
          : 'border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900'
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          {habit.icon && <span className="text-2xl">{habit.icon}</span>}
          <div>
            <Link
              href={`/habits/${habit.id}`}
              className="font-semibold hover:underline"
            >
              {habit.name}
            </Link>
            {habit.life_areas && (
              <p className="text-xs text-gray-500">
                {habit.life_areas.name}
              </p>
            )}
          </div>
        </div>

        <button
          onClick={() =>
            toggle.mutate({ habitId: habit.id, date: today })
          }
          disabled={toggle.isPending}
          className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all ${
            isCompleted
              ? 'border-green-500 bg-green-500 text-white'
              : 'border-gray-300 hover:border-green-400 dark:border-gray-600'
          }`}
          aria-label={
            isCompleted ? 'Desmarcar hábito' : 'Marcar hábito como completado'
          }
        >
          {isCompleted && (
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={3}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
              />
            </svg>
          )}
        </button>
      </div>

      <div className="mt-3 flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
        <FrequencyLabel habit={habit} />
        {habit.streak && (
          <span className="flex items-center gap-1">
            <span className="text-orange-500">&#x1f525;</span>
            {habit.streak.current_streak} días
          </span>
        )}
        {habit.habit_type === 'quantitative' && habit.target_value && (
          <span>
            Meta: {habit.target_value} {habit.unit ?? ''}
          </span>
        )}
      </div>
    </div>
  )
}

function HabitCheckin({ habits }: { habits: HabitWithStreak[] }) {
  const completed = habits.filter((h) => h.today_entry?.completed).length
  const total = habits.length
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-900">
      <h2 className="mb-2 text-lg font-semibold">Check-in diario</h2>
      <div className="mb-2 flex items-end gap-2">
        <span className="text-3xl font-bold">{completed}</span>
        <span className="pb-1 text-gray-500">/ {total} completados</span>
      </div>
      <div className="h-3 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
        <div
          className="h-full rounded-full bg-green-500 transition-all"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <p className="mt-1 text-sm text-gray-500">{percentage}% completado hoy</p>
    </div>
  )
}

export default function HabitsPage() {
  const { data: habits, isLoading, error } = useHabits()

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-red-700">
        <p className="font-semibold">Error al cargar hábitos</p>
        <p className="text-sm">{(error as Error).message}</p>
      </div>
    )
  }

  const activeHabits = habits ?? []

  return (
    <div className="mx-auto max-w-4xl space-y-8 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Mis Hábitos</h1>
        <Link
          href="/habits/new"
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
        >
          + Añadir hábito
        </Link>
      </div>

      {/* Daily check-in */}
      {activeHabits.length > 0 && <HabitCheckin habits={activeHabits} />}

      {/* Habits grid */}
      {activeHabits.length === 0 ? (
        <div className="py-16 text-center">
          <p className="text-lg text-gray-500">
            Aún no tienes hábitos creados.
          </p>
          <Link
            href="/habits/new"
            className="mt-4 inline-block text-blue-600 hover:underline"
          >
            Crear tu primer hábito
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {activeHabits.map((habit) => (
            <HabitCard key={habit.id} habit={habit} />
          ))}
        </div>
      )}
    </div>
  )
}
