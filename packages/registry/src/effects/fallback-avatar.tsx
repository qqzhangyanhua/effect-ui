"use client"

// Ported from Spell UI (MIT, (c) 2025 Spell UI) — https://github.com/xxtomm/spell-ui/blob/main/registry/spell-ui/fallback-avatar.tsx

import { useId, useRef, useState, type PointerEvent } from "react"

import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export interface FallbackAvatarProps {
  name?: string
  size?: number
  className?: string
}

function hueOf(name: string) {
  let hash = 0
  for (let index = 0; index < name.length; index += 1) {
    hash = Math.imul(hash ^ name.charCodeAt(index), 2654435761)
  }
  return (hash >>> 0) % 360
}

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean).slice(0, 2)
  const letters = parts.map((part) => part.charAt(0).toUpperCase()).join("")
  return letters || "?"
}

function cssName(id: string) {
  return `avatar-${id.replace(/[^a-zA-Z0-9_-]/g, "")}`
}

export function FallbackAvatar({ name = "Ada Lovelace", size = 64, className }: FallbackAvatarProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const live = useAnimationActive(rootRef)
  const reduced = usePrefersReducedMotion()
  const [hot, setHot] = useState(false)
  const animation = cssName(useId())
  const hue = hueOf(name)
  const moving = hot && live && !reduced

  function arm(event: PointerEvent<HTMLDivElement>, next: boolean) {
    if (event.pointerType === "touch" && !next) {
      setHot(false)
      return
    }
    if (event.pointerType === "touch") {
      setHot(true)
      return
    }
    setHot(next)
  }

  return (
    <div
      ref={rootRef}
      role="img"
      aria-label={name}
      tabIndex={0}
      onFocus={() => setHot(true)}
      onBlur={() => setHot(false)}
      onPointerEnter={(event) => arm(event, true)}
      onPointerLeave={(event) => arm(event, false)}
      onPointerDown={(event) => {
        if (event.pointerType === "touch") setHot(true)
      }}
      onPointerUp={(event) => {
        if (event.pointerType === "touch") setHot(false)
      }}
      className={cn(
        "inline-flex items-center justify-center rounded-full font-semibold text-white outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:animate-none",
        className,
      )}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        fontSize: `${Math.max(12, Math.round(size * 0.34))}px`,
        backgroundImage: `radial-gradient(circle at 30% 28%, hsl(${hue} 72% 74%), transparent 52%), radial-gradient(circle at 72% 68%, hsl(${(hue + 42) % 360} 68% 46%), transparent 48%), hsl(${hue} 42% 32%)`,
        backgroundSize: "140% 140%",
        animationName: moving ? animation : "none",
        animationDuration: "2.8s",
        animationTimingFunction: "ease-in-out",
        animationIterationCount: "infinite",
        animationDirection: "alternate",
        animationPlayState: moving ? "running" : "paused",
      }}
    >
      <style>{`@keyframes ${animation} { from { background-position: 20% 30%; } to { background-position: 80% 70%; } }`}</style>
      {initials(name)}
    </div>
  )
}
