"use client"

import * as React from "react"

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export interface SwirlAvatar {
  name: string
  hue: string
}

export interface HeroSwirlAvatarsProps {
  title?: string
  people?: SwirlAvatar[]
  className?: string
}

const defaultPeople: SwirlAvatar[] = [
  { name: "林夏", hue: "#7c3aed" },
  { name: "周衡", hue: "#22d3ee" },
  { name: "苏晚", hue: "#f472b6" },
  { name: "陈默", hue: "#f59e0b" },
]

const ShaderPack2 = React.lazy(() =>
  import("@/components/ui/shader-pack-2").then((mod) => ({ default: mod.ShaderPack2 })),
)

function HeroSwirlAvatars({
  title = "漩涡底上漂着还在线的人",
  people = defaultPeople,
  className,
}: HeroSwirlAvatarsProps) {
  const reduced = usePrefersReducedMotion()

  return (
    <section className={cn("relative overflow-hidden rounded-2xl border bg-zinc-950 text-white", className)}>
      <style>
        {`@keyframes eu-drift { 50% { transform: translateY(-10px); } }`}
      </style>
      <div className="absolute inset-0">
        {reduced ? (
          <div className="size-full bg-[conic-gradient(from_120deg,#312e81,#7c3aed,#22d3ee,#312e81)] opacity-80" />
        ) : (
          <React.Suspense fallback={<div className="size-full bg-[#1e1b4b]" />}>
            <ShaderPack2 variant="swirl" className="min-h-full rounded-none" />
          </React.Suspense>
        )}
      </div>
      <div className="relative z-10 grid min-h-80 items-center gap-6 px-6 py-12 md:grid-cols-2">
        <div>
          <p className="font-mono text-xs tracking-[0.28em] text-white/70 uppercase">Swirl</p>
          <h2 className="font-display mt-3 text-4xl tracking-tight text-balance sm:text-5xl">{title}</h2>
        </div>
        <div className="relative h-56">
          {people.map((person, index) => (
            <div
              key={person.name}
              className="absolute flex items-center gap-2 rounded-2xl border border-white/20 bg-black/35 px-3 py-2 text-sm backdrop-blur"
              style={{
                left: `${8 + (index % 2) * 42}%`,
                top: `${8 + Math.floor(index / 2) * 46}%`,
                animation: reduced ? undefined : `eu-drift ${3.2 + index * 0.4}s ${index * 0.2}s ease-in-out infinite`,
              }}
            >
              <span className="grid size-8 place-items-center rounded-full text-xs text-white" style={{ background: person.hue }}>
                {person.name.slice(0, 1)}
              </span>
              {person.name}
              <span className="size-2 rounded-full bg-emerald-400" aria-label="在线" />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export { HeroSwirlAvatars }
