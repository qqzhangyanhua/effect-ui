"use client"

// Ported from uselayouts (MIT, (c) 2025 Urvish Mali) — https://github.com/iurvish/uselayouts/blob/main/registry/default/example/photo-albums.tsx

import { useId, useRef, useState } from "react"
import { ChevronLeft } from "lucide-react"
import { LayoutGroup, motion } from "motion/react"

import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export interface AlbumPhoto {
  id: string
  src: string
}

export interface AlbumCollection {
  id: string
  title: string
  subtitle: string
  photos: AlbumPhoto[]
}

function swatch(title: string, hue: number) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="480" height="480"><rect width="480" height="480" fill="hsl(${hue} 38% 46%)"/><circle cx="360" cy="90" r="36" fill="white" fill-opacity="0.7"/></svg>`
  return `data:image/svg+xml,${encodeURIComponent(svg)}`
}

function album(id: string, title: string, subtitle: string, hue: number): AlbumCollection {
  return {
    id,
    title,
    subtitle,
    photos: Array.from({ length: 6 }, (_, index) => ({
      id: `${id}-${index + 1}`,
      src: swatch(title, hue + index * 10),
    })),
  }
}

export const DEFAULT_ALBUMS: AlbumCollection[] = [
  album("c1", "Travel & Exploration", "Private", 198),
  album("c2", "Industrial Design", "Private", 220),
  album("c3", "Modern Architecture", "Private", 210),
  album("c4", "Abstract Art", "Public", 280),
]

export interface PhotoAlbumsProps {
  collections?: AlbumCollection[]
  color?: string
  duration?: number
  intensity?: number
  size?: number
  className?: string
}

export function PhotoAlbums({
  collections = DEFAULT_ALBUMS,
  color = "var(--foreground)",
  duration = 480,
  intensity = 14,
  size = 136,
  className,
}: PhotoAlbumsProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const live = useAnimationActive(rootRef)
  const reduced = usePrefersReducedMotion()
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const layoutGroupId = useId()
  const selected = collections.find((item) => item.id === selectedId) ?? null
  const spring = reduced || !live ? { duration: 0 } : { type: "spring" as const, stiffness: 280, damping: 32, mass: 1 }
  const fade = reduced || !live ? { duration: 0 } : { duration: duration / 1000 }

  return (
    <div
      ref={rootRef}
      data-open={selectedId ?? "none"}
      data-motion={live ? "on" : "off"}
      data-reduced={reduced ? "true" : "false"}
      className={cn("flex w-full max-w-md flex-col px-4 py-6 text-[var(--foreground)]", className)}
      style={{ color }}
    >
      <LayoutGroup id={layoutGroupId}>
        {selected ? (
          <div className="flex min-h-0 flex-col">
            <button
              type="button"
              onClick={() => setSelectedId(null)}
              className="mb-4 flex size-12 items-center justify-center rounded-full bg-[var(--muted)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ring)] motion-reduce:transform-none"
            >
              <ChevronLeft size={24} strokeWidth={2.5} />
              <span className="sr-only">Go back</span>
            </button>
            <motion.h2 layoutId={`title-${selected.id}`} transition={spring} className="mb-4 text-3xl font-medium tracking-tight">
              {selected.title}
            </motion.h2>
            <div className="grid grid-cols-2 gap-4">
              {selected.photos.map((photo) => (
                <motion.div
                  key={photo.id}
                  layoutId={`photo-${photo.id}`}
                  transition={spring}
                  className="aspect-square overflow-hidden rounded-2xl bg-[var(--muted)] ring-1 ring-[var(--border)]"
                >
                  <img src={photo.src} alt="" className="h-full w-full object-cover" />
                </motion.div>
              ))}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-x-8 gap-y-10">
            {collections.map((collection) => (
              <button
                key={collection.id}
                type="button"
                onClick={() => setSelectedId(collection.id)}
                className="group flex flex-col items-center outline-none focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--ring)]"
              >
                <span className="relative mb-3 flex aspect-square w-full items-center justify-center">
                  {collection.photos.slice(0, 3).map((photo, index) => {
                    const rotations = [-intensity, intensity, 0]
                    return (
                      <motion.span
                        key={photo.id}
                        layoutId={`photo-${photo.id}`}
                        className="absolute overflow-hidden rounded-3xl bg-[var(--muted)] ring-1 ring-[var(--border)] motion-reduce:transform-none"
                        style={{ width: size * 0.72, height: size * 0.72 }}
                        animate={{ rotate: reduced ? 0 : (rotations[index] ?? 0) }}
                        transition={fade}
                      >
                        <img src={photo.src} alt="" className="pointer-events-none h-full w-full object-cover" />
                      </motion.span>
                    )
                  })}
                </span>
                <motion.span layoutId={`title-${collection.id}`} transition={spring} className="text-center text-base font-medium">
                  {collection.title}
                </motion.span>
                <span className="sr-only">{collection.subtitle}</span>
              </button>
            ))}
          </div>
        )}
      </LayoutGroup>
    </div>
  )
}

export default PhotoAlbums
