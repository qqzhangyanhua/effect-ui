"use client"

import * as React from "react"

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export interface RubberBandDragProps {
  className?: string
}

const ANCHOR = { x: 160, y: 140 }
const REST = { x: 280, y: 150 }

function RubberBandDrag({ className }: RubberBandDragProps) {
  const reduced = usePrefersReducedMotion()
  const hostRef = React.useRef<HTMLDivElement>(null)
  const [point, setPoint] = React.useState(REST)
  const pointRef = React.useRef(REST)
  const velocityRef = React.useRef({ x: 0, y: 0 })
  const dragRef = React.useRef<{ dx: number; dy: number } | null>(null)
  const frameRef = React.useRef(0)
  const visibleRef = React.useRef(true)
  const oscillatingRef = React.useRef(false)
  const stepRef = React.useRef<() => void>(() => {})

  React.useEffect(() => {
    const step = () => {
      if (!visibleRef.current) {
        frameRef.current = 0
        return
      }
      const current = pointRef.current
      const vx = velocityRef.current.x + (REST.x - current.x) * 0.085 - velocityRef.current.x * 0.14
      const vy = velocityRef.current.y + (REST.y - current.y) * 0.085 - velocityRef.current.y * 0.14
      velocityRef.current = { x: vx, y: vy }
      const next = { x: current.x + vx, y: current.y + vy }
      if (Math.hypot(vx, vy) < 0.18 && Math.hypot(REST.x - next.x, REST.y - next.y) < 0.6) {
        pointRef.current = REST
        oscillatingRef.current = false
        frameRef.current = 0
        setPoint(REST)
        return
      }
      pointRef.current = next
      setPoint(next)
      frameRef.current = window.requestAnimationFrame(step)
    }
    stepRef.current = step
    const host = hostRef.current
    if (!host || typeof IntersectionObserver === "undefined") {
      return () => window.cancelAnimationFrame(frameRef.current)
    }
    const observer = new IntersectionObserver((entries) => {
      visibleRef.current = entries.some((entry) => entry.isIntersecting)
      if (visibleRef.current && oscillatingRef.current && frameRef.current === 0) {
        frameRef.current = window.requestAnimationFrame(step)
      }
    })
    observer.observe(host)
    return () => {
      observer.disconnect()
      window.cancelAnimationFrame(frameRef.current)
    }
  }, [])

  const settle = () => {
    window.cancelAnimationFrame(frameRef.current)
    frameRef.current = 0
    velocityRef.current = { x: 0, y: 0 }
    if (reduced) {
      oscillatingRef.current = false
      pointRef.current = REST
      setPoint(REST)
      return
    }
    oscillatingRef.current = true
    if (!visibleRef.current) return
    frameRef.current = window.requestAnimationFrame(() => stepRef.current())
  }

  const distance = Math.hypot(point.x - ANCHOR.x, point.y - ANCHOR.y)
  const width = Math.max(1.2, 9 - distance / 36)

  return (
    <div ref={hostRef} data-slot="rubber-band-drag" className={cn("relative h-72 overflow-hidden rounded-xl border bg-slate-950", className)}>
      <svg viewBox="0 0 480 280" className="size-full">
        <line x1={ANCHOR.x} y1={ANCHOR.y} x2={point.x} y2={point.y} stroke="#f8fafc" strokeWidth={width} strokeLinecap="round" />
        <circle cx={ANCHOR.x} cy={ANCHOR.y} r="7" fill="#94a3b8" />
        <circle
          cx={point.x}
          cy={point.y}
          r="16"
          fill="#38bdf8"
          role="button"
          aria-label="拖拽节点"
          onPointerDown={(event) => {
            window.cancelAnimationFrame(frameRef.current)
            frameRef.current = 0
            oscillatingRef.current = false
            const svg = event.currentTarget.ownerSVGElement
            if (!svg) return
            const matrix = svg.getScreenCTM()
            if (!matrix) return
            const local = new DOMPoint(event.clientX, event.clientY).matrixTransform(matrix.inverse())
            dragRef.current = { dx: local.x - pointRef.current.x, dy: local.y - pointRef.current.y }
            event.currentTarget.setPointerCapture(event.pointerId)
          }}
          onPointerMove={(event) => {
            const drag = dragRef.current
            const svg = event.currentTarget.ownerSVGElement
            if (!drag || !svg) return
            const matrix = svg.getScreenCTM()
            if (!matrix) return
            const local = new DOMPoint(event.clientX, event.clientY).matrixTransform(matrix.inverse())
            const next = { x: local.x - drag.dx, y: local.y - drag.dy }
            pointRef.current = next
            setPoint(next)
          }}
          onPointerUp={() => {
            dragRef.current = null
            settle()
          }}
        />
      </svg>
    </div>
  )
}

export { RubberBandDrag }
