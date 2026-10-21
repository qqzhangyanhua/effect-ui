"use client"

import * as React from "react"

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export interface TypingTextProps extends React.HTMLAttributes<HTMLSpanElement> {
  text: string
  duration?: number
  /** 第一字出现前的等待（毫秒）。不传则沿用原来的逐字间隔。 */
  delay?: number
  loop?: boolean
  /** 精细指针移入时从头打。触屏上忽略移入。 */
  interactive?: boolean
  cursor?: boolean
  fontSize?: number
  fontWeight?: number
  letterSpacing?: number
  align?: "left" | "center" | "right"
}

function coarsePointer() {
  return window.matchMedia("(pointer: coarse)").matches
}

function TypingText({
  text,
  duration = 80,
  delay = 0,
  loop = false,
  interactive = false,
  cursor = true,
  fontSize,
  fontWeight,
  letterSpacing,
  align,
  className,
  style,
  ...props
}: TypingTextProps) {
  const reduced = usePrefersReducedMotion()
  const [count, setCount] = React.useState(0)
  const [dir, setDir] = React.useState<1 | -1>(1)
  const waited = React.useRef(false)

  React.useEffect(() => {
    waited.current = false
  }, [text])

  React.useEffect(() => {
    if (reduced) return
    const next = count + dir
    const atEnd = next > text.length
    const atStart = next < 0

    const step = atEnd || atStart ? 900 : duration
    const wait = !waited.current && delay > 0 ? delay : step
    waited.current = true
    const timer = window.setTimeout(() => {
      if (atEnd) {
        if (loop) setDir(-1)
        return
      }
      if (atStart) {
        setDir(1)
        setCount(0)
        return
      }
      setCount(next)
    }, wait)

    return () => window.clearTimeout(timer)
  }, [count, delay, dir, duration, loop, reduced, text.length])

  const nextStyle: React.CSSProperties = { ...style }
  if (fontSize !== undefined) nextStyle.fontSize = fontSize
  if (fontWeight !== undefined) nextStyle.fontWeight = fontWeight
  if (letterSpacing !== undefined) nextStyle.letterSpacing = `${letterSpacing}em`
  if (align !== undefined) nextStyle.textAlign = align

  return (
    <span
      data-slot="typing-text"
      className={cn("inline-flex items-baseline font-medium", className)}
      style={Object.keys(nextStyle).length > 0 ? nextStyle : undefined}
      {...props}
      onPointerEnter={() => {
        if (!interactive || coarsePointer()) return
        waited.current = false
        setDir(1)
        setCount(0)
      }}
    >
      {reduced ? text : text.slice(0, count)}
      {cursor ? (
        <span className="ml-0.5 inline-block h-[1em] w-px translate-y-0.5 animate-pulse bg-current motion-reduce:animate-none" />
      ) : null}
    </span>
  )
}

export { TypingText }
