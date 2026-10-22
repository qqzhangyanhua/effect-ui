"use client"

// Ported from AI Canvas (MIT, (c) 2026 AI Canvas) — https://github.com/uiNerd16/aicanvas/blob/main/components-workspace/stack-tower/index.tsx

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { useAnimationActive } from "@/hooks/use-animation-active"
import React, { useEffect, useMemo, useRef, useState, type RefObject } from "react"
import {
  motion,
  motionValue,
  useAnimationFrame,
  useTransform,
} from "motion/react"
import type { MotionValue } from "motion/react"


const ROW_COUNT = 12
const AMPLITUDE_PX = 22
const HOVER_SCALE_BOOST = 0.1
const HOVER_EASE_RATE = 10

function useTheme(ref: React.RefObject<HTMLElement | null>) {
  const [theme, setTheme] = useState<'light' | 'dark'>('dark')
  useEffect(() => {
    const element = ref.current
    if (!element) return
    const read = () => {
      const scope = element.closest('[data-card-theme]') as HTMLElement | null
      if (scope) {
        setTheme(scope.dataset.cardTheme === 'dark' ? 'dark' : 'light')
        return
      }
      setTheme(document.documentElement.classList.contains('dark') ? 'dark' : 'light')
    }
    read()
    const observers: MutationObserver[] = []
    let current: HTMLElement | null = element
    while (current) {
      const o = new MutationObserver(read)
      o.observe(current, { attributes: true, attributeFilter: ['class', 'data-card-theme'] })
      observers.push(o)
      current = current.parentElement
    }
    return () => observers.forEach((o) => o.disconnect())
  }, [ref])
  return { theme }
}

type RowProps = {
  text: string
  rowIndex: number
  phase: MotionValue<number>
  hover: MotionValue<number>
  fg: string
  dim: string
  accent: string
  fontSize: string
  onEnter: (i: number) => void
  onLeave: (i: number) => void
}

function TowerRow({
  text,
  rowIndex,
  phase,
  hover,
  fg,
  dim,
  accent,
  fontSize,
  onEnter,
  onLeave,
}: RowProps) {
  const rowOffset = rowIndex * 0.35

  const transform = useTransform([phase, hover], ([p, h]) => {
    const local = (p as number) * Math.PI * 2 + rowOffset
    const scaleX = 0.55 + 0.45 * Math.cos(local)
    const shiftX = Math.sin(local) * AMPLITUDE_PX
    const skewX = Math.sin(local) * 6
    const boost = 1 + (h as number) * HOVER_SCALE_BOOST
    return `translateX(${shiftX}px) skewX(${skewX}deg) scale(${
      Math.max(0.08, scaleX) * boost
    }, ${boost})`
  })

  const color = useTransform([phase, hover], ([p, h]) => {
    const local = (p as number) * Math.PI * 2 + rowOffset
    const tt = (Math.cos(local) + 1) / 2
    const base = mix(dim, fg, tt)
    const hv = h as number
    if (hv < 0.002) return base
    return mix(base, accent, hv)
  })

  return (
    <div
      onPointerEnter={() => onEnter(rowIndex)}
      onPointerLeave={() => onLeave(rowIndex)}
      onPointerDown={() => onEnter(rowIndex)}
      onPointerUp={() => onLeave(rowIndex)}
      onPointerCancel={() => onLeave(rowIndex)}
      style={{
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
        cursor: 'pointer',
        touchAction: 'pan-y',
      }}
    >
      <motion.div
        style={{
          fontFamily:
            'ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif',
          fontWeight: 900,
          fontSize,
          lineHeight: 0.92,
          letterSpacing: '-0.03em',
          textAlign: 'center',
          whiteSpace: 'nowrap',
          transform,
          color,
          willChange: 'transform, color',
          userSelect: 'none',
        }}
      >
        {text}
      </motion.div>
    </div>
  )
}


function mix(a: string, b: string, t: number): string {
  if (!a.startsWith("#") || !b.startsWith("#")) return t > 0.5 ? b : a
  const pa = parseInt(a.slice(1), 16)
  const pb = parseInt(b.slice(1), 16)
  const ar = (pa >> 16) & 0xff
  const ag = (pa >> 8) & 0xff
  const ab = pa & 0xff
  const br = (pb >> 16) & 0xff
  const bg = (pb >> 8) & 0xff
  const bb = pb & 0xff
  const r = Math.round(ar + (br - ar) * t)
  const g = Math.round(ag + (bg - ag) * t)
  const bl = Math.round(ab + (bb - ab) * t)
  return `#${((r << 16) | (g << 8) | bl).toString(16).padStart(6, '0')}`
}

export interface StackTowerProps {
  /** Words painted down the cylinder. They repeat to fill twelve rows. */
  rows?: string[]
  /** Turns per second. @default 0.2 */
  speed?: number
  /** Row type size, in pixels. @default 72 */
  fontSize?: number
  /** Hover accent. Defaults to the primary token. */
  color?: string
  className?: string
}

const DEFAULT_ROWS = ["STACK", "TOWER"]

export function StackTower({
  rows = DEFAULT_ROWS,
  speed = 0.2,
  fontSize = 72,
  color = "var(--primary)",
  className = "",
}: StackTowerProps = {}) {
  const rootRef = useRef<HTMLDivElement>(null)
  const { theme } = useTheme(rootRef)
  const isDark = theme === 'dark'

  const bg = isDark ? '#0A0A0A' : '#EFEEE6'
  const fg = isDark ? '#EFEEE6' : '#0A0A0A'
  const dim = isDark ? '#3A3936' : '#C7C3B8'
  const accent = color
  const fadeTop = isDark
    ? 'linear-gradient(to bottom, #0A0A0A 0%, rgba(10,10,10,0) 100%)'
    : 'linear-gradient(to bottom, #EFEEE6 0%, rgba(239,238,230,0) 100%)'
  const fadeBot = isDark
    ? 'linear-gradient(to top, #0A0A0A 0%, rgba(10,10,10,0) 100%)'
    : 'linear-gradient(to top, #EFEEE6 0%, rgba(239,238,230,0) 100%)'

  const reducedMotion = usePrefersReducedMotion()
  const live = useAnimationActive(rootRef as RefObject<Element | null>)
  const speedRef = useRef(speed)
  const liveRef = useRef(live)
  useEffect(() => {
    speedRef.current = speed
    liveRef.current = live
  }, [speed, live])

  const hoveredIndexRef = useRef<number | null>(null)

  const phases = useMemo<MotionValue<number>[]>(
    () => Array.from({ length: ROW_COUNT }, () => motionValue(0)),
    [],
  )

  const hovers = useMemo<MotionValue<number>[]>(
    () => Array.from({ length: ROW_COUNT }, () => motionValue(0)),
    [],
  )

  const hoverEased = useRef<number[]>(Array(ROW_COUNT).fill(0))
  const prevTs = useRef<number | null>(null)

  useAnimationFrame((t) => {
    if (reducedMotion || !liveRef.current) {
      if (reducedMotion) phases.forEach((p, i) => p.set(0.2 + i * 0.03))
      prevTs.current = null
      return
    }
    const last = prevTs.current
    prevTs.current = t
    if (last == null) return

    const dtSec = (t - last) / 1000
    const phaseDt = dtSec * Math.max(0.05, speedRef.current)
    const alpha = 1 - Math.exp(-HOVER_EASE_RATE * dtSec)

    const hov = hoveredIndexRef.current
    for (let i = 0; i < ROW_COUNT; i++) {
      const phase = phases[i]
      if (phase) phase.set(phase.get() + phaseDt)

      const target = i === hov ? 1 : 0
      const cur = hoverEased.current[i] ?? 0
      const next = cur + (target - cur) * alpha
      hoverEased.current[i] = next
      hovers[i]?.set(next)
    }
  })

  const handleEnter = (i: number) => {
    hoveredIndexRef.current = i
  }
  const handleLeave = (i: number) => {
    if (hoveredIndexRef.current === i) hoveredIndexRef.current = null
  }

  const painted = Array.from({ length: ROW_COUNT }, (_, i) => rows[i % rows.length] ?? "")

  return (
    <div
      ref={rootRef}
      data-reduced={reducedMotion ? "true" : "false"}
      data-motion={live && !reducedMotion ? "on" : "off"}
      className={`motion-reduce:transition-none flex min-h-80 w-full items-center justify-center overflow-hidden ${className}`}
      style={{ backgroundColor: bg }}
    >
      <div
        className="relative flex flex-col items-center justify-center"
        style={{ width: 'min(92vw, 620px)' }}
      >
        {painted.map((word, i) => {
          const phase = phases[i]
          const hover = hovers[i]
          if (!phase || !hover) return null
          return (
          <TowerRow
            key={i}
            text={word}
            rowIndex={i}
            phase={phase}
            hover={hover}
            fg={fg}
            dim={dim}
            accent={accent}
            fontSize={`${fontSize}px`}
            onEnter={handleEnter}
            onLeave={handleLeave}
          />
          )
        })}

        <div
          aria-hidden
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: 0,
            height: '22%',
            background: fadeTop,
            pointerEvents: 'none',
          }}
        />
        <div
          aria-hidden
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 0,
            height: '22%',
            background: fadeBot,
            pointerEvents: 'none',
          }}
        />
      </div>
    </div>
  )
}
