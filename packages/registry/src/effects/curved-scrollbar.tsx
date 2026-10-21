"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

export interface CurvedScrollbarProps {
  children?: React.ReactNode
  className?: string
  radius?: number
}

function trackPath(width: number, height: number, radius: number) {
  const inset = 8
  const right = Math.max(inset + radius, width - inset)
  const bottom = Math.max(inset + radius, height - inset)
  const left = inset
  const top = inset
  const corner = Math.min(radius, (right - left) / 2, (bottom - top) / 2)
  return `M ${left + corner} ${top} H ${right - corner} Q ${right} ${top} ${right} ${top + corner} V ${bottom - corner} Q ${right} ${bottom} ${right - corner} ${bottom} H ${left + corner} Q ${left} ${bottom} ${left} ${bottom - corner} V ${top + corner} Q ${left} ${top} ${left + corner} ${top}`
}

function CurvedScrollbar({ children, className, radius = 28 }: CurvedScrollbarProps) {
  const scrollerRef = React.useRef<HTMLDivElement>(null)
  const pathRef = React.useRef<SVGPathElement>(null)
  const [size, setSize] = React.useState({ width: 320, height: 240 })
  const [offset, setOffset] = React.useState(0)
  const [thumb, setThumb] = React.useState(24)
  const [span, setSpan] = React.useState(800)
  const path = trackPath(size.width, size.height, radius)

  const sync = React.useCallback(() => {
    const scroller = scrollerRef.current
    const shape = pathRef.current
    if (!scroller || !shape) return
    const length = shape.getTotalLength()
    const visible = scroller.clientHeight / Math.max(scroller.scrollHeight, 1)
    const thumbLength = Math.max(18, length * visible)
    const travel = Math.max(length - thumbLength, 1)
    const progress = scroller.scrollTop / Math.max(scroller.scrollHeight - scroller.clientHeight, 1)
    setSpan(length)
    setThumb(thumbLength)
    setOffset(progress * travel)
  }, [])

  React.useEffect(() => {
    const scroller = scrollerRef.current
    if (!scroller) return
    const measure = () => {
      const rect = scroller.getBoundingClientRect()
      setSize({ width: rect.width, height: rect.height })
    }
    measure()
    const observer = new ResizeObserver(() => {
      measure()
      sync()
    })
    observer.observe(scroller)
    scroller.addEventListener("scroll", sync, { passive: true })
    return () => {
      observer.disconnect()
      scroller.removeEventListener("scroll", sync)
    }
  }, [sync])

  React.useLayoutEffect(() => {
    sync()
  }, [path, sync])

  return (
    <div data-slot="curved-scrollbar" className={cn("relative", className)}>
      <div ref={scrollerRef} className="h-full overflow-auto pr-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {children}
      </div>
      <svg className="pointer-events-none absolute inset-0 size-full" aria-hidden>
        <path ref={pathRef} d={path} fill="none" stroke="currentColor" strokeOpacity="0.25" strokeWidth="3" />
        <path
          d={path}
          fill="none"
          stroke="currentColor"
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray={`${thumb} ${Math.max(span - thumb, 0.5)}`}
          strokeDashoffset={-offset}
        />
      </svg>
    </div>
  )
}

export { CurvedScrollbar }
