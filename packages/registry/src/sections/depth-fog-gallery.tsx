"use client"

import * as React from "react"
import { motion, useScroll, useSpring, useTransform } from "motion/react"

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export interface DepthFogItem {
  title: string
  tone: string
}

export interface DepthFogGalleryProps {
  items?: DepthFogItem[]
  className?: string
}

const DEFAULTS: DepthFogItem[] = [
  { title: "近处的窗", tone: "from-amber-200 to-orange-500" },
  { title: "廊下的光", tone: "from-sky-200 to-blue-600" },
  { title: "院子深处", tone: "from-lime-200 to-emerald-700" },
  { title: "雾里的门", tone: "from-slate-300 to-slate-700" },
  { title: "几乎看不见", tone: "from-zinc-400 to-zinc-900" },
]

function DepthCard({
  item,
  index,
  count,
  progress,
  reduced,
}: {
  item: DepthFogItem
  index: number
  count: number
  progress: ReturnType<typeof useSpring>
  reduced: boolean
}) {
  const start = (index - (count - 1) / 2) * 220
  const z = useTransform(progress, [0, 1], reduced ? [0, 0] : [start + 420, start - 640])
  const blur = useTransform(z, [-520, 0, 280], reduced ? [0, 0, 0] : [12, 0, 7])
  const darkness = useTransform(z, [-520, 0, 280], reduced ? [1, 1, 1] : [0.35, 1, 0.45])
  const opacity = useTransform(z, [-620, -80, 320], reduced ? [1, 1, 1] : [0.2, 1, 0.4])
  const filter = useTransform([blur, darkness], ([blurValue, darkValue]) => `blur(${Number(blurValue).toFixed(2)}px) brightness(${Number(darkValue).toFixed(2)})`)

  return (
    <motion.figure style={{ x: "-50%", y: "-50%", z, opacity, filter }} className="absolute top-1/2 left-1/2 w-64">
      <div className={cn("h-40 rounded-xl bg-linear-to-br shadow-xl", item.tone)} />
      <figcaption className="mt-2 text-center text-sm text-white">{item.title}</figcaption>
    </motion.figure>
  )
}

function DepthFogGallery({ items = DEFAULTS, className }: DepthFogGalleryProps) {
  const reduced = usePrefersReducedMotion()
  const ref = React.useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] })
  const progress = useSpring(scrollYProgress, reduced ? { stiffness: 400, damping: 80 } : { stiffness: 90, damping: 24 })

  if (reduced) {
    return (
      <section data-slot="depth-fog-gallery" className={cn("grid gap-3 p-4 sm:grid-cols-2", className)}>
        {items.map((item) => (
          <figure key={item.title}>
            <div className={cn("h-36 rounded-xl bg-linear-to-br", item.tone)} />
            <figcaption className="mt-2 text-sm">{item.title}</figcaption>
          </figure>
        ))}
      </section>
    )
  }

  return (
    <section ref={ref} data-slot="depth-fog-gallery" className={cn("relative h-[240vh]", className)}>
      <div className="sticky top-0 h-svh overflow-hidden bg-slate-950 [perspective:900px]">
        <p className="absolute top-6 left-6 z-10 max-w-xs text-sm text-white/70">滚动穿过这些画面。越远越模糊，也越暗。</p>
        <div className="relative h-full w-full [transform-style:preserve-3d]">
          {items.map((item, index) => (
            <DepthCard key={item.title} item={item} index={index} count={items.length} progress={progress} reduced={false} />
          ))}
        </div>
      </div>
    </section>
  )
}

export { DepthFogGallery }
