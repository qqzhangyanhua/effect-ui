"use client"

import * as React from "react"

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export interface SlideToConfirmProps {
  label?: string
  threshold?: number
  color?: string
  duration?: number
  disabled?: boolean
  onConfirm?: () => void
  className?: string
  ref?: React.Ref<HTMLButtonElement>
}

function SlideToConfirm({
  label = "滑动确认",
  threshold = 0.85,
  color,
  duration,
  disabled = false,
  onConfirm,
  className,
  ref,
}: SlideToConfirmProps) {
  const reduced = usePrefersReducedMotion()
  const trackRef = React.useRef<HTMLDivElement>(null)
  const percentRef = React.useRef(0)
  const draggingRef = React.useRef(false)
  const [percent, setPercent] = React.useState(0)
  const [dragging, setDragging] = React.useState(false)
  const limit = Math.min(1, Math.max(0, threshold)) * 100
  const snapBack = duration === undefined || duration === 150

  const publish = (next: number) => {
    const clamped = Math.min(100, Math.max(0, Math.round(next)))
    percentRef.current = clamped
    setPercent(clamped)
  }

  const confirm = () => {
    publish(0)
    onConfirm?.()
  }

  const endDrag = () => {
    if (!draggingRef.current) return
    draggingRef.current = false
    setDragging(false)
    if (percentRef.current >= limit) confirm()
    else publish(0)
  }

  return (
    <div
      ref={trackRef}
      data-slot="slide-to-confirm"
      className={cn(
        "relative h-12 overflow-hidden rounded-full bg-muted",
        disabled && "opacity-50",
        className,
      )}
    >
      <span aria-hidden className="pointer-events-none absolute inset-0 grid place-items-center text-sm text-muted-foreground">
        {label}
      </span>
      <button
        ref={ref}
        type="button"
        role="slider"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percent}
        aria-disabled={disabled || undefined}
        disabled={disabled}
        className={cn(
          "absolute top-1 bottom-1 left-1 w-10 rounded-full bg-primary text-primary-foreground shadow-sm outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed",
          !reduced && !dragging && (snapBack ? "transition-[left] duration-150" : "transition-[left]"),
        )}
        style={
          snapBack || reduced || dragging
            ? {
                left: `calc(${percent} * (100% - 2.75rem) / 100)`,
                background: color,
              }
            : {
                left: `calc(${percent} * (100% - 2.75rem) / 100)`,
                background: color,
                transitionDuration: `${duration}ms`,
              }
        }
        onPointerDown={(event) => {
          if (disabled || event.button !== 0) return
          draggingRef.current = true
          setDragging(true)
          event.currentTarget.setPointerCapture(event.pointerId)
        }}
        onPointerMove={(event) => {
          if (!draggingRef.current || disabled) return
          const rect = trackRef.current?.getBoundingClientRect()
          if (!rect || rect.width <= 0) return
          publish(((event.clientX - rect.left) / rect.width) * 100)
        }}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onKeyDown={(event) => {
          if (disabled || event.repeat) return
          if (event.key === "ArrowRight") {
            event.preventDefault()
            const next = percentRef.current + 10
            if (next >= limit) confirm()
            else publish(next)
          } else if (event.key === "ArrowLeft") {
            event.preventDefault()
            publish(percentRef.current - 10)
          } else if (event.key === "Enter" || event.key === " ") {
            // 键盘没有拖动手势，Enter / Space 是明确的确认方式。
            event.preventDefault()
            confirm()
          }
        }}
      />
    </div>
  )
}

export { SlideToConfirm }
