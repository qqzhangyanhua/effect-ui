"use client"

// Copyright Spectrum UI (Made by Arihant)
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Modified by effect-ui: framer-motion 改为 motion/react，去掉 next-themes 与 styled-jsx，颜色改为主题变量，抖动偏移预先算好，减弱动效或离开视口时文字保持可见并停止闪烁。
// Ported from Spectrum UI（Apache-2.0，Made by Arihant）— https://github.com/arihantcodes/spectrum-ui/blob/main/app/registry/animatedtext/components/hologram-text.tsx

import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

import { motion } from "motion/react"
import { useMemo, useRef, type CSSProperties } from "react"

export interface HologramTextProps {
  text?: string
  scanDuration?: number
  chromaJitter?: number
  className?: string
}

function round3(value: number) {
  return Math.round(value * 1000) / 1000
}

export function HologramText({
  text = "SPECTRUM UI",
  scanDuration = 1800,
  chromaJitter = 0.8,
  className,
}: HologramTextProps) {
  const ref = useRef<HTMLDivElement>(null)
  const prefersReducedMotion = usePrefersReducedMotion()
  const motionOn = useAnimationActive(ref)
  const animate = !prefersReducedMotion && motionOn
  const chars = useMemo(() => text.split(""), [text])

  return (
    <motion.div
      ref={ref}
      aria-label={text}
      role="img"
      data-reduced={prefersReducedMotion ? "true" : "false"}
      data-motion={animate ? "on" : "off"}
      data-slot="hologram-text"
      className={cn("relative text-foreground", className)}
      initial={false}
      animate={{ opacity: 1, y: 0 }}
      transition={animate ? { duration: 0.5, ease: "easeOut" } : { duration: 0 }}
    >
      <div className="flex select-none items-center justify-center gap-[0.04em] text-[clamp(32px,6vw,72px)] font-bold tracking-tight">
        {chars.map((char, index) => (
          <span
            key={`${char}-${index}`}
            className="relative inline-block"
            style={
              {
                "--i": index,
                "--scanMs": `${scanDuration}ms`,
                "--jit": chromaJitter,
                "--jx": round3(Math.cos(index)),
                "--jy": round3(Math.sin(index)),
                "--jx2": round3(Math.cos(index * 3.1)),
                "--jy2": round3(Math.sin(index * 2.6)),
              } as CSSProperties
            }
          >
            <span className="hologram-base">{char === " " ? "\u00A0" : char}</span>
            <span className="hologram-red" aria-hidden="true">
              {char === " " ? "\u00A0" : char}
            </span>
            <span className="hologram-cyan" aria-hidden="true">
              {char === " " ? "\u00A0" : char}
            </span>
          </span>
        ))}
      </div>
      <style>{`
        [data-slot="hologram-text"] .hologram-base,
        [data-slot="hologram-text"] .hologram-red,
        [data-slot="hologram-text"] .hologram-cyan {
          display: inline-block;
        }
        [data-slot="hologram-text"] .hologram-base {
          position: relative;
          color: var(--foreground);
          text-shadow: 0 0 8px color-mix(in oklab, var(--foreground) 40%, transparent), 0 0 16px color-mix(in oklab, var(--foreground) 20%, transparent);
        }
        [data-slot="hologram-text"][data-motion="on"] .hologram-base {
          animation:
            hologram-scan var(--scanMs) calc(var(--i) * 45ms) ease-out both,
            hologram-flicker var(--scanMs) calc(var(--i) * 45ms) steps(1) infinite;
        }
        [data-slot="hologram-text"] .hologram-red,
        [data-slot="hologram-text"] .hologram-cyan {
          position: absolute;
          top: 0;
          left: 0;
          color: transparent;
          mix-blend-mode: screen;
          opacity: 0;
        }
        [data-slot="hologram-text"][data-motion="on"] .hologram-red,
        [data-slot="hologram-text"][data-motion="on"] .hologram-cyan {
          animation:
            hologram-chroma var(--scanMs) calc(var(--i) * 45ms) ease-out both,
            hologram-jitter calc(var(--scanMs) * 0.8) calc(var(--i) * 45ms) ease-out both;
        }
        [data-slot="hologram-text"] .hologram-red { text-shadow: 0 0 0 rgba(255, 60, 60, 0.95); }
        [data-slot="hologram-text"] .hologram-cyan { text-shadow: 0 0 0 rgba(60, 255, 255, 0.95); }
        [data-slot="hologram-text"][data-motion="off"] .hologram-base {
          animation: none;
          opacity: 1;
          color: var(--foreground);
          filter: none;
          transform: none;
        }
        @keyframes hologram-scan {
          0% { color: transparent; letter-spacing: 0.04em; filter: contrast(1) brightness(0.5); transform: translateY(-4px); }
          60% { color: var(--foreground); letter-spacing: 0.005em; filter: contrast(1.2) brightness(1.1); transform: translateY(0); }
          100% { color: var(--foreground); letter-spacing: 0; filter: none; transform: translateY(0); }
        }
        @keyframes hologram-chroma {
          0% { opacity: 0; }
          30% { opacity: 0.8; }
          60% { opacity: 0.45; }
          100% { opacity: 0; }
        }
        @keyframes hologram-jitter {
          0% { transform: translate(calc(var(--jit) * 1px * var(--jx)), calc(var(--jit) * 1px * var(--jy))); filter: blur(0.5px); }
          50% { transform: translate(calc(var(--jit) * 4px * var(--jx2)), calc(var(--jit) * 3px * var(--jy2))); filter: blur(1.2px); }
          100% { transform: translate(0, 0); filter: blur(0); }
        }
        @keyframes hologram-flicker {
          0%, 100% { opacity: 1; }
          8%, 22%, 42%, 70%, 90% { opacity: 0.9; }
          34%, 54%, 74%, 94% { opacity: 0.92; }
        }
      `}</style>
    </motion.div>
  )
}
