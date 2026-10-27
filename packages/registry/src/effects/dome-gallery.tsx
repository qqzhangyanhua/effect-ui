"use client"

import { motion, useAnimationFrame, useMotionValue } from "motion/react"
import * as React from "react"

import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/cn"

export interface DomeGalleryProps {
  className?: string
  count?: number
  speed?: number
  size?: number
}

interface DomeTile {
  id: string
  label: string
  background: string
  lon: number
  lat: number
}

const BACKGROUNDS = [
  "linear-gradient(160deg,#312e81,#818cf8)",
  "linear-gradient(160deg,#0f766e,#5eead4)",
  "linear-gradient(160deg,#9a3412,#fdba74)",
  "linear-gradient(160deg,#831843,#f9a8d4)",
  "linear-gradient(160deg,#1e3a8a,#7dd3fc)",
  "linear-gradient(160deg,#3f6212,#bef264)",
  "linear-gradient(160deg,#44403c,#d6d3d1)",
  "linear-gradient(160deg,#4c1d95,#c4b5fd)",
]

function buildTiles(count: number): DomeTile[] {
  return Array.from({ length: count }, (_, index) => {
    const y = 1 - (index / Math.max(count - 1, 1)) * 2
    const theta = Math.PI * (3 - Math.sqrt(5)) * index
    return {
      id: `dome-${index}`,
      label: String(index + 1).padStart(2, "0"),
      background: BACKGROUNDS[index % BACKGROUNDS.length] ?? "#444",
      lon: (theta * 180) / Math.PI,
      lat: Math.asin(Math.max(-1, Math.min(1, y))) * (180 / Math.PI),
    }
  })
}

const TILES = buildTiles(20)

function DomeGallery({ className, count, speed, size }: DomeGalleryProps) {
  const reduced = usePrefersReducedMotion()
  const hostRef = React.useRef<HTMLDivElement>(null)
  const active = useAnimationActive(hostRef)
  const total = count === undefined || count === 20 ? 20 : count
  const tiles = total === 20 ? TILES : buildTiles(total)
  const rate = speed === undefined || speed === 1 ? 1 : speed
  const depth = size === undefined || size === 168 ? 168 : size
  const [open, setOpen] = React.useState<DomeTile | null>(null)
  const rotX = useMotionValue(-8)
  const rotY = useMotionValue(16)
  const drag = React.useRef({ active: false, x: 0, y: 0, moved: false })
  const rateRef = React.useRef(rate)
  const activeRef = React.useRef(false)
  const reducedRef = React.useRef(reduced)

  React.useEffect(() => {
    rateRef.current = rate
    activeRef.current = active
    reducedRef.current = reduced
  }, [active, rate, reduced])

  useAnimationFrame((_, delta) => {
    if (reducedRef.current || !activeRef.current || drag.current.active) return
    const spin = rateRef.current === 1 ? 0.012 : 0.012 * rateRef.current
    rotY.set(rotY.get() + delta * spin)
  })

  if (reduced) {
    return (
      <div ref={hostRef} data-slot="dome-gallery" className={cn("relative w-full", className)}>
        <div className="grid grid-cols-4 gap-2 sm:grid-cols-5">
          {tiles.map((tile) => (
            <TileButton key={tile.id} tile={tile} flat onOpen={setOpen} />
          ))}
        </div>
        <Enlarged tile={open} onClose={() => setOpen(null)} />
      </div>
    )
  }

  return (
    <div ref={hostRef} data-slot="dome-gallery" className={cn("relative h-[440px] w-full overflow-hidden rounded-xl bg-zinc-950", className)}>
      <div
        className="absolute inset-0 cursor-grab touch-none active:cursor-grabbing"
        style={{ perspective: 880 }}
        onPointerDown={(event) => {
          drag.current = { active: true, x: event.clientX, y: event.clientY, moved: false }
          event.currentTarget.setPointerCapture(event.pointerId)
        }}
        onPointerMove={(event) => {
          if (!drag.current.active) return
          const dx = event.clientX - drag.current.x
          const dy = event.clientY - drag.current.y
          if (Math.hypot(dx, dy) > 4) drag.current.moved = true
          drag.current.x = event.clientX
          drag.current.y = event.clientY
          rotY.set(rotY.get() + dx * 0.45)
          rotX.set(Math.max(-35, Math.min(35, rotX.get() - dy * 0.3)))
        }}
        onPointerUp={() => {
          drag.current.active = false
        }}
        onPointerCancel={() => {
          drag.current.active = false
        }}
      >
        <motion.div
          className="absolute top-1/2 left-1/2 size-0"
          style={{ rotateX: rotX, rotateY: rotY, transformStyle: "preserve-3d" }}
        >
          {tiles.map((tile) => (
            <button
              key={tile.id}
              type="button"
              className="absolute flex h-20 w-16 items-end rounded-md p-1.5 text-left text-xs font-medium text-white shadow-lg"
              style={{
                left: 0,
                top: 0,
                background: tile.background,
                transform: `rotateY(${tile.lon}deg) rotateX(${tile.lat}deg) translateZ(${depth}px) translate(-50%, -50%)`,
                backfaceVisibility: "hidden",
              }}
              onClick={() => {
                if (drag.current.moved) return
                setOpen(tile)
              }}
            >
              {tile.label}
            </button>
          ))}
        </motion.div>
      </div>
      <p className="pointer-events-none absolute bottom-3 left-0 w-full text-center text-xs text-zinc-400">
        拖动旋转 · 点击放大
      </p>
      <Enlarged tile={open} onClose={() => setOpen(null)} />
    </div>
  )
}

function TileButton({
  tile,
  flat,
  onOpen,
}: {
  tile: DomeTile
  flat?: boolean
  onOpen: (tile: DomeTile) => void
}) {
  return (
    <button
      type="button"
      className={cn("flex items-end rounded-md p-1.5 text-left text-xs font-medium text-white", flat && "aspect-[3/4]")}
      style={{ background: tile.background }}
      onClick={() => onOpen(tile)}
    >
      {tile.label}
    </button>
  )
}

function Enlarged({ tile, onClose }: { tile: DomeTile | null; onClose: () => void }) {
  if (!tile) return null
  return (
    <div className="absolute inset-0 z-20 grid place-items-center bg-black/55 p-6" onClick={onClose}>
      <motion.div
        role="dialog"
        aria-label={`放大 ${tile.label}`}
        initial={{ scale: 0.86, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="flex h-64 w-48 flex-col justify-between rounded-2xl p-4 text-white shadow-2xl"
        style={{ background: tile.background }}
        onClick={(event) => event.stopPropagation()}
      >
        <span className="text-sm tracking-[0.2em]">TILE</span>
        <span className="font-display text-6xl">{tile.label}</span>
        <button type="button" className="text-left text-sm underline" onClick={onClose}>
          关闭
        </button>
      </motion.div>
    </div>
  )
}

export { DomeGallery }
