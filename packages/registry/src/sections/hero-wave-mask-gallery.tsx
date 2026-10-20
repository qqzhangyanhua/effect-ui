"use client"

import * as React from "react"
import { motion, useScroll, useTransform } from "motion/react"

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export interface WaveTile {
  label: string
  tint: string
}

export interface HeroWaveMaskGalleryProps {
  title?: string
  tiles?: WaveTile[]
  className?: string
}

const defaultTiles: WaveTile[] = [
  { label: "01", tint: "#312e81" },
  { label: "02", tint: "#7c3aed" },
  { label: "03", tint: "#22d3ee" },
  { label: "04", tint: "#f472b6" },
  { label: "05", tint: "#0f172a" },
]

function HeroWaveMaskGallery({
  title = "粗体标题压在波浪裁切的画面上",
  tiles = defaultTiles,
  className,
}: HeroWaveMaskGalleryProps) {
  const reduced = usePrefersReducedMotion()
  const ref = React.useRef<HTMLElement>(null)
  const clipId = React.useId().replace(/:/g, "")
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] })
  const x = useTransform(scrollYProgress, [0, 1], reduced ? [0, 0] : [-48, 48])
  const y = useTransform(scrollYProgress, [0, 1], reduced ? [0, 0] : [28, -28])

  return (
    <section ref={ref} className={cn("overflow-hidden rounded-2xl border bg-background px-4 py-12 sm:px-8", className)}>
      <h2 className="font-display mx-auto max-w-4xl text-center text-5xl leading-[0.9] font-black tracking-tight text-balance uppercase sm:text-7xl">
        {title}
      </h2>
      <div className="relative mx-auto mt-8 h-56 max-w-4xl">
        <svg className="absolute size-0" aria-hidden>
          <defs>
            <clipPath id={clipId} clipPathUnits="objectBoundingBox">
              <path d="M0,0.18 C0.12,0.42 0.22,0.02 0.36,0.2 C0.5,0.38 0.6,0.05 0.74,0.22 C0.86,0.36 0.94,0.1 1,0.2 L1,1 L0,1 Z" />
            </clipPath>
          </defs>
        </svg>
        <motion.div
          className="absolute inset-x-[-8%] top-0 flex h-[130%] gap-3"
          style={{ x, y, clipPath: `url(#${clipId})` }}
        >
          {tiles.map((tile) => (
            <div
              key={tile.label}
              className="grid h-full w-48 shrink-0 place-items-end p-3 text-sm text-white"
              style={{ background: `linear-gradient(160deg, ${tile.tint}, #09090b)` }}
            >
              {tile.label}
            </div>
          ))}
        </motion.div>
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent"
          style={{ clipPath: `url(#${clipId})` }}
        />
      </div>
    </section>
  )
}

export { HeroWaveMaskGallery }
