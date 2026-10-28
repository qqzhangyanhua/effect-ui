"use client"

import { useId, useEffect, useRef, useState, type KeyboardEvent, type PointerEvent, type ReactNode } from "react"

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/cn"

export interface ScrubFogClearProps {
  blur?: number
  threshold?: number
  brush?: number
  className?: string
  children?: ReactNode
  onClear?: () => void
}

const COLS = 24
const ROWS = 16

function clamp(value: number, min: number, max: number) {
  if (!Number.isFinite(value)) return min
  return Math.min(max, Math.max(min, value))
}

function coverage(mask: Uint8Array) {
  let marked = 0
  for (let index = 0; index < mask.length; index += 1) marked += mask[index] ?? 0
  return marked / mask.length
}

function stamp(mask: Uint8Array, x: number, y: number, radius: number, width: number, height: number) {
  const cx = (x / width) * COLS
  const cy = (y / height) * ROWS
  const rx = Math.max(0.75, (radius / width) * COLS)
  const ry = Math.max(0.75, (radius / height) * ROWS)
  const x0 = Math.max(0, Math.floor(cx - rx))
  const x1 = Math.min(COLS - 1, Math.ceil(cx + rx))
  const y0 = Math.max(0, Math.floor(cy - ry))
  const y1 = Math.min(ROWS - 1, Math.ceil(cy + ry))
  for (let gy = y0; gy <= y1; gy += 1) {
    for (let gx = x0; gx <= x1; gx += 1) {
      const dx = (gx + 0.5 - cx) / rx
      const dy = (gy + 0.5 - cy) / ry
      if (dx * dx + dy * dy <= 1) mask[gy * COLS + gx] = 1
    }
  }
}

function localPoint(clientX: number, clientY: number, node: HTMLElement) {
  const rect = node.getBoundingClientRect()
  const width = rect.width > 0 ? rect.width : 320
  const height = rect.height > 0 ? rect.height : 180
  const left = rect.width > 0 ? rect.left : 0
  const top = rect.height > 0 ? rect.top : 0
  return { x: clientX - left, y: clientY - top, width, height }
}

export function ScrubFogClear({
  blur = 12,
  threshold = 0.4,
  brush = 36,
  className,
  children,
  onClear,
}: ScrubFogClearProps) {
  const reduced = usePrefersReducedMotion()
  const limit = clamp(threshold, 0.05, 0.95)
  const radius = clamp(brush, 8, 96)
  const fog = clamp(blur, 0, 28)
  const maskId = useId().replace(/:/g, "")
  const rootRef = useRef<HTMLDivElement>(null)
  const holesRef = useRef<SVGGElement>(null)
  const maskRef = useRef(new Uint8Array(COLS * ROWS))
  const doneRef = useRef(false)
  const stopRef = useRef<(() => void) | null>(null)
  const [progress, setProgress] = useState(0)
  const [phase, setPhase] = useState<"fogged" | "scrubbing" | "clear">("fogged")
  const percent = Math.round(progress * 100)
  const ring = 2 * Math.PI * 15

  useEffect(() => () => stopRef.current?.(), [])

  function addHole(x: number, y: number) {
    const group = holesRef.current
    if (!group) return
    const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle")
    circle.setAttribute("cx", String(x))
    circle.setAttribute("cy", String(y))
    circle.setAttribute("r", String(radius))
    circle.setAttribute("fill", "black")
    group.appendChild(circle)
  }

  function scrub(fromX: number, fromY: number, to: ReturnType<typeof localPoint>) {
    if (doneRef.current) return
    const dist = Math.hypot(to.x - fromX, to.y - fromY)
    const steps = Math.max(1, Math.ceil(dist / 8))
    for (let step = 0; step <= steps; step += 1) {
      const t = step / steps
      const x = fromX + (to.x - fromX) * t
      const y = fromY + (to.y - fromY) * t
      stamp(maskRef.current, x, y, radius, to.width, to.height)
      if (step % 2 === 0) addHole(x, y)
    }
    const next = coverage(maskRef.current)
    setProgress(next)
    if (next >= limit) {
      doneRef.current = true
      setPhase("clear")
      onClear?.()
      return
    }
    setPhase("scrubbing")
  }

  function clearNow() {
    if (doneRef.current) return
    doneRef.current = true
    maskRef.current.fill(1)
    setProgress(1)
    setPhase("clear")
    onClear?.()
  }

  function reset() {
    stopRef.current?.()
    holesRef.current?.replaceChildren()
    maskRef.current = new Uint8Array(COLS * ROWS)
    doneRef.current = false
    setProgress(0)
    setPhase(reduced ? "clear" : "fogged")
  }

  function onPointerDown(event: PointerEvent<HTMLDivElement>) {
    if (reduced || doneRef.current || event.button !== 0) return
    const node = rootRef.current
    if (!node) return
    const pointerId = event.pointerId
    let last = localPoint(event.clientX, event.clientY, node)
    scrub(last.x, last.y, last)
    const move = (native: globalThis.PointerEvent) => {
      if (native.pointerId !== pointerId || doneRef.current) return
      const next = localPoint(native.clientX, native.clientY, node)
      scrub(last.x, last.y, next)
      last = next
    }
    const stop = () => {
      window.removeEventListener("pointermove", move)
      window.removeEventListener("pointerup", stop)
      window.removeEventListener("pointercancel", stop)
      if (stopRef.current === stop) stopRef.current = null
    }
    stopRef.current = stop
    window.addEventListener("pointermove", move)
    window.addEventListener("pointerup", stop)
    window.addEventListener("pointercancel", stop)
  }

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.target instanceof HTMLElement && event.target.closest("button")) return
    if (event.key !== "Enter" && event.key !== " " && event.key !== "Spacebar") return
    event.preventDefault()
    clearNow()
  }

  const body = children ?? (
    <div className="grid h-full place-items-center px-6 text-center">
      <div>
        <p className="font-display text-3xl tracking-tight">先把雾擦开</p>
        <p className="mt-2 text-sm text-muted-foreground">清出一条路，整页才会亮起来。</p>
      </div>
    </div>
  )
  const foggy = !reduced && phase !== "clear"

  return (
    <div
      ref={rootRef}
      data-slot="scrub-fog-clear"
      data-blur={fog}
      data-threshold={limit}
      data-brush={radius}
      data-motion={reduced ? "off" : "on"}
      data-state={phase}
      data-progress={progress.toFixed(2)}
      data-fog={foggy ? "on" : "off"}
      data-layer="fog"
      tabIndex={0}
      role="group"
      aria-label="擦开雾面。Enter 或空格直接清除。"
      aria-keyshortcuts="Enter Space"
      onKeyDown={onKeyDown}
      onPointerDown={onPointerDown}
      className={cn(
        "relative h-64 touch-none overflow-hidden rounded-3xl border border-border bg-card text-card-foreground outline-none select-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none",
        className,
      )}
    >
      {body}
      <svg aria-hidden className="pointer-events-none absolute inset-0 h-full w-full">
        <mask id={maskId} maskUnits="userSpaceOnUse" maskContentUnits="userSpaceOnUse">
          <rect x="0" y="0" width="100%" height="100%" fill="white" />
          <g ref={holesRef} />
        </mask>
      </svg>
      {foggy ? (
        <div
          data-fog=""
          aria-hidden
          className="absolute inset-0 bg-background/50 motion-reduce:transition-none"
          style={{
            backdropFilter: fog > 0 ? `blur(${fog}px)` : "none",
            WebkitBackdropFilter: fog > 0 ? `blur(${fog}px)` : "none",
            mask: `url(#${maskId})`,
            WebkitMask: `url(#${maskId})`,
          }}
        />
      ) : null}
      {phase !== "clear" && !reduced ? (
        <div className="pointer-events-none absolute inset-x-0 top-4 flex flex-col items-center gap-2 text-foreground">
          <svg viewBox="0 0 36 36" className="h-11 w-11" aria-hidden>
            <circle cx="18" cy="18" r="15" fill="none" className="stroke-border" strokeWidth="3" />
            <circle
              cx="18"
              cy="18"
              r="15"
              fill="none"
              className="stroke-primary"
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray={`${progress * ring} ${ring}`}
              transform="rotate(-90 18 18)"
            />
          </svg>
          <p className="text-sm">Scrub to begin</p>
        </div>
      ) : null}
      <div role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={percent} aria-label="清雾进度" className="sr-only">
        {percent}%
      </div>
      {reduced && phase !== "clear" ? (
        <div className="absolute inset-x-0 bottom-4 flex justify-center">
          <button
            type="button"
            onClick={clearNow}
            className="pointer-events-auto rounded-full bg-primary px-4 py-2 text-sm text-primary-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Clear
          </button>
        </div>
      ) : null}
      {phase === "clear" && !reduced ? (
        <button
          type="button"
          onClick={reset}
          className="absolute right-3 bottom-3 rounded-full border border-border bg-background px-3 py-1 text-xs text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          重置
        </button>
      ) : null}
    </div>
  )
}
