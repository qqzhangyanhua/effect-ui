"use client"

// Ported from Framekit UI (MIT, (c) 2026 Framekit UI contributors) — https://github.com/Sid9022/framekit-ui/blob/master/src/components/ui/ink-bleed-text.tsx

import { useEffect, useId, useMemo, useRef, useState } from "react"
import { RotateCcw } from "lucide-react"

import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export interface InkBleedTextProps {
  text?: string
  highlight?: string
  color?: string
  duration?: number
  delay?: number
  intensity?: number
  trigger?: "mount" | "inView"
  showReplay?: boolean
  onComplete?: () => void
  className?: string
}

function tokensOf(text: string, highlight: string) {
  const mark = highlight && text.includes(highlight) ? highlight : ""
  if (!mark) return text.split(/\s+/).filter(Boolean).map((word) => ({ word, hot: false }))
  const pieces = text.split(mark)
  const before = pieces[0] ?? ""
  const rest = pieces.slice(1)
  const tokens: { word: string; hot: boolean }[] = []
  before.split(/\s+/).filter(Boolean).forEach((word) => tokens.push({ word, hot: false }))
  mark.split(/\s+/).forEach((word) => tokens.push({ word, hot: true }))
  rest.join(mark).split(/\s+/).filter(Boolean).forEach((word, index) => {
    const last = tokens[tokens.length - 1]
    if (index === 0 && /^[.,;:!?]/.test(word) && last) {
      tokens[tokens.length - 1] = { word: last.word + word, hot: last.hot }
    } else tokens.push({ word, hot: false })
  })
  return tokens
}

export function InkBleedText({
  text = "Good ideas spread slowly, then all at once.",
  highlight = "spread slowly",
  color = "var(--primary)",
  duration = 1400,
  delay = 90,
  intensity = 1,
  trigger = "inView",
  showReplay = true,
  onComplete,
  className,
}: InkBleedTextProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<SVGFEDisplacementMapElement>(null)
  const reduced = usePrefersReducedMotion()
  const live = useAnimationActive(rootRef)
  const moving = live && !reduced
  const [run, setRun] = useState(0)
  const elapsedRef = useRef(0)
  const finishedRef = useRef(false)
  const filterId = useId().replace(/:/g, "")
  const tokens = useMemo(() => tokensOf(text, highlight), [text, highlight])
  const stagger = Math.min(200, Math.max(30, delay))
  const dry = Math.min(3000, Math.max(600, duration))
  const total = dry + stagger * tokens.length
  const armed = trigger === "mount" || live

  useEffect(() => {
    elapsedRef.current = 0
    finishedRef.current = false
  }, [run])

  useEffect(() => {
    const map = mapRef.current
    if (!map || !armed || reduced || !moving) return
    let frame = 0
    let last = 0
    const step = (now: number) => {
      const dt = last ? Math.min(50, now - last) : 16
      last = now
      elapsedRef.current += dt
      const scale = Math.max(0, 34 * intensity * (1 - Math.min(1, elapsedRef.current / total)))
      map.setAttribute("scale", scale.toFixed(2))
      if (elapsedRef.current >= total) {
        if (!finishedRef.current) {
          finishedRef.current = true
          onComplete?.()
        }
        return
      }
      frame = requestAnimationFrame(step)
    }
    frame = requestAnimationFrame(step)
    return () => cancelAnimationFrame(frame)
  }, [armed, intensity, moving, onComplete, reduced, run, total])

  return (
    <div ref={rootRef} className={cn("relative", className)} data-motion={moving ? "on" : "off"} style={{ ["--ink" as string]: color }}>
      <style>{`@keyframes ${filterId}{from{opacity:0;filter:blur(14px)}to{opacity:1;filter:blur(0)}}@media (prefers-reduced-motion:reduce){.${filterId}{animation:none!important;opacity:1!important;filter:none!important}}`}</style>
      <svg aria-hidden className="absolute size-0">
        <filter id={filterId} x="-10%" y="-30%" width="120%" height="160%">
          <feTurbulence type="fractalNoise" baseFrequency="0.022 0.05" numOctaves="2" seed="7" result="noise" />
          <feDisplacementMap ref={mapRef} in="SourceGraphic" in2="noise" scale={reduced ? 0 : 34} />
        </filter>
      </svg>
      <h2 className="text-balance text-[clamp(34px,6.4vw,64px)] leading-[1.02] font-normal tracking-[-0.025em] text-foreground">
        <span className="sr-only">{text}</span>
        <span aria-hidden key={run} className="inline" style={{ filter: armed && !reduced ? `url(#${filterId})` : undefined }}>
          {tokens.map((token, index) => (
            <span key={`${token.word}-${index}`} className="relative mr-[0.24em] inline-block last:mr-0">
              <span
                className={cn("relative inline-block motion-reduce:animate-none", filterId, token.hot && "italic text-[var(--ink)]")}
                style={
                  reduced
                    ? undefined
                    : {
                        animation: armed ? `${filterId} ${dry}ms cubic-bezier(.16,1,.3,1) ${index * stagger}ms both` : "none",
                        animationPlayState: moving ? "running" : "paused",
                      }
                }
              >
                {token.word}
              </span>
            </span>
          ))}
        </span>
      </h2>
      {showReplay ? (
        <button type="button" onClick={() => setRun((value) => value + 1)} className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-full px-3 text-[13px] text-muted-foreground ring-1 ring-border outline-none focus-visible:ring-2 focus-visible:ring-ring">
          <RotateCcw aria-hidden className="size-4" /> Replay ink
        </button>
      ) : null}
    </div>
  )
}
