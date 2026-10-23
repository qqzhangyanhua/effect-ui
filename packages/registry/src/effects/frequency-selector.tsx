"use client"

// Ported from Watermelon UI (MIT, (c) 2025-present Watermelon Contributors) — https://github.com/WatermelonCorp/watermellon-registry/blob/86052b8/src/components/watermelon-ui/frequency-selector-base.tsx

import { useId, useState } from "react"
import { AnimatePresence, LayoutGroup, motion } from "motion/react"
import { Check, ChevronRight } from "lucide-react"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"

export type FrequencyType = "Daily" | "Weekly" | "Monthly" | "Yearly"

export interface FrequencyData {
  type: FrequencyType
  subValue?: string
}

export interface FrequencySelectorProps {
  value: FrequencyData
  onChange: (data: FrequencyData) => void
  className?: string
}

const frequencies: FrequencyType[] = ["Daily", "Weekly", "Monthly", "Yearly"]

const subOptions: Record<FrequencyType, string[]> = {
  Daily: [],
  Weekly: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
  Monthly: Array.from({ length: 31 }, (_, index) => String(index + 1)),
  Yearly: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
}

export function FrequencySelector({ value, onChange, className }: FrequencySelectorProps) {
  const reduced = usePrefersReducedMotion()
  const group = useId()
  const [open, setOpen] = useState(false)
  const [tempType, setTempType] = useState<FrequencyType>(value.type)
  const [tempSub, setTempSub] = useState(value.subValue)
  const spring = reduced ? { duration: 0 } : { type: "spring" as const, bounce: 0.3, duration: 0.7 }
  const options = subOptions[tempType]

  const reveal = () => {
    setTempType(value.type)
    setTempSub(value.subValue || subOptions[value.type][0])
    setOpen(true)
  }

  const confirm = () => {
    onChange({ type: tempType, subValue: tempType === "Daily" ? undefined : tempSub })
    setOpen(false)
  }

  return (
    <LayoutGroup id={group}>
      <div data-slot="frequency-selector" data-open={open ? "true" : "false"} className={`flex w-full items-center justify-center motion-reduce:transition-none ${className ?? ""}`}>
        <AnimatePresence mode="wait">
          {!open ? (
            <motion.button
              key="closed"
              type="button"
              layout
              onClick={reveal}
              transition={spring}
              className="flex min-h-14 w-full max-w-md items-center justify-between rounded-lg border border-border bg-muted p-1 pl-4 text-left"
            >
              <span className="text-base font-bold text-muted-foreground">Frequency</span>
              <span className="flex min-h-12 items-center gap-2 rounded-lg border border-border bg-background px-4 font-bold text-foreground">
                {value.type}
                {value.subValue ? `, ${value.subValue}` : ""}
                <ChevronRight size={18} className="text-muted-foreground" aria-hidden="true" />
              </span>
            </motion.button>
          ) : (
            <motion.div key="open" layout transition={spring} className="flex w-full max-w-lg flex-col gap-3 rounded-lg border border-border bg-muted p-2">
              <div className="flex items-center gap-2">
                <div className="flex h-12 flex-1 items-center gap-1 overflow-x-auto rounded-lg bg-background p-1">
                  {frequencies.map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => {
                        setTempType(type)
                        setTempSub(subOptions[type][0])
                      }}
                      className="relative h-full flex-none px-4 text-sm font-bold text-foreground"
                    >
                      {tempType === type ? <motion.span layoutId={`${group}-tab`} className="absolute inset-0 rounded-lg border border-border bg-muted" /> : null}
                      <span className="relative z-10">{type}</span>
                    </button>
                  ))}
                </div>
                <motion.button type="button" aria-label="Confirm frequency" whileTap={{ scale: 0.9 }} onClick={confirm} className="flex size-12 items-center justify-center rounded-lg bg-foreground text-background">
                  <Check size={18} aria-hidden="true" />
                </motion.button>
              </div>
              <AnimatePresence>
                {options.length > 0 ? (
                  <motion.div key={tempType} initial={reduced ? false : { opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className={`grid gap-2 rounded-lg bg-background p-3 ${tempType === "Yearly" ? "grid-cols-4" : "grid-cols-7"}`}>
                    {options.map((option) => (
                      <button key={option} type="button" onClick={() => setTempSub(option)} className="relative h-9 text-sm font-bold text-foreground">
                        {tempSub === option ? <motion.span layoutId={`${group}-sub`} className="absolute inset-0 rounded-lg border border-border bg-muted" /> : null}
                        <span className="relative z-10">{option}</span>
                      </button>
                    ))}
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </LayoutGroup>
  )
}
