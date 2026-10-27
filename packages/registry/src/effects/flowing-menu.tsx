"use client"

import { AnimatePresence, motion } from "motion/react"
import * as React from "react"

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/cn"

export interface FlowingMenuItem {
  label: string
}

export interface FlowingMenuProps {
  className?: string
  items?: FlowingMenuItem[]
  duration?: number
  speed?: number
}

const DEFAULT_ITEMS: FlowingMenuItem[] = [
  { label: "Index" },
  { label: "Studio" },
  { label: "Archive" },
  { label: "Contact" },
]

function FlowingMenu({ className, items = DEFAULT_ITEMS, duration, speed }: FlowingMenuProps) {
  const reduced = usePrefersReducedMotion()

  return (
    <div data-slot="flowing-menu" className={cn("w-full", className)}>
      <style>
        {`@keyframes flowing-marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }`}
      </style>
      <ul className="divide-y border-y">
        {items.map((item) => (
          <MenuRow key={item.label} label={item.label} reduced={reduced} duration={duration} speed={speed} />
        ))}
      </ul>
    </div>
  )
}

function MenuRow({
  label,
  reduced,
  duration,
  speed,
}: {
  label: string
  reduced: boolean
  duration?: number
  speed?: number
}) {
  const [presence, setPresence] = React.useState<"left" | "right" | null>(null)
  const band = `${label}  ·  `.repeat(8)
  const slide = duration === undefined || duration === 380 ? 0.38 : duration / 1000
  const marquee =
    speed === undefined || speed === 1
      ? "flowing-marquee 9s linear infinite"
      : `flowing-marquee ${9 / speed}s linear infinite`

  return (
    <li
      className="relative overflow-hidden"
      onPointerEnter={(event) => {
        const rect = event.currentTarget.getBoundingClientRect()
        setPresence(event.clientX < rect.left + rect.width / 2 ? "left" : "right")
      }}
      onPointerLeave={() => setPresence(null)}
    >
      <div className="px-2 py-4 font-display text-5xl tracking-tight sm:text-6xl">{label}</div>
      <AnimatePresence>
        {presence ? (
          <motion.div
            key="band"
            className="absolute inset-0 flex items-center overflow-hidden bg-foreground text-background"
            initial={reduced ? { x: 0 } : { x: presence === "left" ? "-100%" : "100%" }}
            animate={{ x: 0 }}
            exit={reduced ? { x: 0 } : { x: presence === "left" ? "-100%" : "100%" }}
            transition={reduced ? { duration: 0 } : { duration: slide, ease: "easeOut" }}
          >
            <span
              className="flex w-max font-display text-5xl whitespace-nowrap sm:text-6xl"
              style={reduced ? undefined : { animation: marquee }}
            >
              <span className="px-4">{band}</span>
              <span className="px-4">{band}</span>
            </span>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </li>
  )
}

export { FlowingMenu }
