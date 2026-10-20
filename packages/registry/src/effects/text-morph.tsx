"use client"

import { cn } from "@/lib/utils"

import { TextRotate } from "./text-rotate"

export interface TextMorphProps {
  texts?: string[]
  className?: string
}

function TextMorph({ texts = ["Design", "Delight"], className }: TextMorphProps) {
  return (
    <TextRotate
      animation="glyph"
      className={cn("font-display text-4xl", className)}
      interval={1800}
      texts={texts}
    />
  )
}

export { TextMorph }
