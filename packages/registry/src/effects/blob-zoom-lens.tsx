"use client"

import { useEffect, useId, useRef, useState, useSyncExternalStore, type KeyboardEvent, type PointerEvent } from "react"

import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/cn"

export interface BlobZoomLensProps {
  intensity?: number
  radius?: number
  pace?: number
  jagged?: number
  className?: string
}

interface Point {
  x: number
  y: number
}

const fieldImage = [
  "radial-gradient(circle at 28% 36%, var(--primary) 0 16%, transparent 17%)",
  "radial-gradient(circle at 72% 62%, var(--accent) 0 12%, transparent 13%)",
  "linear-gradient(140deg, var(--muted), var(--background))",
].join(",")

function clamp(value: number, min: number, max: number) {
  if (!Number.isFinite(value)) return min
  return Math.min(max, Math.max(min, value))
}

function rateOf(pace: number) {
  return Number.isFinite(pace) && pace > 0 ? pace : 1
}

function subscribeCoarse(onStoreChange: () => void) {
  const media = window.matchMedia("(pointer: coarse)")
  media.addEventListener("change", onStoreChange)
  return () => media.removeEventListener("change", onStoreChange)
}

function coarseNow() {
  return window.matchMedia("(pointer: coarse)").matches
}

function blobPath(cx: number, cy: number, radiusNorm: number, jagged: number, phase: number, round: boolean) {
  if (round) {
    const r = radiusNorm
    return `M ${cx - r} ${cy} A ${r} ${r} 0 1 1 ${cx + r} ${cy} A ${r} ${r} 0 1 1 ${cx - r} ${cy}`
  }
  const steps = 18
  const teeth = clamp(jagged, 0, 1)
  let path = ""
  for (let i = 0; i <= steps; i += 1) {
    const t = (i / steps) * Math.PI * 2
    const wave = 1 + Math.sin(t * 3 + phase) * teeth * 0.28 + Math.sin(t * 5 - phase * 1.3) * teeth * 0.12
    const r = radiusNorm * wave
    const x = cx + Math.cos(t) * r
    const y = cy + Math.sin(t) * r
    path += `${i === 0 ? "M" : "L"}${x.toFixed(3)} ${y.toFixed(3)}`
  }
  return `${path} Z`
}

function locate(event: { clientX: number; clientY: number }, node: HTMLElement): Point {
  const rect = node.getBoundingClientRect()
  const width = rect.width > 1 ? rect.width : 400
  const height = rect.height > 1 ? rect.height : 280
  return {
    x: clamp((event.clientX - rect.left) / width, 0.08, 0.92),
    y: clamp((event.clientY - rect.top) / height, 0.12, 0.88),
  }
}

export function BlobZoomLens({ intensity = 0.65, radius = 72, pace = 1, jagged = 0.55, className }: BlobZoomLensProps) {
  const ref = useRef<HTMLDivElement>(null)
  const targetRef = useRef<Point>({ x: 0.5, y: 0.5 })
  const poseRef = useRef({ x: 0.5, y: 0.5, morph: 0 })
  const dragRef = useRef(false)
  const reduced = usePrefersReducedMotion()
  const coarse = useSyncExternalStore(subscribeCoarse, coarseNow, () => false)
  const live = useAnimationActive(ref)
  const clipId = `blob${useId().replace(/:/g, "")}`
  const gain = clamp(intensity, 0, 1)
  const teeth = clamp(jagged, 0, 1)
  const rate = rateOf(pace)
  const baseRadius = clamp(radius, 36, 120)
  const [boost, setBoost] = useState(0)
  const [phase, setPhase] = useState<"idle" | "tracking" | "resting">("idle")
  const [pose, setPose] = useState({ x: 0.5, y: 0.5, morph: 0 })
  const effective = reduced ? baseRadius : clamp(baseRadius + boost, 36, 120)
  const norm = effective / 400
  const scale = Math.round((1.2 + gain * 1.6) * 100) / 100
  const cx = reduced ? 0.5 : pose.x
  const cy = reduced ? 0.5 : pose.y
  const path = blobPath(cx, cy, norm, reduced ? 0 : teeth, reduced ? 0 : pose.morph, reduced)

  useEffect(() => {
    if (reduced || !live) return
    let frame = 0
    let stopped = false
    const tick = () => {
      if (stopped) return
      setPose((prev) => {
        const target = targetRef.current
        const k = Math.min(0.48, 0.22 * rate)
        const next = {
          x: prev.x + (target.x - prev.x) * k,
          y: prev.y + (target.y - prev.y) * k,
          morph: (prev.morph + 0.18 * rate) % (Math.PI * 2),
        }
        poseRef.current = next
        return next
      })
      frame = window.requestAnimationFrame(tick)
    }
    frame = window.requestAnimationFrame(tick)
    return () => {
      stopped = true
      window.cancelAnimationFrame(frame)
    }
  }, [reduced, live, rate])

  function moveTo(next: Point) {
    targetRef.current = next
    const shown = { ...poseRef.current, x: next.x, y: next.y }
    poseRef.current = shown
    setPose(shown)
    setPhase("tracking")
  }

  function follow(event: PointerEvent<HTMLDivElement>) {
    if (reduced || !live) return
    const touch = coarse || event.pointerType === "touch"
    if (touch && !dragRef.current) return
    targetRef.current = locate(event, event.currentTarget)
    setPhase("tracking")
  }

  function onPointerDown(event: PointerEvent<HTMLDivElement>) {
    if (reduced || (event.button !== undefined && event.button !== 0)) return
    dragRef.current = true
    if (typeof event.currentTarget.setPointerCapture === "function") {
      try {
        event.currentTarget.setPointerCapture(event.pointerId)
      } catch {
        // jsdom 里不一定有指针捕获。
      }
    }
    follow(event)
  }

  function onPointerUp() {
    dragRef.current = false
    if (reduced) return
    setPhase((current) => (current === "idle" ? "idle" : "resting"))
  }

  function onPointerLeave() {
    if (reduced || dragRef.current) return
    targetRef.current = { x: 0.5, y: 0.5 }
    setPhase((current) => (current === "idle" ? "idle" : "resting"))
  }

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (reduced) return
    const step = 0.06
    const current = poseRef.current
    if (event.key === "ArrowRight") {
      event.preventDefault()
      moveTo({ x: clamp(current.x + step, 0.08, 0.92), y: current.y })
    } else if (event.key === "ArrowLeft") {
      event.preventDefault()
      moveTo({ x: clamp(current.x - step, 0.08, 0.92), y: current.y })
    } else if (event.key === "ArrowDown") {
      event.preventDefault()
      moveTo({ x: current.x, y: clamp(current.y + step, 0.12, 0.88) })
    } else if (event.key === "ArrowUp") {
      event.preventDefault()
      moveTo({ x: current.x, y: clamp(current.y - step, 0.12, 0.88) })
    } else if (event.key === "+" || event.key === "=") {
      event.preventDefault()
      setBoost((value) => clamp(value + 10, -80, 80))
    } else if (event.key === "-" || event.key === "_") {
      event.preventDefault()
      setBoost((value) => clamp(value - 10, -80, 80))
    }
  }

  return (
    <div
      ref={ref}
      tabIndex={0}
      role="application"
      aria-label="有机放大镜"
      data-slot="blob-zoom-lens"
      data-ritual="blob-zoom"
      data-pace={Number.isFinite(pace) ? pace : 1}
      data-intensity={gain}
      data-radius={Math.round(effective)}
      data-jagged={teeth}
      data-scale={scale.toFixed(2)}
      data-cx={cx.toFixed(3)}
      data-cy={cy.toFixed(3)}
      data-morph={(reduced ? 0 : pose.morph).toFixed(2)}
      data-shape={reduced ? "round" : "blob"}
      data-mask={reduced ? "round" : "blob"}
      data-motion={reduced ? "off" : "on"}
      data-pointer={coarse ? "coarse" : "fine"}
      data-live={live ? "on" : "off"}
      data-state={reduced ? "resting" : phase}
      data-follow={reduced ? "off" : "on"}
      onPointerDown={onPointerDown}
      onPointerMove={follow}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onPointerLeave={onPointerLeave}
      onKeyDown={onKeyDown}
      className={cn(
        "relative h-72 w-full max-w-xl overflow-hidden rounded-3xl border border-border bg-card text-card-foreground outline-none touch-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none",
        className,
      )}
    >
      <div aria-hidden data-layer="base" className="absolute inset-0" style={{ backgroundImage: fieldImage }} />
      <div
        aria-hidden
        data-layer="zoom"
        className="absolute inset-0 motion-reduce:transition-none"
        style={{
          backgroundImage: fieldImage,
          clipPath: `url(#${clipId})`,
          transform: `scale(${scale})`,
          transformOrigin: `${cx * 100}% ${cy * 100}%`,
        }}
      />
      <svg viewBox="0 0 1 1" preserveAspectRatio="none" aria-hidden className="pointer-events-none absolute inset-0 h-full w-full">
        <defs>
          <clipPath id={clipId} clipPathUnits="objectBoundingBox">
            <path d={path} />
          </clipPath>
        </defs>
        <path d={path} fill="none" stroke="var(--foreground)" strokeWidth={0.006} />
      </svg>
      <p className="pointer-events-none absolute bottom-3 left-3 right-3 text-xs text-muted-foreground">
        {reduced ? "静止的圆形遮罩" : "拖动或方向键移动，加减号改大小"}
      </p>
    </div>
  )
}
