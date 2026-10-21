"use client"

import * as React from "react"
import { motion } from "motion/react"

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { textStyle } from "@/lib/text-style"
import { cn } from "@/lib/utils"

export interface RollingTextHoverProps {
  items?: string[]
  label?: string
  className?: string
  /** 相邻字母滚动的间隔，毫秒。不传则 35。 */
  delay?: number
  fontSize?: number
  fontWeight?: number
  letterSpacing?: number
  align?: "left" | "center" | "right"
}

function Letters({ text, delay }: { text: string; delay: number }) {
  return (
    <span className="inline-flex">
      {[...text].map((char, index) => (
        <span key={`${char}-${index}`} className="relative inline-block h-[1.15em] overflow-hidden">
          <motion.span
            className="flex flex-col"
            variants={{ rest: { y: "0%" }, hover: { y: "-50%" } }}
            transition={{ delay: index * delay, type: "spring", stiffness: 420, damping: 30 }}
          >
            <span>{char === " " ? "\u00a0" : char}</span>
            <span aria-hidden>{char === " " ? "\u00a0" : char}</span>
          </motion.span>
        </span>
      ))}
    </span>
  )
}

function RollingTextHover({
  items = ["产品", "文档", "价格"],
  label = "开始使用",
  className,
  delay,
  fontSize,
  fontWeight,
  letterSpacing,
  align,
}: RollingTextHoverProps) {
  const reduced = usePrefersReducedMotion()
  const step = (delay ?? 35) / 1000

  return (
    <div
      data-slot="rolling-text-hover"
      className={cn("flex flex-wrap items-center gap-4", className)}
      style={textStyle(undefined, fontSize, fontWeight, letterSpacing, align)}
    >
      <nav aria-label="示例导航" className="flex gap-4 text-sm">
        {items.map((item) => (
          <motion.a
            key={item}
            href={`#${item}`}
            initial="rest"
            animate="rest"
            whileHover={reduced ? undefined : "hover"}
            className={cn("inline-flex", reduced && "transition-colors hover:text-primary")}
            onClick={(event) => event.preventDefault()}
          >
            {reduced ? item : <Letters text={item} delay={step} />}
          </motion.a>
        ))}
      </nav>
      <motion.button
        type="button"
        initial="rest"
        animate="rest"
        whileHover={reduced ? undefined : "hover"}
        className={cn("rounded-full bg-primary px-4 py-2 text-sm text-primary-foreground", reduced && "transition-colors hover:bg-primary/80")}
      >
        {reduced ? label : <Letters text={label} delay={step} />}
      </motion.button>
    </div>
  )
}

export { RollingTextHover }
