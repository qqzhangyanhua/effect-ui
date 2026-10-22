"use client"

// Copyright Spectrum UI (Made by Arihant)
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Modified by effect-ui: framer-motion 改为 motion/react，文字引用提前声明，减弱动效或离开视口时直接落到终点颜色并把位移清零。
// Ported from Spectrum UI（Apache-2.0，Made by Arihant）— https://github.com/arihantcodes/spectrum-ui/blob/main/app/registry/animatedtext/components/ink-morph.tsx

import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

import { motion } from "motion/react"
import { useEffect, useId, useRef } from "react"

export interface InkMorphTextProps {
  text?: string
  intensityFrom?: number
  intensityTo?: number
  settleMs?: number
  colorStart?: string
  colorEnd?: string
  className?: string
}

export function InkMorphText({
  text = "Ink Morph",
  intensityFrom = 0.28,
  intensityTo = 0.002,
  settleMs = 2000,
  colorStart = "var(--primary)",
  colorEnd = "var(--foreground)",
  className,
}: InkMorphTextProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const textRef = useRef<HTMLSpanElement>(null)
  const turbRef = useRef<SVGFETurbulenceElement>(null)
  const dispRef = useRef<SVGFEDisplacementMapElement>(null)
  const prefersReducedMotion = usePrefersReducedMotion()
  const motionOn = useAnimationActive(rootRef)
  const animate = !prefersReducedMotion && motionOn
  const id = useId().replace(/:/g, "")

  useEffect(() => {
    const turb = turbRef.current
    const disp = dispRef.current
    const node = textRef.current
    if (!turb || !disp || !node) return
    if (!animate) {
      turb.setAttribute("baseFrequency", `${intensityTo} ${intensityTo * 0.9}`)
      turb.setAttribute("seed", "1")
      disp.setAttribute("scale", "0")
      node.style.color = colorEnd
      return
    }
    node.style.color = colorStart
    let frame = 0
    let start: number | null = null
    const tick = (now: number) => {
      if (start === null) start = now
      const progress = Math.min(1, (now - start) / Math.max(1, settleMs))
      const ease = 1 - (1 - progress) ** 3
      const freq = intensityFrom + (intensityTo - intensityFrom) * ease
      turb.setAttribute("baseFrequency", `${freq} ${freq * 0.9}`)
      turb.setAttribute("seed", `${Math.floor(1000 + now * 0.02 + progress * 50)}`)
      disp.setAttribute("scale", `${80 * (1 - ease)}`)
      const mixed = progress
      node.style.color = mixed >= 1 ? colorEnd : colorStart
      if (progress < 1) frame = requestAnimationFrame(tick)
      else node.style.color = colorEnd
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [animate, colorEnd, colorStart, intensityFrom, intensityTo, settleMs])

  return (
    <motion.div
      ref={rootRef}
      aria-label={text}
      role="img"
      data-reduced={prefersReducedMotion ? "true" : "false"}
      data-motion={animate ? "on" : "off"}
      data-slot="ink-morph"
      className={cn("relative isolate", className)}
      style={{ filter: `url(#ink_${id})` }}
      initial={false}
      animate={{ opacity: 1, scale: 1 }}
      transition={animate ? { duration: 0.6, ease: "easeOut" } : { duration: 0 }}
    >
      <span
        ref={textRef}
        className="select-none whitespace-pre text-[clamp(30px,6vw,68px)] font-black tracking-tight"
        style={{ color: animate ? colorStart : colorEnd }}
      >
        {text}
      </span>
      <svg width="0" height="0" className="absolute" aria-hidden="true">
        <filter id={`ink_${id}`}>
          <feTurbulence
            ref={turbRef}
            type="fractalNoise"
            baseFrequency={`${animate ? intensityFrom : intensityTo} ${(animate ? intensityFrom : intensityTo) * 0.9}`}
            numOctaves="2"
            stitchTiles="stitch"
            result="noise"
            seed="1"
          />
          <feDisplacementMap
            ref={dispRef}
            in="SourceGraphic"
            in2="noise"
            scale={animate ? 80 : 0}
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>
      </svg>
    </motion.div>
  )
}
