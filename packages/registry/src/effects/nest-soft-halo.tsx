"use client"

import { useEffect, useRef, useState, type FocusEvent, type PointerEvent } from "react"
import { motion } from "motion/react"

import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/cn"

/**
 * Inspired by Canny, Headspace, Obsidian, Vanta, and Productboard (via Mobbin), original implementation.
 * https://mobbin.com/screens/77ba2100-7588-4fb6-8dc1-6c3020ae3bbc
 * https://mobbin.com/screens/9648939e-25d6-4e09-b792-44ea435b0110
 * https://mobbin.com/screens/f3edba70-5206-4127-81f0-83b9e4bf26e7
 * https://mobbin.com/screens/296da360-5ac5-4f1e-8812-583ab11a9520
 * https://mobbin.com/screens/00b77d69-1bb8-4f93-ac74-cb778460a385
 */

export interface NestSoftHaloProps {
  pace?: number
  intensity?: number
  fit?: HaloFit
  trigger?: NestTrigger
  className?: string
  onValueChange?: (state: { nest: string; moving: boolean }) => void
}

export type HaloFit = "pad" | "tight"
export type NestTrigger = "hover" | "focus" | "both"

export interface HaloBox {
  x: number
  y: number
  w: number
  h: number
}

const ITEMS = [
  { id: "quiet", label: "Quiet hours", hint: "Pause notices after dusk." },
  { id: "digest", label: "Daily digest", hint: "One summary in the morning." },
  { id: "pins", label: "Pinned notes", hint: "Keep three notes on the list." },
] as const

type ItemId = (typeof ITEMS)[number]["id"]
type NestSource = "pointer" | "keyboard"

const ring =
  "outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"

const emptyBox: HaloBox = { x: 0, y: 0, w: 0, h: 0 }

function clamp(value: number, min: number, max: number) {
  if (!Number.isFinite(value)) return min
  return Math.min(max, Math.max(min, value))
}

function rateOf(pace: number) {
  return Number.isFinite(pace) && pace > 0 ? pace : 1
}

export function acceptsPointer(trigger: NestTrigger) {
  return trigger !== "focus"
}

export function acceptsFocus(trigger: NestTrigger) {
  return trigger !== "hover"
}

export function haloPad(fit: HaloFit) {
  return fit === "tight" ? 2 : 10
}

export function haloAlpha(intensity: number) {
  return Math.round((0.08 + clamp(intensity, 0, 1) * 0.2) * 1000) / 1000
}

export function haloStep(pace: number) {
  return Math.round(clamp(0.24 * rateOf(pace), 0.08, 0.6) * 1000) / 1000
}

export function approach(from: number, to: number, step: number) {
  if (Math.abs(to - from) <= 0.6) return to
  return Math.round((from + (to - from) * clamp(step, 0.05, 0.85)) * 10) / 10
}

export function approachBox(from: HaloBox, to: HaloBox, step: number): HaloBox {
  return {
    x: approach(from.x, to.x, step),
    y: approach(from.y, to.y, step),
    w: approach(from.w, to.w, step),
    h: approach(from.h, to.h, step),
  }
}

export function boxSettled(from: HaloBox, to: HaloBox) {
  return from.x === to.x && from.y === to.y && from.w === to.w && from.h === to.h
}

function readBox(node: HTMLElement, stage: HTMLElement): HaloBox {
  const stageRect = stage.getBoundingClientRect()
  const rect = node.getBoundingClientRect()
  if (rect.width > 0 && rect.height > 0) {
    return { x: rect.left - stageRect.left, y: rect.top - stageRect.top, w: rect.width, h: rect.height }
  }
  return {
    x: Number(node.dataset.nx ?? 0),
    y: Number(node.dataset.ny ?? 0),
    w: Number(node.dataset.nw ?? 160),
    h: Number(node.dataset.nh ?? 52),
  }
}

export function NestSoftHalo({
  pace = 1,
  intensity = 0.22,
  fit = "pad",
  trigger = "both",
  className,
  onValueChange,
}: NestSoftHaloProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const shownRef = useRef<HaloBox>(emptyBox)
  const goalRef = useRef<HaloBox>(emptyBox)
  const frameRef = useRef(0)
  const sourceRef = useRef<NestSource | null>(null)
  const liveRef = useRef(false)
  const reducedRef = useRef(false)
  const paceRef = useRef(1)
  const triggerRef = useRef<NestTrigger>("both")
  const reduced = usePrefersReducedMotion()
  const live = useAnimationActive(rootRef)
  const gain = clamp(intensity, 0, 1)
  const pad = haloPad(fit)
  const [nest, setNest] = useState<ItemId | "none">("none")
  const [goal, setGoal] = useState<HaloBox>(emptyBox)
  const [shown, setShown] = useState<HaloBox>(emptyBox)
  const [moving, setMoving] = useState(false)
  const [picks, setPicks] = useState(0)
  if ((!live || reduced) && nest !== "none" && (moving || !boxSettled(shown, goal))) {
    if (moving) setMoving(false)
    if (!boxSettled(shown, goal)) setShown(goal)
  }

  function stop() {
    if (frameRef.current === 0) return
    window.cancelAnimationFrame(frameRef.current)
    frameRef.current = 0
  }

  function publish(box: HaloBox, active: boolean) {
    shownRef.current = box
    setShown(box)
    setMoving(active)
  }

  function kick() {
    if (frameRef.current !== 0) return
    const tick = () => {
      if (!liveRef.current || reducedRef.current) {
        publish(goalRef.current, false)
        frameRef.current = 0
        return
      }
      const next = approachBox(shownRef.current, goalRef.current, haloStep(paceRef.current))
      const done = boxSettled(next, goalRef.current)
      publish(next, !done)
      if (done) {
        frameRef.current = 0
        return
      }
      frameRef.current = window.requestAnimationFrame(tick)
    }
    frameRef.current = window.requestAnimationFrame(tick)
  }

  function clearNest() {
    stop()
    sourceRef.current = null
    setNest("none")
    setMoving(false)
  }

  function aim(id: ItemId, node: HTMLElement, source: NestSource) {
    const stage = stageRef.current
    if (!stage) return
    const nextGoal = readBox(node, stage)
    goalRef.current = nextGoal
    setGoal(nextGoal)
    sourceRef.current = source
    setNest(id)
    if (reducedRef.current || !liveRef.current) {
      stop()
      publish(nextGoal, false)
      return
    }
    setMoving(true)
    kick()
  }

  function onPointerEnter(id: ItemId, event: PointerEvent<HTMLButtonElement>) {
    if (!acceptsPointer(triggerRef.current)) return
    aim(id, event.currentTarget, "pointer")
  }

  function onPointerLeave(event: PointerEvent<HTMLDivElement>) {
    if (sourceRef.current !== "pointer") return
    const next = event.relatedTarget
    if (next instanceof Node && event.currentTarget.contains(next)) return
    clearNest()
  }

  function onFocus(id: ItemId, event: FocusEvent<HTMLButtonElement>) {
    if (!acceptsFocus(triggerRef.current)) return
    aim(id, event.currentTarget, "keyboard")
  }

  function onBlur(event: FocusEvent<HTMLDivElement>) {
    if (sourceRef.current !== "keyboard") return
    const next = event.relatedTarget
    if (next instanceof Node && event.currentTarget.contains(next)) return
    clearNest()
  }

  useEffect(() => {
    liveRef.current = live
    reducedRef.current = reduced
    paceRef.current = rateOf(pace)
    triggerRef.current = trigger
    if (live && !reduced) return
    if (frameRef.current !== 0) {
      window.cancelAnimationFrame(frameRef.current)
      frameRef.current = 0
    }
  }, [live, reduced, pace, trigger])

  useEffect(() => {
    onValueChange?.({ nest, moving })
  }, [nest, moving, onValueChange])

  useEffect(() => () => stop(), [])

  const eased = reduced || !live ? "cut" : "glide"

  return (
    <div
      ref={rootRef}
      data-slot="nest-soft-halo"
      data-ritual="nest-halo"
      data-motion={reduced ? "off" : "on"}
      data-live={live ? "on" : "off"}
      data-fit={fit}
      data-trigger={trigger}
      data-nest={nest}
      data-eased={eased}
      data-moving={moving ? "on" : "off"}
      data-picks={picks}
      data-x={shown.x}
      data-y={shown.y}
      data-pad={pad}
      className={cn(
        "w-full rounded-3xl border border-border bg-card p-4 text-card-foreground motion-reduce:transition-none",
        className,
      )}
    >
      <div
        ref={stageRef}
        className="relative"
        onPointerLeave={onPointerLeave}
        onBlur={onBlur}
      >
        {nest !== "none" ? (
          <motion.div
            data-halo=""
            aria-hidden="true"
            style={{
              left: shown.x - pad,
              top: shown.y - pad,
              width: shown.w + pad * 2,
              height: shown.h + pad * 2,
              opacity: haloAlpha(gain),
              pointerEvents: "none",
              background:
                "radial-gradient(closest-side, color-mix(in oklab, var(--primary) 55%, transparent), transparent 72%)",
            }}
            className="pointer-events-none absolute z-0 rounded-2xl motion-reduce:transition-none"
          />
        ) : null}
        <div className="relative z-10 flex flex-col gap-2">
          {ITEMS.map((item, index) => (
            <button
              key={item.id}
              type="button"
              data-nx={index * 72}
              data-ny={index * 36}
              data-nw={220}
              data-nh={52}
              onPointerEnter={(event) => onPointerEnter(item.id, event)}
              onFocus={(event) => onFocus(item.id, event)}
              onClick={() => setPicks((count) => count + 1)}
              className={cn("rounded-2xl border border-border bg-background px-4 py-3 text-left", ring)}
            >
              <span className="block text-sm font-medium text-foreground">{item.label}</span>
              <span className="mt-1 block text-xs text-muted-foreground">{item.hint}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
