"use client"

import { type HTMLMotionProps } from "motion/react"

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"

import { Reveal } from "./reveal"

export interface BlurFadeProps extends HTMLMotionProps<"div"> {
  delay?: number
  blur?: number
  speed?: number
  intensity?: number
}

function BlurFade({ className, children, delay = 0, blur = 8, speed, intensity, ...props }: BlurFadeProps) {
  const reduced = usePrefersReducedMotion()
  return (
    <Reveal
      data-reduced={reduced ? "true" : undefined}
      data-slot="blur-fade"
      variant="blur"
      className={className ? `${className} motion-reduce:animate-none` : "motion-reduce:animate-none"}
      delay={delay}
      blur={blur}
      speed={speed}
      intensity={intensity}
      {...props}
    >
      {children}
    </Reveal>
  )
}

export { BlurFade }
