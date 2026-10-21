"use client"

import { type HTMLMotionProps } from "motion/react"

import { Reveal } from "./reveal"

export interface BlurFadeProps extends HTMLMotionProps<"div"> {
  delay?: number
  blur?: number
  speed?: number
  intensity?: number
}

function BlurFade({ className, children, delay = 0, blur = 8, speed, intensity, ...props }: BlurFadeProps) {
  return (
    <Reveal
      data-slot="blur-fade"
      variant="blur"
      className={className}
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
