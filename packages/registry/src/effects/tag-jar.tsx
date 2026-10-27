"use client"

// 原创实现

import { useEffect, useRef, type CSSProperties, type KeyboardEvent, type PointerEvent } from "react"
import Matter from "matter-js"

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/cn"

const { Bodies, Body, Composite, Engine } = Matter

export interface TagJarTag {
  id: string
  label: string
}

export interface TagJarProps {
  tags?: readonly TagJarTag[]
  onShake?: () => void
  color?: string
  size?: number
  duration?: number
  className?: string
}

const DEFAULT_TAGS: readonly TagJarTag[] = [
  { id: "design", label: "设计" },
  { id: "motion", label: "动效" },
  { id: "type", label: "字体" },
  { id: "palette", label: "配色" },
]

const CHIP_W = 72
const CHIP_H = 32

interface Anchor {
  x: number
  y: number
}

interface Piece {
  id: string
  body: Matter.Body
  anchor: Anchor
}

interface World {
  engine: Matter.Engine | null
  pieces: Piece[]
  raf: number
}

interface Drag {
  id: number
  x: number
  y: number
  ox: number
  oy: number
  fired: boolean
}

interface Latest {
  onShake?: () => void
  duration: number
  size: number
}

function sceneHeight(size: number) {
  return Math.round(size * 1.2)
}

function spawn(index: number, size: number): Anchor {
  const col = index % 3
  return { x: size * (0.22 + col * 0.28), y: -20 - Math.floor(index / 3) * 40 }
}

function rest(index: number, size: number): Anchor {
  const cols = Math.max(1, Math.floor((size - 16) / (CHIP_W + 8)))
  const col = index % cols
  const row = Math.floor(index / cols)
  return {
    x: 14 + col * (CHIP_W + 8) + CHIP_W / 2,
    y: sceneHeight(size) - 16 - CHIP_H / 2 - row * (CHIP_H + 6),
  }
}

function chipStyle(at: Anchor, accent: string): CSSProperties {
  return {
    backgroundColor: accent,
    color: "var(--primary-foreground)",
    height: CHIP_H,
    left: at.x - CHIP_W / 2,
    top: at.y - CHIP_H / 2,
    width: CHIP_W,
  }
}

function TagJar({
  tags = DEFAULT_TAGS,
  onShake,
  color,
  size = 260,
  duration = 480,
  className,
}: TagJarProps) {
  const reduced = usePrefersReducedMotion()
  const accent = color ?? "var(--primary)"
  const height = sceneHeight(size)
  const rootRef = useRef<HTMLDivElement>(null)
  const nodes = useRef(new Map<string, HTMLElement>())
  const drag = useRef<Drag | null>(null)
  const world = useRef<World>({ engine: null, pieces: [], raf: 0 })
  const latest = useRef<Latest>({ onShake, duration, size })

  useEffect(() => {
    latest.current = { onShake, duration, size }
    const root = rootRef.current
    nodes.current.clear()
    if (!root) return
    for (const node of root.querySelectorAll("[data-piece]")) {
      if (!(node instanceof HTMLElement)) continue
      const id = node.dataset.piece
      if (id) nodes.current.set(id, node)
    }
  }, [duration, onShake, size, tags])

  useEffect(() => {
    if (reduced) return
    const engine = Engine.create({ enableSleeping: false, gravity: { scale: 0.0022, y: 1 } })
    const live = world.current
    live.engine = engine
    live.pieces = tags.map((tag, index) => {
      const anchor = spawn(index, size)
      const body = Bodies.rectangle(anchor.x, anchor.y, CHIP_W, CHIP_H, {
        chamfer: { radius: 14 },
        density: 0.002,
        friction: 0.55,
        frictionAir: 42 / duration,
        restitution: 0.12,
      })
      return { id: tag.id, body, anchor }
    })
    const thick = 48
    const walls = [
      Bodies.rectangle(size / 2, height + thick / 2 - 10, size + thick * 2, thick, { isStatic: true }),
      Bodies.rectangle(-thick / 2 + 8, height / 2, thick, height * 2, { isStatic: true }),
      Bodies.rectangle(size + thick / 2 - 8, height / 2, thick, height * 2, { isStatic: true }),
    ]
    Composite.add(engine.world, [...live.pieces.map((piece) => piece.body), ...walls])
    const root = rootRef.current
    if (root) root.dataset.physics = "on"
    let last = 0
    const tick = (now: number) => {
      const box = world.current
      if (!box.engine) return
      const dt = last === 0 ? 16 : Math.min(16, Math.max(1, now - last))
      last = now
      const air = 42 / Math.max(120, latest.current.duration)
      for (const piece of box.pieces) piece.body.frictionAir = air
      Engine.update(box.engine, dt)
      for (const piece of box.pieces) {
        const el = nodes.current.get(piece.id)
        if (!el) continue
        const dx = piece.body.position.x - piece.anchor.x
        const dy = piece.body.position.y - piece.anchor.y
        el.style.transform = `translate(${dx.toFixed(1)}px, ${dy.toFixed(1)}px) rotate(${piece.body.angle.toFixed(3)}rad)`
      }
      box.raf = requestAnimationFrame(tick)
    }
    live.raf = requestAnimationFrame(tick)
    return () => {
      cancelAnimationFrame(live.raf)
      live.raf = 0
      live.engine = null
      live.pieces = []
      if (root) delete root.dataset.physics
      Composite.clear(engine.world, false)
      Engine.clear(engine)
    }
  }, [duration, height, reduced, size, tags])

  function impulse(x: number, y: number) {
    const live = world.current
    const root = rootRef.current
    if (root) root.style.rotate = `${Math.max(-10, Math.min(10, x))}deg`
    if (live.engine) {
      for (const piece of live.pieces) {
        Body.setVelocity(piece.body, {
          x: Math.max(-8, Math.min(8, piece.body.velocity.x + x * 0.08)),
          y: Math.max(-8, Math.min(8, piece.body.velocity.y + y * 0.08)),
        })
      }
      return
    }
    const limitW = latest.current.size
    const limitH = sceneHeight(limitW)
    for (const el of nodes.current.values()) {
      const left = Number.parseFloat(el.style.left || "0") + x
      const top = Number.parseFloat(el.style.top || "0") + y
      el.style.left = `${Math.max(4, Math.min(limitW - CHIP_W - 4, left))}px`
      el.style.top = `${Math.max(4, Math.min(limitH - CHIP_H - 4, top))}px`
    }
  }

  function shake(x: number, y: number) {
    const root = rootRef.current
    if (root) root.dataset.shaken = "true"
    latest.current.onShake?.()
    impulse(x, y)
  }

  function onPointerDown(event: PointerEvent<HTMLDivElement>) {
    if (event.pointerType === "mouse" && event.button !== 0) return
    drag.current = {
      id: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      ox: event.clientX,
      oy: event.clientY,
      fired: false,
    }
    event.currentTarget.setPointerCapture?.(event.pointerId)
  }

  function onPointerMove(event: PointerEvent<HTMLDivElement>) {
    const current = drag.current
    if (!current || current.id !== event.pointerId) return
    const dx = event.clientX - current.x
    const dy = event.clientY - current.y
    current.x = event.clientX
    current.y = event.clientY
    if (Math.hypot(event.clientX - current.ox, event.clientY - current.oy) < 4) return
    if (!current.fired) {
      current.fired = true
      shake(dx, dy)
      return
    }
    impulse(dx, dy)
  }

  function onPointerUp(event: PointerEvent<HTMLDivElement>) {
    const current = drag.current
    if (!current || current.id !== event.pointerId) return
    drag.current = null
    event.currentTarget.releasePointerCapture?.(event.pointerId)
    if (current.fired) return
    const dx = event.clientX - current.ox
    const dy = event.clientY - current.oy
    if (Math.hypot(dx, dy) < 4) return
    shake(dx, dy)
  }

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const x = event.key === "ArrowLeft" ? -16 : event.key === "ArrowRight" || event.key === " " ? 16 : 0
    const y = event.key === "ArrowUp" ? -12 : event.key === "ArrowDown" ? 12 : 0
    if (x === 0 && y === 0) return
    event.preventDefault()
    shake(x, y)
  }

  return (
    <div
      aria-label="标签罐"
      className={cn(
        "relative touch-none select-none rounded-b-[2rem] outline-none focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-current motion-reduce:rotate-0 motion-reduce:transform-none",
        className,
      )}
      data-reduced={reduced ? "true" : undefined}
      data-slot="tag-jar"
      onKeyDown={onKeyDown}
      onPointerCancel={onPointerUp}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      ref={rootRef}
      role="application"
      style={{ height, width: size }}
      tabIndex={0}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-b-[2rem] rounded-t-xl border-2 border-foreground/20 bg-card/40 shadow-inner"
        style={{ borderColor: accent }}
      />
      <div aria-hidden className="pointer-events-none absolute inset-x-4 top-2 h-2 rounded-full bg-foreground/15" />
      {tags.map((tag, index) => {
        const at = reduced ? rest(index, size) : spawn(index, size)
        return (
          <div
            className="pointer-events-none absolute grid place-items-center rounded-full text-xs font-medium shadow-sm motion-reduce:transition-none"
            data-piece={tag.id}
            key={tag.id}
            style={chipStyle(at, accent)}
          >
            {tag.label}
          </div>
        )
      })}
      <p className="text-muted-foreground pointer-events-none absolute inset-x-0 top-full mt-2 text-center text-xs">
        拖动或按方向键摇晃
      </p>
    </div>
  )
}

export { TagJar }
