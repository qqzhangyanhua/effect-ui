"use client"

import * as React from "react"
import { motion } from "motion/react"

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export interface BookFlipProps {
  title?: string
  pages?: string[]
  className?: string
}

function BookFlip({
  title = "effect-ui",
  pages = ["把特效复制进项目。", "封面流、书本、旋钮。", "整页模板串起落地页。"],
  className,
}: BookFlipProps) {
  const reduced = usePrefersReducedMotion()
  const [open, setOpen] = React.useState(false)
  const [page, setPage] = React.useState(0)
  const leaf = pages[page] ?? ""

  return (
    <div className={cn("grid place-items-center py-6", className)}>
      <button
        type="button"
        className="relative h-64 w-48 [perspective:1200px]"
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onClick={() => setPage((current) => (current + 1) % pages.length)}
        aria-label={`${title}，点击翻页`}
      >
        <span className="absolute inset-y-2 right-0 left-3 rounded-r-md border bg-amber-50 shadow-md" />
        <span className="absolute inset-y-4 right-2 left-5 rounded-sm bg-white p-3 text-left text-xs text-zinc-700">
          {leaf}
        </span>
        <motion.span
          aria-hidden
          className="absolute inset-0 origin-left rounded-r-md border border-amber-950/30 bg-[linear-gradient(160deg,#7c3aed,#1e1b4b)] text-white shadow-xl [transform-style:preserve-3d]"
          animate={{ rotateY: !reduced && open ? -155 : 0 }}
          transition={reduced ? { duration: 0 } : { type: "spring", stiffness: 120, damping: 18 }}
        >
          <span className="grid h-full place-items-center px-4 font-display text-2xl [backface-visibility:hidden]">
            {title}
          </span>
        </motion.span>
      </button>
      <p className="mt-3 text-xs text-muted-foreground">悬停打开封面，点击翻页。</p>
    </div>
  )
}

export { BookFlip }
