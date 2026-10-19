"use client"

import * as React from "react"
import { useReducedMotion } from "motion/react"

import { cn } from "@/lib/utils"

function parseSettings(value: string) {
  return new Map(
    value
      .split(",")
      .map((part) => part.trim())
      .flatMap((part) => {
        const [name, raw] = part.split(" ")
        if (!name || raw === undefined) return []
        return [[name.replace(/['"]/g, ""), Number.parseFloat(raw)] as const]
      }),
  )
}

export interface VariableFontProximityProps {
  label: string
  fromFontVariationSettings: string
  toFontVariationSettings: string
  containerRef: React.RefObject<HTMLElement | null>
  radius?: number
  falloff?: "linear" | "exponential" | "gaussian"
  className?: string
}

function VariableFontProximity({
  label,
  fromFontVariationSettings,
  toFontVariationSettings,
  containerRef,
  radius = 80,
  falloff = "linear",
  className,
}: VariableFontProximityProps) {
  const prefersReducedMotion = useReducedMotion()
  const [reduced, setReduced] = React.useState(false)
  const letterRefs = React.useRef<Array<HTMLSpanElement | null>>([])
  const mouse = React.useRef({ x: -9999, y: -9999 })

  const axes = React.useMemo(() => {
    const from = parseSettings(fromFontVariationSettings)
    const to = parseSettings(toFontVariationSettings)
    return Array.from(from.entries()).map(([axis, fromValue]) => ({
      axis,
      fromValue,
      toValue: to.get(axis) ?? fromValue,
    }))
  }, [fromFontVariationSettings, toFontVariationSettings])

  React.useEffect(() => {
    setReduced(prefersReducedMotion === true)
  }, [prefersReducedMotion])

  React.useEffect(() => {
    if (reduced) return
    const move = (event: PointerEvent) => {
      const box = containerRef.current?.getBoundingClientRect()
      if (!box) return
      mouse.current = { x: event.clientX - box.left, y: event.clientY - box.top }
    }
    window.addEventListener("pointermove", move)
    return () => window.removeEventListener("pointermove", move)
  }, [containerRef, reduced])

  React.useEffect(() => {
    if (reduced) return
    let frame = 0
    const tick = () => {
      frame = window.requestAnimationFrame(tick)
      const box = containerRef.current?.getBoundingClientRect()
      if (!box) return
      letterRefs.current.forEach((letter) => {
        if (!letter) return
        const rect = letter.getBoundingClientRect()
        const dx = mouse.current.x - (rect.left + rect.width / 2 - box.left)
        const dy = mouse.current.y - (rect.top + rect.height / 2 - box.top)
        const distance = Math.hypot(dx, dy)
        const normalized = Math.min(Math.max(1 - distance / radius, 0), 1)
        const strength =
          falloff === "exponential"
            ? normalized ** 2
            : falloff === "gaussian"
              ? Math.exp(-((distance / (radius / 2)) ** 2) / 2)
              : normalized
        letter.style.fontVariationSettings = axes
          .map(({ axis, fromValue, toValue }) => `'${axis}' ${fromValue + (toValue - fromValue) * strength}`)
          .join(", ")
      })
    }
    frame = window.requestAnimationFrame(tick)
    return () => window.cancelAnimationFrame(frame)
  }, [axes, containerRef, falloff, radius, reduced])

  const letters = Array.from(label)

  return (
    <span className={cn("inline-block", className)} aria-label={label}>
      {letters.map((char, index) => (
        <span
          key={`${char}-${index}`}
          ref={(node) => {
            letterRefs.current[index] = node
          }}
          aria-hidden="true"
          className="inline-block"
          style={reduced ? { fontVariationSettings: fromFontVariationSettings } : undefined}
        >
          {char === " " ? "\u00a0" : char}
        </span>
      ))}
    </span>
  )
}

export { VariableFontProximity }
