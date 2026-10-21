"use client"

import * as React from "react"

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { textStyle } from "@/lib/text-style"
import { cn } from "@/lib/utils"

export interface TextPressureProps {
  text?: string
  className?: string
  /** 指针影响半径，像素。 */
  radius?: number
  fontSize?: number
  letterSpacing?: number
  align?: "left" | "center" | "right"
}

function TextPressure({
  text = "PRESSURE",
  className,
  radius = 160,
  fontSize,
  letterSpacing,
  align,
}: TextPressureProps) {
  const reduced = usePrefersReducedMotion()
  const letterRefs = React.useRef<Array<HTMLSpanElement | null>>([])
  const [weights, setWeights] = React.useState<number[]>([])
  const letters = Array.from(text)

  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (reduced) return
    const next = letterRefs.current.map((node) => {
      if (!node) return 0
      const rect = node.getBoundingClientRect()
      const dx = event.clientX - (rect.left + rect.width / 2)
      const dy = event.clientY - (rect.top + rect.height / 2)
      return Math.max(0, 1 - Math.hypot(dx, dy) / radius)
    })
    setWeights(next)
  }

  return (
    <div
      data-slot="text-pressure"
      className={cn("flex w-full items-end py-8 select-none", className)}
      onPointerMove={onPointerMove}
      onPointerLeave={() => setWeights([])}
    >
      <p
        className="flex w-full items-end justify-between font-sans text-[clamp(2.4rem,8vw,6.5rem)] leading-none"
        style={textStyle(undefined, fontSize, undefined, letterSpacing, align)}
      >
        {letters.map((char, index) => {
          const proximity = reduced ? 0 : (weights[index] ?? 0)
          const weight = Math.round(420 + proximity * 480)
          const width = Math.round(100 + proximity * 45)
          return (
            <span
              key={`${char}-${index}`}
              ref={(node) => {
                letterRefs.current[index] = node
              }}
              className="inline-block origin-bottom text-center transition-[font-weight,transform] duration-100 ease-out"
              style={{
                flex: char === " " ? "0 0 0.35em" : align === undefined ? "1 1 0" : "0 0 auto",
                fontWeight: weight,
                fontVariationSettings: `"wght" ${weight}, "wdth" ${width}`,
                transform: `scaleX(${1 + proximity * 0.18}) scaleY(${1 + proximity * 0.62})`,
              }}
            >
              {char === " " ? "\u00a0" : char}
            </span>
          )
        })}
      </p>
    </div>
  )
}

export { TextPressure }
