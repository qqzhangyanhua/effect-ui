"use client"

import { useRef, type CSSProperties, type ReactNode } from "react"

import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/cn"

export interface TwistInCardProps {
  pace?: number
  intensity?: number
  delay?: number
  className?: string
  children?: ReactNode
}

const KEYFRAMES = `
@keyframes twist-in-card {
  from {
    opacity: 0;
    transform: translateY(var(--twist-y)) rotate(var(--twist-r)) scale(0.92);
  }
  to {
    opacity: 1;
    transform: none;
  }
}
`

function rateOf(pace: number) {
  return Number.isFinite(pace) && pace > 0 ? pace : 1
}

export function TwistInCard({ pace = 1, intensity = 1, delay = 0, className, children }: TwistInCardProps) {
  const ref = useRef<HTMLDivElement>(null)
  const reduced = usePrefersReducedMotion()
  const live = useAnimationActive(ref)
  const rate = rateOf(pace)
  const play = live && !reduced

  return (
    <>
      <style>{KEYFRAMES}</style>
      <div
        ref={ref}
        data-slot="twist-in-card"
        data-motion={play ? "on" : "off"}
        className={cn(
          "rounded-2xl border border-border bg-card text-card-foreground shadow-sm motion-reduce:animate-none motion-reduce:transform-none motion-reduce:opacity-100",
          className,
        )}
        style={
          {
            "--twist-y": `${28 * intensity}px`,
            "--twist-r": `${-8 * intensity}deg`,
            animationName: reduced ? "none" : "twist-in-card",
            animationDuration: `${Math.round(720 / rate)}ms`,
            animationDelay: `${Math.round(delay * 1000)}ms`,
            animationTimingFunction: "cubic-bezier(0.22, 1, 0.36, 1)",
            animationFillMode: "both",
            animationPlayState: play ? "running" : "paused",
          } as CSSProperties
        }
      >
        {children}
      </div>
    </>
  )
}
