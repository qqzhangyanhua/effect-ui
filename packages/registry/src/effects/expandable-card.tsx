"use client"

import * as React from "react"
import { AnimatePresence, motion } from "motion/react"

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export interface ExpandableCardProps {
  className?: string
  title: string
  preview: React.ReactNode
  children: React.ReactNode
}

function ExpandableCard({
  className,
  title,
  preview,
  children,
}: ExpandableCardProps) {
  const reduceMotion = usePrefersReducedMotion()
  const [open, setOpen] = React.useState(false)

  return (
    <motion.button
      type="button"
      data-slot="expandable-card"
      layout={!reduceMotion}
      onClick={() => setOpen((current) => !current)}
      className={cn(
        "w-full rounded-xl border bg-card p-5 text-left text-card-foreground shadow-sm",
        className,
      )}
    >
      <motion.h3 layout={!reduceMotion} className="text-lg font-medium">
        {title}
      </motion.h3>
      <p className="mt-2 text-sm text-muted-foreground">{preview}</p>
      <AnimatePresence>
        {open ? (
          <motion.div
            initial={reduceMotion ? { opacity: 0 } : { opacity: 0, height: 0 }}
            animate={reduceMotion ? { opacity: 1 } : { opacity: 1, height: "auto" }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, height: 0 }}
            transition={reduceMotion ? { duration: 0.15 } : undefined}
            className="overflow-hidden"
          >
            <div className="pt-3 text-sm">{children}</div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </motion.button>
  )
}

export { ExpandableCard }
