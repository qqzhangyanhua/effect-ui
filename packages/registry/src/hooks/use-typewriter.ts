"use client"

// Ported from Spectrum UI (Apache-2.0, (c) Spectrum UI / arihantcodes) — https://github.com/arihantcodes/spectrum-ui/blob/main/components/spectrumui/use-typewriter.ts. Modified for effect-ui.

import { useEffect, useState } from "react"

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"

export type TypewriterPhase = "idle" | "typing" | "holding" | "deleting" | "waiting"

export interface UseTypewriterOptions {
  typeMs?: number
  deleteMs?: number
  holdMs?: number
  gapMs?: number
  startDelayMs?: number
  enabled?: boolean
  jitter?: boolean
}

function sleep(ms: number) {
  return new Promise<void>((resolve) => {
    window.setTimeout(resolve, ms)
  })
}

export function useTypewriter(
  phrases: readonly string[],
  { typeMs = 70, deleteMs = 28, holdMs = 1800, gapMs = 450, startDelayMs = 400, enabled = true, jitter = true }: UseTypewriterOptions = {},
) {
  const reduced = usePrefersReducedMotion()
  const first = phrases[0] ?? ""
  const phrasesKey = JSON.stringify(phrases)
  const [text, setText] = useState(first)
  const [phase, setPhase] = useState<TypewriterPhase>("idle")
  if (reduced && text !== first) setText(first)

  useEffect(() => {
    if (reduced || !enabled) return
    const list = JSON.parse(phrasesKey) as string[]
    if (list.length === 0) return
    let cancelled = false
    const tick = (base: number) => (jitter ? base * (0.6 + Math.random() * 0.8) : base)

    const timer = window.setTimeout(() => {
      void (async () => {
        await sleep(startDelayMs)
        let index = 0
        while (!cancelled) {
          const phrase = list[index % list.length]
          if (phrase === undefined) return
          setPhase("typing")
          for (let i = 1; i <= phrase.length; i += 1) {
            if (cancelled) return
            setText(phrase.slice(0, i))
            await sleep(tick(typeMs))
          }
          setPhase("holding")
          await sleep(holdMs)
          if (cancelled) return
          setPhase("deleting")
          for (let i = phrase.length - 1; i >= 0; i -= 1) {
            if (cancelled) return
            setText(phrase.slice(0, i))
            await sleep(deleteMs)
          }
          setPhase("waiting")
          await sleep(gapMs)
          index += 1
        }
      })()
    }, 0)

    return () => {
      cancelled = true
      window.clearTimeout(timer)
    }
  }, [deleteMs, enabled, gapMs, holdMs, jitter, phrasesKey, reduced, startDelayMs, typeMs])

  return { text: reduced ? first : text, phase: reduced || !enabled ? "idle" : phase }
}
