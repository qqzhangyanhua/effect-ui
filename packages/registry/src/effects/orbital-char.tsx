"use client"

// Copyright Spectrum UI (Made by Arihant)
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Modified by effect-ui: framer-motion 改为 motion/react，初值按序号确定，useTransform 提到函数顶部，减弱动效或离开视口时直接落位。保留 aria-label。
// Ported from Spectrum UI（Apache-2.0，Made by Arihant）— https://github.com/arihantcodes/spectrum-ui/blob/main/app/registry/animatedtext/components/orbital-char.tsx

import { motion, useSpring, useTransform } from "motion/react"
import { useEffect, useRef } from "react"

type OrbitalCharOptions = {
  char: string
  index: number
  radius: number
  duration: number
  decay: number
  animate: boolean
}

function unit(index: number, salt: number) {
  const value = Math.sin(index * 12.9898 + salt) * 43758.5453
  return Math.round((value - Math.floor(value)) * 1000) / 1000
}

export function OrbitalChar({ char, index, radius, duration, decay, animate }: OrbitalCharOptions) {
  const initialX = (unit(index, 1) - 0.5) * 40
  const initialY = (unit(index, 2) - 0.5) * 40
  const initialRot = (unit(index, 3) - 0.5) * 30
  const springX = useSpring(animate ? initialX : 0, { stiffness: 100, damping: 15 })
  const springY = useSpring(animate ? initialY : 0, { stiffness: 100, damping: 15 })
  const springRot = useSpring(animate ? initialRot : 0, { stiffness: 100, damping: 15 })
  const springOpacity = useSpring(animate ? 0 : 1, { stiffness: 100, damping: 15 })
  const springBlur = useSpring(animate ? 4 : 0, { stiffness: 100, damping: 15 })
  const filter = useTransform(springBlur, (blur) => `blur(${blur}px)`)
  const hoverTick = useRef(0)

  useEffect(() => {
    if (!animate) {
      springX.set(0)
      springY.set(0)
      springRot.set(0)
      springOpacity.set(1)
      springBlur.set(0)
      return
    }
    let frame = 0
    let stopped = false
    const phase0 = (unit(index, 4) * Math.PI * 2 + index * 0.4) % (Math.PI * 2)
    const start = () => {
      springX.set(initialX)
      springY.set(initialY)
      springRot.set(initialRot)
      springOpacity.set(0)
      springBlur.set(4)
      let amp = 1
      let phase = phase0
      let started: number | null = null
      const step = (now: number) => {
        if (stopped) return
        if (started === null) started = now
        const normalized = Math.min(1, (now - started) / Math.max(1, duration))
        amp *= decay + (1 - decay) * (1 - normalized)
        phase += 0.004 + index * 0.003
        const reach = radius * amp
        springX.set(Math.sin(phase) * reach)
        springY.set(Math.cos(phase * 0.9) * reach * 0.65)
        springRot.set(Math.sin(phase * 0.7) * amp * 8)
        springOpacity.set(0.75 + 0.25 * (1 - amp))
        springBlur.set(amp * 1.2)
        if (normalized < 1 || amp > 0.005) frame = requestAnimationFrame(step)
        else {
          springX.set(0)
          springY.set(0)
          springRot.set(0)
          springOpacity.set(1)
          springBlur.set(0)
        }
      }
      frame = requestAnimationFrame(step)
    }
    const settle = window.setTimeout(start, 280)
    return () => {
      stopped = true
      window.clearTimeout(settle)
      cancelAnimationFrame(frame)
    }
  }, [animate, decay, duration, index, initialRot, initialX, initialY, radius, springBlur, springOpacity, springRot, springX, springY])

  return (
    <motion.span
      style={{ x: springX, y: springY, rotate: springRot, opacity: springOpacity, filter }}
      className="inline-block will-change-transform"
      onMouseEnter={() => {
        if (!animate) return
        hoverTick.current += 1
        const nudge = unit(index + hoverTick.current, 5)
        springX.set((nudge - 0.5) * 40)
        springY.set((unit(index + hoverTick.current, 6) - 0.5) * 40)
        springRot.set((unit(index + hoverTick.current, 7) - 0.5) * 30)
        springOpacity.set(0)
        springBlur.set(4)
      }}
    >
      {char === " " ? "\u00A0" : char}
    </motion.span>
  )
}
