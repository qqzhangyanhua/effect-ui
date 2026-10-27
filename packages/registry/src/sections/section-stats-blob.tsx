"use client"

import { motion } from "motion/react"

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/cn"

export interface BlobStat {
  label: string
  value: string
}

export interface SectionStatsBlobProps {
  stats?: BlobStat[]
  className?: string
}

const defaultStats: BlobStat[] = [
  { label: "周活跃", value: "12k" },
  { label: "回访", value: "64%" },
  { label: "完成", value: "4.8" },
]

const blobA = "M70,18 C104,8 128,40 116,74 C104,108 48,118 24,86 C2,54 32,28 70,18 Z"
const blobB = "M78,12 C118,22 124,64 102,92 C80,120 28,108 16,74 C4,40 36,2 78,12 Z"

function SectionStatsBlob({ stats = defaultStats, className }: SectionStatsBlobProps) {
  const reduced = usePrefersReducedMotion()

  return (
    <section className={cn("rounded-2xl border bg-background px-4 py-12", className)}>
      <div className="mx-auto grid max-w-4xl gap-6 sm:grid-cols-3">
        {stats.map((stat, index) => (
          <div key={stat.label} className="relative grid h-44 place-items-center">
            <svg viewBox="0 0 140 130" className="absolute inset-0 size-full" aria-hidden>
              <motion.path
                d={blobA}
                fill="color-mix(in oklab, var(--primary) 72%, white)"
                initial={reduced ? false : { opacity: 0, scale: 0.82 }}
                animate={
                  reduced
                    ? { opacity: 1, scale: 1, d: blobA }
                    : { opacity: 1, scale: 1, d: [blobA, blobB, blobA] }
                }
                transition={
                  reduced
                    ? { duration: 0 }
                    : { opacity: { duration: 0.4 }, scale: { type: "spring", delay: index * 0.08 }, d: { duration: 7, repeat: Infinity, ease: "easeInOut" } }
                }
                style={{ transformOrigin: "70px 65px" }}
              />
            </svg>
            <div className="relative text-center text-zinc-950">
              <p className="font-display text-4xl">{stat.value}</p>
              <p className="text-xs">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

export { SectionStatsBlob }
