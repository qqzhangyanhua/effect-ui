"use client"

import { cn } from "@/lib/utils"

import { TextRotate } from "./text-rotate"

export interface TextMorphProps {
  texts?: string[]
  className?: string
  interval?: number
  fontSize?: number
  fontWeight?: number
  letterSpacing?: number
  align?: "left" | "center" | "right"
}

function TextMorph({
  texts = ["Design", "Delight"],
  className,
  interval = 1800,
  fontSize,
  fontWeight,
  letterSpacing,
  align,
}: TextMorphProps) {
  return (
    <TextRotate
      animation="glyph"
      className={cn("font-display text-4xl", className)}
      interval={interval}
      texts={texts}
      fontSize={fontSize}
      fontWeight={fontWeight}
      letterSpacing={letterSpacing}
      align={align}
    />
  )
}

export { TextMorph }
