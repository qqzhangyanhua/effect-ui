"use client"

import * as React from "react"
import { AnimatePresence, motion } from "motion/react"

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export interface FamilyStep {
  title: string
  body: string
}

export interface FamilyDrawerProps {
  steps?: FamilyStep[]
  className?: string
  intensity?: number
}

const defaultSteps: FamilyStep[] = [
  { title: "你", body: "先确认自己的账户。" },
  { title: "家人", body: "把成员加进同一个空间。" },
  { title: "确认", body: "共享组件和主题。" },
]

function FamilyDrawer({ steps = defaultSteps, className, intensity }: FamilyDrawerProps) {
  const reduced = usePrefersReducedMotion()
  const [open, setOpen] = React.useState(false)
  const [step, setStep] = React.useState(0)
  const current = steps[step]
  const lift = intensity === undefined || intensity === 1 ? 8 : 8 * intensity

  return (
    <motion.div
      layout
      transition={reduced ? { duration: 0 } : { type: "spring", stiffness: 260, damping: 28 }}
      className={cn("w-full max-w-sm overflow-hidden rounded-2xl border bg-card shadow-sm", className)}
    >
      {!open || !current ? (
        <button type="button" className="w-full px-4 py-3 text-left text-sm font-medium" onClick={() => setOpen(true)}>
          打开 Family
        </button>
      ) : (
        <div className="space-y-4 p-4">
          <p className="text-xs text-muted-foreground">
            {step + 1} / {steps.length}
          </p>
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={current.title}
              initial={reduced ? false : { opacity: 0, y: lift }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduced ? { opacity: 1 } : { opacity: 0, y: lift === 8 ? -8 : -lift }}
            >
              <h3 className="font-display text-2xl">{current.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{current.body}</p>
            </motion.div>
          </AnimatePresence>
          <div className="flex justify-between">
            <button
              type="button"
              className="text-sm text-muted-foreground"
              onClick={() => {
                if (step === 0) setOpen(false)
                else setStep((value) => value - 1)
              }}
            >
              返回
            </button>
            <button
              type="button"
              className="rounded-full bg-primary px-3 py-1 text-sm text-primary-foreground"
              onClick={() => {
                if (step >= steps.length - 1) {
                  setOpen(false)
                  setStep(0)
                } else setStep((value) => value + 1)
              }}
            >
              {step >= steps.length - 1 ? "完成" : "继续"}
            </button>
          </div>
        </div>
      )}
    </motion.div>
  )
}

export { FamilyDrawer }
