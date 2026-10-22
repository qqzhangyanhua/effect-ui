"use client"

// Ported from GodUI (MIT, (c) 2026 Lucas Bassetti) — https://github.com/LucasBassetti/godui/blob/1f632a7/packages/lab/src/liquid-metaballs/liquid-metaballs.tsx

import { useEffect, useId, useRef, type HTMLAttributes } from "react"
import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"

const FALLBACK_COLORS = ["var(--primary)", "var(--chart-2)", "var(--chart-4)", "var(--chart-3)"]

export type LiquidMetaballsProps = HTMLAttributes<HTMLDivElement> & {
  colors?: string[]
  speed?: number
  intensity?: number
  count?: number
  interactive?: boolean
}

type Blob = { x: number; y: number; vx: number; vy: number; r: number; el: SVGCircleElement | null }

export function LiquidMetaballs({
  colors = FALLBACK_COLORS,
  speed = 1,
  intensity = 16,
  count = 7,
  interactive = true,
  className,
  style,
  ...props
}: LiquidMetaballsProps) {
  const ref = useRef<HTMLDivElement>(null)
  const svgRef = useRef<SVGSVGElement>(null)
  const cursorRef = useRef<SVGCircleElement>(null)
  const blobsRef = useRef<Blob[]>([])
  const reduced = usePrefersReducedMotion()
  const live = useAnimationActive(ref)
  const liveRef = useRef(live)
  const reducedRef = useRef(reduced)
  const filterId = `goo-${useId().replace(/:/g, "")}`
  const palette = colors.length > 0 ? colors : FALLBACK_COLORS
  const blobs = Math.max(1, Math.round(count))

  useEffect(() => {
    liveRef.current = live
  }, [live])

  useEffect(() => {
    reducedRef.current = reduced
  }, [reduced])

  useEffect(() => {
    const container = ref.current
    const svg = svgRef.current
    if (!container || !svg) return
    blobsRef.current.length = Math.min(blobsRef.current.length, blobs)
    let width = 0
    let height = 0
    let frame = 0
    const cursor = { x: -9999, y: -9999, active: false }

    const setup = () => {
      width = container.clientWidth
      height = container.clientHeight
      svg.setAttribute("viewBox", `0 0 ${width} ${height}`)
      svg.setAttribute("preserveAspectRatio", "xMidYMid meet")
      const min = Math.min(width, height) || 1
      for (let i = 0; i < blobsRef.current.length; i += 1) {
        const blob = blobsRef.current[i]
        if (!blob || blob.r !== 0) continue
        const turn = i * 2.399
        blob.x = width * (0.5 + 0.32 * Math.cos(turn))
        blob.y = height * (0.5 + 0.32 * Math.sin(turn))
        blob.r = min * (0.08 + (i % 5) * 0.012)
        blob.vx = Math.cos(turn) * 0.35 * speed
        blob.vy = Math.sin(turn * 1.3) * 0.35 * speed
        blob.el?.setAttribute("r", `${blob.r}`)
      }
    }

    const paint = () => {
      for (const blob of blobsRef.current) {
        blob.el?.setAttribute("cx", `${blob.x}`)
        blob.el?.setAttribute("cy", `${blob.y}`)
      }
    }

    const step = () => {
      if (!liveRef.current || reducedRef.current) {
        frame = 0
        return
      }
      for (const blob of blobsRef.current) {
        blob.x += blob.vx
        blob.y += blob.vy
        if (blob.x < -blob.r) blob.x = width + blob.r
        if (blob.x > width + blob.r) blob.x = -blob.r
        if (blob.y < -blob.r) blob.y = height + blob.r
        if (blob.y > height + blob.r) blob.y = -blob.r
      }
      if (interactive && cursorRef.current) {
        if (cursor.active) {
          cursorRef.current.setAttribute("cx", `${cursor.x}`)
          cursorRef.current.setAttribute("cy", `${cursor.y}`)
          cursorRef.current.setAttribute("r", `${Math.min(width, height) * 0.1}`)
        } else {
          cursorRef.current.setAttribute("r", "0")
        }
      }
      paint()
      frame = requestAnimationFrame(step)
    }

    setup()
    paint()
    if (live && !reduced) frame = requestAnimationFrame(step)

    const place = (event: PointerEvent) => {
      const rect = container.getBoundingClientRect()
      cursor.x = event.clientX - rect.left
      cursor.y = event.clientY - rect.top
      cursor.active = true
    }
    const clear = () => {
      cursor.active = false
    }
    if (interactive) {
      container.addEventListener("pointermove", place)
      container.addEventListener("pointerdown", place)
      container.addEventListener("pointerleave", clear)
      container.addEventListener("pointercancel", clear)
    }
    const observer = new ResizeObserver(() => {
      setup()
      paint()
    })
    observer.observe(container)
    return () => {
      cancelAnimationFrame(frame)
      if (interactive) {
        container.removeEventListener("pointermove", place)
        container.removeEventListener("pointerdown", place)
        container.removeEventListener("pointerleave", clear)
        container.removeEventListener("pointercancel", clear)
      }
      observer.disconnect()
    }
  }, [blobs, speed, interactive, live, reduced])

  return (
    <div
      ref={ref}
      data-slot="liquid-metaballs"
      data-motion={live && !reduced ? "on" : "off"}
      aria-hidden="true"
      className={`absolute inset-0 size-full overflow-hidden motion-reduce:transform-none ${className ?? ""}`}
      style={style}
      {...props}
    >
      <svg ref={svgRef} className="pointer-events-none size-full" role="presentation">
        <defs>
          <filter id={filterId}>
            <feGaussianBlur in="SourceGraphic" stdDeviation={intensity} result="blur" />
            <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 20 -9" result="goo" />
            <feBlend in="SourceGraphic" in2="goo" />
          </filter>
        </defs>
        <g filter={`url(#${filterId})`}>
          {Array.from({ length: blobs }, (_, index) => (
            <circle
              key={index}
              r={0}
              fill={palette[index % palette.length] ?? "var(--primary)"}
              ref={(node) => {
                const current = blobsRef.current[index] ?? { x: 0, y: 0, vx: 0, vy: 0, r: 0, el: null }
                current.el = node
                blobsRef.current[index] = current
              }}
            />
          ))}
          {interactive ? <circle ref={cursorRef} r={0} fill={palette[0] ?? "var(--primary)"} /> : null}
        </g>
      </svg>
    </div>
  )
}
