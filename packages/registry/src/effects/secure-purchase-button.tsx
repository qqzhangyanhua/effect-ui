"use client"

// Ported from MicroKit (MIT, (c) 2026 Henrique Barone) — https://github.com/henriquegpb/microkit/blob/fd993e8/registry/microkit/secure-purchase-button.tsx

import { useEffect, useId, useRef, useState } from "react"

import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export interface SecurePurchaseButtonProps {
  color?: string
  duration?: number
  size?: number
  speed?: number
  className?: string
}

type PurchaseState = "idle" | "processing" | "success"

const labels: Record<PurchaseState, string> = {
  idle: "Complete Purchase",
  processing: "Processing Payment",
  success: "Payment Secured",
}

const pixelDelays = Array.from({ length: 16 }, (_, index) => Math.hypot(Math.floor(index / 4) - 1.5, (index % 4) - 1.5) * 0.12)

export function SecurePurchaseButton({
  color = "var(--primary)",
  duration = 1600,
  size = 48,
  speed = 1,
  className,
}: SecurePurchaseButtonProps) {
  const rootRef = useRef<HTMLButtonElement>(null)
  const reduced = usePrefersReducedMotion()
  const live = useAnimationActive(rootRef)
  const [state, setState] = useState<PurchaseState>("idle")
  const deadlineRef = useRef<number | null>(null)
  const pulseName = `purchase-pulse-${useId().replace(/:/g, "")}`
  const labelName = `purchase-label-${useId().replace(/:/g, "")}`
  const pulsing = state === "processing" && !reduced

  useEffect(() => {
    if (state === "idle") {
      deadlineRef.current = null
      return
    }
    if (!live) return
    const total = (state === "processing" ? duration : duration / 2) / Math.max(0.1, speed)
    if (deadlineRef.current === null) deadlineRef.current = performance.now() + total
    const remaining = Math.max(0, deadlineRef.current - performance.now())
    const timeout = window.setTimeout(() => {
      deadlineRef.current = null
      setState((current) => (current === "processing" ? "success" : "idle"))
    }, remaining)
    return () => window.clearTimeout(timeout)
  }, [duration, live, speed, state])

  return (
    <button
      ref={rootRef}
      type="button"
      data-slot="secure-purchase-button"
      data-state={state}
      data-motion={live && pulsing ? "on" : "off"}
      className={cn(
        "relative inline-flex w-fit cursor-pointer items-center justify-center rounded-full border border-border bg-card px-6 text-base font-medium text-foreground motion-reduce:transition-none focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring data-[state=processing]:cursor-default data-[state=success]:cursor-default",
        className,
      )}
      style={{ height: size, color }}
      aria-busy={state === "processing"}
      onClick={() => {
        if (state !== "idle") return
        setState("processing")
      }}
    >
      <style>
        {`@keyframes ${pulseName}{0%,100%{opacity:.5;transform:scale(.7)}50%{opacity:1;transform:scale(1)}}@keyframes ${labelName}{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}`}
      </style>
      <span className={cn("relative h-5 w-0 shrink-0 overflow-hidden motion-reduce:transition-none", state === "idle" ? "w-0" : "mr-2 w-5")} aria-hidden="true">
        <span className={cn("absolute inset-0 grid grid-cols-4 place-content-center gap-0.5", state === "processing" ? "opacity-100" : "opacity-0")}>
          {pixelDelays.map((delay, index) => (
            <span
              key={index}
              className="size-0.5 bg-current motion-reduce:animate-none"
              style={{
                animationName: pulsing ? pulseName : "none",
                animationDuration: `${0.9 / Math.max(0.1, speed)}s`,
                animationTimingFunction: "ease-in-out",
                animationIterationCount: "infinite",
                animationDelay: `${delay}s`,
                animationPlayState: live ? "running" : "paused",
              }}
            />
          ))}
        </span>
        <svg className={cn("absolute inset-0 size-5", state === "success" ? "opacity-100" : "opacity-0")} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M18.54 4.12 13.04 2.06c-.57-.21-1.5-.21-2.07 0L5.47 4.12C4.41 4.52 3.55 5.76 3.55 6.89v8.1c0 .81.53 1.88 1.18 2.36l5.5 4.11c.97.73 2.56.73 3.53 0l5.5-4.11c.65-.49 1.18-1.55 1.18-2.36v-8.1c.01-1.13-.86-2.37-1.9-2.77ZM15.48 9.72l-4.3 4.3c-.15.15-.34.22-.53.22s-.38-.07-.53-.22l-1.6-1.62a.75.75 0 0 1 1.06-1.06l1.08 1.08 3.77-3.77a.75.75 0 0 1 1.06 1.07Z" />
        </svg>
      </span>
      <span className="relative inline-block whitespace-nowrap" aria-live="polite">
        <span
          key={state}
          className="inline-block motion-reduce:animate-none"
          style={{
            animationName: reduced ? "none" : labelName,
            animationDuration: "320ms",
            animationTimingFunction: "cubic-bezier(.16,1,.3,1)",
            animationFillMode: "both",
          }}
        >
          {labels[state]}
        </span>
      </span>
    </button>
  )
}
