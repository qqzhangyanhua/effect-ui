"use client"

import * as React from "react"
import { motion, useMotionValue, useScroll, useSpring, useTransform } from "motion/react"

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/cn"

export interface ParallaxWallCard {
  title: string
  tint: string
}

export interface HeroParallaxWallProps {
  title?: string
  subtitle?: string
  cards?: ParallaxWallCard[]
  className?: string
}

const defaultCards: ParallaxWallCard[] = [
  { title: "Aurora", tint: "#7c3aed" },
  { title: "Silk", tint: "#22d3ee" },
  { title: "Globe", tint: "#f472b6" },
  { title: "Bento", tint: "#f59e0b" },
  { title: "Dock", tint: "#34d399" },
  { title: "Beam", tint: "#818cf8" },
  { title: "Tilt", tint: "#fb7185" },
  { title: "Orbit", tint: "#38bdf8" },
  { title: "Foil", tint: "#c084fc" },
]

function HeroParallaxWall({
  title = "倾斜卡片墙，反向视差",
  subtitle = "灵感来自 Aceternity，原创实现。未打开也不拷贝其源码。",
  cards = defaultCards,
  className,
}: HeroParallaxWallProps) {
  const reduced = usePrefersReducedMotion()
  const ref = React.useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] })
  const y = useTransform(scrollYProgress, [0, 1], reduced ? [0, 0] : [90, -90])
  const rotateX = useTransform(scrollYProgress, [0, 1], reduced ? [0, 0] : [22, 8])
  const pointerX = useMotionValue(0)
  const rotateY = useSpring(useTransform(pointerX, [-0.5, 0.5], reduced ? [0, 0] : [10, -10]), {
    stiffness: 120,
    damping: 18,
  })

  return (
    <section
      ref={ref}
      className={cn("relative overflow-hidden rounded-2xl border bg-zinc-950 px-6 py-16 text-white", className)}
      onPointerMove={(event) => {
        if (reduced) return
        const box = event.currentTarget.getBoundingClientRect()
        pointerX.set((event.clientX - box.left) / box.width - 0.5)
      }}
      onPointerLeave={() => pointerX.set(0)}
    >
      <div className="relative z-10 mx-auto max-w-xl text-center">
        <p className="text-xs tracking-[0.28em] text-white/50 uppercase">Hero Wall</p>
        <h2 className="font-display mt-3 text-4xl tracking-tight">{title}</h2>
        <p className="mt-3 text-sm text-white/60">{subtitle}</p>
        <div className="mt-5 flex justify-center gap-2">
          <button
            type="button"
            className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-sm text-primary-foreground"
          >
            浏览组件
          </button>
          <button type="button" className="inline-flex h-9 items-center justify-center rounded-md px-4 text-sm text-white hover:bg-white/10 hover:text-white">
            GitHub
          </button>
        </div>
      </div>
      <div className="mt-10 [perspective:1400px]">
        <motion.div
          style={reduced ? undefined : { y, rotateX, rotateY, rotateZ: -8 }}
          className="mx-auto grid max-w-4xl grid-cols-3 gap-3 [transform-style:preserve-3d]"
        >
          {cards.map((card) => (
            <article
              key={card.title}
              className="min-h-24 rounded-xl border border-white/10 p-4 shadow-xl"
              style={{
                background: `linear-gradient(160deg, color-mix(in oklab, ${card.tint} 55%, #09090b), #09090b)`,
              }}
            >
              <p className="text-sm font-medium">{card.title}</p>
              <p className="mt-1 text-[11px] text-white/55">section block</p>
            </article>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

export { HeroParallaxWall }
