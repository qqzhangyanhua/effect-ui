"use client"

// Ported from Keyframery (MIT, (c) 2026 Briyan Hingrajiya) — https://github.com/keyframery/keyframery/blob/9ab2430/registry/components/keyframery/icon-moves.tsx
// Move table and stroke helpers inlined from registry/lib/keyframery/moves.ts and icon.ts. Listeners stay on this wrapper. No data-kf gate.

import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"
import { useEffect, useRef, type CSSProperties, type ReactNode } from "react"

export interface IconMovesProps {
  on?: "press" | "hover"
  color?: string
  speed?: number
  size?: number
  duration?: number
  className?: string
  children?: ReactNode
}

const OUT = "cubic-bezier(0.22, 1, 0.36, 1)"
const BACK = "cubic-bezier(0.34, 1.56, 0.64, 1)"
const STROKES = "path,circle,rect,line,polyline,polygon,ellipse"
const SLOTS = [
  "button",
  "sidebar-menu-button",
  "sidebar-menu-sub-button",
  "sidebar-menu-action",
  "collapsible-trigger",
  "dropdown-menu-item",
  "context-menu-item",
  "menubar-item",
  "command-item",
  "tabs-trigger",
  "toggle",
  "toggle-group-item",
  "navigation-menu-link",
]
const CONTROLS = ["button", ...SLOTS.map((slot) => `[data-slot="${slot}"]`)].join(",")
const STATE_ICON = /^lucide-(chevron|chevrons|caret|grip|loader)/

type Part = SVGGeometryElement
type Move = (svg: SVGSVGElement, parts: Part[], ms: (base: number) => number) => Array<Animation | null>

function strokesOf(svg: Element) {
  return [...svg.querySelectorAll<Part>(STROKES)]
}

function isOutline(svg: Element) {
  return (svg.getAttribute("fill") ?? getComputedStyle(svg).fill) === "none"
}

function m(el: Element | undefined, keyframes: Keyframe[], duration: number, delay = 0, easing = OUT, origin?: string): Animation[] {
  if (!el || typeof el.animate !== "function") return []
  if (origin && el instanceof SVGElement) {
    el.style.setProperty("transform-box", "fill-box")
    el.style.transformOrigin = origin
  }
  return [el.animate(keyframes, { duration, delay, easing, fill: "backwards" })]
}

function draw(el: Part | undefined, duration: number, delay = 0, easing = "cubic-bezier(0.65, 0, 0.35, 1)"): Animation | null {
  if (!el || typeof el.animate !== "function") return null
  el.setAttribute("pathLength", "1")
  el.style.strokeDasharray = "1"
  const anim = el.animate([{ strokeDashoffset: 1 }, { strokeDashoffset: 0 }], { duration, delay, easing, fill: "backwards" })
  const clean = () => {
    el.style.strokeDasharray = ""
    el.removeAttribute("pathLength")
  }
  anim.finished.then(clean, clean)
  return anim
}

function redraw(svg: Element, duration: number, delay = 0) {
  return strokesOf(svg).map((part, index) => draw(part, duration, delay + index * (duration / 6)))
}

function punch(svg: Element, duration: number, delay = 0): Animation | null {
  if (typeof svg.animate !== "function") return null
  return svg.animate([{ scale: "1" }, { scale: "1.2", offset: 0.4 }, { scale: "1" }], { duration, delay, easing: "ease-out" })
}

const bob = (dy: number) => [{ translate: "0 0" }, { translate: `0 ${dy}px`, offset: 0.35 }, { translate: "0 0" }]
const pop = (scale: number) => [{ scale: "1" }, { scale: `${scale}`, offset: 0.4 }, { scale: "1" }]
const from = (x: number, y: number) => [{ translate: `${x}px ${y}px`, opacity: 0 }, { translate: "0 0", opacity: 1 }]
const nudge = (x: number, y: number) => [{ translate: "0 0" }, { translate: `${x}px ${y}px`, offset: 0.4 }, { translate: "0 0" }]
const turn = (deg: number) => [{ rotate: "0deg" }, { rotate: `${deg}deg` }]
const rock = (deg: number) => [{ rotate: "0deg" }, { rotate: `${deg}deg` }, { rotate: `${-deg * 0.75}deg` }, { rotate: `${deg * 0.45}deg` }, { rotate: "0deg" }]

const moves: Record<string, Move> = {
  house: (s, p, t) => [...m(s, bob(-2.5), t(420)), draw(p[0], t(320), t(120))],
  inbox: (s, p, t) => [...m(p[0], from(0, -5), t(380), 0, BACK), ...m(p[1], [{ scale: "1 1" }, { scale: "1 .88", offset: 0.5 }, { scale: "1 1" }], t(360), t(140), OUT, "50% 100%")],
  "chart-column": (s, p, t) => p.slice(1).flatMap((bar, i) => m(bar, [{ scale: "1 0" }, { scale: "1 1" }], t(380), t(i * 70), BACK, "50% 100%")),
  "chart-line": (s, p, t) => [draw(p[1], t(480))],
  folder: (s, p, t) => m(s, [{ rotate: "0deg", scale: "1" }, { rotate: "-10deg", scale: "1.08", offset: 0.4 }, { rotate: "0deg", scale: "1" }], t(440), 0, OUT, "15% 85%"),
  users: (s, p, t) => [...m(p[3], pop(1.14), t(360), 0, OUT, "50% 50%"), ...m(p[1], from(-3, 0), t(340), t(80)), ...m(p[2], from(-3, 0), t(340), t(80))],
  user: (s, p, t) => m(p[1], bob(-1.8), t(380), 0, OUT, "50% 50%"),
  bell: (s, p, t) => [...m(s, rock(18), t(680), 0, "ease-out", "50% 12%"), ...m(p[0], [{ translate: "0 0" }, { translate: "2px 0" }, { translate: "-2px 0" }, { translate: "1px 0" }, { translate: "0 0" }], t(680), t(40), "ease-out")],
  settings: (s, p, t) => m(s, turn(120), t(660), 0, BACK, "50% 50%"),
  search: (s, p, t) => m(s, [{ rotate: "0deg", scale: "1" }, { rotate: "-16deg", scale: "1.16", offset: 0.45 }, { rotate: "0deg", scale: "1" }], t(460), 0, OUT, "45% 45%"),
  calendar: (s, p, t) => [...m(p[0], from(0, -3), t(320), 0, BACK), ...m(p[1], from(0, -3), t(320), t(70), BACK), draw(p[3], t(300), t(140))],
  "file-text": (s, p, t) => [draw(p[2], t(220)), draw(p[3], t(260), t(80)), draw(p[4], t(260), t(160))],
  "message-square": (s, p, t) => m(s, [{ scale: ".8", rotate: "-6deg" }, { scale: "1.08", rotate: "2deg", offset: 0.55 }, { scale: "1", rotate: "0deg" }], t(440), 0, OUT, "10% 90%"),
  sparkles: (s, p, t) => [
    ...m(p[0], [{ scale: "1", rotate: "0deg" }, { scale: "1.2", rotate: "20deg", offset: 0.45 }, { scale: "1", rotate: "0deg" }], t(500), 0, OUT, "50% 50%"),
    ...m(p[1], [{ opacity: 1 }, { opacity: 0, offset: 0.3 }, { opacity: 1 }], t(440), t(80)),
    ...m(p[2], [{ opacity: 1 }, { opacity: 0, offset: 0.3 }, { opacity: 1 }], t(440), t(80)),
    ...m(p[3], pop(0.01), t(460), t(140), OUT, "50% 50%"),
  ],
  mail: (s, p, t) => [draw(p[0], t(360)), ...m(p[1], pop(1.06), t(360), 0, OUT, "50% 50%")],
  send: (s, p, t) => m(s, [{ translate: "0 0", opacity: 1 }, { translate: "6px -6px", opacity: 0, offset: 0.45 }, { translate: "-6px 6px", opacity: 0, offset: 0.46 }, { translate: "0 0", opacity: 1 }], t(560)),
  trash: (s, p, t) => [...m(p[3], bob(-2.2), t(380), 0, OUT, "50% 50%"), ...m(p[4], bob(-2.2), t(380), 0, OUT, "50% 50%")],
  plus: (s, p, t) => m(s, turn(90), t(360), 0, BACK, "50% 50%"),
  x: (s, p, t) => m(s, turn(90), t(360), 0, BACK, "50% 50%"),
  check: (s, p, t) => [draw(p[0], t(320))],
  copy: (s, p, t) => m(p[1], [{ translate: "0 0" }, { translate: "2px 2px", offset: 0.45 }, { translate: "0 0" }], t(380)),
  download: (s, p, t) => [...m(p[0], from(0, -4), t(380), 0, BACK), ...m(p[2], from(0, -4), t(380), 0, BACK)],
  upload: (s, p, t) => [...m(p[0], from(0, 4), t(380), 0, BACK), ...m(p[1], from(0, 4), t(380), 0, BACK)],
  "refresh-cw": (s, p, t) => m(s, turn(180), t(560), 0, OUT, "50% 50%"),
  "rotate-cw": (s, p, t) => m(s, turn(360), t(620), 0, OUT, "50% 50%"),
  "refresh-ccw": (s, p, t) => m(s, turn(-180), t(560), 0, OUT, "50% 50%"),
  "rotate-ccw": (s, p, t) => m(s, turn(-360), t(620), 0, OUT, "50% 50%"),
  heart: (s, p, t) => m(s, [{ scale: "1" }, { scale: "1.25", offset: 0.25 }, { scale: ".95", offset: 0.5 }, { scale: "1.08", offset: 0.7 }, { scale: "1" }], t(600), 0, "ease-out", "50% 50%"),
  star: (s, p, t) => m(s, [{ rotate: "0deg", scale: "1" }, { rotate: "72deg", scale: "1.2", offset: 0.6 }, { rotate: "72deg", scale: "1" }], t(560), 0, OUT, "50% 55%"),
  bookmark: (s, p, t) => m(s, [{ translate: "0 -3px", scale: "1 .9" }, { translate: "0 0", scale: "1 1.05", offset: 0.6 }, { translate: "0 0", scale: "1 1" }], t(420), 0, OUT, "50% 0%"),
  "share-2": (s, p, t) => p.slice(0, 3).flatMap((dot, i) => m(dot, pop(1.35), t(320), t(i * 70), OUT, "50% 50%")),
  "log-out": (s, p, t) => [...m(p[0], nudge(3, 0), t(420)), ...m(p[1], nudge(3, 0), t(420))],
  "log-in": (s, p, t) => [...m(p[0], nudge(3, 0), t(420)), ...m(p[1], nudge(3, 0), t(420))],
  pencil: (s, p, t) => m(s, [{ rotate: "0deg", translate: "0 0" }, { rotate: "-12deg", translate: "-1px 1px", offset: 0.3 }, { rotate: "8deg", translate: "1px 0", offset: 0.6 }, { rotate: "0deg", translate: "0 0" }], t(520), 0, "ease-in-out", "20% 80%"),
  "square-pen": (s, p, t) => m(p[1], [{ rotate: "0deg" }, { rotate: "-14deg", offset: 0.35 }, { rotate: "8deg", offset: 0.65 }, { rotate: "0deg" }], t(520), 0, "ease-in-out", "10% 90%"),
  eye: (s, p, t) => m(s, [{ scale: "1 1" }, { scale: "1 .1", offset: 0.3 }, { scale: "1 1", offset: 0.6 }], t(420), 0, "ease-in-out", "50% 50%"),
  lock: (s, p, t) => m(p[1], [{ translate: "0 0" }, { translate: "0 -2.5px", offset: 0.35 }, { translate: "0 0" }], t(420), 0, BACK),
  archive: (s, p, t) => m(p[0], bob(-2.5), t(420)),
  funnel: (s, p, t) => m(s, [{ scale: "1 1" }, { scale: ".82 1", offset: 0.4 }, { scale: "1 1" }], t(420), 0, OUT, "50% 0%"),
  "layout-dashboard": (s, p, t) => p.flatMap((tile, i) => m(tile, pop(0.6), t(360), t(i * 60), BACK, "50% 50%")),
  "layout-grid": (s, p, t) => p.flatMap((tile, i) => m(tile, pop(0.6), t(360), t(i * 60), BACK, "50% 50%")),
  list: (s, p, t) => p.slice(3).flatMap((line, i) => m(line, from(-4, 0), t(320), t(i * 60))),
  "map-pin": (s, p, t) => m(s, [{ translate: "0 -5px" }, { translate: "0 0", offset: 0.5 }, { translate: "0 -1.5px", offset: 0.72 }, { translate: "0 0" }], t(560), 0, "ease-in"),
  globe: (s, p, t) => m(p[1], [{ scale: "1 1" }, { scale: "-1 1" }], t(620), 0, "ease-in-out", "50% 50%"),
  link: (s, p, t) => [...m(p[0], nudge(1.5, 1.5), t(420)), ...m(p[1], nudge(-1.5, -1.5), t(420))],
  "external-link": (s, p, t) => [...m(p[0], nudge(2, -2), t(420)), ...m(p[1], nudge(2, -2), t(420))],
  info: (s, p, t) => [...m(p[1], from(0, -3), t(360), t(60), BACK), ...m(p[2], from(0, -4), t(360), 0, BACK)],
  "circle-help": (s, p, t) => m(s, rock(12), t(560), 0, "ease-out", "50% 50%"),
  "shopping-cart": (s, p, t) => m(s, [{ translate: "0 0", rotate: "0deg" }, { translate: "3px 0", rotate: "-6deg", offset: 0.4 }, { translate: "0 0", rotate: "0deg" }], t(460), 0, OUT, "50% 100%"),
  package: (s, p, t) => m(s, [{ translate: "0 0", scale: "1 1" }, { translate: "0 -3px", scale: "1 1", offset: 0.35 }, { translate: "0 0", scale: "1.06 .94", offset: 0.7 }, { translate: "0 0", scale: "1 1" }], t(520), 0, "ease-out", "50% 100%"),
  zap: (s, p, t) => m(s, [{ opacity: 1, scale: "1" }, { opacity: 0.25, scale: "1.15", offset: 0.25 }, { opacity: 1, scale: "1", offset: 0.5 }, { opacity: 0.5, offset: 0.7 }, { opacity: 1 }], t(480), 0, "linear", "50% 50%"),
  moon: (s, p, t) => m(s, rock(-20), t(620), 0, "ease-out", "50% 50%"),
  sun: (s, p, t) => [...m(s, turn(45), t(560), 0, OUT, "50% 50%"), ...p.slice(1).flatMap((ray, i) => m(ray, [{ opacity: 0.2 }, { opacity: 1 }], t(300), t(i * 30)))],
  "sliders-horizontal": (s, p, t) => [...m(p[2], nudge(3, 0), t(460)), ...m(p[7], nudge(-3, 0), t(460), t(60)), ...m(p[3], nudge(-3, 0), t(460), t(120))],
  "arrow-right": (s, p, t) => m(s, nudge(3, 0), t(380)),
  "arrow-left": (s, p, t) => m(s, nudge(-3, 0), t(380)),
  "arrow-up": (s, p, t) => m(s, nudge(0, -3), t(380)),
  "arrow-down": (s, p, t) => m(s, nudge(0, 3), t(380)),
  ellipsis: (s, p, t) => p.flatMap((dot, i) => m(dot, bob(-2.5), t(360), t(i * 70))),
  play: (s, p, t) => m(s, pop(1.2), t(360), 0, OUT, "50% 50%"),
  pause: (s, p, t) => p.flatMap((bar, i) => m(bar, [{ scale: "1 1" }, { scale: "1 .7", offset: 0.4 }, { scale: "1 1" }], t(360), t(i * 60), OUT, "50% 50%")),
  "volume-2": (s, p, t) => [draw(p[1], t(260)), draw(p[2], t(300), t(120))],
  mic: (s, p, t) => m(p[2], bob(-2), t(400)),
  camera: (s, p, t) => [...m(s, pop(0.9), t(320), 0, OUT, "50% 50%"), ...m(p[1], [{ opacity: 1 }, { opacity: 0.2, offset: 0.3 }, { opacity: 1 }], t(320))],
  phone: (s, p, t) => m(s, rock(14), t(620), 0, "ease-out", "30% 70%"),
  clock: (s, p, t) => m(p[1], [{ rotate: "0deg" }, { rotate: "360deg" }], t(700), 0, "ease-in-out", "0% 75%"),
  bot: (s, p, t) => [...m(s, bob(-2), t(420)), ...m(p[4], [{ scale: "1 1" }, { scale: "1 .1", offset: 0.5 }, { scale: "1 1" }], t(300), t(200), "linear", "50% 50%"), ...m(p[5], [{ scale: "1 1" }, { scale: "1 .1", offset: 0.5 }, { scale: "1 1" }], t(300), t(200), "linear", "50% 50%")],
  "square-terminal": (s, p, t) => m(p[1], [{ opacity: 1 }, { opacity: 0, offset: 0.25 }, { opacity: 1, offset: 0.5 }, { opacity: 0, offset: 0.75 }, { opacity: 1 }], t(700), 0, "steps(1, end)"),
  code: (s, p, t) => [...m(p[0], nudge(1.5, 0), t(420)), ...m(p[1], nudge(-1.5, 0), t(420))],
  layers: (s, p, t) => [...m(p[0], nudge(0, -2), t(440)), ...m(p[2], nudge(0, 2), t(440))],
  tag: (s, p, t) => m(s, rock(14), t(560), 0, "ease-out", "15% 15%"),
  gift: (s, p, t) => [...m(p[2], bob(-2.5), t(420)), ...m(p[3], bob(-2.5), t(420))],
  rocket: (s, p, t) => m(s, [{ translate: "0 0", opacity: 1 }, { translate: "5px -5px", opacity: 0, offset: 0.45 }, { translate: "-5px 5px", opacity: 0, offset: 0.46 }, { translate: "0 0", opacity: 1 }], t(620)),
  "thumbs-up": (s, p, t) => m(s, [{ rotate: "0deg", translate: "0 0" }, { rotate: "-14deg", translate: "0 -1.5px", offset: 0.45 }, { rotate: "0deg", translate: "0 0" }], t(460), 0, OUT, "30% 90%"),
}

const ALIASES: Record<string, string> = {
  home: "house",
  "bar-chart-3": "chart-column",
  "chart-bar": "chart-column",
  "line-chart": "chart-line",
  "trending-up": "chart-line",
  "folder-open": "folder",
  "folder-kanban": "folder",
  "users-round": "users",
  "user-round": "user",
  "circle-user": "user",
  "bell-ring": "bell",
  cog: "settings",
  "calendar-days": "calendar",
  "message-circle": "message-square",
  stars: "sparkles",
  "trash-2": "trash",
  "pen-line": "pencil",
  pen: "pencil",
  edit: "square-pen",
  filter: "funnel",
  "help-circle": "circle-help",
  "circle-question-mark": "circle-help",
  "shopping-bag": "shopping-cart",
  "more-horizontal": "ellipsis",
  terminal: "square-terminal",
  "terminal-square": "square-terminal",
  "code-xml": "code",
  "layers-3": "layers",
}

function moveFor(svg: Element): Move | null {
  for (const cls of svg.classList) {
    if (!cls.startsWith("lucide-")) continue
    const name = cls.slice(7)
    const alias = ALIASES[name]
    const move = moves[name] ?? (alias ? moves[alias] : undefined)
    if (move) return move
  }
  return null
}

function playMove(svg: SVGSVGElement, scale: number) {
  if (svg.getAttribute("data-kf-moving") !== null) return false
  const ms = (base: number) => Math.max(1, Math.round(base * scale))
  const move = moveFor(svg)
  const raw = move ? move(svg, strokesOf(svg), ms) : isOutline(svg) ? redraw(svg, ms(460)) : [punch(svg, ms(360))]
  const anims = raw.filter((item): item is Animation => item !== null)
  if (!anims.length) return false
  svg.setAttribute("data-kf-moving", "")
  Promise.allSettled(anims.map((anim) => anim.finished)).then(() => svg.removeAttribute("data-kf-moving"))
  return true
}

function iconOf(control: Element) {
  for (const svg of control.querySelectorAll("svg")) {
    if (svg.parentElement?.closest(CONTROLS) !== control) continue
    if ([...svg.classList].some((cls) => STATE_ICON.test(cls))) continue
    if (svg instanceof SVGSVGElement) return svg
  }
  return null
}

export function IconMoves({
  on = "press",
  color = "var(--foreground)",
  speed = 1,
  size = 24,
  duration = 420,
  className,
  children,
}: IconMovesProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const reduced = usePrefersReducedMotion()
  const live = useAnimationActive(rootRef)
  const gate = useRef({ live, reduced })
  useEffect(() => {
    gate.current = { live, reduced }
  }, [live, reduced])

  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    const scale = (duration / 420) * speed
    const play = (target: EventTarget | null) => {
      if (!gate.current.live || gate.current.reduced) return
      const control = target instanceof Element ? target.closest(CONTROLS) : null
      if (!control || !root.contains(control)) return
      if (control.closest("[data-cut=none]") || control.matches(":disabled, [aria-disabled='true'], [data-disabled]")) return
      const svg = iconOf(control)
      if (svg) playMove(svg, scale)
    }
    const onPress = (event: PointerEvent) => play(event.target)
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Enter" || event.key === " ") play(event.target)
    }
    const onOver = (event: PointerEvent) => {
      if (event.pointerType !== "mouse" || !(event.target instanceof Element)) return
      const control = event.target.closest(CONTROLS)
      if (!control || !root.contains(control)) return
      if (event.relatedTarget instanceof Node && control.contains(event.relatedTarget)) return
      play(control)
    }
    root.addEventListener("pointerdown", onPress, true)
    root.addEventListener("keydown", onKey, true)
    if (on === "hover") root.addEventListener("pointerover", onOver, true)
    return () => {
      root.removeEventListener("pointerdown", onPress, true)
      root.removeEventListener("keydown", onKey, true)
      root.removeEventListener("pointerover", onOver, true)
    }
  }, [on, duration, speed])

  const moving = live && !reduced
  return (
    <div
      ref={rootRef}
      data-slot="icon-moves"
      data-motion={moving ? "on" : "off"}
      className={cn("text-(--icon-moves-color) [&_svg]:size-(--icon-moves-size) motion-reduce:transform-none", className)}
      style={{ color, "--icon-moves-color": color, "--icon-moves-size": `${size}px` } as CSSProperties}
    >
      {children}
    </div>
  )
}
