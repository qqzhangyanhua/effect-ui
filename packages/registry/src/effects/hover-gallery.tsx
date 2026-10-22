"use client"

// Ported from daisyUI（MIT，(c) 2020 Pouya Saadeghi）— https://github.com/saadeghi/daisyui/blob/main/packages/daisyui/src/components/hovergallery.css. Modified for effect-ui.

import { useRef, useState, type HTMLAttributes, type PointerEvent } from "react"

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export interface HoverGalleryImage {
  src: string
  alt: string
}

export interface HoverGalleryProps extends HTMLAttributes<HTMLDivElement> {
  images: readonly (string | HoverGalleryImage)[]
  alt?: string
  progress?: boolean
}

function frameOf(image: string | HoverGalleryImage, alt: string | undefined, index: number): HoverGalleryImage {
  if (typeof image === "string") return { src: image, alt: alt ?? `图片 ${index + 1}` }
  return image
}

export function HoverGallery({ images, alt, progress = false, className, ...props }: HoverGalleryProps) {
  const ref = useRef<HTMLDivElement>(null)
  const reduced = usePrefersReducedMotion()
  const [index, setIndex] = useState(0)
  const [dragging, setDragging] = useState(false)
  const count = images.length
  const safeIndex = count === 0 ? 0 : Math.min(index, count - 1)
  const current = count === 0 ? undefined : frameOf(images[safeIndex] ?? images[0] ?? "", alt, safeIndex)

  function scrub(clientX: number) {
    const node = ref.current
    if (!node || count === 0) return
    const rect = node.getBoundingClientRect()
    const ratio = rect.width <= 0 ? 0 : (clientX - rect.left) / rect.width
    const next = Math.min(count - 1, Math.max(0, Math.floor(Math.min(1, Math.max(0, ratio)) * count)))
    setIndex(next)
  }

  function onPointerDown(event: PointerEvent<HTMLDivElement>) {
    if (event.pointerType === "touch" || event.pointerType === "pen") {
      setDragging(true)
      event.currentTarget.setPointerCapture(event.pointerId)
      scrub(event.clientX)
    }
  }

  function onPointerMove(event: PointerEvent<HTMLDivElement>) {
    if (event.pointerType === "mouse" || dragging) scrub(event.clientX)
  }

  function onPointerUp() {
    setDragging(false)
  }

  return (
    <div
      {...props}
      ref={ref}
      className={cn("relative aspect-[4/3] w-full overflow-hidden rounded-lg bg-muted", className)}
      data-index={safeIndex}
      data-reduced={reduced ? "true" : "false"}
      data-slot="hover-gallery"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      {current ? (
        // eslint-disable-next-line @next/next/no-img-element -- registry 组件用 img，不引入 next/image
        <img
          alt={current.alt}
          className="size-full object-cover"
          draggable={false}
          src={current.src}
          style={{ transition: reduced ? "none" : "opacity 160ms linear" }}
        />
      ) : null}
      {progress && count > 0 ? (
        <span aria-hidden className="absolute inset-x-3 bottom-3 h-1 overflow-hidden rounded-full bg-background/70" data-part="progress">
          <span className="block h-full bg-primary" style={{ width: `${((safeIndex + 1) / count) * 100}%`, transition: reduced ? "none" : "width 160ms linear" }} />
        </span>
      ) : null}
    </div>
  )
}
