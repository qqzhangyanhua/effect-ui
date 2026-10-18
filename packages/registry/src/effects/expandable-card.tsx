"use client"

import * as React from "react"
import { AnimatePresence, motion } from "motion/react"

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
  const [open, setOpen] = React.useState(false)

  return (
    <motion.button
      type="button"
      data-slot="expandable-card"
      layout
      onClick={() => setOpen((current) => !current)}
      className={cn(
        "w-full rounded-xl border bg-card p-5 text-left text-card-foreground shadow-sm",
        className,
      )}
    >
      <motion.h3 layout className="text-lg font-medium">
        {title}
      </motion.h3>
      <p className="mt-2 text-sm text-muted-foreground">{preview}</p>
      <AnimatePresence>
        {open ? (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
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
