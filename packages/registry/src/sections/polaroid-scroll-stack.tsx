"use client"

import * as React from "react"
import { motion, useScroll, useSpring, useTransform } from "motion/react"

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/cn"

export interface PolaroidScrollStackProps {
  className?: string
}

const FRAMES = [
  { caption: "晨雾还没散", tone: "from-sky-300 to-indigo-500" },
  { caption: "暖岸上的光", tone: "from-amber-200 to-orange-500" },
  { caption: "深林很安静", tone: "from-lime-200 to-emerald-600" },
  { caption: "夜灯一盏盏", tone: "from-fuchsia-300 to-violet-700" },
  { caption: "雪线刚刚到", tone: "from-slate-100 to-sky-400" },
]

function seedAngle(index: number) {
  const value = Math.sin((index + 1) * 127.1) * 43758.5453
  return (value - Math.floor(value) - 0.5) * 16
}

function Polaroid({
  index,
  caption,
  tone,
  progress,
  reduced,
}: {
  index: number
  caption: string
  tone: string
  progress: ReturnType<typeof useSpring>
  reduced: boolean
}) {
  const start = 0.08 + index * 0.14
  const end = start + 0.16
  const angle = seedAngle(index)
  const x = useTransform(progress, [start, end], reduced ? [0, 0] : [index % 2 === 0 ? -640 : 640, (index - 2) * 14])
  const y = useTransform(progress, [start, end], reduced ? [index * 8, index * 8] : [-520, index * 10])
  const rotate = useTransform(progress, [start, end], reduced ? [angle, angle] : [angle + (index % 2 === 0 ? -28 : 28), angle])

  return (
    <motion.figure
      style={{ x, y, rotate, zIndex: index }}
      className="absolute top-16 left-1/2 w-40 -translate-x-1/2 rounded-sm bg-white p-2 text-neutral-900 shadow-xl"
    >
      <div className={cn("h-32 rounded-sm bg-linear-to-br", tone)} />
      <figcaption
        className="px-1 pt-2 text-center text-sm"
        style={{ fontFamily: '"Segoe Script", "Comic Sans MS", "Apple Chancery", cursive' }}
      >
        {caption}
      </figcaption>
    </motion.figure>
  )
}

function PolaroidScrollStack({ className }: PolaroidScrollStackProps) {
  const reduced = usePrefersReducedMotion()
  const ref = React.useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] })
  const progress = useSpring(scrollYProgress, reduced ? { duration: 0 } : { stiffness: 90, damping: 16, mass: 0.7 })

  return (
    <section ref={ref} data-slot="polaroid-scroll-stack" className={cn("relative h-[240vh]", className)}>
      <div className="sticky top-0 flex h-svh items-center justify-center overflow-hidden">
        <p className="absolute top-6 left-6 max-w-xs text-sm text-muted-foreground">向下滚动。相片从画面外甩进来，再叠成一摞。</p>
        <div className="relative h-80 w-full">
          {FRAMES.map((frame, index) => (
            <Polaroid
              key={frame.caption}
              index={index}
              caption={frame.caption}
              tone={frame.tone}
              progress={progress}
              reduced={reduced}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

export { PolaroidScrollStack }
