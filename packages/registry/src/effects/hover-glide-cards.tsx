"use client"

// Ported from MicroKit (MIT, (c) 2026 Henrique Barone) — https://github.com/henriquegpb/microkit/blob/fd993e8/registry/microkit/hover-glide-cards.tsx

import { useEffect, useRef, useState } from "react"
import { CalendarDays, FolderOpen, Mail, NotebookPen, type LucideIcon } from "lucide-react"

import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export interface HoverGlideCardsProps {
  color?: string
  duration?: number
  intensity?: number
  speed?: number
  className?: string
}

const apps: { name: string; detail: string; icon: LucideIcon }[] = [
  { name: "Calendar", detail: "Plan your week", icon: CalendarDays },
  { name: "Mail", detail: "Triage every inbox", icon: Mail },
  { name: "Notes", detail: "Draft from meetings", icon: NotebookPen },
  { name: "Files", detail: "Find shared files", icon: FolderOpen },
]

export function HoverGlideCards({
  color = "var(--primary)",
  duration = 300,
  intensity = 10,
  speed = 1,
  className,
}: HoverGlideCardsProps) {
  const hostRef = useRef<HTMLDivElement>(null)
  const layerRef = useRef<HTMLSpanElement>(null)
  const glideRef = useRef<HTMLSpanElement>(null)
  const reduced = usePrefersReducedMotion()
  const live = useAnimationActive(hostRef)
  const [active, setActive] = useState(-1)
  const activeRef = useRef(-1)
  const glideMs = reduced || !live ? 1 : duration / Math.max(0.1, speed)

  useEffect(() => {
    const host = hostRef.current
    const layer = layerRef.current
    const glide = glideRef.current
    if (!host || !layer || !glide) return
    const tiles = Array.from(host.querySelectorAll<HTMLElement>("[data-glide-card]"))
    let shown = false

    const drawMask = () => {
      const bounds = host.getBoundingClientRect()
      const shapes = tiles
        .map((tile) => {
          const rect = tile.getBoundingClientRect()
          const x = rect.left - bounds.left + host.scrollLeft
          const y = rect.top - bounds.top + host.scrollTop
          const radius = Number.parseFloat(getComputedStyle(tile).borderTopLeftRadius) || intensity
          return `<rect x="${x}" y="${y}" width="${rect.width}" height="${rect.height}" rx="${radius}"/>`
        })
        .join("")
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${Math.max(host.scrollWidth, 1)}" height="${Math.max(host.scrollHeight, 1)}">${shapes}</svg>`
      const image = `url("data:image/svg+xml,${encodeURIComponent(svg)}")`
      layer.style.width = `${host.scrollWidth}px`
      layer.style.height = `${host.scrollHeight}px`
      layer.style.setProperty("mask-image", image)
      layer.style.setProperty("-webkit-mask-image", image)
    }

    const place = (index: number) => {
      const tile = tiles[index]
      if (!tile) return
      const bounds = host.getBoundingClientRect()
      const rect = tile.getBoundingClientRect()
      const x = rect.left - bounds.left + host.scrollLeft
      const y = rect.top - bounds.top + host.scrollTop
      if (!shown) glide.style.transition = "opacity 180ms ease"
      glide.style.transform = `translate(${x}px, ${y}px)`
      glide.style.width = `${rect.width}px`
      glide.style.height = `${rect.height}px`
      if (!shown) {
        void glide.offsetWidth
        glide.style.transition = ""
        shown = true
      }
      glide.dataset.visible = ""
    }

    const hide = () => {
      shown = false
      activeRef.current = -1
      delete glide.dataset.visible
      setActive(-1)
    }

    const select = (event: Event) => {
      const target = event.target
      const tile = target instanceof Element ? target.closest("[data-glide-card]") : null
      const index = tile ? tiles.indexOf(tile as HTMLElement) : -1
      if (index < 0) return
      if (!shown || index !== activeRef.current) drawMask()
      activeRef.current = index
      setActive(index)
      place(index)
    }

    host.addEventListener("pointerover", select)
    host.addEventListener("focusin", select)
    host.addEventListener("pointerdown", select)
    host.addEventListener("pointerleave", hide)
    const onFocusOut = (event: FocusEvent) => {
      const inside = event.relatedTarget instanceof Node && host.contains(event.relatedTarget)
      if (!inside) hide()
    }
    host.addEventListener("focusout", onFocusOut)
    let reflow: ResizeObserver | undefined
    if (typeof ResizeObserver !== "undefined") {
      reflow = new ResizeObserver(() => {
        if (!shown) return
        drawMask()
        const current = tiles.findIndex((tile) => tile.dataset.active === "true")
        if (current >= 0) place(current)
      })
      reflow.observe(host)
    }
    return () => {
      host.removeEventListener("pointerover", select)
      host.removeEventListener("focusin", select)
      host.removeEventListener("pointerdown", select)
      host.removeEventListener("pointerleave", hide)
      host.removeEventListener("focusout", onFocusOut)
      reflow?.disconnect()
    }
  }, [intensity])

  return (
    <div
      ref={hostRef}
      role="group"
      aria-label="Workspace apps"
      data-slot="hover-glide-cards"
      data-motion={live && !reduced ? "on" : "off"}
      className={cn("relative grid w-full max-w-60 grid-cols-2 gap-1.5 motion-reduce:transition-none", className)}
    >
      <span ref={layerRef} aria-hidden="true" className="pointer-events-none absolute top-0 left-0 z-[1] block">
        <span
          ref={glideRef}
          className="pointer-events-none absolute top-0 left-0 block h-0 w-0 opacity-0 data-[visible]:opacity-100 motion-reduce:transition-none"
          style={{
            borderRadius: intensity,
            background: `color-mix(in srgb, ${color} 22%, transparent)`,
            transition: `transform ${glideMs}ms cubic-bezier(.32,.72,0,1), width ${glideMs}ms cubic-bezier(.32,.72,0,1), height ${glideMs}ms cubic-bezier(.32,.72,0,1), opacity 180ms ease`,
          }}
        />
      </span>
      {apps.map((app, index) => (
        <button
          key={app.name}
          type="button"
          data-glide-card=""
          data-active={active === index ? "true" : "false"}
          className="m-0 flex min-w-0 cursor-pointer flex-col items-start rounded-[10px] border border-border bg-card p-2 text-left text-card-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          <span className="mb-1.5 grid size-5 place-items-center rounded-md bg-muted text-muted-foreground" style={{ color }}>
            <app.icon size={12} strokeWidth={1.8} aria-hidden="true" />
          </span>
          <span className="max-w-full truncate text-xs font-semibold leading-4">{app.name}</span>
          <span className="mt-px max-w-full truncate text-[11px] leading-4 text-muted-foreground">{app.detail}</span>
        </button>
      ))}
    </div>
  )
}
