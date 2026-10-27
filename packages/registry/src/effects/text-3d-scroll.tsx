"use client"

import * as React from "react"
import { motion, useScroll, useTransform } from "motion/react"

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { textStyle } from "@/lib/text-style"
import { cn } from "@/lib/cn"

export interface Text3dScrollProps {
  text?: string
  className?: string
  /** 入场时绕 X 轴的角度。不传则 90。 */
  angle?: number
  fontSize?: number
  fontWeight?: number
  letterSpacing?: number
  align?: "left" | "center" | "right"
}

function Letter({
  char,
  index,
  count,
  progress,
  angle,
}: {
  char: string
  index: number
  count: number
  progress: ReturnType<typeof useScroll>["scrollYProgress"]
  angle: number
}) {
  const start = (index / Math.max(count, 1)) * 0.45
  const rotateX = useTransform(progress, [start, start + 0.38], [angle, 0])
  const opacity = useTransform(progress, [start, start + 0.2], [0.2, 1])
  return (
    <motion.span style={{ rotateX, opacity, transformOrigin: "center bottom" }} className="inline-block">
      {char}
    </motion.span>
  )
}

function Text3dScroll({
  text = "把句子从平面里翻出来",
  className,
  angle,
  fontSize,
  fontWeight,
  letterSpacing,
  align,
}: Text3dScrollProps) {
  const reduced = usePrefersReducedMotion()
  const ref = React.useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] })
  const chars = [...text]

  if (reduced) {
    return (
      <section data-slot="text-3d-scroll" className={cn("px-6 py-16", className)}>
        <h2 className="text-4xl font-semibold" style={textStyle(undefined, fontSize, fontWeight, letterSpacing, align)}>
          {text}
        </h2>
      </section>
    )
  }

  return (
    <section ref={ref} data-slot="text-3d-scroll" className={cn("relative h-[160vh]", className)}>
      <div className="sticky top-24 px-6 [perspective:800px]">
        <h2
          className="flex flex-wrap text-5xl font-semibold [transform-style:preserve-3d]"
          style={textStyle(undefined, fontSize, fontWeight, letterSpacing, align)}
        >
          {chars.map((char, index) => (
            <Letter
              key={`${char}-${index}`}
              char={char === " " ? "\u00a0" : char}
              index={index}
              count={chars.length}
              progress={scrollYProgress}
              angle={angle ?? 90}
            />
          ))}
        </h2>
      </div>
    </section>
  )
}

export { Text3dScroll }
