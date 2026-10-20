"use client"

import * as React from "react"

import { Reveal } from "./reveal"

export interface RevealSectionProps {
  className?: string
  children?: React.ReactNode
  delay?: number
}

function RevealSection({ className, children, delay = 0 }: RevealSectionProps) {
  return (
    <Reveal
      data-slot="reveal-section"
      as="section"
      variant="clip"
      className={className}
      delay={delay}
    >
      {children}
    </Reveal>
  )
}

export { RevealSection }
