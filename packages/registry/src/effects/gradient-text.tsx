"use client"

import * as React from "react"

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export interface GradientTextProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Tailwind 渐变类。不是 CSS 颜色数组。 */
  colors?: string
  /** 流动开始前的等待（毫秒）。不传则立刻开始。 */
  delay?: number
  /** 为假时只走一轮。不传则保持原来的无限循环。 */
  loop?: boolean
  /** 精细指针移入时重播。触屏上忽略移入。 */
  interactive?: boolean
  fontSize?: number
  fontWeight?: number
  letterSpacing?: number
  align?: "left" | "center" | "right"
}

function coarsePointer() {
  return window.matchMedia("(pointer: coarse)").matches
}

function GradientText({
  className,
  colors = "from-violet-500 via-fuchsia-500 to-cyan-400",
  delay = 0,
  loop = true,
  interactive = false,
  fontSize,
  fontWeight,
  letterSpacing,
  align,
  children,
  style,
  ...props
}: GradientTextProps) {
  const reduced = usePrefersReducedMotion()
  const [replay, setReplay] = React.useState(0)
  const nextStyle: React.CSSProperties = { ...style }
  if (fontSize !== undefined) nextStyle.fontSize = fontSize
  if (fontWeight !== undefined) nextStyle.fontWeight = fontWeight
  if (letterSpacing !== undefined) nextStyle.letterSpacing = `${letterSpacing}em`
  if (align !== undefined) nextStyle.textAlign = align
  if (delay > 0) nextStyle.animationDelay = `${delay}ms`
  if (!loop) nextStyle.animationIterationCount = 1

  return (
    <span
      key={replay}
      data-slot="gradient-text"
      className={cn(
        "inline-block animate-[gradient-shift_6s_ease_infinite] bg-linear-to-r bg-size-[200%_auto] bg-clip-text text-transparent motion-reduce:animate-none",
        colors,
        className,
      )}
      style={Object.keys(nextStyle).length > 0 ? nextStyle : undefined}
      {...props}
      onPointerEnter={() => {
        if (reduced || !interactive || coarsePointer()) return
        setReplay((current) => current + 1)
      }}
    >
      {children}
    </span>
  )
}

export { GradientText }
