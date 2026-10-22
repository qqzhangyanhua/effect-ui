"use client"

// Ported from Uiverse galaxy（MIT，(c) 2023 Uiverse.io, author Subaashbala）— https://github.com/uiverse-io/galaxy/blob/main/loaders/Subaashbala_ugly-lizard-47.html. Modified for effect-ui.
// 源文件装饰球写了无效的 16ss，这里按作者意图改成 16s。

import { useRef, type HTMLAttributes } from "react"

import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export interface GlassClockLoaderProps extends HTMLAttributes<HTMLDivElement> {
  size?: number
  tint?: string
}

const keyframes = `
@keyframes glass-clock-loader-hand {
  to { transform: translate(-50%, -100%) rotate(360deg); }
}
@keyframes glass-clock-loader-orbit {
  to { transform: translate(-50%, -50%) rotateZ(360deg); }
}
@keyframes glass-clock-loader-float {
  0% { transform: translate(0); }
  100% { transform: translate(0, 2em); }
}
`

export function GlassClockLoader({ size = 240, tint = "color-mix(in oklab, var(--background) 55%, transparent)", className, ...props }: GlassClockLoaderProps) {
  const ref = useRef<HTMLDivElement>(null)
  const reduced = usePrefersReducedMotion()
  const motionOn = useAnimationActive(ref)
  const active = !reduced && motionOn
  const minute = "1500ms"
  const hour = "18000ms"
  const orbit = "75000ms"

  return (
    <div
      {...props}
      ref={ref}
      aria-label="加载中"
      className={cn("relative isolate inline-flex items-center justify-center", className)}
      data-motion={active ? "on" : "off"}
      data-reduced={reduced ? "true" : "false"}
      data-slot="glass-clock-loader"
      role="status"
      style={{ width: size * 1.85, height: size * 1.55, fontSize: size / 15 }}
    >
      <style>{keyframes}</style>
      <div
        className="relative z-[1] aspect-square w-[15em] rounded-full border-[0.25em] border-solid shadow-[0_0_25px_rgba(0,0,0,0.171)] backdrop-blur-[10px]"
        data-part="clock"
        style={{
          background: tint,
          borderColor: "var(--foreground)",
          animation: active ? "glass-clock-loader-float 15s linear infinite alternate" : "none",
          transform: active ? undefined : "translate(0, 0.6em)",
        }}
      >
        <span aria-hidden className="absolute top-1/2 left-1/2 size-[0.5em] -translate-x-1/2 -translate-y-[65%] rounded-full bg-foreground" />
        <span
          aria-hidden
          className="absolute top-1/2 left-1/2 h-[30%] w-[0.25em] origin-bottom rounded-full bg-foreground"
          data-part="minute"
          style={{
            animation: active ? `glass-clock-loader-hand ${minute} linear infinite` : "none",
            transform: active ? "translate(-50%, -100%)" : "translate(-50%, -100%) rotate(120deg)",
          }}
        />
        <span
          aria-hidden
          className="absolute top-1/2 left-1/2 h-[20%] w-[0.25em] origin-bottom rounded-full bg-foreground"
          data-part="hour"
          style={{
            animation: active ? `glass-clock-loader-hand ${hour} linear infinite` : "none",
            transform: active ? "translate(-50%, -100%)" : "translate(-50%, -100%) rotate(36deg)",
          }}
        />
      </div>
      <div
        className="absolute top-1/2 left-1/2 z-0"
        data-part="orbit"
        style={{
          animation: active ? `glass-clock-loader-orbit ${orbit} linear infinite` : "none",
          transform: "translate(-50%, -50%)",
        }}
      >
        <span
          aria-hidden
          className="absolute left-1/2 aspect-square w-[7em] rounded-full"
          data-part="orb-a"
          style={{
            background: "orangered",
            animation: active ? "glass-clock-loader-float 16s linear infinite" : "none",
            transform: active ? undefined : "translate(0, 0)",
          }}
        />
        <span aria-hidden className="absolute right-[55%] aspect-square w-[7em] rounded-full" data-part="orb-b" style={{ background: "hotpink" }} />
      </div>
    </div>
  )
}
