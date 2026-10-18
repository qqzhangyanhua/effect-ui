"use client"

import * as React from "react"
import { useInView, useMotionValue, useSpring } from "motion/react"

import { cn } from "@/lib/utils"

export interface CountUpProps extends React.HTMLAttributes<HTMLSpanElement> {
  value: number
  direction?: "up" | "down"
  delay?: number
  decimalPlaces?: number
}

function CountUp({
  value,
  direction = "up",
  delay = 0,
  decimalPlaces = 0,
  className,
  ...props
}: CountUpProps) {
  const ref = React.useRef<HTMLSpanElement>(null)
  const motionValue = useMotionValue(direction === "down" ? value : 0)
  const springValue = useSpring(motionValue, { damping: 40, stiffness: 120 })
  const isInView = useInView(ref, { once: true, margin: "0px" })

  React.useEffect(() => {
    if (!isInView) return
    const timer = window.setTimeout(() => {
      motionValue.set(direction === "down" ? 0 : value)
    }, delay * 1000)
    return () => window.clearTimeout(timer)
  }, [delay, direction, isInView, motionValue, value])

  React.useEffect(() => {
    const unsubscribe = springValue.on("change", (latest) => {
      if (!ref.current) return
      ref.current.textContent = Intl.NumberFormat("en-US", {
        minimumFractionDigits: decimalPlaces,
        maximumFractionDigits: decimalPlaces,
      }).format(Number(latest.toFixed(decimalPlaces)))
    })
    return unsubscribe
  }, [decimalPlaces, springValue])

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
