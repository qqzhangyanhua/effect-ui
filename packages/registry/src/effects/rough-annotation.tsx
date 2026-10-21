"use client"

import * as React from "react"

import { textStyle } from "@/lib/text-style"
import { cn } from "@/lib/utils"

export type RoughAnnotationType =
  | "underline"
  | "box"
  | "circle"
  | "highlight"
  | "strike-through"
  | "crossed-off"
  | "bracket"

export interface RoughAnnotationProps {
  className?: string
  type?: RoughAnnotationType
  color?: string
  /** 笔画时长，毫秒。不传则 700。 */
  duration?: number
  fontSize?: number
  fontWeight?: number
  letterSpacing?: number
  align?: "left" | "center" | "right"
  children?: React.ReactNode
}

function RoughAnnotation({
  className,
  type = "underline",
  color = "#7c3aed",
  duration,
  fontSize,
  fontWeight,
  letterSpacing,
  align,
  children,
}: RoughAnnotationProps) {
  const ref = React.useRef<HTMLSpanElement>(null)

  React.useEffect(() => {
    const el = ref.current
    if (!el) return
    let annotation: { show: () => void; remove: () => void } | undefined
    let cancelled = false
    void import("rough-notation").then(({ annotate }) => {
      if (cancelled || !el) return
      annotation = annotate(el, { type, color, animationDuration: duration ?? 700, multiline: true })
      annotation.show()
    })
    return () => {
      cancelled = true
      annotation?.remove()
    }
  }, [color, duration, type])

  return (
    <span
      ref={ref}
      className={cn("inline-block px-0.5", className)}
      style={textStyle(undefined, fontSize, fontWeight, letterSpacing, align)}
    >
      {children}
    </span>
  )
}

export { RoughAnnotation }
