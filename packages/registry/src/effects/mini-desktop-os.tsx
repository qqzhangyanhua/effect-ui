"use client"

// Ported from Framekit UI (MIT, (c) 2026 Framekit UI contributors) — https://github.com/Sid9022/framekit-ui/blob/master/src/components/ui/mini-desktop-os.tsx

import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent, type ReactNode } from "react"
import { AnimatePresence, motion } from "motion/react"
import { BatteryFull, Maximize2, Minus, Wifi, X } from "lucide-react"

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export interface MiniDesktopApp {
  id: string
  title: string
  icon: ReactNode
  content: ReactNode
  size?: { w: number; h: number }
}

export interface MiniDesktopOSProps {
  apps: MiniDesktopApp[]
  defaultOpen?: string[]
  brand?: string
  wallpaperSeed?: number
  height?: number
  onOpenChange?: (openIds: string[]) => void
  className?: string
}

type Win = { id: string; x: number; y: number; w: number; h: number; z: number; min: boolean; max: boolean }

export function MiniDesktopOS({ apps, defaultOpen = [], brand = "Folio", wallpaperSeed = 14, height = 540, onOpenChange, className }: MiniDesktopOSProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const zTop = useRef(10)
  const opened = useRef(false)
  const reduced = usePrefersReducedMotion()
  const [box, setBox] = useState({ w: 900, h: height })
  const [wins, setWins] = useState<Win[]>([])
  const [say, setSay] = useState("")
  const [clock, setClock] = useState("")
  const compact = box.w < 600
  const openKey = defaultOpen.join("\0")

  useEffect(() => {
    const format = () => setClock(new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }))
    format()
    const id = window.setInterval(format, 15000)
    return () => window.clearInterval(id)
  }, [])

  useEffect(() => {
    const node = rootRef.current
    if (!node) return
    const place = (id: string, index: number, width: number, deskHeight: number): Win => {
      const app = apps.find((item) => item.id === id)
      const w = Math.min(app?.size?.w ?? 380, width - 24)
      const h = Math.min(app?.size?.h ?? 260, deskHeight - 120)
      return { id, w, h, x: Math.max(8, Math.min(width - w - 8, 120 + index * 34)), y: Math.max(40, Math.min(deskHeight - h - 80, 54 + index * 30)), z: ++zTop.current, min: false, max: false }
    }
    const observer = new ResizeObserver(() => {
      const next = { w: node.clientWidth, h: node.clientHeight }
      setBox(next)
      if (!opened.current && next.w > 0) {
        opened.current = true
        const open = (openKey ? openKey.split("\0") : []).filter((id) => apps.some((app) => app.id === id))
        setWins(open.map((id, index) => place(id, index, next.w, next.h)))
      }
    })
    observer.observe(node)
    return () => observer.disconnect()
  }, [apps, openKey])

  useEffect(() => {
    onOpenChange?.(wins.map((win) => win.id))
  }, [onOpenChange, wins])

  const appOf = (id: string) => apps.find((app) => app.id === id)
  const raise = (id: string) => {
    setWins((current) => current.map((win) => (win.id === id ? { ...win, z: ++zTop.current } : win)))
  }
  const open = (id: string) => {
    const existing = wins.find((win) => win.id === id)
    const app = appOf(id)
    if (!app) return
    if (existing) {
      setWins((current) => current.map((win) => (win.id === id ? { ...win, min: false, z: ++zTop.current } : win)))
      setSay(`${app.title} in front`)
      return
    }
    const w = Math.min(app.size?.w ?? 380, box.w - 24)
    const h = Math.min(app.size?.h ?? 260, box.h - 120)
    setWins((current) => [...current, { id, w, h, x: 120 + current.length * 28, y: 54 + current.length * 24, z: ++zTop.current, min: false, max: false }])
    setSay(`${app.title} opened`)
  }
  const close = (id: string) => {
    setWins((current) => current.filter((win) => win.id !== id))
    setSay(`${appOf(id)?.title ?? "Window"} closed`)
  }
  const minimise = (id: string) => {
    setWins((current) => current.map((win) => (win.id === id ? { ...win, min: true } : win)))
    setSay(`${appOf(id)?.title ?? "Window"} minimised`)
  }
  const toggleMax = (id: string) => setWins((current) => current.map((win) => (win.id === id ? { ...win, max: !win.max } : win)))
  const move = (id: string, x: number, y: number) => setWins((current) => current.map((win) => (win.id === id ? { ...win, x: Math.max(0, Math.min(box.w - 80, x)), y: Math.max(32, Math.min(box.h - 90, y)) } : win)))

  const startDrag = (event: ReactPointerEvent<HTMLElement>, win: Win) => {
    if (compact || win.max || (event.target as HTMLElement).closest("button")) return
    raise(win.id)
    const originX = event.clientX
    const originY = event.clientY
    const left = win.x
    const top = win.y
    event.currentTarget.setPointerCapture?.(event.pointerId)
    const movePointer = (pointer: PointerEvent) => move(win.id, left + pointer.clientX - originX, top + pointer.clientY - originY)
    const stop = () => {
      event.currentTarget.removeEventListener("pointermove", movePointer)
      event.currentTarget.removeEventListener("pointerup", stop)
    }
    event.currentTarget.addEventListener("pointermove", movePointer)
    event.currentTarget.addEventListener("pointerup", stop)
  }

  const front = wins.filter((win) => !win.min).sort((a, b) => b.z - a.z)[0]?.id
  const hue = (wallpaperSeed * 37) % 360

  return (
    <div ref={rootRef} className={cn("relative isolate w-full max-w-5xl overflow-hidden rounded-[1.75rem] border border-border bg-muted text-foreground motion-reduce:animate-none", className)} style={{ height }} data-motion={reduced ? "off" : "on"}>
      <div aria-hidden className="absolute inset-0 -z-10" style={{ background: `linear-gradient(145deg, hsl(${hue} 40% 28%), hsl(${(hue + 40) % 360} 45% 18%))` }} />
      <div className="absolute inset-x-0 top-0 z-[900] flex h-8 items-center justify-between bg-card/80 px-3 text-xs">
        <span className="font-semibold">{front ? appOf(front)?.title : brand}</span>
        <span className="flex items-center gap-2 text-muted-foreground"><Wifi className="size-3.5" aria-hidden /><BatteryFull className="size-4" aria-hidden /><span className="tabular-nums">{clock}</span></span>
      </div>
      <ul className="absolute top-11 left-3 z-0 flex flex-col gap-1.5">
        {apps.map((app) => (
          <li key={app.id}>
            <button type="button" data-icon={app.id} onClick={() => open(app.id)} aria-label={`Open ${app.title}`} className="flex min-h-11 w-[76px] flex-col items-center gap-1 rounded-xl p-1.5 outline-none focus-visible:ring-2 focus-visible:ring-ring">
              <span className="grid size-10 place-items-center rounded-xl bg-primary text-primary-foreground" aria-hidden>{app.icon}</span>
              <span className="rounded bg-foreground/70 px-1.5 text-[11px] text-background">{app.title}</span>
            </button>
          </li>
        ))}
      </ul>
      <AnimatePresence>
        {wins.map((win) => {
          const app = appOf(win.id)
          if (!app) return null
          const full = compact || win.max
          const hidden = win.min || (compact && front !== win.id)
          const pos = full
            ? { left: compact ? 8 : 0, top: 32, width: compact ? box.w - 16 : box.w, height: box.h - 108 }
            : { left: win.x, top: win.y, width: win.w, height: win.h }
          return (
            <motion.section key={win.id} role="group" aria-label={`${app.title} window`} aria-hidden={hidden || undefined} initial={reduced ? false : { opacity: 0, y: 12 }} animate={{ opacity: hidden ? 0 : 1, y: 0 }} exit={{ opacity: 0 }} transition={reduced ? { duration: 0 } : { duration: 0.2 }} className={cn("absolute flex flex-col overflow-hidden border border-border bg-card shadow-xl", full && !compact ? "rounded-none" : "rounded-2xl", hidden && "pointer-events-none")} style={{ ...pos, zIndex: win.z }} onPointerDown={() => raise(win.id)}>
              <div className={cn("flex h-10 shrink-0 items-center gap-2 border-b border-border bg-muted px-3", !full && "cursor-grab")} style={{ touchAction: "none" }} onPointerDown={(event) => startDrag(event, win)}>
                <button type="button" aria-label={`Close ${app.title}`} onClick={() => close(win.id)} className="grid size-5 place-items-center rounded-full bg-destructive text-primary-foreground"><X className="size-3" aria-hidden /></button>
                <button type="button" aria-label={`Minimise ${app.title}`} onClick={() => minimise(win.id)} className="grid size-5 place-items-center rounded-full bg-chart-4 text-foreground"><Minus className="size-3" aria-hidden /></button>
                {!compact ? <button type="button" aria-label={win.max ? `Restore ${app.title}` : `Maximise ${app.title}`} aria-pressed={win.max} onClick={() => toggleMax(win.id)} className="grid size-5 place-items-center rounded-full bg-chart-2 text-foreground"><Maximize2 className="size-2.5" aria-hidden /></button> : null}
                <div
                  tabIndex={full ? -1 : 0}
                  role={full ? undefined : "button"}
                  aria-label={full ? undefined : `${app.title} — move window with the arrow keys, Escape closes`}
                  onKeyDown={(event) => {
                    const step = event.shiftKey ? 48 : 16
                    const delta: Record<string, [number, number]> = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] }
                    const moveBy = delta[event.key]
                    if (moveBy && !compact && !win.max) {
                      event.preventDefault()
                      move(win.id, win.x + moveBy[0], win.y + moveBy[1])
                    } else if (event.key === "Escape") {
                      event.preventDefault()
                      close(win.id)
                    }
                  }}
                  className="min-w-0 flex-1 truncate rounded text-center text-xs font-semibold outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {app.title}
                </div>
              </div>
              <div className="min-h-0 flex-1 overflow-auto p-4 text-sm">{app.content}</div>
            </motion.section>
          )
        })}
      </AnimatePresence>
      <nav aria-label="Dock" className="absolute inset-x-0 bottom-3 z-[900] flex justify-center">
        <ul className="flex items-end gap-1.5 rounded-[1.4rem] border border-border bg-card/80 p-1.5">
          {apps.map((app) => {
            const win = wins.find((item) => item.id === app.id)
            return (
              <li key={app.id}>
                <button type="button" onClick={() => (win && !win.min && front === app.id ? minimise(app.id) : open(app.id))} aria-label={app.title} className="grid size-11 place-items-center rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-ring">
                  <span className="grid size-10 place-items-center rounded-xl bg-primary text-primary-foreground" aria-hidden>{app.icon}</span>
                </button>
              </li>
            )
          })}
        </ul>
      </nav>
      <p className="sr-only" role="status">{say}</p>
    </div>
  )
}
