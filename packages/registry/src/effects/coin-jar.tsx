"use client"

// 原创实现

import { useEffect, useRef, useState, type CSSProperties, type KeyboardEvent, type PointerEvent } from "react"
import Matter from "matter-js"

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

const { Bodies, Composite, Engine } = Matter

export interface CoinJarCoin {
  id: string
  label: string
}

export interface CoinJarProps {
  coins?: readonly CoinJarCoin[]
  onDrop?: (id: string) => void
  color?: string
  size?: number
  duration?: number
  className?: string
}

const DEFAULT_COINS: readonly CoinJarCoin[] = [
  { id: "one", label: "1元" },
  { id: "five", label: "5元" },
  { id: "ten", label: "10元" },
  { id: "twenty", label: "20元" },
]

const COIN = 44

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

interface Latest {
  onDrop?: (id: string) => void
  coins: readonly CoinJarCoin[]
  duration: number
  size: number
}

function sceneHeight(size: number) {
  return Math.round(size * 1.15)
}

function mouth(index: number, size: number): Anchor {
  return { x: size / 2 + (index % 2 === 0 ? -10 : 10), y: 28 }
}

function stack(index: number, size: number): Anchor {
  return {
    x: size / 2 + (index % 2 === 0 ? -6 : 6),
    y: sceneHeight(size) - 26 - index * 14,
  }
}

function coinStyle(at: Anchor, accent: string): CSSProperties {
  return {
    backgroundColor: accent,
    color: "var(--primary-foreground)",
    height: COIN,
    left: at.x - COIN / 2,
    top: at.y - COIN / 2,
    width: COIN,
  }
}

function CoinJar({
  coins = DEFAULT_COINS,
  onDrop,
  color,
  size = 220,
  duration = 560,
  className,
}: CoinJarProps) {
  const reduced = usePrefersReducedMotion()
  const accent = color ?? "var(--primary)"
  const height = sceneHeight(size)
  const [dropped, setDropped] = useState<readonly string[]>([])
  const rootRef = useRef<HTMLDivElement>(null)
  const jarRef = useRef<HTMLDivElement>(null)
  const nodes = useRef(new Map<string, HTMLElement>())
  const droppedRef = useRef<string[]>([])
  const world = useRef<World>({ engine: null, pieces: [], raf: 0 })
  const placeRef = useRef<(id: string, index: number) => void>(() => {})
  const latest = useRef<Latest>({ onDrop, coins, duration, size })

  useEffect(() => {
    latest.current = { onDrop, coins, duration, size }
    const jar = jarRef.current
    nodes.current.clear()
    if (!jar) return
    for (const node of jar.querySelectorAll("[data-piece]")) {
      if (!(node instanceof HTMLElement)) continue
      const id = node.dataset.piece
      if (id) nodes.current.set(id, node)
    }
  }, [coins, dropped, duration, onDrop, size])

  useEffect(() => {
    if (reduced) {
      placeRef.current = () => {}
      return
    }
    const engine = Engine.create({ enableSleeping: false, gravity: { scale: 1.4 / duration, y: 1 } })
    const live = world.current
    live.engine = engine
    live.pieces = []
    const thick = 40
    Composite.add(engine.world, [
      Bodies.rectangle(size / 2, height + thick / 2 - 8, size + thick * 2, thick, { isStatic: true }),
      Bodies.rectangle(-thick / 2 + 6, height / 2, thick, height * 2, { isStatic: true }),
      Bodies.rectangle(size + thick / 2 - 6, height / 2, thick, height * 2, { isStatic: true }),
    ])
    const place = (id: string, index: number) => {
      const box = world.current
      if (!box.engine || box.pieces.some((piece) => piece.id === id)) return
      const anchor = mouth(index, latest.current.size)
      const body = Bodies.circle(anchor.x, anchor.y, COIN / 2, {
        density: 0.006,
        friction: 0.92,
        frictionAir: 36 / latest.current.duration,
        restitution: 0.02,
      })
      Composite.add(box.engine.world, body)
      box.pieces.push({ id, body, anchor })
    }
    droppedRef.current.forEach((id, index) => place(id, index))
    placeRef.current = place
    const root = rootRef.current
    if (root) root.dataset.physics = "on"
    let last = 0
    const tick = (now: number) => {
      const box = world.current
      if (!box.engine) return
      const dt = last === 0 ? 16 : Math.min(16, Math.max(1, now - last))
      last = now
      box.engine.gravity.scale = 1.4 / Math.max(160, latest.current.duration)
      const air = 36 / Math.max(160, latest.current.duration)
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
      placeRef.current = () => {}
      if (root) delete root.dataset.physics
      Composite.clear(engine.world, false)
      Engine.clear(engine)
    }
  }, [duration, height, reduced, size])

  function dropNext() {
    const next = latest.current.coins.find((coin) => !droppedRef.current.includes(coin.id))
    if (!next) return
    const index = droppedRef.current.length
    droppedRef.current = [...droppedRef.current, next.id]
    setDropped(droppedRef.current)
    latest.current.onDrop?.(next.id)
    placeRef.current(next.id, index)
  }

  function onPointerUp(event: PointerEvent<HTMLDivElement>) {
    if (event.pointerType === "mouse" && event.button !== 0) return
    dropNext()
  }

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key !== "ArrowDown" && event.key !== " " && event.key !== "Enter") return
    event.preventDefault()
    dropNext()
  }

  const waiting = coins.filter((coin) => !dropped.includes(coin.id))
  const piled = dropped.flatMap((id) => {
    const coin = coins.find((item) => item.id === id)
    return coin ? [coin] : []
  })

  return (
    <div
      aria-label="投币罐"
      className={cn(
        "relative flex w-fit flex-col items-center gap-2 outline-none focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-current motion-reduce:transition-none",
        className,
      )}
      data-reduced={reduced ? "true" : undefined}
      data-slot="coin-jar"
      data-stacked={dropped.length}
      onKeyDown={onKeyDown}
      onPointerUp={onPointerUp}
      ref={rootRef}
      role="application"
      tabIndex={0}
    >
      <ul aria-label="待投入" className="flex h-12 items-center justify-center gap-2">
        {waiting.map((coin) => (
          <li
            className="grid size-11 place-items-center rounded-full text-[11px] font-medium shadow-sm"
            key={coin.id}
            style={{ backgroundColor: accent, color: "var(--primary-foreground)" }}
          >
            {coin.label}
          </li>
        ))}
      </ul>
      <div className="relative" ref={jarRef} style={{ height, width: size }}>
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-b-[2rem] rounded-t-lg border-2 border-foreground/20 bg-card/40 shadow-inner"
          style={{ borderColor: accent }}
        />
        <div aria-hidden className="pointer-events-none absolute inset-x-3 top-1.5 h-2 rounded-full bg-foreground/15" />
        <div aria-label="罐内" className="absolute inset-0" role="list">
          {piled.length === 0 ? (
            <p className="text-muted-foreground pointer-events-none absolute inset-x-0 bottom-6 text-center text-xs">还没有硬币</p>
          ) : null}
          {piled.map((coin, index) => {
            const at = reduced ? stack(index, size) : mouth(index, size)
            return (
              <div
                className="pointer-events-none absolute grid place-items-center rounded-full text-[11px] font-medium shadow-md motion-reduce:transition-none"
                data-piece={coin.id}
                key={coin.id}
                role="listitem"
                style={coinStyle(at, accent)}
              >
                {coin.label}
              </div>
            )
          })}
        </div>
      </div>
      <p className="text-muted-foreground text-xs">点击或按向下键投入</p>
    </div>
  )
}

export { CoinJar }
