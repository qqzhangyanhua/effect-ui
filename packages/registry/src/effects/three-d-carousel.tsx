"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

export interface ThreeDCarouselItem {
  title: string
  src: string
}

export interface ThreeDCarouselProps {
  items: ThreeDCarouselItem[]
  className?: string
}

function ThreeDCarousel({ items, className }: ThreeDCarouselProps) {
  const [active, setActive] = React.useState(0)
  const count = items.length || 1
  const angle = 360 / count

  return (
    <div className={cn("space-y-4", className)}>
      <div className="relative mx-auto h-56 w-full max-w-lg [perspective:1100px]">
        <div
          className="absolute inset-0 [transform-style:preserve-3d] transition-transform duration-500"
          style={{ transform: `translateZ(-180px) rotateY(${-active * angle}deg)` }}
        >
          {items.map((item, index) => (
            <button
              key={item.title}
              type="button"
              onClick={() => setActive(index)}
              className="absolute top-1/2 left-1/2 h-40 w-28 -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-xl border bg-cover shadow-lg"
              style={{
                backgroundImage: `url(${item.src})`,
                transform: `rotateY(${index * angle}deg) translateZ(180px)`,
              }}
            >
              <span className="absolute inset-x-0 bottom-0 bg-black/50 px-2 py-1 text-xs text-white">{item.title}</span>
            </button>
          ))}
        </div>
      </div>
      <div className="flex justify-center gap-2">
        <button type="button" className="rounded-md border px-3 py-1 text-sm" onClick={() => setActive((value) => (value - 1 + count) % count)}>
          上一张
        </button>
        <button type="button" className="rounded-md border px-3 py-1 text-sm" onClick={() => setActive((value) => (value + 1) % count)}>
          下一张
        </button>
      </div>
    </div>
  )
}

export { ThreeDCarousel }
