"use client"

// Ported from Fancy Components (MIT, (c) 2024 Daniel Petho) — https://github.com/danielpetho/fancy/blob/main/src/fancy/components/text/text-cursor-proximity.tsx

import { useAnimationActive } from "@/hooks/use-animation-active"
import { useMousePositionRef } from "@/hooks/use-mouse-position-ref"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

import { useAnimationFrame } from "motion/react"
import { useEffect, useRef, type CSSProperties, type ElementType, type RefObject } from "react"

type StyleStop = { from: string | number; to: string | number }

export interface TextCursorProximityProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode
  as?: ElementType
  styles: Partial<Record<keyof CSSProperties, StyleStop>>
  containerRef: RefObject<HTMLDivElement | null>
  radius?: number
  falloff?: "linear" | "exponential" | "gaussian"
}

function parseColor(input: string): [number, number, number] | undefined {
  const hex = /^#([\da-f]{3}|[\da-f]{6})$/i.exec(input.trim())
  const digits = hex?.[1]
  if (digits) {
    const full = digits.length === 3 ? digits.split("").map((char) => char + char).join("") : digits
    const value = Number.parseInt(full, 16)
    return [(value >> 16) & 255, (value >> 8) & 255, value & 255]
  }
  const rgb = /^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i.exec(input.trim())
  if (!rgb?.[1] || !rgb[2] || !rgb[3]) return undefined
  return [Number(rgb[1]), Number(rgb[2]), Number(rgb[3])]
}

function mixChannel(from: number, to: number, amount: number) {
  return Math.round(from + (to - from) * amount)
}

function mixStyle(from: string | number, to: string | number, amount: number) {
  if (typeof from === "number" && typeof to === "number") {
    const value = from + (to - from) * amount
    return String(Math.round(value * 1000) / 1000)
  }
  const fromColor = parseColor(String(from))
  const toColor = parseColor(String(to))
  if (fromColor && toColor) {
    return `rgb(${mixChannel(fromColor[0], toColor[0], amount)}, ${mixChannel(fromColor[1], toColor[1], amount)}, ${mixChannel(fromColor[2], toColor[2], amount)})`
  }
  return amount > 0 ? String(to) : String(from)
}

function cssProperty(key: string) {
  return key.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`)
}

function applyStyles(node: HTMLElement, styles: TextCursorProximityProps["styles"], amount: number) {
  for (const key of Object.keys(styles) as (keyof CSSProperties)[]) {
    const value = styles[key]
    if (!value) continue
    node.style.setProperty(cssProperty(String(key)), mixStyle(value.from, value.to, amount))
  }
}

function falloffValue(distance: number, radius: number, falloff: "linear" | "exponential" | "gaussian") {
  const normalized = Math.min(Math.max(1 - distance / radius, 0), 1)
  if (falloff === "exponential") return normalized ** 2
  if (falloff === "gaussian") return Math.exp(-((distance / (radius / 2)) ** 2) / 2)
  return normalized
}

export function TextCursorProximity({
  children,
  as = "span",
  styles,
  containerRef,
  radius = 50,
  falloff = "linear",
  className,
  ...props
}: TextCursorProximityProps) {
  const hostRef = useRef<HTMLSpanElement>(null)
  const letterRefs = useRef<(HTMLSpanElement | null)[]>([])
  const mousePositionRef = useMousePositionRef(containerRef)
  const prefersReducedMotion = usePrefersReducedMotion()
  const motionOn = useAnimationActive(hostRef)
  const paused = prefersReducedMotion || !motionOn
  const text = Array.isArray(children) ? children.join("") : String(children ?? "")
  const words = text.split(" ")
  const groups: { letters: { char: string; index: number }[] }[] = []
  let cursor = 0
  for (const word of words) {
    const letters: { char: string; index: number }[] = []
    for (const char of word) {
      letters.push({ char, index: cursor })
      cursor += 1
    }
    groups.push({ letters })
  }
  const Tag = as as "span"

  useEffect(() => {
    if (!paused) return
    for (const node of letterRefs.current) {
      if (node) applyStyles(node, styles, 0)
    }
  }, [paused, styles])

  useAnimationFrame(() => {
    if (paused || !containerRef.current) return
    const containerRect = containerRef.current.getBoundingClientRect()
    letterRefs.current.forEach((letter, index) => {
      if (!letter) return
      const rect = letter.getBoundingClientRect()
      const centerX = rect.left + rect.width / 2 - containerRect.left
      const centerY = rect.top + rect.height / 2 - containerRect.top
      const distance = Math.hypot(mousePositionRef.current.x - centerX, mousePositionRef.current.y - centerY)
      const proximity = falloffValue(distance, Math.max(radius, 1), falloff)
      const node = letterRefs.current[index]
      if (node) applyStyles(node, styles, proximity)
    })
  })

  return (
    <Tag
      {...props}
      className={cn(className)}
      data-reduced={prefersReducedMotion ? "true" : "false"}
      data-slot="text-cursor-proximity"
      ref={hostRef}
    >
      {groups.map((group, wordIndex) => (
        <span aria-hidden className="inline-block" key={wordIndex}>
          {group.letters.map((letter) => (
            <span
              className="inline-block"
              key={letter.index}
              ref={(node) => {
                letterRefs.current[letter.index] = node
              }}
            >
              {letter.char}
            </span>
          ))}
          {wordIndex < groups.length - 1 ? <span className="inline-block">&nbsp;</span> : null}
        </span>
      ))}
      <span className="sr-only">{text}</span>
    </Tag>
  )
}
