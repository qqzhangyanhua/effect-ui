"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

export interface TypingTextProps extends React.HTMLAttributes<HTMLSpanElement> {
  text: string
  duration?: number
  loop?: boolean
  cursor?: boolean
}

function TypingText({
  text,
  duration = 80,
  loop = false,
  cursor = true,
  className,
  ...props
}: TypingTextProps) {
  const [count, setCount] = React.useState(0)
  const [dir, setDir] = React.useState<1 | -1>(1)

  React.useEffect(() => {
    const next = count + dir
    const atEnd = next > text.length
    const atStart = next < 0

    const delay = atEnd || atStart ? 900 : duration
    const timer = window.setTimeout(() => {
      if (atEnd) {
        if (loop) setDir(-1)
        return
      }
      if (atStart) {
        setDir(1)
        setCount(0)
        return
      }
      setCount(next)
    }, delay)

    return () => window.clearTimeout(timer)
  }, [count, dir, duration, loop, text.length])

  return (
    <span
      data-slot="typing-text"
      className={cn("inline-flex items-baseline font-medium", className)}
      {...props}
    >
      {text.slice(0, count)}
      {cursor ? (
        <span className="ml-0.5 inline-block h-[1em] w-px translate-y-0.5 animate-pulse bg-current" />
      ) : null}
    </span>
  )
}

export { TypingText }
