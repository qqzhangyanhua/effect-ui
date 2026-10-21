"use client"

import * as React from "react"

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export interface GlitchTextProps {
  text: string
  className?: string
  /** 故障层开始前的等待（毫秒）。不传则立刻开始。 */
  delay?: number
  /** 为假时故障层只走一轮。不传则保持原来的无限循环。 */
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

function GlitchText({
  text,
  className,
  delay = 0,
  loop = true,
  interactive = false,
  fontSize,
  fontWeight,
  letterSpacing,
  align,
}: GlitchTextProps) {
  const reduced = usePrefersReducedMotion()
  const [replay, setReplay] = React.useState(0)
  const style: React.CSSProperties = {}
  if (fontSize !== undefined) style.fontSize = fontSize
  if (fontWeight !== undefined) style.fontWeight = fontWeight
  if (letterSpacing !== undefined) style.letterSpacing = `${letterSpacing}em`
  if (align !== undefined) style.textAlign = align
  const motionStyle: React.CSSProperties = {}
  if (delay > 0) motionStyle.animationDelay = `${delay}ms`
  if (!loop) motionStyle.animationIterationCount = 1
  const layerStyle = Object.keys(motionStyle).length > 0 ? motionStyle : undefined

  return (
    <span
      key={replay}
      data-slot="glitch-text"
      className={cn("relative inline-block", className)}
      style={Object.keys(style).length > 0 ? style : undefined}
      onPointerEnter={() => {
        if (reduced || !interactive || coarsePointer()) return
        setReplay((current) => current + 1)
      }}
    >
      <span
        aria-hidden
        className="absolute inset-0 animate-[glitch-r_1.6s_steps(2,end)_infinite] text-red-500/80 motion-reduce:animate-none motion-reduce:hidden"
        style={layerStyle}
      >
        {text}
      </span>
      <span
        aria-hidden
        className="absolute inset-0 animate-[glitch-c_1.8s_steps(2,end)_infinite] text-cyan-400/80 motion-reduce:animate-none motion-reduce:hidden"
        style={layerStyle}
      >
        {text}
      </span>
      <span className="relative">{text}</span>
    </span>
  )
}

export { GlitchText }
