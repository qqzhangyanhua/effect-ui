"use client"

// Ported from UI Layouts (MIT, (c) 2024 UI LAYOUT) — https://github.com/ui-layouts/uilayouts/blob/main/apps/ui-layout/components/ui/spotlight.tsx. Modified for effect-ui.

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

import { Children, useEffect, useState, type HTMLAttributes, type MouseEvent, type ReactNode } from "react"

export interface SpotlightGroupProps extends HTMLAttributes<HTMLDivElement> {
  mode?: "proximity" | "hover-focus" | "cursor-flow"
  color?: string
  children?: ReactNode
}

export function SpotlightGroup({
  mode = "proximity",
  color = "var(--foreground)",
  className,
  children,
  ...props
}: SpotlightGroupProps) {
  const reduced = usePrefersReducedMotion()
  const [pointer, setPointer] = useState({ x: 0, y: 0 })
  const [groupHover, setGroupHover] = useState(false)

  useEffect(() => {
    if (reduced || mode === "cursor-flow") return
    const onMove = (event: globalThis.MouseEvent) => setPointer({ x: event.clientX, y: event.clientY })
    window.addEventListener("mousemove", onMove)
    return () => window.removeEventListener("mousemove", onMove)
  }, [mode, reduced])

  return (
    <div
      {...props}
      className={cn("grid gap-3 sm:grid-cols-2", className)}
      data-mode={mode}
      data-reduced={reduced ? "true" : "false"}
      data-slot="spotlight-group"
      onMouseEnter={() => setGroupHover(true)}
      onMouseLeave={() => setGroupHover(false)}
    >
      {Children.map(children, (child, index) => (
        <SpotlightCell
          color={color}
          groupHover={groupHover}
          key={index}
          mode={mode}
          pointer={pointer}
          reduced={reduced}
        >
          {child}
        </SpotlightCell>
      ))}
    </div>
  )
}

function SpotlightCell({
  children,
  mode,
  color,
  pointer,
  groupHover,
  reduced,
}: {
  children: ReactNode
  mode: NonNullable<SpotlightGroupProps["mode"]>
  color: string
  pointer: { x: number; y: number }
  groupHover: boolean
  reduced: boolean
}) {
  const [local, setLocal] = useState({ x: 0, y: 0 })
  const [hovered, setHovered] = useState(false)
  const move = (event: MouseEvent<HTMLDivElement>) => {
    const box = event.currentTarget.getBoundingClientRect()
    setLocal({ x: event.clientX - box.left, y: event.clientY - box.top })
  }
  const showFlow = mode === "cursor-flow" && hovered && !reduced
  const showFocus = mode === "hover-focus" && groupHover && !reduced
  const showProximity = mode === "proximity" && !reduced
  return (
    <div
      className={cn("relative overflow-hidden rounded-xl border bg-card p-4", reduced ? "transition-none" : "transition-shadow")}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onMouseMove={move}
    >
      {showFlow ? (
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: `radial-gradient(160px circle at ${local.x}px ${local.y}px, color-mix(in oklab, ${color} 28%, transparent), transparent 70%)` }}
        />
      ) : null}
      {showFocus ? (
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: `radial-gradient(circle at ${pointer.x}px ${pointer.y}px, color-mix(in oklab, ${color} 35%, transparent) 0%, transparent 18%) fixed` }}
        />
      ) : null}
      {showProximity ? (
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: `radial-gradient(circle at ${pointer.x}px ${pointer.y}px, color-mix(in oklab, ${color} 24%, transparent) 0%, transparent 20%) fixed` }}
        />
      ) : null}
      <div className="relative z-10">{children}</div>
    </div>
  )
}
