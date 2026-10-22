"use client"

// Ported from Uiverse galaxy（MIT，(c) 2023 Uiverse.io, author kennyotsu）— https://github.com/uiverse-io/galaxy/blob/main/Cards/kennyotsu_witty-deer-12.html

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

import { type HTMLAttributes } from "react"

export interface GridTiltCardProps extends HTMLAttributes<HTMLDivElement> {
  heading?: string
  subtitle?: string
  prompt?: string
  colors?: string[]
}

function tiltRules() {
  const slot = '[data-slot="grid-tilt-card"]'
  const still = `${slot}[data-reduced="true"] [data-heading]{opacity:1}${slot}[data-reduced="true"] [data-prompt]{opacity:0}`
  const reveal = `${slot}[data-reduced="false"] [data-cell]:hover ~ [data-face] [data-heading]{opacity:1}${slot}[data-reduced="false"] [data-cell]:hover ~ [data-face] [data-prompt]{opacity:0}${slot}[data-reduced="false"] [data-cell]:hover ~ [data-face]{filter:brightness(1.08)}`
  const tilts = Array.from({ length: 25 }, (_, index) => {
    const row = Math.floor(index / 5)
    const col = index % 5
    const rx = 20 - row * 10
    const ry = -10 + col * 5
    return `${slot}[data-reduced="false"] [data-cell="${index}"]:hover ~ [data-face]{transform:rotateX(${rx}deg) rotateY(${ry}deg);transition:transform 125ms ease-in-out}`
  }).join("")
  return `${still}${reveal}${tilts}`
}

export function GridTiltCard({
  heading = "纯 CSS 倾斜",
  subtitle = "5×5 追踪格",
  prompt = "悬停看看",
  colors,
  className,
  ...props
}: GridTiltCardProps) {
  const prefersReducedMotion = usePrefersReducedMotion()
  const from = colors?.[0] ?? "var(--primary)"
  const via = colors?.[1] ?? "var(--accent)"
  const to = colors?.[2] ?? "color-mix(in oklab, var(--primary) 40%, white)"

  return (
    <div
      {...props}
      className={cn("relative h-64 w-48 select-none", !prefersReducedMotion && "active:scale-95", className)}
      data-reduced={prefersReducedMotion ? "true" : "false"}
      data-slot="grid-tilt-card"
    >
      <style>{tiltRules()}</style>
      <div className="absolute inset-0 grid grid-cols-5 grid-rows-5 [perspective:800px]">
        {Array.from({ length: 25 }, (_, index) => (
          <div key={index} aria-hidden className="z-10" data-cell={index} />
        ))}
        <div
          className="absolute inset-0 z-0 flex items-center justify-center rounded-[20px] shadow-lg transition-[filter] duration-300"
          data-face
          style={{ background: `linear-gradient(43deg, ${from} 0%, ${via} 46%, ${to} 100%)` }}
        >
          <p className="absolute bottom-3 left-3 max-w-28 text-sm font-bold text-primary-foreground" data-prompt>
            {prompt}
          </p>
          <p className="absolute px-3 text-center text-xl font-bold text-primary-foreground opacity-0 transition-opacity duration-300" data-heading>
            {heading}
          </p>
          <p className="absolute bottom-8 w-full text-center text-xs text-primary-foreground/80">{subtitle}</p>
        </div>
      </div>
    </div>
  )
}
