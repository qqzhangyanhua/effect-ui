"use client"

// Copyright Spectrum UI (Made by Arihant)
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Modified by effect-ui: 减弱动效时直接替换文字，不走定时器。嵌入的文字交换来自 transitions.dev（Jakub Antalík）。
// Ported from Spectrum UI（Apache-2.0，Made by Arihant）— https://github.com/arihantcodes/spectrum-ui/blob/main/components/spectrumui/text-states.tsx

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from "react"

export interface TextStatesProps {
  text: string
  duration?: number
  translateY?: number
  blur?: number
  className?: string
}

const CSS = `
[data-slot="text-states"]{display:inline-block;transform:translateY(0);filter:blur(0);opacity:1;transition:transform var(--text-swap-dur) var(--text-swap-ease),filter var(--text-swap-dur) var(--text-swap-ease),opacity var(--text-swap-dur) var(--text-swap-ease)}
[data-slot="text-states"].is-exit{transform:translateY(calc(var(--text-swap-translate-y) * -1));filter:blur(var(--text-swap-blur));opacity:0}
[data-slot="text-states"].is-enter-start{transform:translateY(var(--text-swap-translate-y));filter:blur(var(--text-swap-blur));opacity:0;transition:none}
[data-slot="text-states"][data-reduced="true"]{transition:none !important;transform:none;filter:none;opacity:1}
`

export function TextStates({ text, duration = 150, translateY = 4, blur = 2, className }: TextStatesProps) {
  const ref = useRef<HTMLSpanElement>(null)
  const prefersReducedMotion = usePrefersReducedMotion()
  const [shown, setShown] = useState(text)
  if (prefersReducedMotion && shown !== text) setShown(text)

  useEffect(() => {
    if (prefersReducedMotion || text === shown) return
    const el = ref.current
    if (!el) return
    el.classList.add("is-exit")
    const timer = window.setTimeout(() => setShown(text), duration)
    return () => window.clearTimeout(timer)
  }, [duration, prefersReducedMotion, shown, text])

  useLayoutEffect(() => {
    const el = ref.current
    if (!el || !el.classList.contains("is-exit")) return
    el.classList.remove("is-exit")
    el.classList.add("is-enter-start")
    void el.offsetHeight
    el.classList.remove("is-enter-start")
  }, [shown])

  return (
    <>
      <style>{CSS}</style>
      <span
        ref={ref}
        data-slot="text-states"
        data-reduced={prefersReducedMotion ? "true" : "false"}
        className={cn(className)}
        style={
          {
            "--text-swap-dur": `${prefersReducedMotion ? 0 : duration}ms`,
            "--text-swap-translate-y": `${translateY}px`,
            "--text-swap-blur": `${blur}px`,
            "--text-swap-ease": "ease-in-out",
          } as CSSProperties
        }
      >
        {shown}
      </span>
    </>
  )
}
