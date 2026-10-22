"use client"

// Ported from GodUI (MIT, (c) 2026 Lucas Bassetti) — https://github.com/LucasBassetti/godui/blob/1f632a7/packages/lab/src/spin-viewer/spin-viewer.tsx

import { useEffect, useRef, useState, type HTMLAttributes, type PointerEvent as ReactPointerEvent } from "react"
import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"

export type SpinViewerProps = Omit<HTMLAttributes<HTMLDivElement>, "children" | "color"> & {
  frames: string[]
  color?: string
  speed?: number
  intensity?: number
  loop?: boolean
  reverse?: boolean
  initialFrame?: number
  hint?: boolean
  label?: string
}

function mod(value: number, count: number) {
  if (count <= 0) return 0
  return ((value % count) + count) % count
}

export function SpinViewer({
  frames,
  color = "var(--primary)",
  speed = 12,
  intensity = 6,
  loop = true,
  reverse = false,
  initialFrame = 0,
  hint = true,
  label = "360-degree view. Drag to rotate.",
  className,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  ...props
}: SpinViewerProps) {
  const ref = useRef<HTMLDivElement>(null)
  const reduced = usePrefersReducedMotion()
  const live = useAnimationActive(ref)
  const liveRef = useRef(live)
  const count = frames.length
  const [index, setIndex] = useState(() => mod(initialFrame, count || 1))
  const [ready, setReady] = useState(count === 0 || frames.every((frame) => frame.trim().startsWith("<svg")))
  const [dragging, setDragging] = useState(false)
  const [showHint, setShowHint] = useState(hint)
  const drag = useRef<{ x: number; i: number } | null>(null)
  const frame = frames[index]

  useEffect(() => {
    liveRef.current = live
  }, [live])

  useEffect(() => {
    if (count === 0) return
    if (frames.every((item) => item.trim().startsWith("<svg"))) {
      const frameId = requestAnimationFrame(() => setReady(true))
      return () => cancelAnimationFrame(frameId)
    }
    let mounted = true
    let loaded = 0
    const finish = () => {
      loaded += 1
      if (mounted && loaded >= count) setReady(true)
    }
    const images = frames.map((src) => {
      const image = new Image()
      let settled = false
      const done = () => {
        if (settled) return
        settled = true
        finish()
      }
      image.onload = done
      image.onerror = done
      image.src = src
      if (image.complete) done()
      return image
    })
    return () => {
      mounted = false
      for (const image of images) {
        image.onload = null
        image.onerror = null
      }
    }
  }, [frames, count])

  useEffect(() => {
    if (!loop || reduced || dragging || !ready || count === 0) return
    let raf = 0
    let last = 0
    let acc = 0
    const dir = reverse ? -1 : 1
    const step = (now: number) => {
      if (last !== 0 && liveRef.current) {
        acc += ((now - last) / 1000) * speed * dir
        if (Math.abs(acc) >= 1) {
          const inc = Math.trunc(acc)
          acc -= inc
          setIndex((current) => mod(current + inc, count))
        }
      }
      last = now
      raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [loop, reduced, dragging, ready, speed, reverse, count])

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (count > 0) {
      event.currentTarget.setPointerCapture?.(event.pointerId)
      drag.current = { x: event.clientX, i: index }
      setDragging(true)
      setShowHint(false)
    }
    onPointerDown?.(event)
  }

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const current = drag.current
    if (current && count > 0) {
      const stepped = Math.round((event.clientX - current.x) / Math.max(intensity, 1)) * (reverse ? -1 : 1)
      setIndex(mod(current.i + stepped, count))
    }
    onPointerMove?.(event)
  }

  const endDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (drag.current) event.currentTarget.releasePointerCapture?.(event.pointerId)
    drag.current = null
    setDragging(false)
    onPointerUp?.(event)
  }

  const inline = frame?.trim().startsWith("<svg") ?? false

  return (
    <div
      ref={ref}
      data-slot="spin-viewer"
      data-motion={live && !reduced && loop ? "on" : "off"}
      role="img"
      aria-label={label}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      className={`group relative select-none overflow-hidden rounded-xl border bg-card touch-pan-y motion-reduce:transition-none ${dragging ? "cursor-grabbing" : "cursor-grab"} ${className ?? ""}`}
      style={{ color, borderColor: color }}
      {...props}
    >
      {ready && frame ? (
        inline ? (
          <div className="pointer-events-none size-full [&>svg]:size-full" dangerouslySetInnerHTML={{ __html: frame }} />
        ) : (
          <img src={frame} alt="" draggable={false} className="pointer-events-none size-full select-none object-contain" />
        )
      ) : (
        <div className="size-full bg-muted motion-reduce:animate-none" aria-hidden="true" />
      )}
      {showHint && ready ? (
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-3 flex justify-center group-active:opacity-0 motion-reduce:transition-none">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background/80 px-3 py-1 text-xs text-muted-foreground">拖动旋转</span>
        </div>
      ) : null}
    </div>
  )
}
