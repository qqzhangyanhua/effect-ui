"use client"

// Ported from uselayouts (MIT, (c) 2025 Urvish Mali) — https://github.com/iurvish/uselayouts/blob/main/registry/default/example/corner-video.tsx

import { useEffect, useRef, useState } from "react"
import { Maximize2, Minimize2, Pause, Play, Volume2, VolumeX, X } from "lucide-react"
import { motion } from "motion/react"

import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

const sources = [
  "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.webm",
  "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
]

function poster() {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="360" height="640"><rect width="360" height="640" fill="hsl(190 50% 70%)"/><text x="24" y="80" fill="hsl(200 40% 20%)" font-size="28" font-family="sans-serif">Studio</text></svg>`
  return `data:image/svg+xml,${encodeURIComponent(svg)}`
}

function clock(seconds: number) {
  if (!Number.isFinite(seconds)) return "0:00"
  const mins = Math.floor(seconds / 60)
  const rest = Math.floor(seconds % 60)
  return `${mins}:${rest.toString().padStart(2, "0")}`
}

export interface CornerVideoProps {
  title?: string
  defaultMuted?: boolean
  autoPlay?: boolean
  className?: string
}

export function CornerVideo({
  title = "Watch studio tour",
  defaultMuted = true,
  autoPlay = true,
  className,
}: CornerVideoProps) {
  const rootRef = useRef<HTMLElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const live = useAnimationActive(rootRef)
  const reduced = usePrefersReducedMotion()
  const [open, setOpen] = useState(true)
  const [muted, setMuted] = useState(defaultMuted)
  const [available, setAvailable] = useState(true)
  const [playing, setPlaying] = useState(false)
  const [enlarged, setEnlarged] = useState(false)
  const [current, setCurrent] = useState(0)
  const [length, setLength] = useState(0)
  const [controls, setControls] = useState(false)
  const shouldPlay = autoPlay && !reduced && live && open && available

  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    if (!shouldPlay) {
      video.pause()
      return
    }
    video.play().catch(() => setPlaying(false))
  }, [shouldPlay])

  const width = enlarged ? 280 : 180
  const height = enlarged ? 320 : 220
  const progress = length > 0 ? (current / length) * 100 : 0

  const scrub = (clientX: number) => {
    const track = trackRef.current
    const video = videoRef.current
    if (!track || !video || length <= 0) return
    const bounds = track.getBoundingClientRect()
    const ratio = Math.max(0, Math.min(1, (clientX - bounds.left) / Math.max(bounds.width, 1)))
    video.currentTime = ratio * length
    setCurrent(video.currentTime)
  }

  return (
    <section ref={rootRef} className={cn("relative min-h-80 w-full bg-[var(--muted)]", className)}>
      <motion.div
        layout
        transition={reduced ? { duration: 0 } : { duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
        className="absolute right-4 bottom-4 overflow-hidden shadow-lg motion-reduce:transition-none"
        style={{
          width: open ? width : "auto",
          height: open ? height : 44,
          borderRadius: open ? 16 : 22,
          backgroundColor: open ? "var(--accent)" : "var(--muted)",
        }}
        data-open={open ? "true" : "false"}
      >
        <div
          className={cn("absolute inset-0", open ? "pointer-events-auto" : "pointer-events-none")}
          onPointerEnter={(event) => {
            if (event.pointerType === "mouse") setControls(true)
          }}
          onPointerLeave={(event) => {
            if (event.pointerType === "mouse") setControls(false)
          }}
          onFocus={() => setControls(true)}
          onBlur={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget)) setControls(false)
          }}
        >
          {available ? (
            <video
              ref={videoRef}
              poster={poster()}
              muted={muted}
              loop
              playsInline
              preload="metadata"
              onClick={() => {
                const video = videoRef.current
                if (!video) return
                if (video.paused) {
                  video.play().catch(() => setAvailable(false))
                  setPlaying(true)
                } else {
                  video.pause()
                  setPlaying(false)
                }
              }}
              onTimeUpdate={() => {
                if (videoRef.current) setCurrent(videoRef.current.currentTime)
              }}
              onLoadedMetadata={() => {
                if (videoRef.current?.duration) setLength(videoRef.current.duration)
              }}
              onPlay={() => setPlaying(true)}
              onPause={() => setPlaying(false)}
              onError={() => setAvailable(false)}
              className="block h-full w-full object-cover"
            >
              {sources.map((src) => (
                <source key={src} src={src} />
              ))}
            </video>
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-[var(--accent)] px-3 text-center text-sm text-[var(--foreground)]">
              Preview unavailable
            </div>
          )}
          <div className={cn("absolute top-2 right-2 left-2 z-10 flex justify-between", controls || reduced ? "opacity-100" : "opacity-0")}>
            <div className="flex gap-1.5">
              <button type="button" aria-label={muted ? "Unmute" : "Mute"} onClick={() => setMuted((value) => !value)} className="flex size-7 items-center justify-center rounded-full bg-[var(--background)]">
                {muted ? <VolumeX className="size-3.5" /> : <Volume2 className="size-3.5" />}
              </button>
              <button type="button" aria-label={playing ? "Pause" : "Play"} onClick={() => videoRef.current?.click()} className="flex size-7 items-center justify-center rounded-full bg-[var(--background)]">
                {playing ? <Pause className="size-3.5" /> : <Play className="size-3.5" />}
              </button>
              <button type="button" aria-label={enlarged ? "Shrink" : "Enlarge"} onClick={() => setEnlarged((value) => !value)} className="flex size-7 items-center justify-center rounded-full bg-[var(--background)]">
                {enlarged ? <Minimize2 className="size-3.5" /> : <Maximize2 className="size-3.5" />}
              </button>
            </div>
            <button type="button" aria-label="Close" onClick={() => { videoRef.current?.pause(); setOpen(false) }} className="flex size-7 items-center justify-center rounded-full bg-[var(--background)]">
              <X className="size-3.5" />
            </button>
          </div>
          <div
            className="absolute right-0 bottom-0 left-0 z-10 flex h-8 cursor-pointer flex-col justify-end"
            onPointerDown={(event) => {
              event.stopPropagation()
              scrub(event.clientX)
            }}
          >
            <div className="flex justify-between px-2 text-[10px] text-[var(--foreground)]">
              <span>{clock(current)}</span>
              <span>{clock(length)}</span>
            </div>
            <div ref={trackRef} className="mx-2 mb-2 h-1.5 overflow-hidden rounded-full bg-[var(--background)]/50">
              <div className="h-full bg-[var(--foreground)]" style={{ width: `${progress}%` }} />
            </div>
          </div>
        </div>
        <button
          type="button"
          aria-hidden={open}
          tabIndex={open ? -1 : 0}
          onClick={() => setOpen(true)}
          className={cn("flex h-11 items-center gap-2 px-4 text-sm font-medium whitespace-nowrap", open && "pointer-events-none")}
        >
          <Play className="size-3.5" />
          {title}
          {length > 0 ? ` (${Math.round(length)}s)` : ""}
        </button>
      </motion.div>
    </section>
  )
}

export default CornerVideo
