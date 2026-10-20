"use client"

import * as React from "react"

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export interface HoverRow {
  title: string
  meta: string
  tint: string
}

export interface HoverImageListProps {
  rows?: HoverRow[]
  className?: string
}

const defaultRows: HoverRow[] = [
  { title: "北岸灯塔", meta: "01", tint: "#312e81" },
  { title: "暮色长廊", meta: "02", tint: "#7c3aed" },
  { title: "潮汐窗口", meta: "03", tint: "#0e7490" },
  { title: "花影台阶", meta: "04", tint: "#9d174d" },
]

function HoverImageList({ rows = defaultRows, className }: HoverImageListProps) {
  const reduced = usePrefersReducedMotion()
  const frame = React.useRef<HTMLDivElement>(null)
  const [active, setActive] = React.useState<number | null>(null)
  const [point, setPoint] = React.useState({ x: 0, y: 0 })
  const current = active === null ? null : rows[active]

  return (
    <div
      ref={frame}
      className={cn("relative rounded-2xl border bg-background", className)}
      onMouseMove={(event) => {
        if (reduced || !frame.current) return
        const box = frame.current.getBoundingClientRect()
        setPoint({ x: event.clientX - box.left, y: event.clientY - box.top })
      }}
      onMouseLeave={() => setActive(null)}
    >
      {rows.map((row, index) => (
        <button
          key={row.title}
          type="button"
          className="flex w-full items-center justify-between border-b px-5 py-5 text-left last:border-b-0"
          onMouseEnter={() => setActive(index)}
          onFocus={() => setActive(index)}
        >
          <span className="font-display text-3xl">{row.title}</span>
          <span className="font-mono text-xs text-muted-foreground">{row.meta}</span>
          {reduced && active === index ? (
            <span className="ml-4 h-12 w-16 rounded-md" style={{ background: row.tint }} />
          ) : null}
        </button>
      ))}
      {!reduced && current ? (
        <div
          className="pointer-events-none absolute z-10 h-28 w-36 rounded-xl shadow-xl"
          style={{
            left: point.x,
            top: point.y,
            transform: "translate(-30%, -50%)",
            background: `linear-gradient(160deg, ${current.tint}, #09090b)`,
          }}
        />
      ) : null}
    </div>
  )
}

export { HoverImageList }
