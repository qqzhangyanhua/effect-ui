"use client"

import * as React from "react"
import { motion } from "motion/react"

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export interface BoxFace {
  title: string
  tint: string
}

export interface BoxCarouselProps {
  faces?: BoxFace[]
  className?: string
}

const defaultFaces: BoxFace[] = [
  { title: "北", tint: "#7c3aed" },
  { title: "东", tint: "#22d3ee" },
  { title: "南", tint: "#f472b6" },
  { title: "西", tint: "#f59e0b" },
]

function BoxCarousel({ faces = defaultFaces.slice(0, 4), className }: BoxCarouselProps) {
  const reduced = usePrefersReducedMotion()
  const [index, setIndex] = React.useState(0)
  const shown = faces.slice(0, 4)

  return (
    <div className={cn("grid place-items-center gap-4 py-4", className)}>
      <div className="[perspective:900px]">
        <motion.div
          className="relative size-44 [transform-style:preserve-3d]"
          animate={{ rotateY: reduced ? 0 : index * -90 }}
          transition={reduced ? { duration: 0 } : { type: "spring", stiffness: 140, damping: 20 }}
        >
          {shown.map((face, faceIndex) => (
            <div
              key={face.title}
              className="absolute inset-0 grid place-items-center rounded-xl border border-white/20 text-xl font-medium text-white"
              style={{
                background: face.tint,
                transform: `rotateY(${faceIndex * 90}deg) translateZ(5.5rem)`,
                backfaceVisibility: "hidden",
              }}
            >
              {reduced && faceIndex !== 0 ? null : face.title}
            </div>
          ))}
        </motion.div>
      </div>
      <button
        type="button"
        className="rounded-full border px-3 py-1 text-xs"
        onClick={() => setIndex((current) => (current + 1) % shown.length)}
      >
        旋转
      </button>
    </div>
  )
}

export { BoxCarousel }
