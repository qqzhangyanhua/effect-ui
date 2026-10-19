"use client"

import * as React from "react"
import { useInView, useMotionValue, useReducedMotion, useSpring } from "motion/react"

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
  const prefersReducedMotion = useReducedMotion()
  const [reduced, setReduced] = React.useState(false)
  const ref = React.useRef<HTMLSpanElement>(null)
  const motionValue = useMotionValue(direction === "down" ? value : 0)
  const springValue = useSpring(motionValue, { damping: 40, stiffness: 120 })
  const isInView = useInView(ref, { once: true, margin: "0px" })
  const endValue = direction === "down" ? 0 : value

  React.useEffect(() => {
    setReduced(prefersReducedMotion === true)
  }, [prefersReducedMotion])

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

  React.useEffect(() => {
    if (!reduced || !ref.current) return
    ref.current.textContent = formatCount(endValue, decimalPlaces)
  }, [decimalPlaces, endValue, reduced])

  return (
    <span
      ref={ref}
      data-slot="count-up"
      className={cn("inline-block tabular-nums tracking-tight", className)}
      {...props}
    />
  )
}

export { CountUp }
