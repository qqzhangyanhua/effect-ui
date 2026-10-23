"use client"

// Ported from Keyframery (MIT, (c) 2026 Briyan Hingrajiya) — https://github.com/keyframery/keyframery/blob/9ab2430/registry/components/keyframery/list-cut.tsx
// diffIds inlined from registry/lib/keyframery/list.ts. Enter rises 8px. The press-origin path needs the Keyframery engine and is not copied. No data-kf gate and no cut event.

import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"
import { Component, createContext, createElement, useCallback, useContext, useEffect, useRef, useState, type CSSProperties, type ReactNode, type RefObject } from "react"

export interface ListCutProps {
  as?: "div" | "ul" | "ol" | "tbody"
  pace?: number
  cut?: "none"
  className?: string
  children?: ReactNode
}

type ListKey = string | number
type Registry = Map<ListKey, HTMLElement>
type Seen = { el: HTMLElement; rect: DOMRect; cells?: number[] }
type Before = { origin: DOMRect | null; items: Map<ListKey, Seen> }
type Flags = { reduced: boolean; live: boolean; pace: number }

const RegistryContext = createContext<Registry | null>(null)
const gliding = new WeakMap<Element, Animation>()
const ENTER = "cubic-bezier(0.22, 1, 0.36, 1)"
const EXIT = "cubic-bezier(0.4, 0, 1, 1)"

function diffIds(before: ListKey[], after: ListKey[]) {
  const was = new Set(before)
  const is = new Set(after)
  return {
    entered: after.filter((key) => !was.has(key)),
    exited: before.filter((key) => !is.has(key)),
    kept: after.filter((key) => was.has(key)),
  }
}

function near(rect: DOMRect) {
  return rect.bottom > -window.innerHeight * 0.5 && rect.top < window.innerHeight * 1.5
}

function glide(el: Element, keyframes: Keyframe[], options: KeyframeAnimationOptions) {
  if (typeof el.animate !== "function") return null
  return el.animate(keyframes, options)
}

function leave(list: HTMLElement, seen: Seen, shift: { x: number; y: number }, ms: number) {
  const host = /^(TBODY|THEAD|TFOOT|TABLE)$/.test(list.tagName) ? (list.closest("table")?.parentElement ?? list) : list
  const box = host.getBoundingClientRect()
  if (getComputedStyle(host).position === "static") {
    host.style.position = "relative"
    host.setAttribute("data-kf-relative", "")
  }
  let ghost: HTMLElement = seen.el
  if (seen.el.tagName === "TR") {
    const table = document.createElement("table")
    const body = document.createElement("tbody")
    table.style.borderCollapse = "collapse"
    table.style.tableLayout = "fixed"
    seen.cells?.forEach((width, index) => {
      const cell = seen.el.children[index]
      if (cell instanceof HTMLElement) cell.style.width = `${width}px`
    })
    body.append(seen.el)
    table.append(body)
    ghost = table
  }
  if (typeof ghost.animate !== "function") return
  Object.assign(ghost.style, {
    position: "absolute",
    left: `${seen.rect.left + shift.x - box.left - host.clientLeft + host.scrollLeft}px`,
    top: `${seen.rect.top + shift.y - box.top - host.clientTop + host.scrollTop}px`,
    width: `${seen.rect.width}px`,
    height: `${seen.rect.height}px`,
    margin: "0",
    boxSizing: "border-box",
    pointerEvents: "none",
    zIndex: "0",
  })
  ghost.setAttribute("aria-hidden", "true")
  ghost.setAttribute("data-kf-ghost", "")
  ghost.inert = true
  host.append(ghost)
  const done = () => {
    ghost.remove()
    if (host.hasAttribute("data-kf-relative") && !host.querySelector(":scope > [data-kf-ghost]")) {
      host.style.removeProperty("position")
      host.removeAttribute("data-kf-relative")
    }
  }
  glide(ghost, [{ opacity: 1, scale: "1" }, { opacity: 0, scale: "0.97" }], { duration: ms, easing: EXIT, fill: "forwards" })?.finished.then(done, done)
}

function play(list: HTMLElement | null, before: Before, items: Registry, flags: Flags) {
  if (!list || list.getAttribute("data-cut") === "none" || !flags.live) return
  for (const el of items.values()) gliding.get(el)?.cancel()
  const after = new Map(Array.from(items, ([id, el]) => [id, el.getBoundingClientRect()] as const))
  const now = list.getBoundingClientRect()
  const shift = { x: before.origin ? now.left - before.origin.left : 0, y: before.origin ? now.top - before.origin.top : 0 }
  const { entered, exited, kept } = diffIds([...before.items.keys()], [...after.keys()])
  const ms = (base: number) => Math.round(base * flags.pace)
  const lead = exited.length && !flags.reduced ? ms(60) : 0

  if (!flags.reduced) {
    for (const id of kept) {
      const seen = before.items.get(id)
      const next = after.get(id)
      const el = items.get(id)
      if (!seen || !next || !el) continue
      const dx = seen.rect.left + shift.x - next.left
      const dy = seen.rect.top + shift.y - next.top
      if ((Math.abs(dx) < 0.5 && Math.abs(dy) < 0.5) || (!near(seen.rect) && !near(next))) continue
      const animation = glide(el, [{ translate: `${dx}px ${dy}px` }, { translate: "0 0" }], { duration: ms(320), delay: lead, easing: ENTER, fill: "backwards" })
      if (animation) gliding.set(el, animation)
    }
  }

  for (const id of entered) {
    const el = items.get(id)
    const rect = after.get(id)
    if (!el || !rect || !near(rect)) continue
    if (flags.reduced) glide(el, [{ opacity: 0 }, { opacity: 1 }], { duration: 120, easing: ENTER })
    else {
      glide(el, [{ translate: "0 8px", opacity: 0 }, { translate: "0 0", opacity: 1 }], { duration: ms(260), easing: ENTER })
    }
  }

  if (!flags.reduced) {
    for (const id of exited) {
      const seen = before.items.get(id)
      if (seen && near(seen.rect)) leave(list, seen, shift, ms(220))
    }
  }
}

class BeforeAfter extends Component<{ items: Registry; list: RefObject<HTMLElement | null>; onCommit: (before: Before) => void; children?: ReactNode }, object, Before> {
  override getSnapshotBeforeUpdate(): Before {
    const items = new Map<ListKey, Seen>()
    for (const [id, el] of this.props.items) {
      items.set(id, {
        el,
        rect: el.getBoundingClientRect(),
        cells: el.tagName === "TR" ? Array.from(el.children, (cell) => cell.getBoundingClientRect().width) : undefined,
      })
    }
    return { origin: this.props.list.current?.getBoundingClientRect() ?? null, items }
  }

  override componentDidUpdate(_props: unknown, _state: unknown, before?: Before) {
    if (before) this.props.onCommit(before)
  }

  override render() {
    return this.props.children
  }
}

type ItemProps = {
  id: ListKey
  as?: "div" | "li" | "tr"
  className?: string
  children?: ReactNode
}

function ListCutItem({ id, as = "div", className, children }: ItemProps) {
  const items = useContext(RegistryContext)
  const ref = useCallback(
    (el: HTMLElement | null) => {
      if (!el || !items) return
      items.set(id, el)
      return () => {
        if (items.get(id) === el) items.delete(id)
      }
    },
    [items, id],
  )
  return createElement(as, { ref, "data-slot": "list-cut-item", className }, children)
}

function ListCutRoot({ as = "div", children, pace = 1, cut, className }: ListCutProps) {
  const [items] = useState<Registry>(() => new Map())
  const list = useRef<HTMLElement>(null)
  const reduced = usePrefersReducedMotion()
  const live = useAnimationActive(list)
  const flags = useRef<Flags>({ reduced, live, pace })
  useEffect(() => {
    flags.current = { reduced, live, pace }
  }, [reduced, live, pace])
  const onCommit = useCallback((before: Before) => play(list.current, before, items, flags.current), [items])
  const moving = live && !reduced && cut !== "none"
  const style = { "--kf-pace": pace } as CSSProperties
  return (
    <RegistryContext.Provider value={items}>
      {createElement(
        as,
        {
          ref: list,
          "data-slot": "list-cut",
          "data-cut": cut === "none" ? "none" : undefined,
          "data-motion": moving ? "on" : "off",
          className: cn("motion-reduce:transition-none", className),
          style,
        },
        <BeforeAfter items={items} list={list} onCommit={onCommit}>
          {children}
        </BeforeAfter>,
      )}
    </RegistryContext.Provider>
  )
}

export const ListCut = Object.assign(ListCutRoot, { Item: ListCutItem })
