"use client"

import { TextRotate } from "./text-rotate"

export interface MorphingTextProps {
  texts: string[]
  className?: string
  interval?: number
  fontSize?: number
  fontWeight?: number
  letterSpacing?: number
  align?: "left" | "center" | "right"
}

function MorphingText({
  texts,
  className,
  interval = 2200,
  fontSize,
  fontWeight,
  letterSpacing,
  align,
}: MorphingTextProps) {
  return (
    <TextRotate
      animation="blur"
      className={className}
      data-slot="morphing-text"
      interval={interval}
      texts={texts}
      fontSize={fontSize}
      fontWeight={fontWeight}
      letterSpacing={letterSpacing}
      align={align}
    />
  )
}

export { MorphingText }
