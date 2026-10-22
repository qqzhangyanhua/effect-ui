"use client"

// Ported from UI Layouts (MIT, (c) 2024 UI LAYOUT) — https://github.com/ui-layouts/uilayouts/blob/main/apps/ui-layout/registry/components/image-reveal/image-reveal.tsx. Modified for effect-ui.

import { useMediaQuery } from "@/hooks/use-media-query"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

import { useRef, useState, type HTMLAttributes, type MouseEvent } from "react"

export interface HoverImageRevealItem {
  label: string
  img: string
  alt: string
}

export interface HoverImageRevealProps extends HTMLAttributes<HTMLDivElement> {
  items: readonly HoverImageRevealItem[]
}

export function HoverImageReveal({ items, className, ...props }: HoverImageRevealProps) {
  const ref = useRef<HTMLDivElement>(null)
  const reduced = usePrefersReducedMotion()
  const desktop = useMediaQuery("(min-width: 768px)")
  const [active, setActive] = useState<number | null>(null)
  const [point, setPoint] = useState({ x: 0, y: 0 })
  const current = active === null ? undefined : items[active]
  const follow = desktop && !reduced

  const move = (event: MouseEvent<HTMLDivElement>) => {
    if (!follow || !ref.current) return
    const box = ref.current.getBoundingClientRect()
    setPoint({ x: event.clientX - box.left, y: event.clientY - box.top })
  }

  return (
    <div
      {...props}
      ref={ref}
      className={cn("relative w-full", className)}
      data-reduced={reduced ? "true" : "false"}
      data-slot="hover-image-reveal"
      onMouseLeave={() => setActive(null)}
      onMouseMove={move}
    >
      {items.map((item, index) => (
        <button
          className="flex w-full items-center justify-between border-b py-4 text-left last:border-b-0"
          key={`${item.label}-${index}`}
          onFocus={() => setActive(index)}
          onMouseEnter={() => setActive(index)}
          type="button"
        >
          <span className="font-display text-3xl">{item.label}</span>
          {!follow && active === index ? (
            // eslint-disable-next-line @next/next/no-img-element -- registry 组件用 img，不引入 next/image
            <img alt={item.alt} className="ml-4 h-16 w-24 rounded-md object-cover" src={item.img} />
          ) : null}
        </button>
      ))}
      {follow && current ? (
        // eslint-disable-next-line @next/next/no-img-element -- registry 组件用 img，不引入 next/image
        <img
          alt={current.alt}
          className="pointer-events-none absolute z-10 h-36 w-48 rounded-lg object-cover shadow-xl"
          src={current.img}
          style={{ left: point.x, top: point.y, transform: "translate(-30%, -50%)" }}
        />
      ) : null}
    </div>
  )
}
