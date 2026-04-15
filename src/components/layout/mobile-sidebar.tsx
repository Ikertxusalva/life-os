"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Orbit } from "lucide-react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { modules } from "@/components/layout/sidebar"

interface MobileSidebarProps {
  onNavigate: () => void
}

export function MobileSidebar({ onNavigate }: MobileSidebarProps) {
  const pathname = usePathname()

  return (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex h-14 items-center gap-3 border-b border-border px-4">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary">
          <Orbit className="h-4 w-4 text-primary-foreground" />
        </div>
        <span className="text-lg font-bold tracking-tight">Life OS</span>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 py-3">
        <nav className="flex flex-col gap-1 px-2">
          <span className="mb-1 px-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Areas de vida
          </span>
          {modules.map((mod) => {
            const isActive = mod.enabled && pathname.startsWith(mod.href)
            const Icon = mod.icon

            const content = (
              <div
                className={cn(
                  "group flex items-center gap-3 rounded-lg border border-transparent px-3 py-2.5 text-sm font-medium transition-all",
                  isActive
                    ? mod.activeColor
                    : mod.enabled
                    ? "text-foreground/80 hover:bg-accent hover:text-foreground"
                    : "text-muted-foreground/50"
                )}
              >
                <div
                  className={cn(
                    "flex h-7 w-7 shrink-0 items-center justify-center rounded-md",
                    isActive ? mod.bgColor : "bg-transparent"
                  )}
                >
                  <Icon
                    className={cn(
                      "h-4 w-4",
                      isActive || mod.enabled
                        ? mod.color
                        : "text-muted-foreground/40"
                    )}
                  />
                </div>
                <span className="flex-1 truncate">{mod.name}</span>
                {!mod.enabled && (
                  <Badge
                    variant="secondary"
                    className="text-[10px] px-1.5 py-0 font-normal"
                  >
                    Pronto
                  </Badge>
                )}
              </div>
            )

            return mod.enabled ? (
              <Link key={mod.name} href={mod.href} onClick={onNavigate}>
                {content}
              </Link>
            ) : (
              <div key={mod.name}>{content}</div>
            )
          })}
        </nav>
      </ScrollArea>

      <Separator />
      <div className="p-3 text-center text-xs text-muted-foreground">
        Life OS v0.1
      </div>
    </div>
  )
}
