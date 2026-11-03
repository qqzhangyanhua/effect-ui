"use client"

import { useEffect, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from "react"
import { motion } from "motion/react"

import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/cn"

/**
 * Inspired by Featurebase, Asana, Trello, and Linear (via Mobbin), original implementation.
 * https://mobbin.com/screens/19c5dddb-0f80-4955-8ad0-a3acee80a2c5
 * https://mobbin.com/screens/0a9f2bf5-409a-4af8-9493-531dd6868124
 * https://mobbin.com/screens/7b057470-11db-4250-a5a3-930994c123d6
 * https://mobbin.com/screens/f04937c0-0b75-44e4-94f9-18ee654ce6da
 * https://mobbin.com/screens/fc208a44-dbf9-4f79-b9b0-db57f9840964
 */

export interface LaneInsertBeamProps {
  pace?: number
  intensity?: number
  style?: BeamStyle
  label?: LabelMode
  className?: string
  onValueChange?: (state: { phase: BeamPhase; lane: LaneName | "none" }) => void
}

export type BeamStyle = "line" | "column"
export type LabelMode = "on" | "off"
export type LaneName = "open" | "hold"
export type BeamPhase = "rest" | "aiming" | "moved"

interface Card {
  id: string
  label: string
}

interface Board {
  open: string[]
  hold: string[]
}

interface Aim {
  cardId: string
  lane: LaneName
  seam: number
  progress: number
  still: boolean
}

const CARDS: readonly Card[] = [
  { id: "a", label: "Item A" },
  { id: "b", label: "Item B" },
  { id: "c", label: "Item C" },
]

const focusRing =
  "outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"

function clamp(value: number, min: number, max: number) {
  if (!Number.isFinite(value)) return min
  return Math.min(max, Math.max(min, value))
}

function paceRate(pace: number) {
  return Number.isFinite(pace) && pace > 0 ? pace : 1
}

function easeOut(progress: number) {
  const t = clamp(progress, 0, 1)
  return 1 - (1 - t) * (1 - t)
}

function seedBoard(): Board {
  return { open: ["a", "b"], hold: ["c"] }
}

export function moveCard(board: Board, id: string, lane: LaneName, seam: number): Board {
  const open = board.open.filter((item) => item !== id)
  const hold = board.hold.filter((item) => item !== id)
  const target = lane === "open" ? open : hold
  target.splice(clamp(seam, 0, target.length), 0, id)
  return { open, hold }
}

export function beamStep(pace: number) {
  const frames = clamp(12 / paceRate(pace), 6, 18)
  return Math.round((1 / frames) * 1000) / 1000
}

export function beamOpacity(progress: number, intensity: number, still: boolean) {
  const cap = 0.4 + clamp(intensity, 0, 1) * 0.5
  const amount = still ? cap : cap * easeOut(progress)
  return Math.round(amount * 1000) / 1000
}

export function LaneInsertBeam({
  pace = 1,
  intensity = 0.4,
  style = "line",
  label = "on",
  className,
  onValueChange,
}: LaneInsertBeamProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const raf = useRef(0)
  const gen = useRef(0)
  const aimRef = useRef<Aim | null>(null)
  const dragRef = useRef<string | null>(null)
  const cardsRef = useRef(new Map<string, HTMLButtonElement>())
  const onValueRef = useRef(onValueChange)
  const reduced = usePrefersReducedMotion()
  const live = useAnimationActive(rootRef)
  const [board, setBoard] = useState<Board>(seedBoard)
  const [aim, setAim] = useState<Aim | null>(null)
  const [focusId, setFocusId] = useState("a")
  const [phase, setPhase] = useState<BeamPhase>("rest")

  if (!live && aim) setAim(null)
  else if (aim && !aim.still && reduced) setAim({ ...aim, progress: 1, still: true })

  useEffect(() => {
    onValueRef.current = onValueChange
  }, [onValueChange])

  useEffect(() => {
    onValueRef.current?.({ phase, lane: aim?.lane ?? "none" })
  }, [phase, aim])

  useEffect(() => {
    return () => {
      gen.current += 1
      cancelAnimationFrame(raf.current)
    }
  }, [])

  useEffect(() => {
    if (live && !reduced) return
    gen.current += 1
    cancelAnimationFrame(raf.current)
  }, [live, reduced])

  useEffect(() => {
    aimRef.current = aim
  }, [aim])

  function stop() {
    gen.current += 1
    cancelAnimationFrame(raf.current)
  }

  function laneOf(id: string): LaneName {
    return board.hold.includes(id) ? "hold" : "open"
  }

  function aimAt(cardId: string, lane: LaneName, seam: number) {
    const length = lane === "open" ? board.open.filter((item) => item !== cardId).length : board.hold.filter((item) => item !== cardId).length
    const nextSeam = clamp(seam, 0, length)
    stop()
    const next: Aim = { cardId, lane, seam: nextSeam, progress: reduced || !live ? 1 : 0, still: reduced || !live }
    aimRef.current = next
    setAim(next)
    setFocusId(cardId)
    setPhase("aiming")
    if (next.still) return
    const token = gen.current
    const step = beamStep(pace)
    let progress = 0
    const tick = () => {
      if (token !== gen.current) return
      progress = Math.min(1, Math.round((progress + step) * 1000) / 1000)
      setAim((current) => {
        if (!current || current.cardId !== cardId) return current
        const still = progress >= 1
        return { ...current, progress: still ? 1 : progress, still }
      })
      if (progress >= 1) return
      raf.current = requestAnimationFrame(tick)
    }
    raf.current = requestAnimationFrame(tick)
  }

  function clearAim(restoreFocus: boolean) {
    const id = aimRef.current?.cardId ?? focusId
    stop()
    dragRef.current = null
    aimRef.current = null
    setAim(null)
    setPhase("rest")
    if (restoreFocus) cardsRef.current.get(id)?.focus()
  }

  useEffect(() => {
    if (!aim && !dragRef.current) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return
      event.preventDefault()
      clearAim(true)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  })

  function commit(cardId?: string, lane?: LaneName, seam?: number) {
    const current = aimRef.current
    const id = cardId ?? current?.cardId ?? focusId
    if (!id) return
    const targetLane = lane ?? current?.lane ?? (laneOf(id) === "open" ? "hold" : "open")
    const targetSeam = seam ?? (current && current.cardId === id && current.lane === targetLane ? current.seam : 0)
    stop()
    dragRef.current = null
    aimRef.current = null
    setBoard((currentBoard) => moveCard(currentBoard, id, targetLane, targetSeam))
    setAim(null)
    setFocusId(id)
    setPhase("moved")
    cardsRef.current.get(id)?.focus()
  }

  function onCardKey(event: ReactKeyboardEvent<HTMLButtonElement>, id: string) {
    if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
      event.preventDefault()
      aimAt(id, event.key === "ArrowRight" ? "hold" : "open", 0)
    } else if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault()
      const current = aimRef.current
      const lane = current?.cardId === id ? current.lane : laneOf(id)
      const seam = current?.cardId === id ? current.seam : 0
      aimAt(id, lane, seam + (event.key === "ArrowDown" ? 1 : -1))
    } else if (event.key === "Enter") {
      event.preventDefault()
      if (aimRef.current?.cardId === id) commit(id)
      else aimAt(id, laneOf(id) === "open" ? "hold" : "open", 0)
    } else if (event.key === "Escape") {
      event.preventDefault()
      clearAim(true)
    }
  }

  const opacity = aim ? beamOpacity(aim.progress, intensity, aim.still || reduced) : 0
  const status = aim
    ? label === "on"
      ? "Insert here"
      : `Aiming at ${aim.lane}`
    : phase === "moved"
      ? "Moved"
      : "Resting"
  const buttonClass = cn("rounded-full border border-border bg-background px-3 py-1.5 text-sm text-foreground", focusRing)

  function renderLane(lane: LaneName, title: string) {
    const ids = board[lane]
    const aimed = aim?.lane === lane
    return (
      <div
        data-lane={lane}
        onPointerEnter={() => {
          const id = dragRef.current
          if (!id) return
          aimAt(id, lane, ids.filter((item) => item !== id).length)
        }}
        onPointerUp={() => {
          const id = dragRef.current
          if (!id) return
          const seam = aimRef.current?.lane === lane ? aimRef.current.seam : ids.filter((item) => item !== id).length
          commit(id, lane, seam)
        }}
        className="relative min-h-36 rounded-2xl border border-border bg-background p-2"
      >
        {aimed && style === "column" ? (
          <motion.div
            data-beam-layer=""
            aria-hidden="true"
            style={{ pointerEvents: "none", opacity }}
            className="pointer-events-none absolute inset-y-2 left-1 w-1 rounded-full bg-primary motion-reduce:transition-none"
          />
        ) : null}
        <p className="px-2 text-xs font-medium tracking-wide text-muted-foreground uppercase">{title}</p>
        <div role="list" aria-label={title} className="mt-2 space-y-2">
          {ids.length === 0 ? <p className="px-2 py-4 text-sm text-muted-foreground">Empty lane</p> : null}
          {aimed && style === "line" && aim.seam === 0 ? beamLine("seam-0") : null}
          {ids.map((id, index) => {
            const card = CARDS.find((item) => item.id === id)
            return (
              <div key={id} role="listitem" className="space-y-2">
                <button
                  type="button"
                  data-focus={id}
                  ref={(node) => {
                    if (node) cardsRef.current.set(id, node)
                    else cardsRef.current.delete(id)
                  }}
                  aria-pressed={aim?.cardId === id}
                  onFocus={() => setFocusId(id)}
                  onPointerDown={() => {
                    dragRef.current = id
                  }}
                  onKeyDown={(event) => onCardKey(event, id)}
                  className={cn(
                    "flex w-full rounded-xl border border-border bg-card px-3 py-2 text-left text-sm font-medium text-foreground",
                    focusRing,
                  )}
                >
                  {card?.label ?? id}
                </button>
                {aimed && style === "line" && aim.seam === index + 1 ? beamLine(`seam-${index + 1}`) : null}
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  function beamLine(key: string) {
    return (
      <motion.div
        key={key}
        data-beam-layer=""
        aria-hidden="true"
        style={{ pointerEvents: "none", opacity }}
        className="pointer-events-none h-1 rounded-full bg-primary motion-reduce:transition-none"
      />
    )
  }

  return (
    <div
      ref={rootRef}
      data-slot="lane-insert-beam"
      data-ritual="lane-beam"
      data-motion={reduced ? "off" : "on"}
      data-live={live ? "on" : "off"}
      data-style={style}
      data-label={label}
      data-phase={phase}
      data-beam={aim ? (aim.still || reduced ? "still" : "run") : "off"}
      data-lane={aim?.lane ?? "none"}
      data-seam={aim?.seam ?? -1}
      data-open={board.open.join(",") || "empty"}
      data-hold={board.hold.join(",") || "empty"}
      className={cn(
        "relative w-full max-w-xl rounded-3xl border border-border bg-card p-4 text-card-foreground motion-reduce:transition-none",
        className,
      )}
    >
      <p className="text-sm text-muted-foreground">
        Press a card, then use arrows to aim the beam. Move to Hold or Move to Open places it. Esc clears the beam. The page keeps scrolling.
      </p>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        {renderLane("open", "Open")}
        {renderLane("hold", "Hold")}
      </div>
      <p role="status" className="mt-3 text-sm text-foreground">
        {status}
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <button type="button" className={buttonClass} onClick={() => commit(focusId, "open")}>
          Move to Open
        </button>
        <button type="button" className={buttonClass} onClick={() => commit(focusId, "hold")}>
          Move to Hold
        </button>
        <button type="button" className={buttonClass} onClick={() => commit()}>
          Commit
        </button>
        <button type="button" className={buttonClass} onClick={() => clearAim(true)}>
          Cancel
        </button>
        <button
          type="button"
          className={buttonClass}
          onClick={() => {
            stop()
            dragRef.current = null
            aimRef.current = null
            setAim(null)
            setBoard((current) => ({ ...current, hold: [] }))
            setPhase("rest")
          }}
        >
          Empty Hold
        </button>
        <button
          type="button"
          className={buttonClass}
          onClick={() => {
            stop()
            dragRef.current = null
            aimRef.current = null
            setAim(null)
            setBoard(seedBoard())
            setFocusId("a")
            setPhase("rest")
          }}
        >
          Restore lanes
        </button>
      </div>
    </div>
  )
}
