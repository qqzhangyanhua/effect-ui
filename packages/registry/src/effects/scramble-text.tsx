"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%"

export interface ScrambleTextProps {
  text: string
  className?: string
  duration?: number
}

function ScrambleText({ text, className, duration = 900 }: ScrambleTextProps) {
  const [output, setOutput] = React.useState(text)

  React.useEffect(() => {
    const start = performance.now()
    let frame = 0
    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / duration)
      const reveal = Math.floor(progress * text.length)
      const next = Array.from(text, (char, index) => {
        if (index < reveal || char === " ") return char
        return GLYPHS[Math.floor(Math.random() * GLYPHS.length)] ?? char
      }).join("")
      setOutput(next)
      if (progress < 1) frame = window.requestAnimationFrame(tick)
    }
    frame = window.requestAnimationFrame(tick)
    return () => window.cancelAnimationFrame(frame)
  }, [duration, text])

  return (
    <span data-slot="scramble-text" className={cn("font-mono", className)}>
      {output}
    </span>
  )
}

export { ScrambleText }
