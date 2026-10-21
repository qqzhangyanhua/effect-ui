"use client"

import { type HTMLMotionProps } from "motion/react"

import { Reveal } from "./reveal"

export interface FadeInProps extends HTMLMotionProps<"div"> {
  delay?: number
  once?: boolean
  speed?: number
  intensity?: number
}

function FadeIn({ className, children, delay = 0, once = true, speed, intensity, ...props }: FadeInProps) {
  return (
    <Reveal
      data-slot="fade-in"
      variant="fade"
      className={className}
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
