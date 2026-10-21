"use client"

import { TextRotate } from "./text-rotate"

export interface WordRotateProps {
  words: string[]
  className?: string
  interval?: number
  fontSize?: number
  fontWeight?: number
  letterSpacing?: number
  align?: "left" | "center" | "right"
}

function WordRotate({
  words,
  className,
  interval = 1800,
  fontSize,
  fontWeight,
  letterSpacing,
  align,
}: WordRotateProps) {
  return (
    <TextRotate
      animation="slide"
      className={className}
      data-slot="word-rotate"
      interval={interval}
      texts={words}
      fontSize={fontSize}
      fontWeight={fontWeight}
      letterSpacing={letterSpacing}
      align={align}
    />
  )
}

export { WordRotate }
