"use client"

import { type HTMLMotionProps } from "motion/react"

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"

import { Reveal } from "./reveal"

export interface FadeInProps extends HTMLMotionProps<"div"> {
  delay?: number
  once?: boolean
  speed?: number
  intensity?: number
}

function FadeIn({ className, children, delay = 0, once = true, speed, intensity, ...props }: FadeInProps) {
  const reduced = usePrefersReducedMotion()
  return (
    <Reveal
      data-reduced={reduced ? "true" : undefined}
      data-slot="fade-in"
      variant="fade"
      className={className ? `${className} motion-reduce:animate-none` : "motion-reduce:animate-none"}
      delay={delay}
      once={once}
      speed={speed}
      intensity={intensity}
      {...props}
    >
      {children}
    </Reveal>
  )
}

export { FadeIn }
