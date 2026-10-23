"use client"

// Ported from GodUI (MIT, (c) 2026 Lucas Bassetti) — https://github.com/LucasBassetti/godui/blob/1f632a7/packages/lab/src/progressive-card-reveal/progressive-card-reveal.tsx

import { AnimatePresence, motion } from "motion/react"
import { createContext, useContext, useMemo, useRef, type HTMLAttributes, type ReactNode } from "react"
import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"

export type ProgressiveCardRevealProps = HTMLAttributes<HTMLDivElement> & {
  activeIndex: number
  onActiveChange?: (index: number) => void
  maxDepth?: number
  color?: string
  duration?: number
  intensity?: number
  size?: number
}

type RevealContextValue = {
  activeIndex: number
  onActiveChange?: (index: number) => void
  maxDepth?: number
  color: string
  duration: number
  intensity: number
  size: number
  reduced: boolean
  live: boolean
}

const RevealContext = createContext<RevealContextValue | null>(null)
const CardIndexContext = createContext<number | null>(null)

function collapsedWidth(distance: number, base: number, step: number) {
  const width = Math.max(base - Math.max(0, distance - 1) * step, 48)
  return `${width}%`
}

function CardCollapsed({ children }: { children?: ReactNode }) {
  return <span hidden>{children}</span>
}
CardCollapsed.displayName = "ProgressiveCardReveal.CardCollapsed"

function CardExpanded({ children }: { children?: ReactNode }) {
  return <span hidden>{children}</span>
}
CardExpanded.displayName = "ProgressiveCardReveal.CardExpanded"

function extractSlots(children: ReactNode) {
  let collapsed: ReactNode = null
  let expanded: ReactNode = null
  const walk = (nodes: ReactNode) => {
    if (!nodes) return
    if (Array.isArray(nodes)) {
      nodes.forEach(walk)
      return
    }
    if (typeof nodes === "object" && nodes && "type" in nodes) {
      const element = nodes as { type: unknown; props?: { children?: ReactNode } }
      if (element.type === CardCollapsed) collapsed = element.props?.children
      else if (element.type === CardExpanded) expanded = element.props?.children
    }
  }
  walk(children)
  return { collapsed, expanded }
}

function Card({ children, className, ...props }: Omit<HTMLAttributes<HTMLDivElement>, "onDrag" | "onDragStart" | "onDragEnd" | "onAnimationStart">) {
  const reveal = useContext(RevealContext)
  const index = useContext(CardIndexContext)
  if (!reveal || index == null) throw new Error("ProgressiveCardReveal.Card must be rendered inside ProgressiveCardReveal.")
  const expanded = index === reveal.activeIndex
  const distance = Math.abs(index - reveal.activeIndex)
  const depth = reveal.maxDepth != null ? Math.min(distance, reveal.maxDepth) : distance
  const slots = extractSlots(children)
  const spring = reveal.reduced || !reveal.live
    ? { duration: 0 }
    : { type: "spring" as const, stiffness: Math.max(120, 320 * (480 / Math.max(reveal.duration, 160))), damping: 32, mass: 0.9 }
  return (
    <motion.div
      layout={!reveal.reduced && reveal.live}
      data-expanded={expanded}
      initial={false}
      transition={spring}
      whileTap={reveal.reduced || expanded ? undefined : { scale: 0.98 }}
      style={{
        width: expanded ? "100%" : collapsedWidth(depth, reveal.size, reveal.intensity),
        borderRadius: expanded ? 20 : 9999,
        borderColor: reveal.color,
      }}
      className={`relative overflow-hidden border bg-card text-card-foreground shadow-sm ${className ?? ""}`}
      {...props}
    >
      <AnimatePresence mode="popLayout" initial={false}>
        {expanded ? (
          <motion.div key="expanded" initial={reveal.reduced ? false : { opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={reveal.reduced ? { duration: 0 } : { duration: 0.2, ease: [0.65, 0, 0.35, 1] }} className="px-5 py-4">
            {slots.expanded}
          </motion.div>
        ) : (
          <motion.button
            key="collapsed"
            type="button"
            initial={reveal.reduced ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0 } }}
            onClick={() => reveal.onActiveChange?.(index)}
            aria-expanded={false}
            className="block w-full cursor-pointer px-5 py-2 text-left text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            {slots.collapsed}
          </motion.button>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
Card.displayName = "ProgressiveCardReveal.Card"

function Root({
  activeIndex,
  onActiveChange,
  maxDepth,
  color = "var(--border)",
  duration = 480,
  intensity = 7,
  size = 90,
  children,
  className,
  ...props
}: ProgressiveCardRevealProps) {
  const ref = useRef<HTMLDivElement>(null)
  const reduced = usePrefersReducedMotion()
  const live = useAnimationActive(ref)
  const context = useMemo<RevealContextValue>(
    () => ({ activeIndex, onActiveChange, maxDepth, color, duration, intensity, size, reduced, live }),
    [activeIndex, onActiveChange, maxDepth, color, duration, intensity, size, reduced, live],
  )
  const list = Array.isArray(children) ? children : [children]
  const rendered: ReactNode[] = []
  let nextIndex = 0
  for (const child of list) {
    if (child && typeof child === "object" && "type" in child && (child as { type: unknown }).type === Card) {
      const index = nextIndex
      nextIndex += 1
      rendered.push(
        <CardIndexContext.Provider key={index} value={index}>
          {child as ReactNode}
        </CardIndexContext.Provider>,
      )
    } else {
      rendered.push(child)
    }
  }
  return (
    <RevealContext.Provider value={context}>
      <div ref={ref} data-slot="progressive-card-reveal" data-motion={live && !reduced ? "on" : "off"} className={`flex flex-col items-center gap-2 motion-reduce:transition-none ${className ?? ""}`} {...props}>
        {rendered}
      </div>
    </RevealContext.Provider>
  )
}

export const ProgressiveCardReveal = Object.assign(Root, { Card, CardCollapsed, CardExpanded })
