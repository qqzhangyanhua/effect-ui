"use client"

import { useRef, useState, type CSSProperties, type MouseEvent } from "react"
import { flushSync } from "react-dom"

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/cn"

/**
 * Original implementation.
 * A circular reveal from the button toggles light and dark on this surface.
 */

export interface ThemeRevealToggleProps {
  duration?: number
  size?: number
  color?: string
  className?: string
}

const LIGHT_SURFACE = {
  "--background": "oklch(0.985 0.01 95)",
  "--foreground": "oklch(0.2 0.03 280)",
  "--card": "oklch(0.995 0.005 95)",
  "--card-foreground": "oklch(0.2 0.03 280)",
  "--muted": "oklch(0.95 0.015 95)",
  "--muted-foreground": "oklch(0.5 0.03 280)",
  "--primary": "oklch(0.5 0.2 292)",
  "--primary-foreground": "oklch(0.985 0.01 95)",
  "--border": "oklch(0.9 0.02 280)",
  "--ring": "oklch(0.5 0.2 292)",
}

const DARK_SURFACE = {
  "--background": "oklch(0.17 0.03 280)",
  "--foreground": "oklch(0.97 0.01 95)",
  "--card": "oklch(0.21 0.03 280)",
  "--card-foreground": "oklch(0.97 0.01 95)",
  "--muted": "oklch(0.27 0.025 280)",
  "--muted-foreground": "oklch(0.72 0.03 280)",
  "--primary": "oklch(0.76 0.16 292)",
  "--primary-foreground": "oklch(0.18 0.04 280)",
  "--border": "oklch(1 0 0 / 10%)",
  "--ring": "oklch(0.76 0.16 292)",
}

const REVEAL_CSS = `
::view-transition-old(theme-reveal),
::view-transition-new(theme-reveal) {
  mix-blend-mode: normal;
  animation: none;
}
::view-transition-old(theme-reveal) {
  z-index: 1;
}
::view-transition-new(theme-reveal) {
  z-index: 2;
  animation: theme-reveal-clip var(--theme-reveal-duration, 640ms) ease-in both;
}
@keyframes theme-reveal-clip {
  from {
    clip-path: circle(var(--theme-reveal-start, 0px) at var(--theme-reveal-x, 50%) var(--theme-reveal-y, 50%));
  }
  to {
    clip-path: circle(var(--theme-reveal-radius, 150%) at var(--theme-reveal-x, 50%) var(--theme-reveal-y, 50%));
  }
}
`

type RevealOrigin = {
  x: number
  y: number
  radius: number
}

type Box = {
  left: number
  top: number
  width: number
  height: number
}

function clamp(value: number, min: number, max: number, fallback: number) {
  if (!Number.isFinite(value)) return fallback
  return Math.min(max, Math.max(min, Math.round(value)))
}

export function surfaceTokens(dark: boolean) {
  return dark ? DARK_SURFACE : LIGHT_SURFACE
}

export function revealCenter(surface: Box, button: Box) {
  return {
    x: button.left + button.width / 2 - surface.left,
    y: button.top + button.height / 2 - surface.top,
  }
}

export function revealRadius(width: number, height: number, x: number, y: number) {
  const dx = Math.max(x, width - x)
  const dy = Math.max(y, height - y)
  return Math.round(Math.hypot(dx, dy))
}

export function revealDuration(duration: number) {
  return clamp(duration, 240, 1400, 640)
}

export function revealButtonSize(size: number) {
  return clamp(size, 28, 72, 44)
}

export function revealStart(size: number) {
  return revealButtonSize(size) / 2
}

export function revealFill(color: string | undefined) {
  const given = color?.trim()
  if (given) return given
  return "var(--primary)"
}

function measureReveal(surface: HTMLElement, button: HTMLElement, size: number): RevealOrigin {
  const surfaceBox = surface.getBoundingClientRect()
  const buttonBox = button.getBoundingClientRect()
  const center = revealCenter(surfaceBox, buttonBox)
  const start = revealStart(size)
  return {
    x: center.x,
    y: center.y,
    radius: Math.max(revealRadius(surfaceBox.width, surfaceBox.height, center.x, center.y), start),
  }
}

function SunMark() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M18.4 5.6 17 7M7 17l-1.4 1.4" />
    </svg>
  )
}

function MoonMark() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M16 3.2A8 8 0 1 0 20.8 14 6.2 6.2 0 0 1 16 3.2Z" />
    </svg>
  )
}

export function ThemeRevealToggle({
  duration = 640,
  size = 44,
  color,
  className,
}: ThemeRevealToggleProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const reduced = usePrefersReducedMotion()
  const [dark, setDark] = useState(false)
  const [origin, setOrigin] = useState<RevealOrigin | null>(null)
  const ms = revealDuration(duration)
  const buttonSize = revealButtonSize(size)
  const style = {
    ...surfaceTokens(dark),
    viewTransitionName: "theme-reveal",
    "--theme-reveal-duration": `${ms}ms`,
    "--theme-reveal-x": origin ? `${origin.x}px` : "50%",
    "--theme-reveal-y": origin ? `${origin.y}px` : "50%",
    "--theme-reveal-radius": origin ? `${origin.radius}px` : "150%",
    "--theme-reveal-start": `${revealStart(size)}px`,
  } as CSSProperties

  function toggle(event: MouseEvent<HTMLButtonElement>) {
    const next = !dark
    const surface = rootRef.current
    const startView = document.startViewTransition
    if (!surface || reduced || typeof startView !== "function") {
      setDark(next)
      return
    }
    const nextOrigin = measureReveal(surface, event.currentTarget, size)
    flushSync(() => {
      setOrigin(nextOrigin)
    })
    try {
      startView(() => {
        flushSync(() => {
          setDark(next)
        })
      })
    } catch {
      setDark(next)
    }
  }

  return (
    <div
      ref={rootRef}
      data-slot="theme-reveal-toggle"
      data-theme={dark ? "dark" : "light"}
      className={cn(
        "relative grid gap-4 overflow-hidden rounded-2xl border border-border bg-background p-6 text-foreground",
        dark && "dark",
        className,
      )}
      style={style}
    >
      <style>{REVEAL_CSS}</style>
      <div className="grid gap-2">
        <p className="text-xs tracking-[0.22em] text-muted-foreground uppercase">Surface</p>
        <h2 className="text-xl font-medium">Reading room</h2>
        <p className="max-w-sm text-sm leading-6 text-muted-foreground">
          This page stays inside the frame. The other theme opens in a circle from the button.
        </p>
      </div>
      <div className="flex items-center gap-3">
        <button
          type="button"
          aria-pressed={dark}
          aria-label={dark ? "Switch to light theme" : "Switch to dark theme"}
          onClick={toggle}
          className="grid shrink-0 place-items-center rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          style={{
            width: buttonSize,
            height: buttonSize,
            background: revealFill(color),
            color: color?.trim() ? "var(--background)" : "var(--primary-foreground)",
          }}
        >
          {dark ? <MoonMark /> : <SunMark />}
        </button>
        <p className="text-sm">{dark ? "Dark theme" : "Light theme"}</p>
      </div>
    </div>
  )
}
