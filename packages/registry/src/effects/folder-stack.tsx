"use client"

import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent as ReactPointerEvent } from "react"

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export interface StackFolder {
  id: string
  title: string
  detail: string
}

export interface FolderStackProps {
  folders?: readonly StackFolder[]
  onExtract?: (id: string) => void
  onOpenChange?: (open: boolean) => void
  color?: string
  size?: number
  duration?: number
  className?: string
}

const DEFAULT_FOLDERS: readonly StackFolder[] = [
  { id: "draft", title: "草稿", detail: "还没写完" },
  { id: "review", title: "评审", detail: "等一个人看" },
  { id: "archive", title: "归档", detail: "可以收起来" },
]

interface Origin {
  id: string
  x: number
  y: number
  pointerId: number
}

interface Flight {
  id: string
  x: number
  y: number
}

function coarsePointer(pointerType: string) {
  if (pointerType === "touch") return true
  if (typeof window.matchMedia !== "function") return false
  return window.matchMedia("(pointer: coarse)").matches
}

function FolderStack({
  folders = DEFAULT_FOLDERS,
  onExtract,
  onOpenChange,
  color,
  size = 176,
  duration = 480,
  className,
}: FolderStackProps) {
  const reduced = usePrefersReducedMotion()
  const [pile, setPile] = useState<readonly StackFolder[]>(folders)
  const [open, setOpen] = useState(false)
  const [drag, setDrag] = useState<{ id: string; x: number; y: number } | null>(null)
  const [ghost, setGhost] = useState<StackFolder | null>(null)
  const [pose, setPose] = useState({ x: 0, y: 0 })
  const origin = useRef<Origin | null>(null)
  const flight = useRef<Flight | null>(null)
  const done = useRef(new Set<string>())
  const coarseDown = useRef(false)
  const suppressClick = useRef(false)
  const sawOpen = useRef(open)
  const onExtractRef = useRef(onExtract)
  const onOpenChangeRef = useRef(onOpenChange)
  const reducedRef = useRef(reduced)
  const durationRef = useRef(duration)
  const sizeRef = useRef(size)
  const accent = color ?? "var(--primary)"

  useEffect(() => {
    onExtractRef.current = onExtract
    onOpenChangeRef.current = onOpenChange
    reducedRef.current = reduced
    durationRef.current = duration
    sizeRef.current = size
  })

  useEffect(() => {
    if (sawOpen.current === open) return
    sawOpen.current = open
    onOpenChangeRef.current?.(open)
  }, [open])

  function finish(id: string) {
    if (done.current.has(id)) return
    done.current.add(id)
    flight.current = null
    setGhost(null)
    onExtractRef.current?.(id)
  }

  useEffect(() => {
    const current = flight.current
    if (!current) return
    let x = current.x
    let y = current.y
    let last = 0
    let elapsed = 0
    let raf = 0
    const step = (now: number) => {
      if (reducedRef.current) {
        finish(current.id)
        return
      }
      const dt = last === 0 ? 16 : Math.min(32, Math.max(0, now - last))
      last = now
      elapsed += dt
      x += dt * 0.45
      y -= dt * 0.05
      if (elapsed >= durationRef.current || x > sizeRef.current + 80) {
        finish(current.id)
        return
      }
      setPose({ x, y })
      raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [ghost])

  function setFan(next: boolean) {
    setOpen((prev) => (prev === next ? prev : next))
  }

  function toggle() {
    setOpen((prev) => !prev)
  }

  function launch(folder: StackFolder, x: number, y: number) {
    setPile((prev) => prev.filter((item) => item.id !== folder.id))
    setDrag(null)
    if (reducedRef.current) {
      finish(folder.id)
      return
    }
    flight.current = { id: folder.id, x, y }
    setPose({ x, y })
    setGhost(folder)
  }

  function onFolderPointerDown(event: ReactPointerEvent<HTMLButtonElement>, id: string) {
    if (ghost || flight.current) return
    if (event.pointerType === "mouse" && event.button !== 0) return
    event.currentTarget.setPointerCapture?.(event.pointerId)
    origin.current = { id, x: event.clientX, y: event.clientY, pointerId: event.pointerId }
    setDrag({ id, x: 0, y: 0 })
  }

  function onFolderPointerMove(event: ReactPointerEvent<HTMLButtonElement>) {
    const start = origin.current
    if (!start || start.pointerId !== event.pointerId) return
    setDrag({ id: start.id, x: event.clientX - start.x, y: event.clientY - start.y })
  }

  function onFolderPointerUp(event: ReactPointerEvent<HTMLButtonElement>) {
    const start = origin.current
    if (!start || start.pointerId !== event.pointerId) return
    origin.current = null
    const dx = event.clientX - start.x
    const dy = event.clientY - start.y
    setDrag(null)
    if (Math.hypot(dx, dy) < 72) return
    const folder = pile.find((item) => item.id === start.id)
    if (!folder) return
    suppressClick.current = true
    launch(folder, dx, dy)
  }

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key !== "Enter" && event.key !== " ") return
    event.preventDefault()
    toggle()
  }

  const count = pile.length
  const mid = (count - 1) / 2

  return (
    <div
      aria-label="文件夹堆"
      className={cn("relative touch-none select-none", className)}
      data-open={open ? "true" : undefined}
      data-reduced={reduced ? "true" : undefined}
      data-slot="folder-stack"
      onClick={() => {
        if (suppressClick.current) {
          suppressClick.current = false
          return
        }
        if (!coarseDown.current) return
        toggle()
      }}
      onKeyDown={onKeyDown}
      onPointerDown={(event) => {
        coarseDown.current = coarsePointer(event.pointerType)
      }}
      onPointerEnter={(event) => {
        if (coarsePointer(event.pointerType)) return
        coarseDown.current = false
        setFan(true)
      }}
      onPointerLeave={(event) => {
        if (coarsePointer(event.pointerType) || coarseDown.current) return
        if (origin.current || flight.current) return
        setFan(false)
      }}
      role="group"
      style={{ height: Math.round(size * 1.15), width: Math.round(size * 2.8) }}
      tabIndex={0}
    >
      {pile.map((folder, index) => {
        const pulling = drag?.id === folder.id
        const x = (open ? (index - mid) * Math.round(size * 0.48) : 0) + (pulling ? drag.x : 0)
        const y = (open ? Math.abs(index - mid) * 8 : index * 10) + (pulling ? drag.y : 0)
        const turn = open ? (index - mid) * 8 : (index - mid) * 2
        return (
          <button
            className={cn(
              "absolute top-4 left-1/2 rounded-xl border bg-card px-3 py-3 text-left text-card-foreground shadow-md",
              "motion-reduce:transition-none",
              pulling || reduced ? "transition-none" : "transition-transform",
            )}
            data-folder={folder.id}
            key={folder.id}
            onPointerCancel={() => {
              origin.current = null
              setDrag(null)
            }}
            onPointerDown={(event) => onFolderPointerDown(event, folder.id)}
            onPointerMove={onFolderPointerMove}
            onPointerUp={onFolderPointerUp}
            style={{
              borderColor: accent,
              height: Math.round(size * 0.62),
              transform: `translate(calc(-50% + ${x}px), ${y}px) rotate(${turn}deg)`,
              transition: pulling || reduced ? "none" : `transform ${duration}ms cubic-bezier(0.22, 1, 0.36, 1)`,
              width: size,
              zIndex: pulling ? 30 : 10 + index,
            }}
            type="button"
          >
            <span aria-hidden className="absolute top-0 left-3 h-3 w-14 -translate-y-full rounded-t-md" style={{ background: accent }} />
            <span className="block text-sm font-medium">{folder.title}</span>
            <span className="text-muted-foreground mt-1 block text-xs">{folder.detail}</span>
          </button>
        )
      })}
      {ghost ? (
        <div
          aria-hidden
          className="pointer-events-none absolute top-4 left-1/2 rounded-xl border bg-card px-3 py-3 text-card-foreground shadow-md motion-reduce:transition-none"
          data-leaving="true"
          style={{
            borderColor: accent,
            height: Math.round(size * 0.62),
            transform: `translate(calc(-50% + ${pose.x}px), ${pose.y}px) rotate(8deg)`,
            width: size,
            zIndex: 40,
          }}
        >
          <span className="block text-sm font-medium">{ghost.title}</span>
          <span className="text-muted-foreground mt-1 block text-xs">{ghost.detail}</span>
        </div>
      ) : null}
    </div>
  )
}

export { FolderStack }
