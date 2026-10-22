"use client"

// Ported from Fancy Components (MIT, (c) 2024 Daniel Petho) — https://github.com/danielpetho/fancy/blob/main/src/fancy/components/blocks/drag-elements.tsx

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

import { motion, type DragElastic, type InertiaOptions } from "motion/react"
import { Children, useEffect, useRef, useState, type ReactNode, type RefObject } from "react"

export interface DragElementsProps {
  children?: ReactNode
  dragElastic?: DragElastic
  dragConstraints?: { top?: number; left?: number; right?: number; bottom?: number } | RefObject<Element | null>
  dragMomentum?: boolean
  dragTransition?: InertiaOptions
  dragPropagation?: boolean
  selectedOnTop?: boolean
  className?: string
}

export function DragElements({
  children,
  dragElastic = 0.5,
  dragConstraints,
  dragMomentum = true,
  dragTransition = { bounceStiffness: 200, bounceDamping: 300 },
  dragPropagation = true,
  selectedOnTop = true,
  className,
}: DragElementsProps) {
  const constraintsRef = useRef<HTMLDivElement>(null)
  const prefersReducedMotion = usePrefersReducedMotion()
  const momentum = dragMomentum && !prefersReducedMotion
  const [zIndices, setZIndices] = useState<number[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const childCount = Children.count(children)

  useEffect(() => {
    queueMicrotask(() => {
      setZIndices(Array.from({ length: childCount }, (_, index) => index))
    })
  }, [childCount])

  const bringToFront = (index: number) => {
    if (!selectedOnTop) return
    setZIndices((previous) => {
      const next = [...previous]
      const currentIndex = next.indexOf(index)
      if (currentIndex < 0) return previous
      next.splice(currentIndex, 1)
      next.push(index)
      return next
    })
  }

  return (
    <div
      className={cn("relative h-full w-full", className)}
      data-momentum={momentum ? "true" : "false"}
      data-reduced={prefersReducedMotion ? "true" : "false"}
      data-slot="drag-elements"
      ref={constraintsRef}
    >
      {Children.map(children, (child, index) => (
        <motion.div
          className="absolute"
          drag
          dragConstraints={dragConstraints || constraintsRef}
          dragElastic={dragElastic}
          dragMomentum={momentum}
          dragPropagation={dragPropagation}
          dragTransition={dragTransition}
          key={index}
          onDragEnd={() => setIsDragging(false)}
          onDragStart={() => {
            bringToFront(index)
            setIsDragging(true)
          }}
          style={{ zIndex: Math.max(zIndices.indexOf(index), 0), cursor: isDragging ? "grabbing" : "grab" }}
        >
          {child}
        </motion.div>
      ))}
    </div>
  )
}
