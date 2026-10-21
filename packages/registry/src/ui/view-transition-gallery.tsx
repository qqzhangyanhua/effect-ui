"use client"

import * as React from "react"
import { flushSync } from "react-dom"
import { LayoutGroup, motion } from "motion/react"

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export interface GalleryShot {
  id: string
  title: string
  tint: string
}

export interface ViewTransitionGalleryProps {
  shots?: GalleryShot[]
  className?: string
  gap?: number
  size?: number
}

const defaultShots: GalleryShot[] = [
  { id: "north", title: "北岸", tint: "#312e81" },
  { id: "violet", title: "暮紫", tint: "#7c3aed" },
  { id: "tide", title: "潮色", tint: "#22d3ee" },
  { id: "bloom", title: "花影", tint: "#f472b6" },
  { id: "ember", title: "余烬", tint: "#f59e0b" },
  { id: "ink", title: "墨色", tint: "#18181b" },
]

function canUseViewTransition() {
  return typeof document.startViewTransition === "function"
}

function ViewTransitionGallery({ shots = defaultShots, className, gap, size }: ViewTransitionGalleryProps) {
  const gapPx = gap === undefined || gap === 12 ? undefined : gap
  const thumbPx = size === undefined || size === 112 ? undefined : size
  const reduced = usePrefersReducedMotion()
  const native = React.useSyncExternalStore(
    () => () => {},
    canUseViewTransition,
    () => false,
  )
  const [selected, setSelected] = React.useState<string | null>(null)
  const shot = shots.find((item) => item.id === selected) ?? null
  const useNative = native && !reduced

  const change = (next: string | null) => {
    if (!useNative) {
      setSelected(next)
      return
    }
    const name = `shot-${next ?? selected}`
    const outgoing = document.getElementById(next ? `thumb-${next}` : `detail-${selected}`)
    if (outgoing) outgoing.style.viewTransitionName = name
    document.startViewTransition(() => {
      flushSync(() => setSelected(next))
      if (outgoing) outgoing.style.viewTransitionName = ""
      const incoming = document.getElementById(next ? `detail-${next}` : `thumb-${selected}`)
      if (incoming) incoming.style.viewTransitionName = name
    })
  }

  return (
    <LayoutGroup>
      <div className={cn("relative rounded-2xl border bg-background p-4", className)}>
        <p className="mb-3 text-xs tracking-[0.22em] text-muted-foreground uppercase">Shared element</p>
        <div className={gapPx === undefined ? "grid grid-cols-3 gap-3" : "grid grid-cols-3"} style={gapPx === undefined ? undefined : { gap: gapPx }}>
          {shots.map((item) => (
            <button
              key={item.id}
              type="button"
              id={`thumb-${item.id}`}
              onClick={() => change(item.id)}
              className="text-left"
            >
              <motion.span
                layoutId={useNative ? undefined : `shot-${item.id}`}
                className={
                  thumbPx === undefined
                    ? "grid h-28 w-full place-items-end rounded-xl p-3 text-sm text-white"
                    : "grid w-full place-items-end rounded-xl p-3 text-sm text-white"
                }
                style={
                  thumbPx === undefined
                    ? { background: `linear-gradient(160deg, ${item.tint}, #09090b)` }
                    : { background: `linear-gradient(160deg, ${item.tint}, #09090b)`, height: thumbPx }
                }
              >
                {item.title}
              </motion.span>
            </button>
          ))}
        </div>
        {shot ? (
          <div className="absolute inset-0 z-10 grid place-items-center bg-black/45 p-6" onClick={() => change(null)}>
            <motion.div
              id={`detail-${shot.id}`}
              layoutId={useNative ? undefined : `shot-${shot.id}`}
              className="grid h-64 w-full max-w-md place-items-end rounded-3xl p-5 text-white shadow-2xl"
              style={{
                background: `linear-gradient(160deg, ${shot.tint}, #09090b)`,
                viewTransitionName: useNative ? `shot-${shot.id}` : undefined,
              }}
              onClick={(event) => event.stopPropagation()}
            >
              <span className="text-2xl">{shot.title}</span>
              <button type="button" className="mt-3 rounded-full bg-white/15 px-3 py-1 text-xs" onClick={() => change(null)}>
                返回
              </button>
            </motion.div>
          </div>
        ) : null}
      </div>
    </LayoutGroup>
  )
}

export { ViewTransitionGallery }
