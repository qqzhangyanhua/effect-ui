"use client"

import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from "react"

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/cn"

export interface ColorStepRailProps {
  count?: number
  pace?: number
  format?: "hex" | "oklch"
  hue?: number
  colors?: readonly string[]
  className?: string
  onCopy?: (value: string) => void
}

interface Swatch {
  hex: string
  oklch: string
  css: string
}

function clamp(value: number, min: number, max: number) {
  if (!Number.isFinite(value)) return min
  return Math.min(max, Math.max(min, value))
}

function rateOf(pace: number) {
  return Number.isFinite(pace) && pace > 0 ? pace : 1
}

function byte(channel: number) {
  const linear = Math.min(1, Math.max(0, channel))
  const encoded = linear <= 0.0031308 ? 12.92 * linear : 1.055 * linear ** (1 / 2.4) - 0.055
  return Math.round(Math.min(1, Math.max(0, encoded)) * 255)
      .toString(16)
      .padStart(2, "0")
}

/** OKLCH 转到 sRGB hex。公式按 Ottosson 的 OKLab 矩阵，没有外部库。 */
function oklchToHex(lightness: number, chroma: number, hue: number) {
  const radians = (hue * Math.PI) / 180
  const a = chroma * Math.cos(radians)
  const b = chroma * Math.sin(radians)
  const lmsL = lightness + 0.3963377774 * a + 0.2158037573 * b
  const lmsM = lightness - 0.1055613458 * a - 0.0638541728 * b
  const lmsS = lightness - 0.0894841775 * a - 1.291485548 * b
  const l = lmsL ** 3
  const m = lmsM ** 3
  const s = lmsS ** 3
  const red = 4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s
  const green = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s
  const blue = -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s
  return `#${byte(red)}${byte(green)}${byte(blue)}`
}

function buildScale(hue: number, count: number): Swatch[] {
  const wrapped = ((hue % 360) + 360) % 360
  return Array.from({ length: count }, (_, index) => {
    const t = count <= 1 ? 0.5 : index / (count - 1)
    const lightness = 0.32 + t * 0.52
    const chroma = 0.045 + Math.sin(t * Math.PI) * 0.13
    const oklch = `oklch(${(lightness * 100).toFixed(1)}% ${chroma.toFixed(3)} ${wrapped.toFixed(1)})`
    const hex = oklchToHex(lightness, chroma, wrapped)
    return { hex, oklch, css: hex }
  })
}

function swatchesOf(colors: readonly string[] | undefined, hue: number, count: number) {
  if (colors && colors.length > 0) {
    return colors.map((css) => ({ hex: css, oklch: css, css }))
  }
  return buildScale(hue, count)
}

function labelOf(swatch: Swatch, format: "hex" | "oklch") {
  return format === "oklch" ? swatch.oklch : swatch.hex
}

export function ColorStepRail({
  count = 8,
  pace = 1,
  format = "hex",
  hue = 262,
  colors,
  className,
  onCopy,
}: ColorStepRailProps) {
  const reduced = usePrefersReducedMotion()
  const steps = Math.round(clamp(count, 4, 14))
  const shownFormat = format === "oklch" ? "oklch" : "hex"
  const hueValue = Number.isFinite(hue) ? hue : 262
  const palette = swatchesOf(colors, hueValue, steps)
  const [index, setIndex] = useState(0)
  const [phase, setPhase] = useState<"idle" | "active" | "copied">("idle")
  const railRef = useRef<HTMLDivElement>(null)
  const stopDrag = useRef<(() => void) | null>(null)
  const safeIndex = Math.min(index, Math.max(0, palette.length - 1))
  const active = palette[safeIndex]
  const label = active ? labelOf(active, shownFormat) : ""
  const ms = Math.round(260 / rateOf(pace))

  useEffect(() => {
    if (phase !== "copied") return
    const timer = window.setTimeout(() => setPhase("active"), 900)
    return () => window.clearTimeout(timer)
  }, [phase])

  useEffect(() => () => stopDrag.current?.(), [])

  function select(next: number, focus = false) {
    const clamped = Math.max(0, Math.min(palette.length - 1, next))
    setIndex(clamped)
    setPhase((current) => (current === "copied" ? current : "active"))
    if (!focus) return
    railRef.current?.querySelector<HTMLElement>(`[data-index="${clamped}"]`)?.focus()
  }

  function indexAt(clientX: number) {
    const rect = railRef.current?.getBoundingClientRect()
    const width = rect && rect.width > 0 ? rect.width : 320
    const left = rect && rect.width > 0 ? rect.left : 0
    const ratio = (clientX - left) / width
    return Math.max(0, Math.min(palette.length - 1, Math.floor(ratio * palette.length)))
  }

  function onPointerDown(event: PointerEvent<HTMLDivElement>) {
    if (event.button !== 0) return
    const target = event.target
    if (target instanceof HTMLElement && target.closest("button") === null && target !== event.currentTarget) return
    select(indexAt(event.clientX))
    stopDrag.current?.()
    const pointerId = event.pointerId
    const move = (native: globalThis.PointerEvent) => {
      if (native.pointerId !== pointerId) return
      select(indexAt(native.clientX))
    }
    const stop = () => {
      window.removeEventListener("pointermove", move)
      window.removeEventListener("pointerup", stop)
      window.removeEventListener("pointercancel", stop)
      if (stopDrag.current === stop) stopDrag.current = null
    }
    stopDrag.current = stop
    window.addEventListener("pointermove", move)
    window.addEventListener("pointerup", stop)
    window.addEventListener("pointercancel", stop)
  }

  function onKeyDown(event: KeyboardEvent<HTMLElement>) {
    if (event.key === "ArrowRight") {
      event.preventDefault()
      select(safeIndex + 1, true)
    } else if (event.key === "ArrowLeft") {
      event.preventDefault()
      select(safeIndex - 1, true)
    } else if (event.key === "Home") {
      event.preventDefault()
      select(0, true)
    } else if (event.key === "End") {
      event.preventDefault()
      select(palette.length - 1, true)
    }
  }

  function copyActive() {
    if (!label) return
    const task = navigator.clipboard?.writeText(label)
    if (task) void task.catch(() => undefined)
    onCopy?.(label)
    setPhase("copied")
  }

  return (
    <div
      data-slot="color-step-rail"
      data-count={palette.length}
      data-pace={pace}
      data-format={shownFormat}
      data-hue={hueValue}
      data-motion={reduced ? "off" : "on"}
      data-state={phase}
      data-index={safeIndex}
      data-pop={reduced ? "off" : "on"}
      className={cn("space-y-4 motion-reduce:transition-none", className)}
    >
      <div
        role="slider"
        aria-label="当前色阶"
        aria-valuemin={0}
        aria-valuemax={Math.max(0, palette.length - 1)}
        aria-valuenow={safeIndex}
        aria-valuetext={label}
        className="sr-only"
      />
      <div
        ref={railRef}
        role="radiogroup"
        aria-label="色阶"
        onPointerDown={onPointerDown}
        onKeyDown={onKeyDown}
        className="flex touch-none items-end gap-2 py-3"
      >
        {palette.map((swatch, swatchIndex) => {
          const on = swatchIndex === safeIndex
          const popped = on && phase !== "idle" && !reduced
          return (
            <button
              key={`${swatch.css}-${swatchIndex}`}
              type="button"
              role="radio"
              data-index={swatchIndex}
              aria-checked={on}
              aria-label={labelOf(swatch, shownFormat)}
              tabIndex={on ? 0 : -1}
              onClick={() => select(swatchIndex)}
              style={{
                background: swatch.css,
                transform: popped ? "translateY(-8px) scale(1.12)" : "none",
                transition: reduced ? "none" : `transform ${ms}ms cubic-bezier(0.2, 1.35, 0.36, 1)`,
              }}
              className={cn(
                "h-12 min-w-0 flex-1 rounded-xl border border-border outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transform-none motion-reduce:transition-none",
                on && "ring-2 ring-foreground",
              )}
            />
          )
        })}
      </div>
      <div className="flex items-center justify-between gap-3">
        <p data-value={label} className="font-mono text-sm text-foreground">
          {label}
        </p>
        <button
          type="button"
          onClick={copyActive}
          className="rounded-full bg-primary px-3 py-1.5 text-sm text-primary-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          复制
        </button>
      </div>
      <p role="status" className="min-h-5 text-sm text-muted-foreground">
        {phase === "copied" ? "Copied" : "点选、拖动，或用左右方向键。"}
      </p>
    </div>
  )
}
