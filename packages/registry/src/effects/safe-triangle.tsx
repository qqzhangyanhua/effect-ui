"use client"

// Ported from HextaUI (MIT, (c) 2026 Preet Suthar) — https://github.com/preetsuthar17/HextaUI/blob/main/components/ui/safe-area.tsx

import { useRef, useState, type PointerEvent as ReactPointerEvent } from "react"

import { cn } from "@/lib/utils"

type Point = { x: number; y: number }
type Rect = { x: number; y: number; width: number; height: number }

export interface SafeTriangleProps {
  label?: string
  items?: readonly string[]
  className?: string
}

const buffer = 0.5

function crosses(point: Point, a: Point, b: Point) {
  if (a.y === b.y) return false
  return a.y >= point.y !== b.y >= point.y && point.x <= ((b.x - a.x) * (point.y - a.y)) / (b.y - a.y) + a.x
}

function inPolygon(point: Point, polygon: Point[]) {
  let inside = false
  for (let index = 0; index < polygon.length; index += 1) {
    const start = polygon[index]
    const end = polygon[(index + 1) % polygon.length]
    if (start && end && crosses(point, start, end)) inside = !inside
  }
  return inside
}

function inRect(point: Point, rect: Rect) {
  return point.x >= rect.x && point.x <= rect.x + rect.width && point.y >= rect.y && point.y <= rect.y + rect.height
}

function box(rect: DOMRect): Rect {
  return { x: rect.left, y: rect.top, width: rect.width, height: rect.height }
}

function safeAreaShape(exit: Point, point: Point, ref: DOMRect, rect: DOMRect) {
  const side = rect.left >= ref.right - 1 ? "right" : rect.right <= ref.left + 1 ? "left" : rect.top >= ref.bottom - 1 ? "bottom" : "top"
  const { x, y } = exit
  const fromRight = x > rect.right - rect.width / 2
  const fromBottom = y > rect.bottom - rect.height / 2
  const wider = rect.width > ref.width
  const taller = rect.height > ref.height
  let polygon: Point[]

  if (side === "left" || side === "right") {
    const offset = taller ? buffer / 2 : buffer * 4
    const one = taller ? y + offset : fromBottom ? y + offset : y - offset
    const two = taller ? y - offset : fromBottom ? y + offset : y - offset
    const near = side === "right" ? rect.left + buffer : rect.right - buffer
    const far = side === "right" ? rect.right : rect.left
    const edgeTop = fromBottom ? near : taller ? near : far
    const edgeBottom = fromBottom ? (taller ? near : far) : near
    const cursorX = side === "right" ? x - buffer : x + buffer + 1
    polygon = [
      { x: cursorX, y: one },
      { x: cursorX, y: two },
      { x: edgeTop, y: rect.top },
      { x: edgeBottom, y: rect.bottom },
    ]
  } else {
    const offset = wider ? buffer / 2 : buffer * 4
    const one = wider ? x + offset : fromRight ? x + offset : x - offset
    const two = wider ? x - offset : fromRight ? x + offset : x - offset
    const near = side === "bottom" ? rect.top + buffer : rect.bottom - buffer
    const far = side === "bottom" ? rect.bottom : rect.top
    const edgeLeft = fromRight ? near : wider ? near : far
    const edgeRight = fromRight ? (wider ? near : far) : near
    const cursorY = side === "bottom" ? y - buffer : y + buffer + 1
    polygon = [
      { x: one, y: cursorY },
      { x: two, y: cursorY },
      { x: rect.left, y: edgeLeft },
      { x: rect.right, y: edgeRight },
    ]
  }

  return {
    polygon,
    inside: inRect(point, box(ref)) || inRect(point, box(rect)) || inPolygon(point, polygon),
  }
}

export function SafeTriangle({
  label = "Open menu",
  items = ["Profile", "Settings", "Sign out"],
  className,
}: SafeTriangleProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const exitRef = useRef<Point | null>(null)
  const [open, setOpen] = useState(false)
  const [outline, setOutline] = useState("")
  const [picked, setPicked] = useState("")

  function measure(cursor?: Point) {
    const host = rootRef.current?.getBoundingClientRect()
    const trigger = triggerRef.current?.getBoundingClientRect()
    const menu = menuRef.current?.getBoundingClientRect()
    if (!host || !trigger || !menu) return
    const origin = cursor ?? {
      x: trigger.left + trigger.width / 2,
      y: trigger.top + trigger.height / 2,
    }
    const exit = exitRef.current ?? origin
    exitRef.current = exit
    const shape = safeAreaShape(exit, origin, trigger, menu)
    setOutline(shape.polygon.map((point) => `${point.x - host.left},${point.y - host.top}`).join(" "))
  }

  function toggle() {
    setOpen((current) => {
      const next = !current
      if (next) requestAnimationFrame(() => measure())
      else {
        exitRef.current = null
        setOutline("")
      }
      return next
    })
  }

  function onPointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    if (!open || event.pointerType === "touch") return
    measure({ x: event.clientX, y: event.clientY })
  }

  function onPointerLeave(event: ReactPointerEvent<HTMLDivElement>) {
    if (!open || event.pointerType === "touch") return
    const trigger = triggerRef.current?.getBoundingClientRect()
    const menu = menuRef.current?.getBoundingClientRect()
    if (!trigger || !menu || !exitRef.current) {
      setOpen(false)
      return
    }
    const point = { x: event.clientX, y: event.clientY }
    if (!safeAreaShape(exitRef.current, point, trigger, menu).inside) setOpen(false)
  }

  return (
    <div
      ref={rootRef}
      className={cn("relative inline-flex items-start", className)}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
      onKeyDown={(event) => {
        if (event.key === "Escape") setOpen(false)
      }}
    >
      <button
        ref={triggerRef}
        type="button"
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={toggle}
        className="h-10 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground"
      >
        {label}
      </button>
      <div className={cn("ml-12 w-40", open ? "" : "invisible absolute")}>
        <div aria-hidden="true" className="mb-2 h-8 rounded-md bg-primary/15" />
        <div ref={menuRef} role="menu" aria-hidden={open ? undefined : true} className="rounded-lg border border-border bg-popover p-1 text-popover-foreground shadow-md">
          {items.map((item) => (
            <button
              key={item}
              type="button"
              role="menuitem"
              className="block w-full rounded-md px-3 py-2 text-left text-sm hover:bg-accent focus-visible:bg-accent focus-visible:outline-none"
              onClick={() => {
                setPicked(item)
                setOpen(false)
              }}
            >
              {item}
            </button>
          ))}
        </div>
      </div>
      {open && outline ? (
        <svg aria-hidden="true" className="pointer-events-none absolute inset-0 h-full w-full overflow-visible">
          <polygon points={outline} fill="var(--primary)" fillOpacity="0.16" stroke="var(--primary)" strokeOpacity="0.7" />
        </svg>
      ) : null}
      <p role="status" className="sr-only">
        {picked}
      </p>
    </div>
  )
}
