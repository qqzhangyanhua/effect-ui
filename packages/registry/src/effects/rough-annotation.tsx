"use client"

import * as React from "react"

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
  children?: React.ReactNode
}

function RoughAnnotation({
  className,
  type = "underline",
  color = "#7c3aed",
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
      annotation = annotate(el, { type, color, animationDuration: 700, multiline: true })
      annotation.show()
    })
    return () => {
      cancelled = true
      annotation?.remove()
    }
  }, [color, type])

  return (
    <span ref={ref} className={cn("inline-block px-0.5", className)}>
      {children}
    </span>
  )
}

export { RoughAnnotation }
