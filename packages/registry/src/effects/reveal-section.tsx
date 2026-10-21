"use client"

import * as React from "react"

import { Reveal } from "./reveal"

export interface RevealSectionProps {
  className?: string
  children?: React.ReactNode
  delay?: number
  speed?: number
  intensity?: number
}

function RevealSection({ className, children, delay = 0, speed, intensity }: RevealSectionProps) {
  return (
    <Reveal
      data-slot="reveal-section"
      as="section"
      variant="clip"
      className={className}
      delay={delay}
      speed={speed}
      intensity={intensity}
    >
      {children}
    </Reveal>
  )
}

export { RevealSection }
