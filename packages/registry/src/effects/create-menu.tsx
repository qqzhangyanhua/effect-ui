"use client"

// Ported from uselayouts (MIT, (c) 2025 Urvish Mali) — https://github.com/iurvish/uselayouts/blob/main/registry/default/example/create-menu.tsx

import { useEffect, useRef, useState } from "react"
import { FileText, LayoutTemplate, Lightbulb, Pencil, Plus, Sparkles } from "lucide-react"
import { motion } from "motion/react"

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

const items = [
  { label: "New Post", icon: FileText },
  { label: "Generate Idea", icon: Lightbulb },
  { label: "Create Thread", icon: Pencil },
  { label: "New Template", icon: LayoutTemplate },
  { label: "Repurpose Content", icon: Sparkles },
  { label: "AI Quick Tool", icon: Sparkles },
]

export interface CreateMenuProps {
  label?: string
  className?: string
  onSelect?: (label: string) => void
}

export function CreateMenu({ label = "Start Creating", className, onSelect }: CreateMenuProps) {
  const reduced = usePrefersReducedMotion()
  const rootRef = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!open) return
    const onPointer = (event: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) setOpen(false)
    }
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false)
    }
    document.addEventListener("pointerdown", onPointer)
    document.addEventListener("keydown", onKey)
    return () => {
      document.removeEventListener("pointerdown", onPointer)
      document.removeEventListener("keydown", onKey)
    }
  }, [open])

  return (
    <div ref={rootRef} className={cn("relative h-10 w-full", className)} data-open={open ? "true" : "false"}>
      <motion.div
        layout
        transition={reduced ? { duration: 0 } : { type: "spring", bounce: 0.3 }}
        className={cn(
          "absolute z-20 w-fit overflow-hidden shadow-sm motion-reduce:transition-none",
          open ? "rounded-xl bg-[var(--popover)] text-[var(--popover-foreground)] ring-1 ring-[var(--border)]" : "rounded-full bg-[var(--primary)] text-[var(--primary-foreground)]",
        )}
      >
        {open ? (
          <div role="menu" className="flex flex-col gap-0.5 p-1">
            {items.map((item) => {
              const Icon = item.icon
              return (
                <button
                  key={item.label}
                  type="button"
                  role="menuitem"
                  className="flex items-center gap-2 rounded-md bg-[var(--muted)] px-3 py-2 text-sm text-[var(--foreground)] hover:bg-[var(--accent)] focus-visible:outline-2 focus-visible:outline-[var(--ring)]"
                  onClick={() => {
                    onSelect?.(item.label)
                    setOpen(false)
                  }}
                >
                  <Icon className="size-4" />
                  {item.label}
                </button>
              )
            })}
          </div>
        ) : (
          <button type="button" aria-expanded={false} className="flex items-center gap-1.5 px-4 py-2" onClick={() => setOpen(true)}>
            <Plus className="size-4" />
            {label}
          </button>
        )}
      </motion.div>
    </div>
  )
}

export default CreateMenu
