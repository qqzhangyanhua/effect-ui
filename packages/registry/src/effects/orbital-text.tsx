"use client"

// Copyright Spectrum UI (Made by Arihant)
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Modified by effect-ui: 颜色改为主题变量，轨道字符的随机初值改为确定值，减弱动效时整组直接落位。保留 aria-label。
// Ported from Spectrum UI（Apache-2.0，Made by Arihant）— https://github.com/arihantcodes/spectrum-ui/blob/main/app/registry/animatedtext/components/orbital-text.tsx

import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

import { useMemo, useRef } from "react"

import { OrbitalChar } from "./orbital-char"

export interface OrbitalTextProps {
  text?: string
  radius?: number
  duration?: number
  decay?: number
  className?: string
}

export function OrbitalText({
  text = "Orbital Letters",
  radius = 18,
  duration = 2000,
  decay = 0.9,
  className,
}: OrbitalTextProps) {
  const ref = useRef<HTMLDivElement>(null)
  const prefersReducedMotion = usePrefersReducedMotion()
  const motionOn = useAnimationActive(ref)
  const animate = !prefersReducedMotion && motionOn
  const chars = useMemo(() => text.split(""), [text])

  return (
    <div
      ref={ref}
      aria-label={text}
      role="img"
      data-reduced={prefersReducedMotion ? "true" : "false"}
      data-motion={animate ? "on" : "off"}
      data-slot="orbital-text"
      className={cn("relative text-[clamp(28px,5vw,56px)] font-semibold tracking-tight text-foreground", className)}
    >
      <div className="flex select-none items-center justify-center gap-[0.02em]">
        {chars.map((char, index) => (
          <OrbitalChar
            key={`${char}-${index}`}
            char={char}
            index={index}
            radius={radius}
            duration={duration}
            decay={decay}
            animate={animate}
          />
        ))}
      </div>
    </div>
  )
}
