"use client"

// Ported from interior (MIT, (c) 2026 ozzy) — https://github.com/ddoemonn/interior/blob/main/components/interior/blur-up-image.tsx

import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { motion, useIsomorphicLayoutEffect } from "motion/react"
import { useEffect, useRef, useState } from "react"

export type BlurUpStatus = "loading" | "ready" | "error"

export interface BlurUpImageProps {
  src?: string
  alt: string
  width: number
  height: number
  placeholder?: string
  /** Placeholder wash. Defaults to the muted token. */
  color?: string
  /** Placeholder blur, in pixels. */
  intensity?: number
  /** Sharpening time, in milliseconds. */
  duration?: number
  /** Corner radius, in pixels. */
  size?: number
  blur?: number
  radius?: number
  srcSet?: string
  sizes?: string
  loading?: "lazy" | "eager"
  fetchPriority?: "high" | "low" | "auto"
  onReady?: () => void
  onError?: () => void
  className?: string
}

export function BlurUpImage({
  src,
  alt,
  width,
  height,
  placeholder,
  color = "var(--muted)",
  intensity = 14,
  duration = 650,
  size = 11,
  blur,
  radius,
  srcSet,
  sizes,
  loading = "lazy",
  fetchPriority,
  onReady,
  onError,
  className = "",
}: BlurUpImageProps) {
  const frameRef = useRef<HTMLDivElement>(null)
  const imgRef = useRef<HTMLImageElement>(null)
  const prefersReduced = usePrefersReducedMotion()
  const live = useAnimationActive(frameRef)
  const readyRef = useRef(onReady)
  const failedRef = useRef(onError)
  const [status, setStatus] = useState<BlurUpStatus>("loading")
  const [instant, setInstant] = useState(false)
  const blurPx = blur ?? intensity
  const corner = radius ?? size

  useEffect(() => {
    readyRef.current = onReady
    failedRef.current = onError
  }, [onReady, onError])

  useIsomorphicLayoutEffect(() => {
    const img = imgRef.current
    if (!img || !src) {
      setStatus("loading")
      setInstant(false)
      return
    }
    let alive = true
    const cached = img.complete && img.naturalWidth > 0
    const reveal = () => {
      if (!alive) return
      setInstant(cached)
      setStatus("ready")
      readyRef.current?.()
    }
    const fail = () => {
      if (!alive) return
      setInstant(cached)
      setStatus("error")
      failedRef.current?.()
    }
    if (img.complete) {
      if (cached) reveal()
      else fail()
      return () => {
        alive = false
      }
    }
    setStatus("loading")
    setInstant(false)
    const onLoad = () => {
      if (!alive) return
      if (typeof img.decode === "function") {
        img.decode().then(reveal, fail)
        return
      }
      reveal()
    }
    img.addEventListener("load", onLoad)
    img.addEventListener("error", fail)
    return () => {
      alive = false
      img.removeEventListener("load", onLoad)
      img.removeEventListener("error", fail)
    }
  }, [src, srcSet])

  const shown = status === "ready"
  const still = prefersReduced || !live || instant
  const transition = still ? { duration: 0 } : { duration: duration / 1000, ease: [0.23, 1, 0.32, 1] as const }

  return (
    <div
      ref={frameRef}
      aria-busy={status === "loading"}
      data-status={status}
      data-reduced={prefersReduced ? "" : undefined}
      data-motion={live ? "on" : "off"}
      style={{ aspectRatio: `${width} / ${height}`, borderRadius: corner, backgroundColor: color }}
      className={`relative w-full overflow-hidden motion-reduce:transition-none ${className}`}
    >
      {placeholder ? (
        <img
          src={placeholder}
          alt=""
          aria-hidden
          draggable={false}
          className="absolute inset-0 h-full w-full object-cover"
          style={{ filter: `blur(${blurPx}px)`, transform: "scale(1.08)" }}
        />
      ) : null}
      <motion.img
        ref={imgRef}
        src={src}
        srcSet={srcSet}
        sizes={sizes}
        alt={alt}
        width={width}
        height={height}
        loading={loading}
        fetchPriority={fetchPriority}
        decoding="async"
        draggable={false}
        className="absolute inset-0 h-full w-full object-cover"
        initial={false}
        animate={
          still
            ? { opacity: shown ? 1 : 0 }
            : shown
              ? { opacity: 1, filter: "blur(0px) saturate(1)", scale: 1 }
              : { opacity: 0, filter: "blur(18px) saturate(0.6)", scale: 1.06 }
        }
        transition={transition}
      />
      {status === "error" ? (
        <div className="absolute inset-0 grid place-items-center bg-background text-muted-foreground" role="img" aria-label={`${alt} failed to load`}>
          <svg width="22" height="22" viewBox="0 0 256 256" fill="currentColor" aria-hidden>
            <path d="M216 40H40a16 16 0 0 0-16 16v144a16 16 0 0 0 16 16h176a16 16 0 0 0 16-16V56a16 16 0 0 0-16-16Zm-16 16v72.2l-28.2-18.8a8 8 0 0 0-9.2.4L128 136l-18.4-13.8a8 8 0 0 0-9.6.2L56 156.2V56Zm16 144H40v-16.8l50.2-37.6 22.2 16.6a8 8 0 0 0 10.2-.6l38.2-32.6L200 168.2V200Z" />
          </svg>
        </div>
      ) : null}
    </div>
  )
}
