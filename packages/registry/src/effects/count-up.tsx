"use client"

import * as React from "react"
import { useInView, useMotionValue, useSpring } from "motion/react"

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export interface CountUpProps extends React.HTMLAttributes<HTMLSpanElement> {
  value: number
  direction?: "up" | "down"
  delay?: number
  decimalPlaces?: number
}

function formatCount(value: number, decimalPlaces: number) {
  return Intl.NumberFormat("en-US", {
    minimumFractionDigits: decimalPlaces,
    maximumFractionDigits: decimalPlaces,
  }).format(Number(value.toFixed(decimalPlaces)))
}

function CountUp({
  value,
  direction = "up",
  delay = 0,
  decimalPlaces = 0,
  className,
  ...props
}: CountUpProps) {
  const reduced = usePrefersReducedMotion()
  const ref = React.useRef<HTMLSpanElement>(null)
  const motionValue = useMotionValue(direction === "down" ? value : 0)
  const springValue = useSpring(motionValue, { damping: 40, stiffness: 120 })
  const isInView = useInView(ref, { once: true, margin: "0px" })
  const endValue = direction === "down" ? 0 : value

  React.useEffect(() => {
    if (reduced || !isInView) return
    const timer = window.setTimeout(() => {
      motionValue.set(direction === "down" ? 0 : value)
    }, delay * 1000)
    return () => window.clearTimeout(timer)
  }, [delay, direction, isInView, motionValue, reduced, value])

  React.useEffect(() => {
    if (reduced) return
    const unsubscribe = springValue.on("change", (latest) => {
      if (!ref.current) return
      ref.current.textContent = formatCount(latest, decimalPlaces)
    })
    return unsubscribe
  }, [decimalPlaces, reduced, springValue])

  return (
    <span
      ref={ref}
      data-slot="count-up"
      className={cn("inline-block tabular-nums tracking-tight", className)}
      {...props}
    >
      {reduced ? formatCount(endValue, decimalPlaces) : null}
    </span>
  )
}

export { CountUp }
