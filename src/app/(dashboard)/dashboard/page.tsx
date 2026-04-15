import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import {
  Target,
  HeartPulse,
  Briefcase,
  Landmark,
  Brain,
  Heart,
  Users,
  BookOpen,
  ArrowRight,
  Sparkles,
  TrendingUp,
  Calendar,
  CheckCircle2,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const areas = [
  {
    name: "Habitos personales",
    description: "Crea y rastrea tus habitos diarios",
    icon: Target,
    href: "/habits",
    color: "text-emerald-400",
    bgColor: "bg-emerald-400/10",
    borderColor: "border-emerald-400/20 hover:border-emerald-400/40",
    glowColor: "hover:shadow-emerald-400/5",
    enabled: true,
  },
  {
    name: "Salud y fitness",
    description: "Entrenamientos, nutricion y bienestar",
    icon: HeartPulse,
    href: "#",
    color: "text-red-400",
    bgColor: "bg-red-400/10",
    borderColor: "border-red-400/20",
    glowColor: "",
    enabled: false,
  },
  {
    name: "Proyectos profesionales",
    description: "Gestiona tus proyectos y tareas",
    icon: Briefcase,
    href: "#",
    color: "text-blue-400",
    bgColor: "bg-blue-400/10",
    borderColor: "border-blue-400/20",
    glowColor: "",
    enabled: false,
  },
  {
    name: "Metas financieras",
    description: "Ahorro, inversiones y presupuesto",
    icon: Landmark,
    href: "#",
    color: "text-amber-400",
    bgColor: "bg-amber-400/10",
    borderColor: "border-amber-400/20",
    glowColor: "",
    enabled: false,
  },
  {
    name: "Mentalidad y emociones",
    description: "Diario, meditacion y crecimiento",
    icon: Brain,
    href: "#",
    color: "text-purple-400",
    bgColor: "bg-purple-400/10",
    borderColor: "border-purple-400/20",
    glowColor: "",
    enabled: false,
  },
  {
    name: "Relacion de pareja",
    description: "Momentos, metas y comunicacion",
    icon: Heart,
    href: "#",
    color: "text-pink-400",
    bgColor: "bg-pink-400/10",
    borderColor: "border-pink-400/20",
    glowColor: "",
    enabled: false,
  },
  {
    name: "Social y amistades",
    description: "Contactos, eventos y conexiones",
    icon: Users,
    href: "#",
    color: "text-cyan-400",
    bgColor: "bg-cyan-400/10",
    borderColor: "border-cyan-400/20",
    glowColor: "",
    enabled: false,
  },
  {
    name: "Aprendizaje y formacion",
    description: "Cursos, lecturas y habilidades",
    icon: BookOpen,
    href: "#",
    color: "text-orange-400",
    bgColor: "bg-orange-400/10",
    borderColor: "border-orange-400/20",
    glowColor: "",
    enabled: false,
  },
]

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect("/login")

  const displayName = user.email?.split("@")[0] ?? "usuario"

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      {/* Welcome section */}
      <div className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
          Bienvenido, {displayName}
        </h1>
        <p className="text-muted-foreground">
          Tu sistema operativo personal. Organiza, mide y mejora cada area de tu
          vida.
        </p>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          {
            label: "Areas activas",
            value: "1/8",
            icon: Sparkles,
            color: "text-emerald-400",
          },
          {
            label: "Racha actual",
            value: "0 dias",
            icon: TrendingUp,
            color: "text-amber-400",
          },
          {
            label: "Tareas hoy",
            value: "0",
            icon: CheckCircle2,
            color: "text-blue-400",
          },
          {
            label: "Semana",
            value: "Sem. 16",
            icon: Calendar,
            color: "text-purple-400",
          },
        ].map((stat) => (
          <Card key={stat.label} className="border-border/50">
            <CardContent className="flex items-center gap-3 p-4">
              <stat.icon className={`h-5 w-5 shrink-0 ${stat.color}`} />
              <div>
                <p className="text-lg font-bold leading-none">{stat.value}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {stat.label}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Area cards grid */}
      <div>
        <h2 className="mb-4 text-lg font-semibold">Areas de vida</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {areas.map((area) => {
            const Icon = area.icon
            const cardContent = (
              <Card
                className={`group relative overflow-hidden border transition-all duration-300 ${area.borderColor} ${area.glowColor} ${
                  area.enabled
                    ? "cursor-pointer hover:shadow-lg"
                    : "opacity-60"
                }`}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-xl ${area.bgColor}`}
                    >
                      <Icon className={`h-5 w-5 ${area.color}`} />
                    </div>
                    {!area.enabled && (
                      <Badge
                        variant="secondary"
                        className="text-[10px] font-normal"
                      >
                        Proximamente
                      </Badge>
                    )}
                    {area.enabled && (
                      <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                    )}
                  </div>
                  <CardTitle className="mt-3 text-sm font-semibold">
                    {area.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-xs text-muted-foreground">
                    {area.description}
                  </p>
                </CardContent>
              </Card>
            )

            return area.enabled ? (
              <Link key={area.name} href={area.href}>
                {cardContent}
              </Link>
            ) : (
              <div key={area.name}>{cardContent}</div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
