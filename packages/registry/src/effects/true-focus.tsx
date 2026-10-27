"use client"

import { LayoutGroup, motion } from "motion/react"
import * as React from "react"

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { textStyle } from "@/lib/text-style"
import { cn } from "@/lib/cn"

export interface TrueFocusProps {
  sentence?: string
  className?: string
  /** 每个词停留的毫秒数。 */
  interval?: number
  color?: string
  fontSize?: number
  fontWeight?: number
  letterSpacing?: number
  align?: "left" | "center" | "right"
}

function TrueFocus({
  sentence = "把注意力交给正在发光的词",
  className,
  interval = 1400,
  color,
  fontSize,
  fontWeight,
  letterSpacing,
  align,
}: TrueFocusProps) {
  const reduced = usePrefersReducedMotion()
  const frameId = React.useId()
  const words = React.useMemo(() => sentence.split(/\s+/).filter((word) => word.length > 0), [sentence])
  const [index, setIndex] = React.useState(0)

  React.useEffect(() => {
    if (reduced || words.length < 2) return
    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % words.length)
    }, interval)
    return () => window.clearInterval(timer)
  }, [reduced, interval, words.length])

  const active = reduced ? 0 : index % Math.max(words.length, 1)

  return (
    <LayoutGroup id={frameId}>
      <p
        data-slot="true-focus"
        className={cn(
          "flex flex-wrap items-center justify-center gap-x-3 gap-y-2 text-center font-display text-3xl tracking-tight sm:text-4xl",
          className,
        )}
        style={textStyle(undefined, fontSize, fontWeight, letterSpacing, align)}
      >
        {words.map((word, wordIndex) => {
          const focused = wordIndex === active
          return (
            <span
              key={`${word}-${wordIndex}`}
              className="relative inline-block px-1 py-1 transition-[filter,opacity] duration-500"
              style={{
                filter: focused || reduced ? "none" : "blur(5px)",
                opacity: focused || reduced ? 1 : 0.55,
              }}
            >
              {word}
              {focused ? (
                <motion.span
                  layoutId={frameId}
                  className="pointer-events-none absolute -inset-1"
                  transition={reduced ? { duration: 0 } : { type: "spring", stiffness: 420, damping: 34 }}
                >
                  <i className="absolute top-0 left-0 size-2.5 border-t-2 border-l-2 border-cyan-300 shadow-[0_0_10px_#67e8f9]" style={cornerStyle(color)} />
                  <i className="absolute top-0 right-0 size-2.5 border-t-2 border-r-2 border-cyan-300 shadow-[0_0_10px_#67e8f9]" style={cornerStyle(color)} />
                  <i className="absolute bottom-0 left-0 size-2.5 border-b-2 border-l-2 border-cyan-300 shadow-[0_0_10px_#67e8f9]" style={cornerStyle(color)} />
                  <i className="absolute right-0 bottom-0 size-2.5 border-r-2 border-b-2 border-cyan-300 shadow-[0_0_10px_#67e8f9]" style={cornerStyle(color)} />
                </motion.span>
              ) : null}
            </span>
          )
        })}
      </p>
    </LayoutGroup>
  )
}

function cornerStyle(color: string | undefined): React.CSSProperties | undefined {
  if (color === undefined) return undefined
  return { borderColor: color, boxShadow: `0 0 10px ${color}` }
}

export { TrueFocus }
