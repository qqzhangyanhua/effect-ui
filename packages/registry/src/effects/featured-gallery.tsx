"use client"

// Ported from Flowbite (MIT, (c) 2023 Bergside Inc.) — https://github.com/themesberg/flowbite/blob/main/content/components/gallery.md. Modified for effect-ui.

import { useRef, useState, type HTMLAttributes, type KeyboardEvent } from "react"

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export interface FeaturedGalleryImage {
  src: string
  alt: string
  tags?: readonly string[]
}

export interface FeaturedGalleryProps extends HTMLAttributes<HTMLDivElement> {
  images: readonly FeaturedGalleryImage[]
  tags?: readonly string[]
}

export function FeaturedGallery({ images, tags = [], className, ...props }: FeaturedGalleryProps) {
  const ref = useRef<HTMLDivElement>(null)
  const reduced = usePrefersReducedMotion()
  const [tag, setTag] = useState<string | null>(null)
  const [index, setIndex] = useState(0)
  const filtered = tag ? images.filter((image) => image.tags?.includes(tag)) : images
  const safeIndex = filtered.length === 0 ? 0 : Math.min(index, filtered.length - 1)
  const current = filtered[safeIndex]

  function pick(next: number) {
    if (filtered.length === 0) return
    const span = filtered.length
    setIndex((next + span) % span)
  }

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "ArrowRight") {
      event.preventDefault()
      pick(safeIndex + 1)
    }
    if (event.key === "ArrowLeft") {
      event.preventDefault()
      pick(safeIndex - 1)
    }
  }

  return (
    <div
      {...props}
      ref={ref}
      aria-label="精选图库"
      className={cn("grid w-full max-w-3xl gap-4", className)}
      data-reduced={reduced ? "true" : "false"}
      data-slot="featured-gallery"
      onKeyDown={onKeyDown}
      role="region"
      tabIndex={0}
    >
      <style>
        {`[data-slot="featured-gallery"][data-reduced="false"] [data-part="main"]{animation:featured-gallery-fade .35s ease}
@keyframes featured-gallery-fade{from{opacity:0}to{opacity:1}}`}
      </style>
      {tags.length > 0 ? (
        <div className="flex flex-wrap items-center justify-center gap-3 py-2">
          <button
            aria-pressed={tag === null}
            className={cn("rounded-md border px-4 py-2 text-sm font-medium", tag === null ? "border-primary text-primary" : "border-border")}
            onClick={() => {
              setTag(null)
              setIndex(0)
            }}
            type="button"
          >
            全部
          </button>
          {tags.map((item) => (
            <button
              key={item}
              aria-pressed={tag === item}
              className={cn("rounded-md border px-4 py-2 text-sm font-medium", tag === item ? "border-primary text-primary" : "border-border hover:border-foreground")}
              onClick={() => {
                setTag(item)
                setIndex(0)
              }}
              type="button"
            >
              {item}
            </button>
          ))}
        </div>
      ) : null}
      {current ? (
        // eslint-disable-next-line @next/next/no-img-element -- registry 组件用 img，不引入 next/image
        <img alt={current.alt} className="h-auto max-h-80 w-full rounded-md object-cover" data-part="main" key={current.src} src={current.src} />
      ) : (
        <p className="rounded-md border border-dashed border-border p-8 text-center text-sm text-muted-foreground">暂无图片</p>
      )}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-5 gap-3">
          {filtered.map((image, imageIndex) => (
            <button
              key={image.src + image.alt}
              aria-current={imageIndex === safeIndex ? "true" : undefined}
              aria-label={image.alt}
              className={cn("overflow-hidden rounded-md border-2", imageIndex === safeIndex ? "border-primary" : "border-transparent")}
              onClick={() => setIndex(imageIndex)}
              type="button"
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- registry 组件用 img，不引入 next/image */}
              <img alt="" className="aspect-square h-auto w-full object-cover" src={image.src} />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  )
}
