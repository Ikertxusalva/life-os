"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Target,
  HeartPulse,
  Briefcase,
  Landmark,
  Brain,
  Heart,
  Users,
  BookOpen,
  Orbit,
  LogOut,
  PanelLeftClose,
  PanelLeft,
  Lock,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"

interface SidebarProps {
  user: { email: string }
}

const modules = [
  {
    name: "Habitos personales",
    icon: Target,
    href: "/habits",
    color: "text-emerald-400",
    bgColor: "bg-emerald-400/10",
    activeColor: "bg-emerald-400/15 border-emerald-400/30",
    enabled: true,
  },
  {
    name: "Salud y fitness",
    icon: HeartPulse,
    href: "#",
    color: "text-red-400",
    bgColor: "bg-red-400/10",
    activeColor: "bg-red-400/15 border-red-400/30",
    enabled: false,
  },
  {
    name: "Proyectos profesionales",
    icon: Briefcase,
    href: "#",
    color: "text-blue-400",
    bgColor: "bg-blue-400/10",
    activeColor: "bg-blue-400/15 border-blue-400/30",
    enabled: false,
  },
  {
    name: "Metas financieras",
    icon: Landmark,
    href: "#",
    color: "text-amber-400",
    bgColor: "bg-amber-400/10",
    activeColor: "bg-amber-400/15 border-amber-400/30",
    enabled: false,
  },
  {
    name: "Mentalidad y emociones",
    icon: Brain,
    href: "#",
    color: "text-purple-400",
    bgColor: "bg-purple-400/10",
    activeColor: "bg-purple-400/15 border-purple-400/30",
    enabled: false,
  },
  {
    name: "Relacion de pareja",
    icon: Heart,
    href: "#",
    color: "text-pink-400",
    bgColor: "bg-pink-400/10",
    activeColor: "bg-pink-400/15 border-pink-400/30",
    enabled: false,
  },
  {
    name: "Social y amistades",
    icon: Users,
    href: "#",
    color: "text-cyan-400",
    bgColor: "bg-cyan-400/10",
    activeColor: "bg-cyan-400/15 border-cyan-400/30",
    enabled: false,
  },
  {
    name: "Aprendizaje y formacion",
    icon: BookOpen,
    href: "#",
    color: "text-orange-400",
    bgColor: "bg-orange-400/10",
    activeColor: "bg-orange-400/15 border-orange-400/30",
    enabled: false,
  },
]

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)

  const initials = user.email
    .split("@")[0]
    .slice(0, 2)
    .toUpperCase()

  return (
    <aside
      className={cn(
        "hidden md:flex flex-col border-r border-border bg-card transition-all duration-300",
        collapsed ? "w-[68px]" : "w-64"
      )}
    >
      {/* Logo */}
      <div className="flex h-14 items-center gap-3 border-b border-border px-4">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary">
          <Orbit className="h-4 w-4 text-primary-foreground" />
        </div>
        {!collapsed && (
          <span className="text-lg font-bold tracking-tight">Life OS</span>
        )}
        <Button
          variant="ghost"
          size="icon-sm"
          className={cn("ml-auto shrink-0", collapsed && "ml-0")}
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? (
            <PanelLeft className="h-4 w-4" />
          ) : (
            <PanelLeftClose className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 py-3">
        <nav className="flex flex-col gap-1 px-2">
          {!collapsed && (
            <span className="mb-1 px-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Areas de vida
            </span>
          )}
          {modules.map((mod) => {
            const isActive = mod.enabled && pathname.startsWith(mod.href)
            const Icon = mod.icon

            const linkContent = (
              <div
                className={cn(
                  "group flex items-center gap-3 rounded-lg border border-transparent px-3 py-2 text-sm font-medium transition-all",
                  isActive
                    ? mod.activeColor
                    : mod.enabled
                    ? "text-foreground/80 hover:bg-accent hover:text-foreground"
                    : "text-muted-foreground/50 cursor-default",
                  collapsed && "justify-center px-2"
                )}
              >
                <div
                  className={cn(
                    "flex h-7 w-7 shrink-0 items-center justify-center rounded-md",
                    isActive && mod.bgColor
                  )}
                >
                  <Icon
                    className={cn(
                      "h-4 w-4",
                      isActive || mod.enabled ? mod.color : "text-muted-foreground/40"
                    )}
                  />
                </div>
                {!collapsed && (
                  <>
                    <span className="flex-1 truncate">{mod.name}</span>
                    {!mod.enabled && (
                      <Lock className="h-3 w-3 text-muted-foreground/40" />
                    )}
                  </>
                )}
              </div>
            )

            if (collapsed) {
              return (
                <Tooltip key={mod.name}>
                  <TooltipTrigger asChild>
                    {mod.enabled ? (
                      <Link href={mod.href}>{linkContent}</Link>
                    ) : (
                      <div>{linkContent}</div>
                    )}
                  </TooltipTrigger>
                  <TooltipContent side="right" className="flex items-center gap-2">
                    {mod.name}
                    {!mod.enabled && (
                      <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                        Proximamente
                      </Badge>
                    )}
                  </TooltipContent>
                </Tooltip>
              )
            }

            return mod.enabled ? (
              <Link key={mod.name} href={mod.href}>
                {linkContent}
              </Link>
            ) : (
              <div key={mod.name}>{linkContent}</div>
            )
          })}
        </nav>
      </ScrollArea>

      {/* User section */}
      <Separator />
      <div
        className={cn(
          "flex items-center gap-3 p-3",
          collapsed && "justify-center"
        )}
      >
        <Avatar className="h-8 w-8 shrink-0">
          <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
            {initials}
          </AvatarFallback>
        </Avatar>
        {!collapsed && (
          <>
            <div className="flex-1 min-w-0">
              <p className="truncate text-sm font-medium">{user.email}</p>
            </div>
            <form action="/api/auth/signout" method="post">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon-sm" type="submit">
                    <LogOut className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Cerrar sesion</TooltipContent>
              </Tooltip>
            </form>
          </>
        )}
      </div>
    </aside>
  )
}

export { modules }
