"use client"

// Ported from Uiverse galaxy（MIT，(c) 2023 Uiverse.io, author bociKond）— https://github.com/uiverse-io/galaxy/blob/main/loaders/bociKond_breezy-sloth-97.html. Modified for effect-ui.

import { useRef, type HTMLAttributes } from "react"

import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export interface PhoneRingLoaderProps extends HTMLAttributes<HTMLDivElement> {
  size?: number
  color?: string
  label?: string
}

const keyframes = `
@keyframes phone-ring-loader-spin {
  0% { rotate: 0deg; }
  100% { rotate: 360deg; }
}
@keyframes phone-ring-loader-shake {
  0% { rotate: 0deg; }
  10% { rotate: 0.5deg; }
  20% { rotate: 0deg; }
  30% { rotate: -0.5deg; }
  50% { rotate: 0deg; }
  100% { rotate: 0deg; }
}
`

export function PhoneRingLoader({ size = 208, color = "var(--primary)", label = "加载中", className, ...props }: PhoneRingLoaderProps) {
  const ref = useRef<HTMLDivElement>(null)
  const reduced = usePrefersReducedMotion()
  const motionOn = useAnimationActive(ref)
  const active = !reduced && motionOn
  const em = size / 13

  return (
    <div
      {...props}
      ref={ref}
      className={cn("relative inline-flex flex-col items-center justify-center gap-[1em] rounded-[0.5em] border-[0.3125em] border-solid border-y-[0.625em]", className)}
      data-motion={active ? "on" : "off"}
      data-reduced={reduced ? "true" : "false"}
      data-slot="phone-ring-loader"
      role="status"
      style={{
        height: size,
        aspectRatio: "10 / 16",
        fontSize: em,
        backgroundColor: color,
        borderColor: "color-mix(in oklab, black 45%, var(--foreground))",
        color: "white",
        animation: active ? "phone-ring-loader-shake 0.5s infinite linear" : "none",
        rotate: active ? undefined : "0deg",
      }}
    >
      <style>{keyframes}</style>
      <span
        aria-hidden
        className="absolute top-[-0.45em] left-1/2 h-[0.3125em] w-[1em] -translate-x-1/2 rounded-full bg-white"
      />
      <span
        aria-hidden
        className="box-border size-[2em] rounded-full border-[0.625em] border-dashed border-white p-[1.7em]"
        data-part="ring"
        style={{
          animation: active ? "phone-ring-loader-spin 2s infinite ease-in-out" : "none",
          rotate: active ? undefined : "0deg",
        }}
      />
      <span>{label}</span>
    </div>
  )
}
