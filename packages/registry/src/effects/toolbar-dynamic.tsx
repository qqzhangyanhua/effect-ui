"use client"

// Ported from Motion Primitives (MIT) — https://github.com/ibelick/motion-primitives/blob/main/components/core/toolbar-dynamic.tsx

import { useRef, useState, type ReactNode } from "react"
import { ArrowLeft, Search } from "lucide-react"
import { MotionConfig, motion } from "motion/react"

import { useClickOutside } from "@/hooks/use-click-outside"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export interface ToolbarDynamicProps {
  items?: readonly { id: string; label: string; icon: ReactNode }[]
  placeholder?: string
  className?: string
}

function ToolbarDynamic({ items = [], placeholder = "搜索", className }: ToolbarDynamicProps) {
  const reduced = usePrefersReducedMotion()
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  useClickOutside(rootRef, () => setOpen(false))

  return (
    <MotionConfig transition={reduced ? { duration: 0 } : { type: "spring", bounce: 0.12, duration: 0.28 }}>
      <div ref={rootRef} data-slot="toolbar-dynamic" data-reduced={reduced ? "true" : "false"} className={cn("w-fit", className)}>
        <motion.div
          className="overflow-hidden rounded-xl border bg-popover p-2 text-popover-foreground shadow-sm"
          initial={false}
          animate={{ width: open ? 280 : "auto" }}
        >
          {open ? (
            <div className="flex items-center gap-2">
              <button type="button" aria-label="返回" className="grid size-9 place-items-center rounded-lg hover:bg-muted" onClick={() => setOpen(false)}>
                <ArrowLeft className="size-5" />
              </button>
              <input autoFocus aria-label={placeholder} placeholder={placeholder} className="h-9 w-full bg-transparent text-sm outline-none" />
            </div>
          ) : (
            <div className="flex items-center gap-1">
              {items.map((item) => (
                <button key={item.id} type="button" aria-label={item.label} className="grid size-9 place-items-center rounded-lg hover:bg-muted">
                  {item.icon}
                </button>
              ))}
              <button type="button" aria-label={placeholder} className="grid size-9 place-items-center rounded-lg hover:bg-muted" onClick={() => setOpen(true)}>
                <Search className="size-5" />
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </MotionConfig>
  )
}

export { ToolbarDynamic }
