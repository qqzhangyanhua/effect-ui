"use client"

import { AnimatePresence, motion } from "motion/react"
import * as React from "react"

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export interface FlowingMenuItem {
  label: string
}

export interface FlowingMenuProps {
  className?: string
  items?: FlowingMenuItem[]
}

const DEFAULT_ITEMS: FlowingMenuItem[] = [
  { label: "Index" },
  { label: "Studio" },
  { label: "Archive" },
  { label: "Contact" },
]

function FlowingMenu({ className, items = DEFAULT_ITEMS }: FlowingMenuProps) {
  const reduced = usePrefersReducedMotion()

  return (
    <div data-slot="flowing-menu" className={cn("w-full", className)}>
      <style>
        {`@keyframes flowing-marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }`}
      </style>
      <ul className="divide-y border-y">
        {items.map((item) => (
          <MenuRow key={item.label} label={item.label} reduced={reduced} />
        ))}
      </ul>
    </div>
  )
}

function MenuRow({ label, reduced }: { label: string; reduced: boolean }) {
  const [presence, setPresence] = React.useState<"left" | "right" | null>(null)
  const band = `${label}  ·  `.repeat(8)

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
            transition={reduced ? { duration: 0 } : { duration: 0.38, ease: "easeOut" }}
          >
            <span
              className="flex w-max font-display text-5xl whitespace-nowrap sm:text-6xl"
              style={reduced ? undefined : { animation: "flowing-marquee 9s linear infinite" }}
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
