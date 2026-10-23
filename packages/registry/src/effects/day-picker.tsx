"use client"

// Ported from uselayouts (MIT, (c) 2025 Urvish Mali) — https://github.com/iurvish/uselayouts/blob/main/registry/default/example/day-picker.tsx

import { useState } from "react"
import { Check, ChevronsUpDown } from "lucide-react"
import { AnimatePresence, motion } from "motion/react"

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
const options = ["Daily", "Weekly", "Monthly", "Yearly"] as const

type Frequency = (typeof options)[number]

export interface DayPickerProps {
  className?: string
  onChange?: (value: { frequency: Frequency; day: number }) => void
}

export function DayPicker({ className, onChange }: DayPickerProps) {
  const reduced = usePrefersReducedMotion()
  const [day, setDay] = useState(1)
  const [option, setOption] = useState<Frequency>("Daily")
  const [picking, setPicking] = useState(false)
  const [selector, setSelector] = useState(true)
  const spring = reduced ? { duration: 0 } : { type: "spring" as const, damping: 30, stiffness: 400 }

  const choose = (next: Frequency) => {
    setOption(next)
    setSelector(true)
    onChange?.({ frequency: next, day })
  }

  return (
    <motion.div
      layout
      transition={spring}
      data-frequency={option}
      data-day={days[day] ?? "Mon"}
      className={cn("flex w-full max-w-xs flex-col gap-1.5 overflow-hidden rounded-3xl bg-[var(--muted)] p-1.5 text-sm font-medium motion-reduce:transition-none", className)}
    >
      <div className="relative flex items-center justify-between">
        <div className={cn("flex h-full items-center px-3 py-2 text-[var(--muted-foreground)]", picking && "blur-sm")}>Frequency</div>
        {picking ? (
          <div className="absolute inset-0 flex items-center gap-2">
            <div className="relative flex flex-1 items-center rounded-3xl bg-[var(--background)] px-1">
              {options.map((item) => (
                <button
                  key={item}
                  type="button"
                  aria-pressed={option === item}
                  onClick={() => choose(item)}
                  className={cn("relative rounded-3xl px-2 py-1 text-[var(--muted-foreground)]", option === item && "text-[var(--foreground)]")}
                >
                  {option === item ? <motion.span layoutId="day-option" transition={spring} className="absolute inset-0 rounded-3xl bg-[var(--secondary)]" /> : null}
                  <span className="relative z-10">{item}</span>
                </button>
              ))}
            </div>
            <button
              type="button"
              aria-label="Confirm frequency"
              onClick={() => {
                setPicking(false)
                setSelector(false)
              }}
              className="flex h-full items-center rounded-3xl bg-[var(--primary)] px-2.5 text-[var(--primary-foreground)]"
            >
              <Check className="size-4" />
            </button>
          </div>
        ) : (
          <button type="button" aria-expanded={false} onClick={() => setPicking(true)} className="relative flex items-center rounded-full bg-[var(--background)]">
            <span className="py-2 pl-3 text-[var(--foreground)]">{option === "Weekly" ? `${option}, ${days[day] ?? "Mon"}` : option}</span>
            <ChevronsUpDown className="mx-2 size-3.5 -rotate-90 text-[var(--muted-foreground)]" />
          </button>
        )}
      </div>
      <AnimatePresence>
        {selector && option === "Weekly" ? (
          <motion.div
            initial={reduced ? false : { opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduced ? undefined : { opacity: 0, y: -8 }}
            transition={spring}
            className="flex justify-between overflow-hidden rounded-full bg-[var(--background)] px-2 py-1 text-[var(--muted-foreground)]"
          >
            {days.map((name, index) => (
              <button
                key={name}
                type="button"
                aria-pressed={index === day}
                onClick={() => {
                  setDay(index)
                  onChange?.({ frequency: option, day: index })
                }}
                className={cn("relative rounded-3xl px-2 py-1", index === day && "text-[var(--foreground)]")}
              >
                <span className="relative z-10">{name}</span>
                {index === day ? <motion.span layoutId="weekday" transition={spring} className="absolute inset-0 rounded-3xl bg-[var(--secondary)]" /> : null}
              </button>
            ))}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </motion.div>
  )
}

export default DayPicker
