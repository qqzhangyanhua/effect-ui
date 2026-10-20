"use client"

import * as React from "react"

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export interface SwipeRowProps {
  children?: React.ReactNode
  actions?: React.ReactNode
  actionWidth?: number
  direction?: "left" | "right"
  disabled?: boolean
  className?: string
  ref?: React.Ref<HTMLDivElement>
}

function SwipeRow({
  children,
  actions,
  actionWidth = 88,
  direction = "left",
  disabled = false,
  className,
  ref,
}: SwipeRowProps) {
  const reduced = usePrefersReducedMotion()
  const [open, setOpen] = React.useState(false)
  const [drag, setDrag] = React.useState(0)
  const [dragging, setDragging] = React.useState(false)
  const startX = React.useRef<number | null>(null)
  const dragRef = React.useRef(0)
  const width = Math.max(1, actionWidth)
  const resting = open ? (direction === "left" ? -width : width) : 0
  const offset = dragging ? resting + drag : resting

  const finish = () => {
    if (startX.current === null) return
    const traveled = dragRef.current
    const shouldOpen = direction === "right" ? traveled > width * 0.4 : traveled < -width * 0.4
    setOpen(shouldOpen)
    startX.current = null
    dragRef.current = 0
    setDrag(0)
    setDragging(false)
  }

  return (
    <div
      ref={ref}
      data-slot="swipe-row"
      className={cn("relative overflow-hidden rounded-lg border bg-card", className)}
    >
      <div
        hidden={!open}
        className={cn(
          "absolute inset-y-0 flex items-stretch",
          direction === "left" ? "right-0" : "left-0",
        )}
        style={{ width }}
        onClick={() => setOpen(false)}
      >
        {actions}
      </div>
      <div
        className={cn(
          "relative z-10 bg-background px-3 py-3",
          !reduced && !dragging && "transition-transform duration-150",
        )}
        style={{ transform: `translateX(${offset}px)` }}
        onPointerDown={(event) => {
          if (disabled || event.button !== 0) return
          startX.current = event.clientX
          dragRef.current = 0
          setDragging(true)
          event.currentTarget.setPointerCapture(event.pointerId)
        }}
        onPointerMove={(event) => {
          if (startX.current === null) return
          dragRef.current = event.clientX - startX.current
          setDrag(dragRef.current)
        }}
        onPointerUp={finish}
        onPointerCancel={finish}
      >
        {children}
      </div>
    </div>
  )
}

export { SwipeRow }
