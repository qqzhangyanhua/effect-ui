"use client"

// Ported from Motiq (MIT, (c) 2026 Mahammad Rustamov) — https://github.com/RMahammad/motiq/blob/main/packages/registry/registry/media/filmstrip-scrub.tsx

import { useCallback, useEffect, useRef, useSyncExternalStore, type HTMLAttributes, type PointerEvent as ReactPointerEvent, type KeyboardEvent as ReactKeyboardEvent } from "react"

import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export interface FilmstripFrame {
  id: string
  label?: string
  node?: React.ReactNode
}

export interface FilmstripScrubProps extends Omit<HTMLAttributes<HTMLDivElement>, "onChange"> {
  frames: FilmstripFrame[]
  color?: string
  duration?: number
  speed?: number
  loop?: boolean
}

interface Head {
  index: number
  p: number
  v: number
  target: number
  dir: number
  lastInteract: number
  dragging: boolean
  listeners: Set<() => void>
}

function createHead(): Head {
  return { index: 0, p: 0, v: 0, target: 0, dir: 1, lastInteract: -100, dragging: false, listeners: new Set() }
}

function clamp(v: number, lo: number, hi: number) {
  return v < lo ? lo : v > hi ? hi : v
}

function publish(head: Head, index: number) {
  if (head.index === index) return
  head.index = index
  for (const listener of head.listeners) listener()
}

function timecode(position: number, fps: number) {
  const seconds = Math.floor(position)
  const frames = Math.floor((position - seconds) * fps)
  return `00:00:${String(seconds).padStart(2, "0")}:${String(frames).padStart(2, "0")}`
}

export function FilmstripScrub({
  frames,
  color = "var(--primary)",
  duration = 1000,
  speed = 0.9,
  loop = true,
  className,
  ...props
}: FilmstripScrubProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const stripRef = useRef<HTMLDivElement>(null)
  const playheadRef = useRef<HTMLDivElement>(null)
  const layerRefs = useRef<Array<HTMLElement | null>>([])
  const codeRef = useRef<HTMLElement>(null)
  const head = useRef(createHead())
  const reduced = usePrefersReducedMotion()
  const live = useAnimationActive(rootRef)
  const moving = live && !reduced && speed > 0
  const maxIndex = Math.max(0, frames.length - 1)
  const subscribe = useCallback((listener: () => void) => {
    const current = head.current
    if (!current) return () => {}
    current.listeners.add(listener)
    return () => current.listeners.delete(listener)
  }, [])
  const index = useSyncExternalStore(
    subscribe,
    () => head.current?.index ?? 0,
    () => 0,
  )

  useEffect(() => {
    const current = head.current
    if (!current || frames.length === 0) return
    const paint = () => {
      const i0 = clamp(Math.floor(current.p), 0, maxIndex)
      const i1 = clamp(Math.ceil(current.p), 0, maxIndex)
      const frac = current.p - i0
      layerRefs.current.forEach((layer, layerIndex) => {
        if (!layer) return
        const opacity = layerIndex === i0 ? 1 : layerIndex === i1 ? frac : 0
        layer.style.opacity = opacity.toFixed(3)
      })
      if (playheadRef.current) playheadRef.current.style.left = `${(maxIndex > 0 ? current.p / maxIndex : 0) * 100}%`
      if (codeRef.current) codeRef.current.textContent = timecode(current.p, 24)
      publish(current, clamp(Math.round(current.p), 0, maxIndex))
    }
    if (!moving) {
      current.p = current.target
      current.v = 0
      paint()
      return
    }
    let raf = 0
    let last = 0
    const frame = (now: number) => {
      const dt = last ? Math.min(0.05, (now - last) / 1000) : 0.016
      last = now
      if (!current.dragging && now / 1000 - current.lastInteract > 3) {
        current.target += current.dir * speed * dt
        if (current.target >= maxIndex) {
          current.target = maxIndex
          current.dir = loop ? -1 : 0
        }
        if (current.target <= 0) {
          current.target = 0
          current.dir = loop ? 1 : 0
        }
      }
      const stiffness = 90000 / Math.max(200, duration)
      current.v += ((current.target - current.p) * stiffness - current.v * 16) * dt
      current.p = clamp(current.p + current.v * dt, 0, maxIndex)
      paint()
      raf = requestAnimationFrame(frame)
    }
    raf = requestAnimationFrame(frame)
    return () => cancelAnimationFrame(raf)
  }, [duration, frames.length, loop, maxIndex, moving, speed])

  const seek = (clientX: number, time: number) => {
    const strip = stripRef.current
    const current = head.current
    if (!strip || !current || maxIndex === 0) return
    const rect = strip.getBoundingClientRect()
    const next = clamp((clientX - rect.left) / Math.max(1, rect.width), 0, 1) * maxIndex
    current.target = next
    current.lastInteract = time / 1000
    if (reduced || !live) {
      current.p = next
      current.v = 0
      publish(current, clamp(Math.round(next), 0, maxIndex))
      layerRefs.current.forEach((layer, layerIndex) => {
        if (layer) layer.style.opacity = layerIndex === current.index ? "1" : "0"
      })
      if (playheadRef.current) playheadRef.current.style.left = `${(next / maxIndex) * 100}%`
    }
  }

  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    const current = head.current
    if (!current) return
    if (event.pointerType === "mouse" && event.button !== 0) return
    current.dragging = true
    event.currentTarget.setPointerCapture?.(event.pointerId)
    seek(event.clientX, event.timeStamp)
  }

  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const current = head.current
    if (!current?.dragging) return
    seek(event.clientX, event.timeStamp)
  }

  const endDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
    const current = head.current
    if (!current) return
    current.dragging = false
    current.lastInteract = event.timeStamp / 1000
  }

  const onKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    const current = head.current
    if (!current) return
    const cur = clamp(Math.round(current.target), 0, maxIndex)
    let next = cur
    if (event.key === "ArrowRight" || event.key === "ArrowUp") next = clamp(cur + 1, 0, maxIndex)
    else if (event.key === "ArrowLeft" || event.key === "ArrowDown") next = clamp(cur - 1, 0, maxIndex)
    else if (event.key === "Home") next = 0
    else if (event.key === "End") next = maxIndex
    else return
    event.preventDefault()
    current.target = next
    current.lastInteract = event.timeStamp / 1000
    if (reduced || !live) {
      current.p = next
      current.v = 0
      publish(current, next)
    }
  }

  const active = frames[clamp(index, 0, maxIndex)]

  return (
    <div
      ref={rootRef}
      data-motion={moving ? "on" : "off"}
      className={cn("flex w-full flex-col overflow-hidden rounded-2xl border border-border bg-card motion-reduce:animate-none", className)}
      {...props}
    >
      <div className="relative aspect-video w-full border-b border-border bg-muted">
        {frames.map((frame, frameIndex) => (
          <div
            key={frame.id}
            ref={(node) => {
              layerRefs.current[frameIndex] = node
            }}
            className="absolute inset-0"
            style={{ opacity: frameIndex === index ? 1 : 0 }}
          >
            {frame.node}
          </div>
        ))}
        <div className="absolute left-3 top-3 rounded-md border border-border bg-background/80 px-2 py-1 font-mono text-xs text-foreground">
          <span ref={codeRef}>{timecode(index, 24)}</span>
          {active?.label ? <span className="ml-2 uppercase tracking-wide text-muted-foreground">{active.label}</span> : null}
        </div>
      </div>
      <div
        role="slider"
        tabIndex={0}
        aria-label="Timeline scrubber"
        aria-valuemin={0}
        aria-valuemax={maxIndex}
        aria-valuenow={clamp(index, 0, maxIndex)}
        aria-valuetext={active?.label ? `Frame ${index + 1} of ${frames.length}, ${active.label}` : `Frame ${index + 1} of ${frames.length}`}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onKeyDown={onKeyDown}
        className="relative h-28 touch-pan-y cursor-ew-resize bg-background px-4 pb-6 pt-3 outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <div ref={stripRef} className="flex h-full gap-1 overflow-hidden rounded-md">
          {frames.map((frame, frameIndex) => (
            <div key={frame.id} aria-hidden className="grid min-w-0 flex-1 place-items-center overflow-hidden rounded-sm bg-muted text-[10px] text-foreground" style={{ outline: frameIndex === index ? `2px solid ${color}` : undefined }}>
              {frame.label ?? frameIndex + 1}
            </div>
          ))}
        </div>
        <div aria-hidden className="pointer-events-none absolute bottom-6 left-4 right-4 top-3">
          <div ref={playheadRef} className="absolute bottom-0 top-0 w-0.5" style={{ left: `${maxIndex > 0 ? (index / maxIndex) * 100 : 0}%`, background: color }} />
        </div>
      </div>
    </div>
  )
}
