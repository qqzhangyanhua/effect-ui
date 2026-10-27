"use client"

import { Children, isValidElement, useEffect, useRef, useState, type ReactNode } from "react"
import { motion } from "motion/react"

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/cn"

export interface HeroTextStaggerProps {
  title?: readonly string[]
  subtitle?: ReactNode
  cta?: ReactNode
  pace?: number
  stagger?: number
  intensity?: number
  className?: string
  children?: ReactNode
}

export function HeroTextStaggerTitle({ children }: { children?: ReactNode }) {
  return <>{children}</>
}

export function HeroTextStaggerSubtitle({ children }: { children?: ReactNode }) {
  return <>{children}</>
}

export function HeroTextStaggerCta({ children }: { children?: ReactNode }) {
  return <>{children}</>
}

function rateOf(pace: number) {
  return Number.isFinite(pace) && pace > 0 ? pace : 1
}

function clamp01(value: number) {
  if (!Number.isFinite(value)) return 0
  return Math.min(1, Math.max(0, value))
}

function slotOf(children: ReactNode, type: (props: { children?: ReactNode }) => ReactNode) {
  let content: ReactNode
  let found = false
  Children.forEach(children, (child) => {
    if (!isValidElement(child) || child.type !== type) return
    content = (child.props as { children?: ReactNode }).children
    found = true
  })
  return found ? content : undefined
}

function linesOf(node: ReactNode): string[] {
  if (typeof node === "string" || typeof node === "number") return String(node).split(/\n/)
  if (Array.isArray(node)) return node.flatMap((item) => linesOf(item as ReactNode))
  return []
}

function wordLines(lines: readonly string[]) {
  return lines
    .map((line) => line.trim().split(/\s+/).filter(Boolean))
    .filter((line) => line.length > 0)
}

function timedLines(lines: readonly string[][], step: number) {
  const rows: { word: string; delay: number }[][] = []
  let count = 0
  for (const line of lines) {
    const row: { word: string; delay: number }[] = []
    for (const word of line) {
      row.push({ word, delay: count * step })
      count += 1
    }
    rows.push(row)
  }
  return { rows, count }
}

export function HeroTextStagger({
  title,
  subtitle,
  cta,
  pace = 1,
  stagger = 80,
  intensity = 0.75,
  className,
  children,
}: HeroTextStaggerProps) {
  const ref = useRef<HTMLDivElement>(null)
  const reduced = usePrefersReducedMotion()
  const [shown, setShown] = useState(false)
  const slottedTitle = slotOf(children, HeroTextStaggerTitle)
  const slottedSubtitle = slotOf(children, HeroTextStaggerSubtitle)
  const slottedCta = slotOf(children, HeroTextStaggerCta)
  const lines = wordLines(slottedTitle !== undefined ? linesOf(slottedTitle) : (title ?? []))
  const subtitleNode = slottedSubtitle !== undefined ? slottedSubtitle : subtitle
  const ctaNode = slottedCta !== undefined ? slottedCta : cta
  const rate = rateOf(pace)
  const amp = clamp01(intensity)
  const rise = Math.round(12 + amp * 28)
  const blur = Math.round(amp * 8)
  const step = Math.max(0, stagger) / rate / 1000
  const duration = 0.62 / rate
  const timed = timedLines(lines, step)
  const words = timed.count
  const visible = reduced || shown

  useEffect(() => {
    if (reduced) return
    const node = ref.current
    if (!node || typeof IntersectionObserver === "undefined") {
      setShown(true)
      return
    }
    const observer = new IntersectionObserver((entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return
      setShown(true)
      observer.disconnect()
    }, { threshold: 0.35 })
    observer.observe(node)
    return () => observer.disconnect()
  }, [reduced])

  if (lines.length === 0 && subtitleNode == null && ctaNode == null) {
    return (
      <div ref={ref} data-slot="hero-text-stagger" data-motion={reduced ? "off" : "on"} className={cn("motion-reduce:transform-none", className)}>
        {children}
      </div>
    )
  }

  return (
    <div
      ref={ref}
      data-slot="hero-text-stagger"
      data-motion={reduced ? "off" : "on"}
      data-state={visible ? "shown" : "waiting"}
      data-pace={pace}
      data-stagger={stagger}
      data-intensity={intensity}
      className={cn("max-w-3xl motion-reduce:transform-none", className)}
    >
      <h2 className="font-display text-5xl leading-tight tracking-tight text-foreground">
        {timed.rows.map((line, lineIndex) => (
          <span key={lineIndex} className="block">
            {line.map((item) => (
              <motion.span
                key={`${lineIndex}-${item.delay}`}
                className="mr-[0.28em] inline-block motion-reduce:translate-none motion-reduce:opacity-100 motion-reduce:blur-none"
                initial={false}
                animate={visible ? { opacity: 1, y: 0, filter: "blur(0px)" } : { opacity: 0, y: rise, filter: `blur(${blur}px)` }}
                transition={reduced ? { duration: 0 } : { duration, delay: item.delay, ease: "easeOut" }}
              >
                {item.word}
              </motion.span>
            ))}
          </span>
        ))}
      </h2>
      {subtitleNode != null ? (
        <motion.p
          className="mt-4 max-w-xl text-base text-muted-foreground motion-reduce:translate-none motion-reduce:opacity-100"
          initial={false}
          animate={visible ? { opacity: 1, y: 0 } : { opacity: 0, y: Math.round(rise * 0.45) }}
          transition={reduced ? { duration: 0 } : { duration, delay: words * step, ease: "easeOut" }}
        >
          {subtitleNode}
        </motion.p>
      ) : null}
      {ctaNode != null ? (
        <motion.div
          className="mt-6 motion-reduce:translate-none motion-reduce:opacity-100"
          initial={false}
          animate={visible ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
          transition={reduced ? { duration: 0 } : { duration, delay: words * step + 0.12, ease: "easeOut" }}
        >
          {ctaNode}
        </motion.div>
      ) : null}
    </div>
  )
}
