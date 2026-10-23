"use client"

// Ported from Sera UI (MIT, (c) 2025 Sera UI) — https://github.com/seraui/seraui/blob/main/src/app/docs/network/network.tsx

import { useEffect, useId, useRef, useState } from "react"

import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

interface GraphNode {
  id: string
  name: string
}

export interface NetworkGraphProps {
  nodes?: readonly GraphNode[]
  color?: string
  className?: string
}

const defaultNodes: readonly GraphNode[] = [
  { id: "hub", name: "Hub" },
  { id: "n1", name: "Avery" },
  { id: "n2", name: "Blair" },
  { id: "n3", name: "Casey" },
  { id: "n4", name: "Drew" },
  { id: "n5", name: "Eden" },
  { id: "n6", name: "Finn" },
]

function cssName(id: string) {
  return `net-${id.replace(/[^a-zA-Z0-9_-]/g, "")}`
}

function place(index: number, total: number) {
  const angle = -Math.PI / 2 + (index / total) * Math.PI * 2
  return { x: 160 + Math.cos(angle) * 112, y: 160 + Math.sin(angle) * 112 }
}

export function NetworkGraph({ nodes = defaultNodes, color = "var(--primary)", className }: NetworkGraphProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const live = useAnimationActive(rootRef)
  const reduced = usePrefersReducedMotion()
  const animation = cssName(useId())
  const people = nodes.length > 0 ? nodes : defaultNodes
  const center = people[0] ?? { id: "hub", name: "Hub" }
  const ring = people.slice(1)
  const positions = new Map<string, { x: number; y: number }>()
  positions.set(center.id, { x: 160, y: 160 })
  ring.forEach((node, index) => positions.set(node.id, place(index, Math.max(1, ring.length))))
  const links = ring.map((node) => node.id)
  const [step, setStep] = useState(0)
  const activeId = links.length === 0 ? "" : (links[(reduced ? 0 : step) % links.length] ?? "")
  const moving = live && !reduced && links.length > 1

  useEffect(() => {
    if (!moving) return
    const timer = window.setInterval(() => setStep((current) => current + 1), 2400)
    return () => window.clearInterval(timer)
  }, [moving])

  const from = center ? positions.get(center.id) : undefined
  const to = activeId ? positions.get(activeId) : undefined
  const length = from && to ? Math.hypot(to.x - from.x, to.y - from.y) : 0

  return (
    <div ref={rootRef} className={cn("relative mx-auto", className)} style={{ width: "320px", height: "320px", maxWidth: "100%" }}>
      <style>{`@keyframes ${animation} { to { stroke-dashoffset: 0; } }`}</style>
      <svg viewBox="0 0 320 320" className="absolute inset-0 h-full w-full">
        <circle cx="160" cy="160" r="112" fill="none" stroke="var(--border)" strokeDasharray="4 6" />
        {from && to ? (
          <line
            key={activeId}
            x1={from.x}
            y1={from.y}
            x2={to.x}
            y2={to.y}
            stroke={color}
            strokeWidth="2"
            strokeDasharray={length}
            strokeDashoffset={reduced ? 0 : length}
            className="motion-reduce:[animation:none]"
            style={{
              animationName: moving ? animation : "none",
              animationDuration: "1.6s",
              animationTimingFunction: "linear",
              animationFillMode: "forwards",
              animationPlayState: moving ? "running" : "paused",
            }}
          />
        ) : null}
      </svg>
      {people.map((node) => {
        const point = positions.get(node.id)
        if (!point) return null
        const active = node.id === center?.id || node.id === activeId
        return (
          <button
            key={node.id}
            type="button"
            aria-label={node.name}
            className={cn(
              "group absolute flex size-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border bg-card text-xs font-semibold text-card-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring",
              active ? "border-primary" : "border-border",
            )}
            style={{ left: `${point.x}px`, top: `${point.y}px`, color: active ? color : undefined }}
            onClick={() => {
              const linkIndex = links.indexOf(node.id)
              if (linkIndex >= 0) setStep(linkIndex)
            }}
          >
            <span aria-hidden="true">{node.name.slice(0, 1)}</span>
            <span
              aria-hidden="true"
              className={cn(
                "pointer-events-none absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-foreground px-2 py-0.5 text-[11px] text-background",
                active ? "opacity-100" : "opacity-0 group-focus:opacity-100",
              )}
            >
              {node.name}
            </span>
          </button>
        )
      })}
    </div>
  )
}
