"use client"

import { TextRotate } from "./text-rotate"

export interface WordRotateProps {
  words: string[]
  className?: string
  interval?: number
}

function WordRotate({ words, className, interval = 1800 }: WordRotateProps) {
  return (
    <TextRotate
      animation="slide"
      className={className}
      data-slot="word-rotate"
      interval={interval}
      texts={words}
    />
  )
}

export { WordRotate }
