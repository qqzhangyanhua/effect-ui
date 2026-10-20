"use client"

import { TextRotate } from "./text-rotate"

export interface MorphingTextProps {
  texts: string[]
  className?: string
  interval?: number
}

function MorphingText({ texts, className, interval = 2200 }: MorphingTextProps) {
  return (
    <TextRotate
      animation="blur"
      className={className}
      data-slot="morphing-text"
      interval={interval}
      texts={texts}
    />
  )
}

export { MorphingText }
