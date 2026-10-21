"use client"

import * as React from "react"
import { motion } from "motion/react"

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

const COVER = ["#7c3aed", "#1e1b4b"]

export interface BookFlipProps {
  title?: string
  pages?: string[]
  className?: string
  /** 打开角度。不传或 155 仍是 155°。 */
  angle?: number
  /** 弹簧倍率。不传或 1 时刚度 120、阻尼 18。 */
  speed?: number
  /** 封面两色。不传或 #7c3aed、#1e1b4b 仍用原来的渐变。 */
  colors?: string[]
}

function pace(speed: number | undefined) {
  return speed === undefined || !Number.isFinite(speed) || speed <= 0 ? 1 : speed
}

function sameCover(colors: string[] | undefined) {
  return (
    colors === undefined ||
    (colors.length === COVER.length && colors.every((color, index) => color.toLowerCase() === COVER[index]))
  )
}

function BookFlip({
  title = "effect-ui",
  pages = ["把特效复制进项目。", "封面流、书本、旋钮。", "整页模板串起落地页。"],
  className,
  angle,
  speed,
  colors,
}: BookFlipProps) {
  const reduced = usePrefersReducedMotion()
  const [open, setOpen] = React.useState(false)
  const [page, setPage] = React.useState(0)
  const leaf = pages[page] ?? ""
  const turn = angle === undefined || angle === 155 ? 155 : angle
  const rate = pace(speed)
  const painted = sameCover(colors)

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
          className={cn(
            "absolute inset-0 origin-left rounded-r-md border border-amber-950/30 text-white shadow-xl [transform-style:preserve-3d]",
            painted && "bg-[linear-gradient(160deg,#7c3aed,#1e1b4b)]",
          )}
          style={painted ? undefined : { background: `linear-gradient(160deg, ${colors?.[0]}, ${colors?.[1]})` }}
          animate={{ rotateY: !reduced && open ? -turn : 0 }}
          transition={
            reduced
              ? { duration: 0 }
              : { type: "spring", stiffness: rate === 1 ? 120 : 120 * rate, damping: rate === 1 ? 18 : 18 * rate }
          }
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
