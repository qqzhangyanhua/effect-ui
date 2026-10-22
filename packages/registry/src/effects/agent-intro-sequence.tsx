"use client"

// Ported from UI Layouts (MIT, (c) 2024 UI LAYOUT) — https://github.com/ui-layouts/uilayouts/blob/main/apps/ui-layout/registry/components/terminal-ui.tsx, https://github.com/ui-layouts/uilayouts/blob/main/apps/ui-layout/components/ui/typing-writter.tsx and https://github.com/ui-layouts/uilayouts/blob/main/apps/ui-layout/components/ui/shimmer-loader.tsx. Modified for effect-ui.

import { Play } from "lucide-react"
import { useCallback, useEffect, useRef, useState, type HTMLAttributes } from "react"

import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

import { CharShimmerLoader } from "./char-shimmer-loader"

export type AgentIntroPhase =
  | { type: "divider" }
  | { type: "bar"; labels: string[]; icons: string[]; duration: number; tokenTarget?: number; showPercent?: boolean }
  | { type: "lines"; lines: string[] }
  | { type: "message"; text: string }

export interface AgentIntroSequenceProps extends HTMLAttributes<HTMLDivElement> {
  sequence: readonly AgentIntroPhase[]
  onComplete?: () => void
}

interface RenderedItem {
  id: string
  phase: AgentIntroPhase
  lineIndex?: number
}

function TypeLine({ text, onDone }: { text: string; onDone: () => void }) {
  const [count, setCount] = useState(0)
  const onDoneRef = useRef(onDone)
  useEffect(() => {
    onDoneRef.current = onDone
  }, [onDone])
  useEffect(() => {
    let index = 0
    let timer = 0
    let finished = false
    const step = () => {
      index += 1
      setCount(index)
      if (index >= text.length) {
        if (!finished) {
          finished = true
          onDoneRef.current()
        }
        return
      }
      timer = window.setTimeout(step, 40)
    }
    timer = window.setTimeout(step, 40)
    return () => window.clearTimeout(timer)
  }, [text])
  return (
    <span className="inline-flex items-center gap-2 text-sm font-semibold">
      <Play className="size-3 fill-primary text-primary" />
      <span>
        {text.slice(0, count)}
        <span className="ml-0.5 inline-block h-[1em] w-0.5 bg-foreground align-text-bottom" />
      </span>
    </span>
  )
}

export function AgentIntroSequence({ sequence, onComplete, className, ...props }: AgentIntroSequenceProps) {
  const ref = useRef<HTMLDivElement>(null)
  const reduced = usePrefersReducedMotion()
  const motionOn = useAnimationActive(ref)
  const active = !reduced && motionOn
  const [items, setItems] = useState<RenderedItem[]>([])
  const phaseRef = useRef(0)
  const completedRef = useRef(false)
  const sequenceRef = useRef(sequence)
  const onCompleteRef = useRef(onComplete)

  useEffect(() => {
    sequenceRef.current = sequence
  }, [sequence])
  useEffect(() => {
    onCompleteRef.current = onComplete
  }, [onComplete])

  const advanceRef = useRef<() => void>(() => {})

  const advance = useCallback(() => {
    const phase = sequenceRef.current[phaseRef.current]
    if (!phase) {
      if (!completedRef.current) {
        completedRef.current = true
        onCompleteRef.current?.()
      }
      return
    }
    if (phase.type === "divider") {
      setItems((prev) => [...prev, { id: `divider-${phaseRef.current}`, phase }])
      phaseRef.current += 1
      window.setTimeout(() => advanceRef.current(), 80)
      return
    }
    if (phase.type === "bar") {
      setItems((prev) => [...prev, { id: `bar-${phaseRef.current}`, phase }])
      phaseRef.current += 1
      return
    }
    if (phase.type === "lines") {
      setItems((prev) => [...prev, { id: `line-${phaseRef.current}-0`, phase, lineIndex: 0 }])
      phaseRef.current += 1
      return
    }
    setItems((prev) => [...prev, { id: `message-${phaseRef.current}`, phase }])
    phaseRef.current += 1
    window.setTimeout(() => advanceRef.current(), 400)
  }, [])

  useEffect(() => {
    advanceRef.current = advance
  }, [advance])

  useEffect(() => {
    if (!active) return
    const timer = window.setTimeout(() => {
      phaseRef.current = 0
      completedRef.current = false
      setItems([])
      advance()
    }, 200)
    return () => window.clearTimeout(timer)
  }, [active, sequence, advance])

  useEffect(() => {
    if (!reduced) return
    const timer = window.setTimeout(() => onCompleteRef.current?.(), 0)
    return () => window.clearTimeout(timer)
  }, [reduced])

  const shown = reduced
    ? sequence.map((phase, index) => ({ id: `static-${index}`, phase, lineIndex: phase.type === "lines" ? 0 : undefined }))
    : items

  return (
    <div
      {...props}
      ref={ref}
      className={cn("flex min-w-0 flex-col gap-2 rounded-xl bg-neutral-950 p-6 font-mono text-violet-100", className)}
      data-reduced={reduced ? "true" : "false"}
      data-slot="agent-intro-sequence"
    >
      {shown.map((item) => {
        const { phase } = item
        if (phase.type === "divider") {
          return (
            <div key={item.id} className="text-violet-200/30">
              {"─".repeat(36)}
            </div>
          )
        }
        if (phase.type === "bar") {
          if (reduced) {
            return (
              <div key={item.id} className="text-sm">
                {phase.labels[phase.labels.length - 1] ?? ""}
              </div>
            )
          }
          return (
            <CharShimmerLoader
              duration={phase.duration}
              icons={phase.icons}
              key={item.id}
              labels={phase.labels}
              onComplete={() => window.setTimeout(advance, 120)}
              showPercent={phase.showPercent}
              textClassName="text-violet-100"
              tokenTarget={phase.tokenTarget}
            />
          )
        }
        if (phase.type === "lines") {
          if (reduced) {
            return (
              <div key={item.id} className="space-y-1 text-sm">
                {phase.lines.map((line, lineIndex) => (
                  <div key={`${line}-${lineIndex}`}>{line}</div>
                ))}
              </div>
            )
          }
          const line = phase.lines[item.lineIndex ?? 0] ?? ""
          return (
            <TypeLine
              key={item.id}
              onDone={() => {
                const next = (item.lineIndex ?? 0) + 1
                if (next < phase.lines.length) {
                  setItems((prev) => [...prev, { id: `${item.id}-${next}`, phase, lineIndex: next }])
                  return
                }
                window.setTimeout(advance, 160)
              }}
              text={line}
            />
          )
        }
        return (
          <div key={item.id} className="text-sm font-semibold text-violet-300">
            {phase.text}
          </div>
        )
      })}
    </div>
  )
}
