"use client"

import { useState } from "react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { MobileSidebar } from "@/components/layout/mobile-sidebar"

interface TopbarProps {
  title: string
}

export function Topbar({ title }: TopbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false)

  const today = new Date()
  const formattedDate = format(today, "EEEE, d 'de' MMMM 'de' yyyy", {
    locale: es,
  })
  const capitalizedDate =
    formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1)

  return (
    <>
      <header className="flex h-14 shrink-0 items-center gap-3 border-b border-border bg-card/50 px-4 backdrop-blur-sm md:px-6">
        {/* Mobile menu button */}
        <Button
          variant="ghost"
          size="icon-sm"
          className="md:hidden"
          onClick={() => setMobileOpen(true)}
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Abrir menu</span>
        </Button>

        {/* Title / Breadcrumb */}
        <div className="flex flex-col gap-0">
          <h1 className="text-base font-semibold tracking-tight">{title}</h1>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Date */}
        <time className="hidden text-sm text-muted-foreground sm:block">
          {capitalizedDate}
        </time>
      </header>

      {/* Mobile Sheet */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-72 p-0">
          <SheetHeader className="sr-only">
            <SheetTitle>Menu de navegacion</SheetTitle>
          </SheetHeader>
          <MobileSidebar onNavigate={() => setMobileOpen(false)} />
        </SheetContent>
      </Sheet>
    </>
  )
}
