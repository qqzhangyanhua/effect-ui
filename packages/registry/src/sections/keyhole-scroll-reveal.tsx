"use client"

import * as React from "react"
import { motion, useMotionValueEvent, useScroll, useTransform } from "motion/react"

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export interface KeyholeCue {
  at: number
  label: string
  from: string
  to: string
}

export interface KeyholeScrollRevealProps {
  cues?: KeyholeCue[]
  className?: string
}

const DEFAULTS: KeyholeCue[] = [
  { at: 0, label: "门厅", from: "#fdba74", to: "#9a3412" },
  { at: 0.38, label: "长廊", from: "#7dd3fc", to: "#1e3a8a" },
  { at: 0.7, label: "庭院", from: "#86efac", to: "#14532d" },
]

function KeyholeScrollReveal({ cues = DEFAULTS, className }: KeyholeScrollRevealProps) {
  const reduced = usePrefersReducedMotion()
  const ref = React.useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] })
  const clip = useTransform(scrollYProgress, [0, 1], ["inset(38% 34% 38% 34% round 120px)", "inset(4% 4% 4% 4% round 28px)"])
  const [label, setLabel] = React.useState(cues[0]?.label ?? "")
  const ordered = [...cues].sort((a, b) => a.at - b.at)
  const current = ordered.filter((cue) => cue.label === label).at(-1) ?? ordered[0]

  useMotionValueEvent(scrollYProgress, "change", (value) => {
    const next = [...ordered].reverse().find((cue) => value >= cue.at) ?? ordered[0]
    if (next && next.label !== label) setLabel(next.label)
  })

  if (reduced) {
    return (
      <section data-slot="keyhole-scroll-reveal" className={cn("grid gap-4 px-4 py-8", className)}>
        {ordered.map((cue) => (
          <article key={cue.label} className="flex h-48 items-end rounded-2xl p-4 text-2xl text-white" style={{ backgroundImage: `linear-gradient(160deg, ${cue.from}, ${cue.to})` }}>{cue.label}</article>
        ))}
      </section>
    )
  }

  return (
    <section ref={ref} data-slot="keyhole-scroll-reveal" className={cn("relative h-[220vh]", className)}>
      <div className="sticky top-0 flex h-svh items-center justify-center overflow-hidden bg-slate-950">
        <motion.article className="flex h-[78%] w-[min(920px,92%)] items-center justify-center p-8 text-5xl text-white" style={{ clipPath: clip, backgroundImage: `linear-gradient(160deg, ${current?.from ?? "#fff"}, ${current?.to ?? "#000"})` }}>
          {current?.label}
        </motion.article>
      </div>
    </section>
  )
}

export { KeyholeScrollReveal }
