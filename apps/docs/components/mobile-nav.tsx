"use client"

import { Menu } from "lucide-react"
import { useState } from "react"
import { usePathname } from "next/navigation"

import { Button } from "@effect-ui/registry/ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@effect-ui/registry/ui/sheet"

import { SiteNav } from "@/components/site-nav"

function MobileNav() {
  const pathname = usePathname()
  const [openPath, setOpenPath] = useState<string | null>(null)
  // Cross-page links must stay mounted until Next.js finishes navigation.
  const open = openPath === pathname

  return (
    <Sheet open={open} onOpenChange={(next) => setOpenPath(next ? pathname : null)}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden" aria-label="打开组件导航">
          <Menu className="size-4" aria-hidden />
        </Button>
      </SheetTrigger>
      <SheetContent
        side="left"
        className="w-60 max-w-[85vw] gap-0 bg-sidebar p-0 text-sidebar-foreground"
      >
        <SheetHeader className="border-b border-sidebar-border pr-10">
          <SheetTitle>组件导航</SheetTitle>
          <SheetDescription className="sr-only">按分类浏览全部组件</SheetDescription>
        </SheetHeader>
        <div className="min-h-0 flex-1 overflow-y-auto">
          <SiteNav onSelectCurrent={() => setOpenPath(null)} />
        </div>
      </SheetContent>
    </Sheet>
  )
}

export { MobileNav }
