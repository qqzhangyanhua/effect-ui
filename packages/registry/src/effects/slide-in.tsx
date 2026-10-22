"use client"

import { type HTMLMotionProps } from "motion/react"

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"

import { Reveal } from "./reveal"

export interface SlideInProps extends HTMLMotionProps<"div"> {
  from?: "left" | "right" | "top" | "bottom"
  delay?: number
  speed?: number
  intensity?: number
}

function SlideIn({
  className,
  children,
  from = "bottom",
  delay = 0,
  speed,
  intensity,
  ...props
}: SlideInProps) {
  const reduced = usePrefersReducedMotion()
  return (
    <Reveal
      data-reduced={reduced ? "true" : undefined}
      data-slot="slide-in"
      variant="slide"
      from={from}
      className={className ? `${className} motion-reduce:animate-none` : "motion-reduce:animate-none"}
      delay={delay}
      speed={speed}
      intensity={intensity}
      {...props}
    >
      {children}
    </Reveal>
  )
}

export { SlideIn }
