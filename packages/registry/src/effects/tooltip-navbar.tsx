"use client"

// Ported from Watermelon UI (MIT, (c) 2025-present Watermelon Contributors) — https://github.com/WatermelonCorp/watermellon-registry/blob/86052b8/src/components/watermelon-ui/tooltip-navbar-base.tsx
// Vertical layout from https://github.com/WatermelonCorp/watermellon-registry/blob/86052b8/src/components/watermelon-ui/vertical-tooltip-navbar-base.tsx

import { useRef, useState, type ReactNode } from "react"
import { AnimatePresence, motion } from "motion/react"
import { Circle, CommandIcon, Crosshair, Download, Inbox, Menu, MessageCircle } from "lucide-react"
import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"

export type TooltipNavbarItem = {
  icon: ReactNode
  label: string
  keys?: string[]
  badge?: boolean
}

export interface TooltipNavbarProps {
  items?: TooltipNavbarItem[]
  direction?: "up" | "down" | "left" | "right"
  color?: string
  duration?: number
  intensity?: number
  speed?: number
  className?: string
}

const defaultItems: TooltipNavbarItem[] = [
  { icon: <MessageCircle className="size-full" />, label: "Comment", keys: ["C"] },
  { icon: <Inbox className="size-full" />, label: "Inbox", keys: ["I"], badge: true },
  { icon: <Circle className="size-full" />, label: "Record", keys: ["R"] },
  { icon: <Crosshair className="size-full" />, label: "Focus Mode", keys: ["F"] },
  { icon: <Download className="size-full" />, label: "Share", keys: ["S"] },
  { icon: <Menu className="size-full" />, label: "Menu", keys: ["M"] },
]

function shortcut(item: TooltipNavbarItem) {
  return (
    <>
      <span>{item.label}</span>
      {item.badge ? (
        <span className="flex items-center rounded-md border border-border p-1">
          <CommandIcon className="size-3" aria-hidden="true" />
        </span>
      ) : null}
      {item.keys?.map((key) => (
        <span key={key} className="rounded-md border border-border px-1 tabular-nums">
          {key}
        </span>
      ))}
    </>
  )
}

export function TooltipNavbar({
  items = defaultItems,
  direction = "up",
  color = "var(--muted)",
  duration = 300,
  intensity = 40,
  speed = 1,
  className,
}: TooltipNavbarProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const reduced = usePrefersReducedMotion()
  const live = useAnimationActive(rootRef)
  const measureRefs = useRef<(HTMLDivElement | null)[]>([])
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([])
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [activeIndex, setActiveIndex] = useState<number | null>(null)
  const [coords, setCoords] = useState({ clipPath: "", shift: 0 })
  const vertical = direction === "left" || direction === "right"
  const spring = reduced ? { duration: 0 } : { type: "spring" as const, bounce: 0, duration: 0.4 / Math.max(speed, 0.1) }

  const place = (index: number) => {
    const label = measureRefs.current[index]
    const icon = buttonRefs.current[index]
    if (!label || !icon) return null
    if (vertical) {
      const total = measureRefs.current.reduce((sum, node) => sum + (node?.offsetHeight || 0), 0) || 1
      const top = (label.offsetTop / total) * 100
      const bottom = 100 - ((label.offsetTop + label.offsetHeight) / total) * 100
      const labelCenter = label.offsetTop + label.offsetHeight / 2
      const iconCenter = icon.offsetTop + icon.offsetHeight / 2
      return { clipPath: `inset(${top}% 0 ${bottom}% 0 round 8px)`, shift: iconCenter - labelCenter }
    }
    const total = measureRefs.current.reduce((sum, node) => sum + (node?.offsetWidth || 0), 0) || 1
    const left = (label.offsetLeft / total) * 100
    const right = 100 - ((label.offsetLeft + label.offsetWidth) / total) * 100
    const labelCenter = label.offsetLeft + label.offsetWidth / 2
    const iconCenter = icon.offsetLeft + icon.offsetWidth / 2
    return { clipPath: `inset(0 ${right}% 0 ${left}% round 8px)`, shift: iconCenter - labelCenter }
  }

  const open = (index: number, immediate: boolean) => {
    const next = place(index)
    if (!next) return
    if (timer.current) clearTimeout(timer.current)
    const wait = immediate || reduced ? 0 : duration
    if (activeIndex !== null || wait === 0) {
      setCoords(next)
      setActiveIndex(index)
      return
    }
    timer.current = setTimeout(() => {
      setCoords(next)
      setActiveIndex(index)
    }, wait)
  }

  const close = () => {
    if (timer.current) clearTimeout(timer.current)
    setActiveIndex(null)
  }

  const tipSide =
    direction === "down" ? "top-full mt-3" : direction === "left" ? "right-full mr-3" : direction === "right" ? "left-full ml-3" : "bottom-full mb-3"

  return (
    <div
      ref={rootRef}
      data-slot="tooltip-navbar"
      data-direction={direction}
      data-motion={live && !reduced ? "on" : "off"}
      className={`relative inline-flex motion-reduce:transition-none ${className ?? ""}`}
      onMouseLeave={close}
    >
      <AnimatePresence>
        {activeIndex !== null && coords.clipPath ? (
          <motion.div key="tip" className={`pointer-events-none absolute z-20 ${vertical ? "top-0" : "left-0"} ${tipSide}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div
              className="text-muted-foreground"
              style={{ background: color }}
              initial={false}
              animate={vertical ? { clipPath: coords.clipPath, y: coords.shift } : { clipPath: coords.clipPath, x: coords.shift }}
              transition={spring}
            >
              <div className={vertical ? "flex flex-col" : "flex"}>
                {items.map((item) => (
                  <div key={item.label} className="flex h-10 items-center gap-1 px-2 text-sm font-medium whitespace-nowrap">
                    {shortcut(item)}
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
      <div className={`z-10 inline-flex rounded-lg border border-border p-2 ${vertical ? "flex-col" : "flex-row"}`} style={{ background: color }}>
        {items.map((item, index) => (
          <button
            key={item.label}
            type="button"
            aria-label={item.label}
            aria-pressed={activeIndex === index}
            ref={(node) => {
              buttonRefs.current[index] = node
            }}
            onPointerEnter={(event) => {
              if (event.pointerType === "mouse") open(index, false)
            }}
            onPointerDown={() => open(index, true)}
            onFocus={() => open(index, true)}
            onBlur={close}
            className="flex items-center justify-center rounded-lg text-muted-foreground hover:bg-accent focus-visible:bg-accent active:bg-accent"
            style={{ width: intensity, height: intensity }}
          >
            <span className="size-5">{item.icon}</span>
          </button>
        ))}
      </div>
      <div className={`pointer-events-none absolute h-0 overflow-hidden opacity-0 ${vertical ? "flex flex-col" : "flex"}`}>
        {items.map((item, index) => (
          <div
            key={item.label}
            ref={(node) => {
              measureRefs.current[index] = node
            }}
            className="flex h-10 items-center gap-1 px-2 text-sm font-medium whitespace-nowrap"
          >
            {shortcut(item)}
          </div>
        ))}
      </div>
    </div>
  )
}
