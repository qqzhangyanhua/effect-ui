"use client"

import { useEffect, useRef, useState, useSyncExternalStore, type KeyboardEvent, type PointerEvent } from "react"

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/cn"

export type SwipeActionTone = "later" | "archive" | "delete"

export interface SwipeAction {
  id: string
  label: string
  tone: SwipeActionTone
}

export interface SwipeActionEntry {
  id: string
  title: string
  note: string
  leading: readonly SwipeAction[]
  trailing: readonly SwipeAction[]
}

export interface SwipeActionRowProps {
  threshold?: number
  snap?: number
  pace?: number
  rows?: readonly SwipeActionEntry[]
  className?: string
  onAction?: (rowId: string, actionId: string) => void
}

interface Pose {
  offset: number
  phase: "rest" | "dragging" | "open" | "actioned"
  side: "none" | "left" | "right"
}

const builtIn: readonly SwipeActionEntry[] = [
  {
    id: "draft",
    title: "晨间备忘",
    note: "还没发出去的草稿",
    leading: [
      { id: "later", label: "稍后", tone: "later" },
      { id: "archive", label: "归档", tone: "archive" },
    ],
    trailing: [{ id: "delete", label: "删除", tone: "delete" }],
  },
  {
    id: "list",
    title: "采购清单",
    note: "下周要用的材料",
    leading: [
      { id: "later", label: "稍后", tone: "later" },
      { id: "archive", label: "归档", tone: "archive" },
    ],
    trailing: [{ id: "delete", label: "删除", tone: "delete" }],
  },
  {
    id: "clip",
    title: "临时摘录",
    note: "从阅读里剪下来的一句",
    leading: [
      { id: "later", label: "稍后", tone: "later" },
      { id: "archive", label: "归档", tone: "archive" },
    ],
    trailing: [{ id: "delete", label: "删除", tone: "delete" }],
  },
]

const restPose: Pose = { offset: 0, phase: "rest", side: "none" }

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

function toneClass(tone: SwipeActionTone) {
  if (tone === "delete") return "bg-destructive text-white"
  if (tone === "archive") return "bg-primary text-primary-foreground"
  return "bg-accent text-accent-foreground"
}

function resist(delta: number, limit: number) {
  const abs = Math.abs(delta)
  if (abs <= limit) return delta
  const sign = delta < 0 ? -1 : 1
  return sign * (limit + (abs - limit) * 0.28)
}

export function SwipeActionRow({
  threshold = 0.34,
  snap = 0.85,
  pace = 1,
  rows = builtIn,
  className,
  onAction,
}: SwipeActionRowProps) {
  const reduced = usePrefersReducedMotion()
  const coarse = useSyncExternalStore(subscribeCoarse, coarseNow, () => false)
  const gateRatio = clamp(threshold, 0.16, 0.7)
  const spring = clamp(snap, 0, 1)
  const ms = Math.round(340 / rateOf(pace))
  const items = rows.length > 0 ? rows : builtIn
  const [poses, setPoses] = useState<Readonly<Record<string, Pose>>>({})
  const stopRef = useRef<(() => void) | null>(null)
  const inline = reduced || coarse

  useEffect(() => () => stopRef.current?.(), [])

  function poseOf(id: string) {
    return poses[id] ?? restPose
  }

  function setPose(id: string, pose: Pose) {
    setPoses((current) => ({ ...current, [id]: pose }))
  }

  function openDistance(actions: readonly SwipeAction[]) {
    return Math.max(88, actions.length * 76)
  }

  function settle(id: string, entry: SwipeActionEntry, offset: number, width: number) {
    const gate = Math.max(64, width * gateRatio)
    if (offset >= gate) {
      setPose(id, { offset: openDistance(entry.leading), phase: "open", side: "left" })
      return
    }
    if (offset <= -gate) {
      setPose(id, { offset: -openDistance(entry.trailing), phase: "open", side: "right" })
      return
    }
    if (spring <= 0) {
      setPose(id, { offset, phase: "rest", side: "none" })
      return
    }
    setPose(id, { offset: 0, phase: "rest", side: "none" })
  }

  function onPointerDown(event: PointerEvent<HTMLDivElement>, entry: SwipeActionEntry) {
    if (reduced || event.button !== 0) return
    const width = event.currentTarget.getBoundingClientRect().width || 280
    const pointerId = event.pointerId
    const startX = event.clientX
    const base = poseOf(entry.id).offset
    stopRef.current?.()
    setPose(entry.id, { offset: base, phase: "dragging", side: base > 8 ? "left" : base < -8 ? "right" : "none" })
    const move = (native: globalThis.PointerEvent) => {
      if (native.pointerId !== pointerId) return
      const raw = base + (native.clientX - startX)
      const limit = Math.max(openDistance(entry.leading), openDistance(entry.trailing))
      const next = resist(raw, limit)
      setPose(entry.id, { offset: next, phase: "dragging", side: next > 8 ? "left" : next < -8 ? "right" : "none" })
    }
    const up = (native: globalThis.PointerEvent) => {
      if (native.pointerId !== pointerId) return
      stop()
      const raw = base + (native.clientX - startX)
      settle(entry.id, entry, raw, width)
    }
    const stop = () => {
      window.removeEventListener("pointermove", move)
      window.removeEventListener("pointerup", up)
      window.removeEventListener("pointercancel", up)
      if (stopRef.current === stop) stopRef.current = null
    }
    stopRef.current = stop
    window.addEventListener("pointermove", move)
    window.addEventListener("pointerup", up)
    window.addEventListener("pointercancel", up)
    try {
      event.currentTarget.setPointerCapture(pointerId)
    } catch {
      // jsdom 没有活动指针时拒绝捕获。窗口监听仍然收得到冒泡。
    }
  }

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>, entry: SwipeActionEntry) {
    if (event.key === "Escape") {
      event.preventDefault()
      setPose(entry.id, restPose)
      return
    }
    if (!event.altKey) return
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return
    event.preventDefault()
    if (event.key === "ArrowLeft") {
      setPose(entry.id, { offset: inline ? 0 : openDistance(entry.leading), phase: "open", side: "left" })
      return
    }
    setPose(entry.id, { offset: inline ? 0 : -openDistance(entry.trailing), phase: "open", side: "right" })
  }

  function act(rowId: string, actionId: string) {
    onAction?.(rowId, actionId)
    setPose(rowId, { offset: 0, phase: "actioned", side: "none" })
  }

  function renderActions(entry: SwipeActionEntry, actions: readonly SwipeAction[]) {
    return actions.map((action) => (
      <button
        key={`${entry.id}-${action.id}`}
        type="button"
        data-action={action.id}
        aria-label={`${action.label} ${entry.title}`}
        onClick={() => act(entry.id, action.id)}
        className={cn(
          "grid min-h-11 min-w-16 place-items-center px-3 text-sm font-medium outline-none focus-visible:ring-2 focus-visible:ring-ring",
          toneClass(action.tone),
        )}
      >
        {action.label}
      </button>
    ))
  }

  return (
    <div
      data-slot="swipe-action-row"
      data-threshold={gateRatio}
      data-snap={spring}
      data-pace={pace}
      data-motion={reduced ? "off" : "on"}
      data-reveal={inline ? "inline" : "overlay"}
      className={cn("space-y-3 motion-reduce:transition-none", className)}
    >
      {items.map((entry) => {
        const pose = poseOf(entry.id)
        const travel = reduced ? "none" : pose.phase === "dragging" ? "none" : `transform ${ms}ms cubic-bezier(0.2, ${1 + spring * 0.45}, 0.3, 1)`
        return (
          <div
            key={entry.id}
            data-row={entry.id}
            data-state={pose.phase}
            data-side={pose.side}
            data-offset={Math.round(pose.offset)}
            className="overflow-hidden rounded-2xl border border-border bg-card text-card-foreground"
          >
            {inline ? (
              <div className="flex items-stretch">
                <div className="flex">{renderActions(entry, entry.leading)}</div>
                <div
                  tabIndex={0}
                  role="group"
                  aria-label={entry.title}
                  aria-keyshortcuts="Alt+ArrowLeft Alt+ArrowRight Escape"
                  onKeyDown={(event) => onKeyDown(event, entry)}
                  onPointerDown={(event) => onPointerDown(event, entry)}
                  style={{ transform: reduced ? "none" : `translate3d(${pose.offset}px, 0, 0)`, transition: travel }}
                  className="min-w-0 flex-1 touch-none bg-card px-4 py-3 outline-none select-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transform-none motion-reduce:transition-none"
                >
                  <p className="font-medium">{entry.title}</p>
                  <p className="text-sm text-muted-foreground">{entry.note}</p>
                </div>
                <div className="flex">{renderActions(entry, entry.trailing)}</div>
              </div>
            ) : (
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex">{renderActions(entry, entry.leading)}</div>
                <div className="absolute inset-y-0 right-0 flex">{renderActions(entry, entry.trailing)}</div>
                <div
                  tabIndex={0}
                  role="group"
                  aria-label={entry.title}
                  aria-keyshortcuts="Alt+ArrowLeft Alt+ArrowRight Escape"
                  onKeyDown={(event) => onKeyDown(event, entry)}
                  onPointerDown={(event) => onPointerDown(event, entry)}
                  style={{ transform: `translate3d(${pose.offset}px, 0, 0)`, transition: travel }}
                  className="relative z-10 touch-none bg-card px-4 py-3 outline-none select-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none"
                >
                  <p className="font-medium">{entry.title}</p>
                  <p className="text-sm text-muted-foreground">{entry.note}</p>
                </div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
