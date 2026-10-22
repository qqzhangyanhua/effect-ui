"use client"

// Ported from Neobrutalism components (MIT, (c) 2023 Samuel Breznjak) — https://github.com/ekmas/neobrutalism-components/blob/main/src/components/app/landing/star-field.tsx. Modified for effect-ui.

import { useRef, type HTMLAttributes, type ReactNode } from "react"

import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

import { NeoStarShapes } from "./neo-star-shapes"

const DEFAULT_SHAPES = [9, 20, 13, 32, 8, 26, 1, 14, 4, 22, 11, 37, 29, 6, 16, 10, 39] as const

export interface StarRingOrbitProps extends HTMLAttributes<HTMLDivElement> {
  count?: number
  size?: number
  color?: string
  shapes?: readonly number[]
  children?: ReactNode
}

function mulberry32(seed: number) {
  let state = seed
  return () => {
    state |= 0
    state = (state + 0x6d2b79f5) | 0
    let value = Math.imul(state ^ (state >>> 15), 1 | state)
    value = (value + Math.imul(value ^ (value >>> 7), 61 | value)) ^ value
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296
  }
}

function ring(count: number, shapes: readonly number[]) {
  const random = mulberry32(11)
  const samples = 720
  const lengths: number[] = [0]
  for (let index = 1; index <= samples; index += 1) {
    const previous = (2 * Math.PI * (index - 1)) / samples
    const next = (2 * Math.PI * index) / samples
    const dx = Math.cos(next) - Math.cos(previous)
    const dy = Math.sin(next) - Math.sin(previous)
    lengths.push((lengths[index - 1] ?? 0) + Math.hypot(dx, dy))
  }
  const total = lengths[samples] ?? 0
  const pool = shapes.length > 0 ? shapes : DEFAULT_SHAPES
  return Array.from({ length: Math.max(0, count) }, (_, index) => {
    const target = (index / Math.max(count, 1)) * total
    let sample = 0
    while (sample < samples && (lengths[sample + 1] ?? total) < target) sample += 1
    const angle = (2 * Math.PI * sample) / samples
    const shape = pool[Math.floor(random() * pool.length)] ?? pool[0] ?? 1
    const percent = (value: number) => Math.round(value * 100) / 100
    return {
      shape,
      x: percent(50 + 50 * Math.cos(angle)),
      y: percent(50 + 50 * Math.sin(angle)),
      rotate: Math.round(random() * 60 - 30),
    }
  })
}

export function StarRingOrbit({
  count = 26,
  size = 90,
  color = "currentColor",
  shapes = DEFAULT_SHAPES,
  children,
  className,
  ...props
}: StarRingOrbitProps) {
  const ref = useRef<HTMLDivElement>(null)
  const reduced = usePrefersReducedMotion()
  const motionOn = useAnimationActive(ref)
  const moving = motionOn && !reduced
  const placements = ring(count, shapes)

  return (
    <div
      ref={ref}
      {...props}
      data-slot="star-ring-orbit"
      data-reduced={reduced ? "true" : "false"}
      data-motion={moving ? "on" : "off"}
      className={cn("relative isolate min-h-11", className)}
    >
      <style>
        {`:where([data-slot="star-ring-orbit"]) { --rx: max(300px, calc(50dvh - 67px)); --ry: max(300px, calc(50dvh - 67px)); }
@supports not (height: 1dvh) {
  :where([data-slot="star-ring-orbit"]) { --rx: max(300px, calc(50vh - 67px)); --ry: max(300px, calc(50vh - 67px)); }
}
@media (min-width: 768px) {
  :where([data-slot="star-ring-orbit"]) { --rx: 760px; --ry: 760px; }
}
@keyframes star-ring-orbit { from { rotate: 0deg; } to { rotate: 360deg; } }
[data-slot="star-ring-orbit"][data-motion="on"] [data-part="ring"] { animation: star-ring-orbit 180s linear infinite; }
[data-slot="star-ring-orbit"][data-motion="on"] [data-part="star"] { animation: star-ring-orbit 180s linear infinite reverse; }`}
      </style>
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          data-slot="star-ring"
          data-part="ring"
          className="absolute top-1/2 left-1/2 h-[calc(var(--ry)*2)] w-[calc(var(--rx)*2)] -translate-x-1/2 -translate-y-1/2 max-md:top-[calc(50%+35px)]"
        >
          {placements.map((star, index) => (
            <div
              key={`${star.shape}-${index}`}
              data-part="star"
              className="absolute -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${star.x}%`, top: `${star.y}%` }}
            >
              <NeoStarShapes
                color={color}
                shape={star.shape}
                size={size}
                stroke="var(--border)"
                strokeWidth={4}
                className="block max-md:scale-[0.6]"
                style={{ transform: `rotate(${star.rotate}deg)` }}
              />
            </div>
          ))}
        </div>
      </div>
      <div className="relative z-10 flex min-h-11 items-center justify-center">{children}</div>
    </div>
  )
}
