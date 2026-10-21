"use client"

// Ported from Motion Primitives (MIT) — https://github.com/ibelick/motion-primitives/blob/main/components/core/toolbar-expandable.tsx

import { useRef, useState, type ReactNode } from "react"
import { AnimatePresence, MotionConfig, motion } from "motion/react"

import { useClickOutside } from "@/hooks/use-click-outside"
import { useMeasure } from "@/hooks/use-measure"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export interface ToolbarExpandableProps {
  items: readonly { id: string; label: string; icon: ReactNode; content: ReactNode }[]
  className?: string
}

function ToolbarExpandable({ items, className }: ToolbarExpandableProps) {
  const reduced = usePrefersReducedMotion()
  const [active, setActive] = useState<string | null>(null)
  const rootRef = useRef<HTMLDivElement>(null)
  const [contentRef, contentSize] = useMeasure<HTMLDivElement>()
  useClickOutside(rootRef, () => setActive(null))

  return (
    <MotionConfig transition={reduced ? { duration: 0 } : { type: "spring", bounce: 0.1, duration: 0.28 }}>
      <div ref={rootRef} data-slot="toolbar-expandable" data-reduced={reduced ? "true" : "false"} className={cn("w-fit rounded-xl border bg-popover text-popover-foreground shadow-sm", className)}>
        <AnimatePresence initial={false}>
          {active ? (
            <motion.div
              key="panel"
              className="overflow-hidden"
              initial={reduced ? false : { height: 0, opacity: 0 }}
              animate={{ height: reduced ? "auto" : contentSize.height || "auto", opacity: 1 }}
              exit={reduced ? { opacity: 0 } : { height: 0, opacity: 0 }}
            >
              <div ref={contentRef} className="p-3 text-sm">
                {items.map((item) => (
                  <div key={item.id} hidden={item.id !== active}>
                    {item.content}
                  </div>
                ))}
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
        <div className="flex gap-1 p-2">
          {items.map((item) => (
            <button
              key={item.id}
              type="button"
              aria-label={item.label}
              aria-expanded={active === item.id}
              className={cn("grid size-9 place-items-center rounded-lg hover:bg-muted", active === item.id && "bg-muted")}
              onClick={() => setActive((current) => (current === item.id ? null : item.id))}
            >
              {item.icon}
            </button>
          ))}
        </div>
      </div>
    </MotionConfig>
  )
}

export { ToolbarExpandable }
