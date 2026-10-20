"use client"

import { type HTMLMotionProps } from "motion/react"

import { Reveal } from "./reveal"

export interface BlurFadeProps extends HTMLMotionProps<"div"> {
  delay?: number
  blur?: number
}

function BlurFade({ className, children, delay = 0, blur = 8, ...props }: BlurFadeProps) {
  return (
    <Reveal
      data-slot="blur-fade"
      variant="blur"
      className={className}
      delay={delay}
      blur={blur}
      {...props}
    >
      {children}
    </Reveal>
  )
}

export { BlurFade }
