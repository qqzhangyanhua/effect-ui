"use client"

import { Menu } from "lucide-react"
import { useEffect, useState } from "react"
import { createPortal } from "react-dom"
import { usePathname } from "next/navigation"

import { SiteNav } from "@/components/site-nav"

function MobileNav() {
  const pathname = usePathname()
  const [openPath, setOpenPath] = useState<string | null>(null)
  // Cross-page links must stay mounted until Next.js finishes navigation.
  const open = openPath === pathname

  useEffect(() => {
    if (!open) return
    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape") return
      setOpenPath(null)
    }
    document.addEventListener("keydown", onKeyDown)
    return () => document.removeEventListener("keydown", onKeyDown)
  }, [open])

  return (
    <>
      <button
        type="button"
        className="inline-flex size-8 items-center justify-center rounded-md hover:bg-accent md:hidden"
        aria-label="打开组件导航"
        aria-expanded={open}
        onClick={() => setOpenPath(open ? null : pathname)}
      >
        <Menu className="size-4" aria-hidden />
      </button>
      {open
        ? createPortal(
            <div className="fixed inset-0 z-50 md:hidden">
              <button
                type="button"
                className="absolute inset-0 bg-black/40"
                aria-label="关闭组件导航"
                onClick={() => setOpenPath(null)}
              />
              <div
                role="dialog"
                aria-modal="true"
                aria-label="组件导航"
                className="relative flex h-full w-60 max-w-[85vw] flex-col bg-sidebar p-0 text-sidebar-foreground"
              >
                <div className="border-b border-sidebar-border px-4 py-4 pr-10">
                  <h2 className="text-base font-semibold">组件导航</h2>
                  <p className="sr-only">按分类浏览全部组件</p>
                </div>
                <div className="min-h-0 flex-1 overflow-y-auto">
                  <SiteNav onSelectCurrent={() => setOpenPath(null)} />
                </div>
              </div>
            </div>,
            document.body,
          )
        : null}
    </>
  )
}

export { MobileNav }
