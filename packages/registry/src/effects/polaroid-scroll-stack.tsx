"use client"

import * as React from "react"

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export interface PolaroidScrollStackProps {
  className?: string
}

const FRAMES = [
  { caption: "晨雾", tone: "from-sky-300 to-indigo-500" },
  { caption: "暖岸", tone: "from-amber-200 to-orange-500" },
  { caption: "深林", tone: "from-lime-200 to-emerald-600" },
  { caption: "夜灯", tone: "from-fuchsia-300 to-violet-700" },
  { caption: "雪线", tone: "from-slate-100 to-sky-400" },
]

function PolaroidScrollStack({ className }: PolaroidScrollStackProps) {
  const reduced = usePrefersReducedMotion()
  const [progress, setProgress] = React.useState(0)
  const spread = reduced ? 1 : progress

  return (
    <div data-slot="polaroid-scroll-stack" className={cn("w-full", className)}>
      <div
        className="h-96 overflow-y-auto rounded-xl border"
        onScroll={(event) => {
          const el = event.currentTarget
          const max = el.scrollHeight - el.clientHeight
          setProgress(max <= 0 ? 1 : el.scrollTop / max)
        }}
      >
        <div className="h-[170vh]">
          <div className="sticky top-0 flex h-96 items-center justify-center">
            <p className="absolute top-3 left-3 text-xs text-muted-foreground">在这个区域里滚动，相片会从叠放散开。</p>
            <div className="relative h-64 w-full">
              {FRAMES.map((frame, index) => {
                const offset = index - 2
                return (
                  <figure
                    key={frame.caption}
                    className="absolute top-6 left-1/2 w-36 rounded-sm bg-white p-2 text-neutral-900 shadow-lg"
                    style={{
                      transform: `translate(calc(-50% + ${offset * 78 * spread}px), ${index * 4 * (1 - spread)}px) rotate(${offset * 7 * spread}deg)`,
                      zIndex: index,
                    }}
                  >
                    <div className={cn("h-28 rounded-sm bg-linear-to-br", frame.tone)} />
                    <figcaption className="pt-2 text-center text-xs">{frame.caption}</figcaption>
                  </figure>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export { PolaroidScrollStack }
