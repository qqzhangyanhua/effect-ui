"use client"

import { type HTMLMotionProps } from "motion/react"

import { Reveal } from "./reveal"

export interface SlideInProps extends HTMLMotionProps<"div"> {
  from?: "left" | "right" | "top" | "bottom"
  delay?: number
}

function SlideIn({
  className,
  children,
  from = "bottom",
  delay = 0,
  ...props
}: SlideInProps) {
  return (
    <Reveal
      data-slot="slide-in"
      variant="slide"
      from={from}
      className={className}
      delay={delay}
      {...props}
    >
      {children}
    </Reveal>
  )
}

export { SlideIn }
