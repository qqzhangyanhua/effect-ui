"use client"

import { useEffect, useRef, useState, type KeyboardEvent as ReactKeyboardEvent, type UIEvent } from "react"
import { motion } from "motion/react"

import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/cn"

/**
 * Inspired by Apple Books, Public, Blinkist, and CVS (via Mobbin), original implementation.
 * https://mobbin.com/screens/8a868d50-e016-47a5-88d4-e61514ead594
 * https://mobbin.com/screens/60f4e2f6-7d49-4851-b67d-4ed5e16af428
 * https://mobbin.com/screens/07b3a204-60d7-4622-9957-9887d5671e6f
 * https://mobbin.com/screens/bac0e988-aa3a-4c3c-b11a-f4f811ec5b39
 */

export interface LedgeChapterChipProps {
  pace?: number
  intensity?: number
  showToc?: boolean
  ledgeAlign?: "start" | "center" | "end"
  className?: string
  onValueChange?: (state: { chapter: number; title: string }) => void
}

export type LedgeAlign = "start" | "center" | "end"
export type FadePhase = "steady" | "out" | "in"

export const LEDGE_CHAPTERS = [
  { id: "c1", title: "Chapter 1", body: "Opening paragraphs sit under a narrow ledge that names the chapter." },
  { id: "c2", title: "Chapter 2", body: "The chip changes its label when the column crosses into the next section." },
  { id: "c3", title: "Chapter 3", body: "The ledge stays short so the first line of the passage remains visible." },
  { id: "c4", title: "Chapter 4", body: "A later chapter replaces the chip. The cards do not stack." },
] as const

const ring =
  "outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"

function clamp(value: number, min: number, max: number) {
  if (!Number.isFinite(value)) return min
  return Math.min(max, Math.max(min, value))
}

function rateOf(pace: number) {
  return Number.isFinite(pace) && pace > 0 ? pace : 1
}

export function roundProgress(value: number) {
  return Math.round(clamp(value, 0, 1) * 1000) / 1000
}

export function ledgeAlignOf(align: string | undefined): LedgeAlign {
  if (align === "center" || align === "end") return align
  return "start"
}

export function ledgeIndex(progress: number, count = LEDGE_CHAPTERS.length) {
  const value = clamp(progress, 0, 1)
  if (value >= 0.999) return count - 1
  return clamp(Math.floor(value * count), 0, count - 1)
}

export function ledgeProgress(index: number, count = LEDGE_CHAPTERS.length) {
  return roundProgress((clamp(Math.round(index), 0, count - 1) + 0.5) / count)
}

export function fadeFrames(pace: number) {
  return clamp(Math.round(8 / rateOf(pace)), 4, 16)
}

export function stepFade(fade: number, phase: FadePhase, pace: number) {
  if (phase === "steady") return { fade: 1, phase: "steady" as const, swap: false }
  const delta = 1 / fadeFrames(pace)
  if (phase === "out") {
    const next = Math.round(Math.max(0, fade - delta) * 1000) / 1000
    if (next <= 0.001) return { fade: 0, phase: "in" as const, swap: true }
    return { fade: next, phase: "out" as const, swap: false }
  }
  const next = Math.round(Math.min(1, fade + delta) * 1000) / 1000
  if (next >= 0.999) return { fade: 1, phase: "steady" as const, swap: false }
  return { fade: next, phase: "in" as const, swap: false }
}

export function LedgeChapterChip({
  pace = 1,
  intensity = 0.45,
  showToc = true,
  ledgeAlign = "start",
  className,
  onValueChange,
}: LedgeChapterChipProps) {
  const ref = useRef<HTMLDivElement>(null)
  const scrollerRef = useRef<HTMLDivElement>(null)
  const chipRef = useRef<HTMLButtonElement>(null)
  const optionRefs = useRef<Array<HTMLButtonElement | null>>([])
  const frameRef = useRef(0)
  const progressRef = useRef(0)
  const shownRef = useRef(0)
  const fadeRef = useRef(1)
  const phaseRef = useRef<FadePhase>("steady")
  const liveRef = useRef(false)
  const reducedRef = useRef(false)
  const paceRef = useRef(1)
  const chapterRef = useRef(0)
  const lockRef = useRef<number | null>(null)
  const reduced = usePrefersReducedMotion()
  const live = useAnimationActive(ref)
  const gain = clamp(intensity, 0, 1)
  const align = ledgeAlignOf(ledgeAlign)
  const paceRate = rateOf(pace)
  const [progress, setProgress] = useState(0)
  const [shown, setShown] = useState(0)
  const [fade, setFade] = useState(1)
  const [phase, setPhase] = useState<FadePhase>("steady")
  const [open, setOpen] = useState(false)
  const [playing, setPlaying] = useState(false)
  const chapter = ledgeIndex(progress)
  const labelIndex = !live || reduced ? chapter : shown
  const title = LEDGE_CHAPTERS[labelIndex]?.title ?? LEDGE_CHAPTERS[0].title
  const fadeShown = !live || reduced ? 1 : fade
  const phaseShown = !live || reduced ? "steady" : phase
  const menuOpen = showToc && open
  const alignClass = align === "center" ? "justify-center" : align === "end" ? "justify-end" : "justify-start"

  function stop() {
    if (frameRef.current === 0) return
    window.cancelAnimationFrame(frameRef.current)
    frameRef.current = 0
  }

  function syncScroll(value: number) {
    const node = scrollerRef.current
    if (!node) return
    const max = node.scrollHeight - node.clientHeight
    if (max <= 1) return
    const top = value * max
    lockRef.current = top
    node.scrollTop = top
  }

  function publish(next: number) {
    const value = roundProgress(next)
    progressRef.current = value
    setProgress(value)
    syncScroll(value)
  }

  function settleLabel(index: number) {
    shownRef.current = index
    fadeRef.current = 1
    phaseRef.current = "steady"
    setShown(index)
    setFade(1)
    setPhase("steady")
    setPlaying(false)
  }

  function kick() {
    if (frameRef.current !== 0) return
    if (phaseRef.current === "steady") {
      phaseRef.current = "out"
      setPhase("out")
    }
    const tick = () => {
      if (!liveRef.current || reducedRef.current) {
        settleLabel(chapterRef.current)
        frameRef.current = 0
        return
      }
      const result = stepFade(fadeRef.current, phaseRef.current, paceRef.current)
      if (result.swap) {
        shownRef.current = chapterRef.current
        setShown(chapterRef.current)
      }
      fadeRef.current = result.fade
      phaseRef.current = result.phase
      setFade(result.fade)
      setPhase(result.phase)
      if (result.phase === "steady") {
        frameRef.current = 0
        setPlaying(false)
        return
      }
      frameRef.current = window.requestAnimationFrame(tick)
    }
    setPlaying(true)
    frameRef.current = window.requestAnimationFrame(tick)
  }

  useEffect(() => {
    chapterRef.current = chapter
    liveRef.current = live
    reducedRef.current = reduced
    paceRef.current = paceRate
    if (!live || reduced) {
      stop()
      return
    }
    if (shownRef.current === chapter && phaseRef.current === "steady") return
    kick()
    return () => stop()
    // kick closes over the latest refs; listing it would restart the fade every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chapter, live, reduced, paceRate])

  useEffect(() => {
    if (!open) return
    optionRefs.current[shown]?.focus()
  }, [open, shown])

  useEffect(() => {
    onValueChange?.({ chapter, title: LEDGE_CHAPTERS[chapter]?.title ?? "Chapter 1" })
  }, [chapter, onValueChange])

  useEffect(() => {
    return () => stop()
  }, [])

  function onScroll(event: UIEvent<HTMLDivElement>) {
    if (lockRef.current !== null && Math.abs(event.currentTarget.scrollTop - lockRef.current) < 1.5) {
      lockRef.current = null
      return
    }
    lockRef.current = null
    if (!liveRef.current) return
    const max = event.currentTarget.scrollHeight - event.currentTarget.clientHeight
    if (max <= 1) return
    publish(event.currentTarget.scrollTop / max)
  }

  function moveColumn(event: ReactKeyboardEvent<HTMLElement>) {
    const key = event.key
    const delta = key === "PageDown" ? 0.28 : key === "PageUp" ? -0.28 : key === "ArrowDown" ? 0.08 : key === "ArrowUp" ? -0.08 : null
    if (delta !== null) {
      event.preventDefault()
      publish(progressRef.current + delta)
      return
    }
    if (key !== "Home" && key !== "End") return
    event.preventDefault()
    publish(key === "Home" ? 0 : 1)
  }

  function onChipKeyDown(event: ReactKeyboardEvent<HTMLButtonElement>) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault()
      if (showToc) setOpen((value) => !value)
      return
    }
    if (event.key === "Escape") {
      event.preventDefault()
      setOpen(false)
      return
    }
    if (!open) moveColumn(event)
  }

  function onOptionKeyDown(event: ReactKeyboardEvent<HTMLButtonElement>, index: number) {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault()
      const next = event.key === "ArrowDown" ? Math.min(LEDGE_CHAPTERS.length - 1, index + 1) : index - 1
      if (next < 0) chipRef.current?.focus()
      else optionRefs.current[next]?.focus()
      return
    }
    if (event.key === "Escape") {
      event.preventDefault()
      setOpen(false)
      chipRef.current?.focus()
      return
    }
    if (event.key !== "Enter" && event.key !== " ") return
    event.preventDefault()
    publish(ledgeProgress(index))
    setOpen(false)
    chipRef.current?.focus()
  }

  const emphasis = Math.round((8 + gain * 18) * 10) / 10

  return (
    <div
      ref={ref}
      data-slot="ledge-chapter-chip"
      data-ritual="ledge-chip"
      data-progress={progress.toFixed(3)}
      data-chapter={chapter}
      data-label={title}
      data-fade={fadeShown.toFixed(3)}
      data-phase={phaseShown}
      data-toc={menuOpen ? "open" : "closed"}
      data-align={align}
      data-emphasis={gain.toFixed(2)}
      data-playing={playing && live && !reduced ? "on" : "off"}
      data-motion={reduced ? "off" : "on"}
      data-live={live ? "on" : "off"}
      className={cn(
        "w-full rounded-3xl border border-border bg-card p-4 text-card-foreground motion-reduce:transition-none",
        className,
      )}
    >
      <div className="relative">
        <div className={cn("flex h-10 items-center", alignClass)}>
          <motion.button
            ref={chipRef}
            type="button"
            aria-label={title}
            aria-expanded={showToc ? menuOpen : undefined}
            aria-haspopup={showToc ? "listbox" : undefined}
            aria-controls={showToc ? "ledge-chapter-toc" : undefined}
            onClick={() => {
              if (showToc) setOpen((value) => !value)
            }}
            onKeyDown={onChipKeyDown}
            style={{
              opacity: 0.45 + fadeShown * 0.55,
              backgroundColor: `color-mix(in oklab, var(--foreground) ${emphasis}%, var(--card))`,
            }}
            className={cn(
              "max-w-full truncate rounded-full border border-border px-3 py-1 text-xs font-medium text-foreground motion-reduce:transition-none",
              ring,
            )}
          >
            {title}
          </motion.button>
        </div>
        {menuOpen ? (
          <ul
            id="ledge-chapter-toc"
            role="listbox"
            aria-label="Chapters"
            className="absolute top-10 z-20 w-44 rounded-xl border border-border bg-popover p-1 text-popover-foreground shadow-sm"
          >
            {LEDGE_CHAPTERS.map((item, index) => (
              <li key={item.id}>
                <button
                  ref={(node) => {
                    optionRefs.current[index] = node
                  }}
                  type="button"
                  role="option"
                  aria-selected={index === chapter}
                  onClick={() => {
                    publish(ledgeProgress(index))
                    setOpen(false)
                    chipRef.current?.focus()
                  }}
                  onKeyDown={(event) => onOptionKeyDown(event, index)}
                  className={cn(
                    "w-full rounded-lg px-2 py-1.5 text-left text-sm text-foreground",
                    index === chapter ? "bg-muted" : "bg-transparent",
                    ring,
                  )}
                >
                  {item.title}
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
      <div
        ref={scrollerRef}
        tabIndex={0}
        role="region"
        aria-label="Chapter column"
        onScroll={onScroll}
        onKeyDown={moveColumn}
        className={cn("mt-2 h-64 overflow-y-auto rounded-2xl border border-border bg-background px-4 py-3", ring)}
      >
        <div className="grid gap-6">
          {LEDGE_CHAPTERS.map((item, index) => (
            <article key={item.id} data-chapter-block={index} className="min-h-36">
              <h3 className="text-sm font-semibold text-foreground">{item.title}</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.body}</p>
            </article>
          ))}
        </div>
      </div>
    </div>
  )
}
