"use client"

import { useRef, useState, type CSSProperties, type PointerEvent, type ReactNode } from "react"

import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export interface PointerTiltGlareProps {
  maxTilt?: number
  glare?: number
  speed?: number
  className?: string
  children?: ReactNode
}

interface Pose {
  rx: number
  ry: number
  gx: number
  gy: number
  on: boolean
}

const FLAT: Pose = { rx: 0, ry: 0, gx: 50, gy: 50, on: false }

function rateOf(speed: number) {
  return Number.isFinite(speed) && speed > 0 ? speed : 1
}

function blockedPointer() {
  return window.matchMedia("(pointer: coarse)").matches
}

export function PointerTiltGlare({ maxTilt = 12, glare = 0.55, speed = 1, className, children }: PointerTiltGlareProps) {
  const ref = useRef<HTMLDivElement>(null)
  const reduced = usePrefersReducedMotion()
  const live = useAnimationActive(ref)
  const [pose, setPose] = useState<Pose>(FLAT)
  const rate = rateOf(speed)
  const active = live && !reduced
  const shown = active ? pose : FLAT
  const ms = Math.round(220 / rate)

  function onPointerMove(event: PointerEvent<HTMLDivElement>) {
    if (!active || event.pointerType === "touch" || blockedPointer()) return
    const rect = event.currentTarget.getBoundingClientRect()
    if (rect.width <= 0 || rect.height <= 0) return
    const px = (event.clientX - rect.left) / rect.width
    const py = (event.clientY - rect.top) / rect.height
    setPose({
      rx: (py - 0.5) * -maxTilt,
      ry: (px - 0.5) * maxTilt,
      gx: px * 100,
      gy: py * 100,
      on: true,
    })
  }

  return (
    <div
      ref={ref}
      data-slot="pointer-tilt-glare"
      data-motion={active ? "on" : "off"}
      className={cn(
        "relative overflow-hidden rounded-2xl border border-border bg-card text-card-foreground shadow-sm [transform-style:preserve-3d] motion-reduce:transform-none motion-reduce:transition-none",
        className,
      )}
      style={
        {
          transform: active ? `perspective(900px) rotateX(${shown.rx}deg) rotateY(${shown.ry}deg)` : "none",
          transition: reduced ? "none" : `transform ${ms}ms ease-out`,
        } as CSSProperties
      }
      onPointerMove={onPointerMove}
      onPointerLeave={() => setPose(FLAT)}
    >
      {children}
      <span
        aria-hidden
        data-slot="pointer-tilt-glare-sheen"
        className="pointer-events-none absolute inset-0 motion-reduce:opacity-0"
        style={{
          opacity: shown.on ? glare : 0,
          background: `radial-gradient(420px circle at ${shown.gx}% ${shown.gy}%, color-mix(in oklab, white 78%, var(--primary)), transparent 46%)`,
          transition: reduced ? "none" : `opacity ${ms}ms linear`,
        }}
      />
    </div>
  )
}
