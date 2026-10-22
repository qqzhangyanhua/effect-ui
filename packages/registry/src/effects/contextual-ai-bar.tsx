"use client"

// Ported from Watermelon UI (MIT, (c) 2025-present Watermelon Contributors) — https://github.com/WatermelonCorp/watermellon-registry/blob/86052b8/src/components/watermelon-ui/contextual-ai-bar-base.tsx

import { useId, useState, type ReactNode } from "react"
import { AnimatePresence, motion } from "motion/react"
import { ArrowRight } from "lucide-react"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"

export interface ContextualAiBarProps {
  defaultExpanded?: boolean
  placeholder?: string
  tools?: ReactNode[]
  musicIcon: ReactNode
  sparkleIcon: ReactNode
  className?: string
}

export function ContextualAiBar({
  defaultExpanded = false,
  placeholder = "Refine with AI",
  tools = [],
  musicIcon,
  sparkleIcon,
  className,
}: ContextualAiBarProps) {
  const reduced = usePrefersReducedMotion()
  const pill = useId()
  const [expanded, setExpanded] = useState(defaultExpanded)
  const spring = reduced ? { duration: 0 } : { type: "spring" as const, stiffness: 220, damping: 22, mass: 1 }

  return (
    <motion.div
      layout
      data-slot="contextual-ai-bar"
      data-expanded={expanded ? "true" : "false"}
      transition={spring}
      className={`relative flex w-full max-w-md items-center justify-between overflow-hidden rounded-full border border-border bg-card p-1 shadow-sm motion-reduce:transition-none ${className ?? ""}`}
    >
      <div className="flex shrink-0 items-center gap-1 rounded-full bg-background p-1 shadow-sm">
        <button type="button" aria-label="Show tools" aria-pressed={!expanded} onClick={() => setExpanded(false)} className="relative rounded-full p-2.5 active:scale-95">
          {!expanded ? <motion.span layoutId={pill} className="absolute inset-0 rounded-full bg-muted" /> : null}
          <span className="relative z-10">{musicIcon}</span>
        </button>
        <button type="button" aria-label="Refine with AI" aria-pressed={expanded} onClick={() => setExpanded(true)} className="relative rounded-full p-2.5 active:scale-95">
          {expanded ? <motion.span layoutId={pill} className="absolute inset-0 rounded-full bg-muted" /> : null}
          <span className="relative z-10">{sparkleIcon}</span>
        </button>
      </div>
      <AnimatePresence mode="popLayout" initial={false}>
        {!expanded ? (
          <motion.div key="tools" initial={reduced ? false : { opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="flex flex-1 items-center justify-end gap-4 px-4 text-foreground">
            {tools.map((tool, index) => (
              <span key={index} className="active:scale-95">{tool}</span>
            ))}
          </motion.div>
        ) : (
          <motion.div key="input" initial={reduced ? false : { opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-1 items-center gap-2 pr-1 pl-3">
            <input placeholder={placeholder} className="w-full flex-1 border-none bg-transparent text-lg text-foreground outline-none placeholder:text-muted-foreground" />
            <button type="button" aria-label="Send" className="rounded-full border border-border bg-background p-2.5 text-foreground active:scale-95">
              <ArrowRight size={20} aria-hidden="true" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
