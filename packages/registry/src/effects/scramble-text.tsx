"use client"

import * as React from "react"

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%"

export interface ScrambleTextProps {
  text: string
  className?: string
  duration?: number
  /** 开始前等待的毫秒数。不传则立刻开始。 */
  delay?: number
  /** 播完后是否再来一遍。不传则只播一次。 */
  loop?: boolean
  /** 为真时，精细指针移入会重播。触屏上忽略移入。 */
  interactive?: boolean
}

function coarsePointer() {
  return window.matchMedia("(pointer: coarse)").matches
}

function ScrambleText({
  text,
  className,
  duration = 900,
  delay = 0,
  loop = false,
  interactive = false,
}: ScrambleTextProps) {
  const reduced = usePrefersReducedMotion()
  const [output, setOutput] = React.useState(text)
  const [replay, setReplay] = React.useState(0)

  React.useEffect(() => {
    if (reduced) return
    let frame = 0
    let timer = 0
    const tick = (started: number) => (now: number) => {
      const progress = Math.min(1, (now - started) / duration)
      const reveal = Math.floor(progress * text.length)
      const next = Array.from(text, (char, index) => {
        if (index < reveal || char === " ") return char
        return GLYPHS[Math.floor(Math.random() * GLYPHS.length)] ?? char
      }).join("")
      setOutput(next)
      if (progress < 1) {
        frame = window.requestAnimationFrame(tick(started))
        return
      }
      if (loop) setReplay((current) => current + 1)
    }
    const start = () => {
      frame = window.requestAnimationFrame(tick(performance.now()))
    }
    if (delay > 0) timer = window.setTimeout(start, delay)
    else start()
    return () => {
      window.cancelAnimationFrame(frame)
      window.clearTimeout(timer)
    }
  }, [delay, duration, loop, reduced, replay, text])

  return (
    <span
      data-slot="scramble-text"
      className={cn("font-mono", className)}
      onPointerEnter={() => {
        if (reduced || !interactive || coarsePointer()) return
        setReplay((current) => current + 1)
      }}
    >
      {reduced ? text : output}
    </span>
  )
}

export { ScrambleText }
