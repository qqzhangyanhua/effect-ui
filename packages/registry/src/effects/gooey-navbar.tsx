"use client"

// Ported from uselayouts (MIT, (c) 2025 Urvish Mali) — https://github.com/iurvish/uselayouts/blob/main/registry/default/example/gooey-navbar.tsx

import { useCallback, useEffect, useMemo, useRef, useState } from "react"

import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export interface GooeyNavItem {
  label: string
  link: string
  width?: number
}

function round(value: number) {
  if (!Number.isFinite(value)) return "0"
  return (Math.round(value * 100) / 100).toString()
}

function pillPath(rect: { x: number; y: number; width: number; height: number }, radius: number) {
  const radiusClamped = Math.min(radius, rect.width / 2, rect.height / 2)
  const { x, y, width, height } = rect
  return [
    `M${round(x)} ${round(y + radiusClamped)}`,
    `A${round(radiusClamped)} ${round(radiusClamped)} 0 0 1 ${round(x + radiusClamped)} ${round(y)}`,
    `L${round(x + width - radiusClamped)} ${round(y)}`,
    `A${round(radiusClamped)} ${round(radiusClamped)} 0 0 1 ${round(x + width)} ${round(y + radiusClamped)}`,
    `L${round(x + width)} ${round(y + height - radiusClamped)}`,
    `A${round(radiusClamped)} ${round(radiusClamped)} 0 0 1 ${round(x + width - radiusClamped)} ${round(y + height)}`,
    `L${round(x + radiusClamped)} ${round(y + height)}`,
    `A${round(radiusClamped)} ${round(radiusClamped)} 0 0 1 ${round(x)} ${round(y + height - radiusClamped)}`,
    "Z",
  ].join(" ")
}

function bridgePath(
  from: { x: number; y: number; width: number; height: number },
  to: { x: number; y: number; width: number; height: number },
  cornerRadius: number,
  neckHeight: number,
  pushFactor: number,
) {
  if (pushFactor <= 0.02) return null
  const height = from.height
  const midY = from.y + height / 2
  const radius = Math.min(cornerRadius, height / 2, from.width / 2, to.width / 2)
  if (radius <= 0) return null
  const right = from.x + from.width
  const left = to.x
  const gap = left - right
  if (gap < 0) return null
  const neck = Math.min((neckHeight / 2) * pushFactor, height / 2 - 0.5)
  const half = gap / 2 + radius
  const rise = neck - height / 2 + radius
  const delta = 2 * (rise - radius)
  if (Math.abs(delta) < 1e-4) return null
  const arc = (radius * radius - half * half - rise * rise) / delta
  if (!(arc > 0) || radius + arc < half) return null
  const drop = Math.sqrt(Math.max(0, (radius + arc) * (radius + arc) - half * half))
  const mid = (right + left) / 2
  const originX = right - radius
  const originY = from.y + radius
  const dx = mid - originX
  const dy = from.y + radius - drop - originY
  const hyp = Math.hypot(dx, dy) || 1
  const x1 = originX + (radius * dx) / hyp
  const y1 = originY + (radius * dy) / hyp
  const x2 = 2 * mid - x1
  return [
    `M${round(x1)} ${round(y1)}`,
    `A${round(arc)} ${round(arc)} 0 0 0 ${round(x2)} ${round(y1)}`,
    `L${round(x2)} ${round(2 * midY - y1)}`,
    `A${round(arc)} ${round(arc)} 0 0 0 ${round(x1)} ${round(2 * midY - y1)}`,
    "Z",
  ].join(" ")
}

function measureLabelWidth(label: string, fontSize: number) {
  let width = 0
  for (const char of label) width += char.charCodeAt(0) > 255 ? fontSize : fontSize * 0.62
  return width
}

function layoutRects(items: GooeyNavItem[], fontSize: number, paddingX: number, paddingY: number, gap: number) {
  const rects: { x: number; y: number; width: number; height: number }[] = []
  let x = 0
  for (const item of items) {
    const width = item.width || Math.ceil(measureLabelWidth(item.label, fontSize) + paddingX * 2)
    const height = fontSize + paddingY * 2
    rects.push({ x, y: 0, width, height })
    x += width + gap
  }
  return rects
}

export const DEFAULT_NAV_ITEMS: GooeyNavItem[] = [
  { label: "Home", link: "#home" },
  { label: "Work", link: "#work" },
  { label: "About", link: "#about" },
  { label: "Lab", link: "#lab" },
  { label: "Contact", link: "#contact" },
]

export interface GooeyNavbarProps {
  items?: GooeyNavItem[]
  defaultActiveIndex?: number
  activeIndex?: number
  onSelect?: (index: number, item: GooeyNavItem) => void
  color?: string
  textColor?: string
  hoverTextColor?: string
  fontSize?: number
  paddingX?: number
  paddingY?: number
  cornerRadius?: number
  gap?: number
  intensity?: number
  duration?: number
  anchorEdge?: "left" | "center" | "right"
  neckRatio?: number
  className?: string
}

export function GooeyNavbar({
  items = DEFAULT_NAV_ITEMS,
  defaultActiveIndex = 0,
  activeIndex: controlledActiveIndex,
  onSelect,
  color = "var(--foreground)",
  textColor = "var(--background)",
  hoverTextColor = "var(--background)",
  fontSize = 15,
  paddingX = 24,
  paddingY = 16,
  cornerRadius = 12,
  gap = 0,
  intensity = 32,
  duration = 420,
  anchorEdge = "center",
  neckRatio = 0.35,
  className,
}: GooeyNavbarProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const live = useAnimationActive(rootRef)
  const reduced = usePrefersReducedMotion()
  const [internalActive, setInternalActive] = useState(defaultActiveIndex)
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const activeIndex = controlledActiveIndex ?? internalActive
  const stiffness = Math.max(80, Math.round(110000 / Math.max(duration, 80)))
  const damping = 30
  const mass = 1

  const baseRects = useMemo(
    () => layoutRects(items, fontSize, paddingX, paddingY, gap),
    [fontSize, gap, items, paddingX, paddingY],
  )

  const pillHeight = baseRects[0]?.height ?? fontSize + paddingY * 2
  const radius = Math.min(Math.max(cornerRadius, 0), pillHeight / 2)
  const targetPushFactors = useMemo(() => {
    const marked = (index: number) => index === hoveredIndex || index === activeIndex
    return baseRects.slice(0, -1).map((_, index) => (marked(index) || marked(index + 1) ? 1 : 0))
  }, [activeIndex, baseRects, hoveredIndex])

  const [animatedPushFactors, setAnimatedPushFactors] = useState<number[]>(() =>
    items.slice(0, -1).map((_, index) => (index === defaultActiveIndex || index + 1 === defaultActiveIndex ? 1 : 0)),
  )
  const currentPush = useRef<number[]>(animatedPushFactors.slice())
  const currentVel = useRef<number[]>(animatedPushFactors.map(() => 0))

  if (reduced) {
    const same = animatedPushFactors.length === targetPushFactors.length && animatedPushFactors.every((value, index) => value === targetPushFactors[index])
    if (!same) setAnimatedPushFactors(targetPushFactors)
  }

  useEffect(() => {
    if (!reduced) return
    currentPush.current = targetPushFactors.slice()
    currentVel.current = targetPushFactors.map(() => 0)
  }, [reduced, targetPushFactors])

  useEffect(() => {
    if (!live || reduced) return
    let frame = 0
    let last = performance.now()
    const tick = (now: number) => {
      const dt = Math.min((now - last) / 1000, 1 / 30)
      last = now
      const pushVals = currentPush.current
      const velVals = currentVel.current
      let moving = false
      for (let index = 0; index < targetPushFactors.length; index += 1) {
        const target = targetPushFactors[index] ?? 0
        const pos = pushVals[index] ?? target
        const vel = velVals[index] ?? 0
        const force = -stiffness * (pos - target) - damping * vel
        const nextVel = vel + (force / mass) * dt
        const nextPos = pos + nextVel * dt
        if (Math.abs(nextPos - target) > 0.001 || Math.abs(nextVel) > 0.01) {
          pushVals[index] = nextPos
          velVals[index] = nextVel
          moving = true
        } else {
          pushVals[index] = target
          velVals[index] = 0
        }
      }
      pushVals.length = targetPushFactors.length
      velVals.length = targetPushFactors.length
      setAnimatedPushFactors([...pushVals])
      if (moving) frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [damping, live, mass, reduced, stiffness, targetPushFactors])

  const factors = reduced || !live ? targetPushFactors : animatedPushFactors
  const positions = useMemo(() => {
    const next: number[] = []
    const first = baseRects[0]
    if (!first) return next
    next[0] = first.x
    for (let index = 1; index < baseRects.length; index += 1) {
      const previous = baseRects[index - 1]
      if (!previous) continue
      next[index] = (next[index - 1] ?? 0) + previous.width + gap + intensity * (factors[index - 1] ?? 0)
    }
    return next
  }, [baseRects, factors, gap, intensity])

  const translations = useMemo(() => {
    const last = baseRects.length - 1
    const first = baseRects[0]
    const end = baseRects[last]
    if (!first || !end || last < 0) return []
    const totalExpansion = (positions[last] ?? 0) + end.width - (positions[0] ?? 0) - (end.x + end.width - first.x)
    const offset = anchorEdge === "right" ? -totalExpansion : anchorEdge === "center" ? -totalExpansion / 2 : 0
    return baseRects.map((rect, index) => (positions[index] ?? rect.x) + offset - rect.x)
  }, [anchorEdge, baseRects, positions])

  const currentRects = baseRects.map((rect, index) => ({ ...rect, x: rect.x + (translations[index] ?? 0) }))
  const path = useMemo(() => {
    const parts = currentRects.map((rect) => pillPath(rect, radius))
    for (let index = 0; index < currentRects.length - 1; index += 1) {
      const from = currentRects[index]
      const to = currentRects[index + 1]
      if (!from || !to) continue
      const bridge = bridgePath(from, to, radius, pillHeight * neckRatio, factors[index] ?? 0)
      if (bridge) parts.push(bridge)
    }
    return parts.join(" ")
  }, [currentRects, factors, neckRatio, pillHeight, radius])

  const select = useCallback(
    (index: number) => {
      const item = items[index]
      if (!item) return
      setInternalActive(index)
      onSelect?.(index, item)
    },
    [items, onSelect],
  )

  const width = currentRects.reduce((max, rect) => Math.max(max, rect.x + rect.width), 0)

  return (
    <div
      ref={rootRef}
      data-motion={live ? "on" : "off"}
      data-reduced={reduced ? "true" : "false"}
      className={cn("relative mx-auto block w-max select-none motion-reduce:transition-none", className)}
      onMouseMove={(event) => {
        if (window.matchMedia("(hover: none)").matches) return
        const bounds = rootRef.current?.getBoundingClientRect()
        if (!bounds) return
        const x = event.clientX - bounds.left
        let closest = 0
        let best = Infinity
        currentRects.forEach((rect, index) => {
          const distance = x < rect.x ? rect.x - x : x > rect.x + rect.width ? x - (rect.x + rect.width) : 0
          if (distance < best) {
            best = distance
            closest = index
          }
        })
        setHoveredIndex(closest)
      }}
      onMouseLeave={() => setHoveredIndex(null)}
    >
      <svg width={width || "100%"} height={pillHeight} aria-hidden="true" className="pointer-events-none absolute top-0 left-0 overflow-visible">
        <path d={path} fill={color} />
      </svg>
      <nav aria-label="Main" className="relative z-10 flex items-center" style={{ gap }}>
        {items.map((item, index) => {
          const active = activeIndex === index
          const hovered = hoveredIndex === index
          return (
            <a
              key={item.link || item.label}
              href={item.link}
              aria-current={active ? "page" : undefined}
              onClick={(event) => {
                event.preventDefault()
                select(index)
              }}
              onFocus={() => setHoveredIndex(index)}
              onBlur={() => setHoveredIndex((current) => (current === index ? null : current))}
              onKeyDown={(event) => {
                if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return
                event.preventDefault()
                const next = event.key === "ArrowRight" ? (index + 1) % items.length : (index - 1 + items.length) % items.length
                select(next)
                const links = event.currentTarget.parentElement?.querySelectorAll("a")
                links?.[next]?.focus()
              }}
              className="relative flex shrink-0 items-center justify-center font-semibold tracking-tight uppercase no-underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ring)]"
              style={{
                width: `${baseRects[index]?.width ?? 0}px`,
                height: `${pillHeight}px`,
                fontSize: `${fontSize}px`,
                color: hovered || active ? hoverTextColor : textColor,
                transform: `translateX(${translations[index] ?? 0}px)`,
                transition: reduced ? "none" : `color ${Math.min(duration, 180)}ms linear`,
              }}
            >
              <span>{item.label}</span>
              {active ? (
                <span
                  aria-hidden="true"
                  className="absolute bottom-[5px] left-1/2 size-1 -translate-x-1/2 rounded-full bg-current"
                />
              ) : null}
            </a>
          )
        })}
      </nav>
    </div>
  )
}

export default GooeyNavbar
