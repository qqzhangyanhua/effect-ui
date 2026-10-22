"use client"

// Ported from uselayouts (MIT, (c) 2025 Urvish Mali) — https://github.com/iurvish/uselayouts/blob/main/registry/default/example/overlapping-slider.tsx

import { useLayoutEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"

import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export function sliderStep(cardWidth: number, overlapFactor: number, cardGap: number) {
  return Math.round(cardWidth - cardWidth * overlapFactor + cardGap)
}

export function snapSliderIndex(offsetX: number, step: number, velocity: number, total: number) {
  if (total <= 1 || step === 0) return 0
  let index = -offsetX / step
  if (velocity < -350) index = Math.ceil(index)
  else if (velocity > 350) index = Math.floor(index)
  else index = Math.round(index)
  return Math.max(0, Math.min(index, total - 1))
}

export interface CardProfile {
  id: string
  name: string
  handle: string
  role: string
  image: string
  hue: number
}

function portrait(name: string, hue: number) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="860"><rect width="640" height="860" fill="hsl(${hue} 42% 46%)"/><circle cx="320" cy="300" r="90" fill="white" fill-opacity="0.85"/><text x="40" y="760" fill="white" font-size="42" font-family="sans-serif">${name}</text></svg>`
  return `data:image/svg+xml,${encodeURIComponent(svg)}`
}

export const DEFAULT_PROFILES: CardProfile[] = [
  { id: "1", name: "Sophie Bennett", handle: "@sophie34", role: "Product Designer", hue: 18, image: portrait("Sophie", 18) },
  { id: "2", name: "Luna Hart", handle: "@lunahart", role: "UI/UX Designer", hue: 78, image: portrait("Luna", 78) },
  { id: "3", name: "Maya Rivera", handle: "@mayacodes", role: "Frontend Developer", hue: 204, image: portrait("Maya", 204) },
  { id: "4", name: "Zoe Bennett", handle: "@zoe", role: "Product Designer", hue: 268, image: portrait("Zoe", 268) },
  { id: "5", name: "Isla Morgan", handle: "@islaui", role: "UI/UX Designer", hue: 42, image: portrait("Isla", 42) },
  { id: "6", name: "Sofia Laurent", handle: "@itssofia", role: "Product Designer", hue: 348, image: portrait("Sofia", 348) },
]

export interface OverlappingSliderProps {
  items?: CardProfile[]
  color?: string
  duration?: number
  size?: number
  intensity?: number
  cardGap?: number
  className?: string
  onActiveChange?: (index: number) => void
}

function rememberPointer(drag: { down: boolean; startX: number; origin: number; lastX: number; lastT: number; velocity: number; moved: number }, clientX: number, origin: number) {
  drag.down = true
  drag.startX = clientX
  drag.origin = origin
  drag.lastX = clientX
  drag.lastT = performance.now()
  drag.velocity = 0
  drag.moved = 0
}

function trackPointer(drag: { down: boolean; startX: number; origin: number; lastX: number; lastT: number; velocity: number; moved: number }, clientX: number) {
  const now = performance.now()
  const dt = Math.max(1, now - drag.lastT)
  drag.velocity = ((clientX - drag.lastX) / dt) * 1000
  drag.lastX = clientX
  drag.lastT = now
  drag.moved = Math.max(drag.moved, Math.abs(clientX - drag.startX))
  return drag.origin + (clientX - drag.startX)
}

function capturePointer(node: HTMLElement, pointerId: number) {
  if (typeof node.setPointerCapture !== "function") return
  try {
    node.setPointerCapture(pointerId)
  } catch {
    // jsdom throws when the pointer id is unknown.
  }
}

function releasePointer(node: HTMLElement, pointerId: number) {
  if (typeof node.releasePointerCapture !== "function") return
  try {
    node.releasePointerCapture(pointerId)
  } catch {
    // Ignore a pointer that was already released.
  }
}

export function OverlappingSlider({
  items = DEFAULT_PROFILES,
  color = "var(--foreground)",
  duration = 380,
  size = 240,
  intensity = 0.04,
  cardGap = 18,
  className,
  onActiveChange,
}: OverlappingSliderProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const live = useAnimationActive(rootRef)
  const reduced = usePrefersReducedMotion()
  const total = items.length
  const height = Math.round(size * 1.35)
  const step = sliderStep(size, intensity, cardGap)
  const [activeIndex, setActiveIndex] = useState(0)
  const [following, setFollowing] = useState<Record<string, boolean>>({})
  const offsetRef = useRef(0)
  const dragRef = useRef({ down: false, startX: 0, origin: 0, lastX: 0, lastT: 0, velocity: 0, moved: 0 })
  const motionMs = reduced || !live ? 0 : duration

  const apply = (x: number, animate: boolean) => {
    offsetRef.current = x
    const track = trackRef.current
    if (!track) return
    const transition = animate && motionMs > 0 ? `transform ${motionMs}ms cubic-bezier(0.22, 1, 0.36, 1)` : "none"
    track.style.transition = transition
    track.style.transform = `translate3d(${x}px, 0, 0)`
    const activeExact = step === 0 ? 0 : -x / step
    for (let index = 0; index < track.children.length; index += 1) {
      const card = track.children[index]
      if (!(card instanceof HTMLElement)) continue
      const leave = Math.min(1, Math.max(0, index - activeExact < 0 ? -(index - activeExact) : 0))
      card.style.transition = transition
      card.style.zIndex = String(index)
      card.style.transform = `translateY(${leave * 36}px) scale(${1 - leave * 0.16})`
    }
  }

  const goTo = (index: number) => {
    const next = Math.max(0, Math.min(index, total - 1))
    setActiveIndex(next)
    apply(-next * step, true)
    onActiveChange?.(next)
  }

  useLayoutEffect(() => {
    apply(-activeIndex * step, false)
    // The track writes its own transform while dragging.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [size, intensity, cardGap, total, motionMs])

  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return
    rememberPointer(dragRef.current, event.clientX, offsetRef.current)
    capturePointer(event.currentTarget, event.pointerId)
  }

  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current
    if (!drag.down) return
    const x = trackPointer(drag, event.clientX)
    apply(x, false)
    const predicted = step === 0 ? 0 : Math.max(0, Math.min(Math.round(-x / step), total - 1))
    if (predicted !== activeIndex) {
      setActiveIndex(predicted)
      onActiveChange?.(predicted)
    }
  }

  const onPointerUp = (event: ReactPointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current
    if (!drag.down) return
    drag.down = false
    releasePointer(event.currentTarget, event.pointerId)
    goTo(snapSliderIndex(offsetRef.current, step, drag.velocity, total))
  }

  return (
    <div
      ref={rootRef}
      data-active={activeIndex}
      data-motion={live ? "on" : "off"}
      data-reduced={reduced ? "true" : "false"}
      className={cn("relative flex w-full flex-col", className)}
    >
      <div
        className="flex w-full cursor-grab touch-pan-y items-center overflow-hidden py-6 active:cursor-grabbing"
        style={{ minHeight: height + 48 }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        <div ref={trackRef} className="flex items-end pl-6 motion-reduce:transition-none">
          {items.map((card, index) => (
            <div
              key={card.id}
              className="relative shrink-0 overflow-hidden rounded-[32px] bg-[var(--muted)]"
              style={{
                width: size,
                height,
                marginRight: cardGap - size * intensity,
                zIndex: index,
              }}
              onClick={() => {
                if (dragRef.current.moved < 8) goTo(index)
              }}
            >
              <img src={card.image} alt="" draggable={false} className="pointer-events-none absolute inset-0 size-full object-cover" />
              <div
                className="pointer-events-none absolute inset-x-0 bottom-0 h-40"
                style={{ background: `linear-gradient(rgba(255,255,255,0), hsl(${card.hue} 48% 42%))` }}
              />
              <div className="relative flex h-full flex-col justify-between p-4 text-white">
                <h3 className="text-center text-lg font-bold">{card.name}</h3>
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0 text-left">
                    <div className="truncate text-sm font-medium">{card.handle}</div>
                    <div className="truncate text-xs text-white/90">{card.role}</div>
                  </div>
                  <button
                    type="button"
                    aria-pressed={Boolean(following[card.id])}
                    onClick={(event) => {
                      event.stopPropagation()
                      setFollowing((current) => ({ ...current, [card.id]: !current[card.id] }))
                    }}
                    className="rounded-2xl bg-white px-3 py-2 text-xs font-medium text-black"
                  >
                    {following[card.id] ? "Following" : "Follow"}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-1 flex items-center gap-2 px-6">
        <button
          type="button"
          aria-label="Previous"
          disabled={activeIndex === 0}
          onClick={() => goTo(activeIndex - 1)}
          className="flex size-9 items-center justify-center rounded-full text-[var(--background)] disabled:cursor-not-allowed disabled:opacity-40"
          style={{ backgroundColor: color }}
        >
          <ChevronLeft className="size-4" />
        </button>
        <button
          type="button"
          aria-label="Next"
          disabled={activeIndex === total - 1}
          onClick={() => goTo(activeIndex + 1)}
          className="flex size-9 items-center justify-center rounded-full text-[var(--background)] disabled:cursor-not-allowed disabled:opacity-40"
          style={{ backgroundColor: color }}
        >
          <ChevronRight className="size-4" />
        </button>
      </div>
    </div>
  )
}

export default OverlappingSlider
