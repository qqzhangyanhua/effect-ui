"use client"

// Ported from Watermelon UI (MIT, (c) 2025-present Watermelon Contributors) — https://github.com/WatermelonCorp/watermellon-registry/blob/86052b8/src/components/watermelon-ui/journal-navigation-base.tsx

import { useEffect, useRef, useState, type ReactNode } from "react"
import { AnimatePresence, motion } from "motion/react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"

export interface JournalEntry {
  id: string | number
  day: number
  month: string
  year?: number
  content: ReactNode
}

export interface JournalNavigationProps {
  entries: JournalEntry[]
  initialIndex?: number
  onEntryChange?: (entry: JournalEntry) => void
  color?: string
  duration?: number
  intensity?: number
  speed?: number
  className?: string
}

export function JournalNavigation({
  entries,
  initialIndex = 0,
  onEntryChange,
  color = "var(--accent)",
  duration = 300,
  intensity = 1.2,
  speed = 1,
  className,
}: JournalNavigationProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const reduced = usePrefersReducedMotion()
  const live = useAnimationActive(rootRef)
  const [currentIndex, setCurrentIndex] = useState(initialIndex)
  const [travel, setTravel] = useState(0)
  const onChangeRef = useRef(onEntryChange)
  const count = entries.length
  const index = count === 0 ? 0 : Math.min(Math.max(currentIndex, 0), count - 1)
  const entry = entries[index]
  const itemHeight = 45
  const spring = reduced || !live ? { duration: 0 } : { type: "spring" as const, stiffness: 260 * speed, damping: 32, mass: 0.6 }
  const charDelay = reduced ? 0 : Math.max(0, duration) / 1000 / 30

  useEffect(() => {
    onChangeRef.current = onEntryChange
  }, [onEntryChange])

  useEffect(() => {
    if (entry) onChangeRef.current?.(entry)
  }, [entry])

  const go = (next: number) => {
    if (next === index || next < 0 || next >= count) return
    setTravel(next > index ? 1 : -1)
    setCurrentIndex(next)
  }

  return (
    <div
      ref={rootRef}
      data-slot="journal-navigation"
      data-motion={live && !reduced ? "on" : "off"}
      className={`flex w-full items-center justify-center p-4 motion-reduce:transition-none ${className ?? ""}`}
    >
      <div className="flex h-80 w-full max-w-md overflow-hidden rounded-lg border border-border bg-muted">
        <div className="relative m-1 w-14 overflow-hidden rounded-lg border border-border bg-background">
          <div className="pointer-events-none absolute inset-x-0 top-0 z-20 h-16 bg-linear-to-b from-background to-transparent" />
          <div className="absolute top-1/2 left-0 z-10 w-full -translate-y-5">
            <motion.div
              drag={count > 1 ? "y" : false}
              dragConstraints={{ top: -Math.max(0, count - 1) * itemHeight, bottom: 0 }}
              onDragEnd={(_, info) => {
                const steps = Math.max(Math.abs(info.velocity.y) > 200 ? 1 : 0, Math.round(Math.abs(info.offset.y) / itemHeight))
                go(index + (info.offset.y < 0 ? steps : -steps))
              }}
              animate={{ y: -(index * itemHeight) }}
              transition={spring}
              className="flex cursor-grab flex-col items-center gap-1.5 active:cursor-grabbing"
            >
              {entries.map((item, itemIndex) => {
                const active = itemIndex === index
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => go(itemIndex)}
                    className="flex size-9 shrink-0 items-center justify-center rounded-lg text-sm font-bold"
                    style={{
                      background: active ? color : "transparent",
                      color: active ? "var(--accent-foreground)" : "var(--muted-foreground)",
                      transform: `scale(${active ? intensity : 1})`,
                    }}
                  >
                    {String(item.day).padStart(2, "0")}
                  </button>
                )
              })}
            </motion.div>
          </div>
          <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-16 bg-linear-to-t from-background to-transparent" />
        </div>
        <div className="flex min-w-0 flex-1 flex-col p-4">
          <div className="mb-4 flex items-center justify-between gap-2">
            <div className="text-lg font-medium text-muted-foreground tabular-nums">
              {entry ? `${entry.month} ${String(entry.day).padStart(2, "0")}` : ""}
            </div>
            <div className="flex gap-2">
              <button type="button" aria-label="Previous" disabled={index === 0} onClick={() => go(index - 1)} className="flex size-8 items-center justify-center rounded-lg bg-background text-muted-foreground active:bg-accent disabled:opacity-40">
                <ChevronLeft aria-hidden="true" size={18} />
              </button>
              <button type="button" aria-label="Next" disabled={index >= count - 1} onClick={() => go(index + 1)} className="flex size-8 items-center justify-center rounded-lg bg-background text-muted-foreground active:bg-accent disabled:opacity-40">
                <ChevronRight aria-hidden="true" size={18} />
              </button>
            </div>
          </div>
          <div className="relative flex-1 overflow-hidden">
            <AnimatePresence mode="wait" custom={travel}>
              {entry ? (
                <motion.div
                  key={entry.id}
                  custom={travel}
                  initial={reduced ? false : { y: travel > 0 ? 8 : -8, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: travel > 0 ? -8 : 8, opacity: 0 }}
                  transition={{ duration: reduced ? 0 : 0.25 }}
                  className="text-lg leading-relaxed font-bold text-foreground"
                >
                  {typeof entry.content === "string" ? <JournalCopy text={entry.content} delay={charDelay} play={live && !reduced} /> : entry.content}
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  )
}

function JournalCopy({ text, delay, play }: { text: string; delay: number; play: boolean }) {
  const chars = Array.from(text)
  return (
    <p>
      {chars.map((char, index) => (
        <motion.span
          key={`${index}-${char}`}
          initial={play ? { y: 4, opacity: 0, filter: "blur(2px)" } : false}
          animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
          transition={{ type: "spring", bounce: 0.1, duration: 0.3, delay: play ? index * delay : 0 }}
          className="inline-block whitespace-pre"
        >
          {char}
        </motion.span>
      ))}
    </p>
  )
}
