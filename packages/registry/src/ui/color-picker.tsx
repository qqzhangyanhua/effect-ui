"use client"

import * as React from "react"
import { PipetteIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

function hslToHex(h: number, s: number, l: number) {
  const sat = s / 100
  const light = l / 100
  const a = sat * Math.min(light, 1 - light)
  const f = (n: number) => {
    const k = (n + h / 30) % 12
    const color = light - a * Math.max(Math.min(k - 3, 9 - k, 1), -1)
    return Math.round(255 * color)
      .toString(16)
      .padStart(2, "0")
  }
  return `#${f(0)}${f(8)}${f(4)}`
}

function hexToHsl(hex: string) {
  const value = hex.replace("#", "")
  const r = Number.parseInt(value.slice(0, 2), 16) / 255
  const g = Number.parseInt(value.slice(2, 4), 16) / 255
  const b = Number.parseInt(value.slice(4, 6), 16) / 255
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const l = (max + min) / 2
  if (max === min) return { h: 0, s: 0, l: l * 100 }
  const d = max - min
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
  let h = 0
  if (max === r) h = (g - b) / d + (g < b ? 6 : 0)
  else if (max === g) h = (b - r) / d + 2
  else h = (r - g) / d + 4
  return { h: h * 60, s: s * 100, l: l * 100 }
}

export interface ColorPickerProps {
  value?: string
  defaultValue?: string
  onValueChange?: (hex: string) => void
  className?: string
}

function ColorPicker({
  value,
  defaultValue = "#6366f1",
  onValueChange,
  className,
}: ColorPickerProps) {
  const initial = hexToHsl(value ?? defaultValue)
  const [hue, setHue] = React.useState(initial.h)
  const [sat, setSat] = React.useState(initial.s)
  const [light, setLight] = React.useState(initial.l)
  const hex = hslToHex(hue, sat, light)

  const emit = (nextHex: string) => {
    onValueChange?.(nextHex)
  }

  const setFromHex = (next: string) => {
    if (!/^#[0-9a-fA-F]{6}$/.test(next)) return
    const parsed = hexToHsl(next)
    setHue(parsed.h)
    setSat(parsed.s)
    setLight(parsed.l)
    emit(next.toLowerCase())
  }

  const pickFromScreen = async () => {
    if (!("EyeDropper" in window)) return
    const EyeDropperCtor = (window as unknown as { EyeDropper: new () => { open: () => Promise<{ sRGBHex: string }> } }).EyeDropper
    const result = await new EyeDropperCtor().open()
    setFromHex(result.sRGBHex)
  }

  return (
    <div className={cn("flex w-64 flex-col gap-3", className)}>
      <button
        type="button"
        aria-label="饱和度与亮度"
        className="relative h-36 w-full cursor-crosshair rounded-md border"
        style={{
          background: `linear-gradient(0deg,#000,transparent), linear-gradient(90deg,#fff,hsl(${hue} 100% 50%))`,
        }}
        onPointerDown={(event) => {
          const rect = event.currentTarget.getBoundingClientRect()
          const update = (clientX: number, clientY: number) => {
            const nextSat = Math.min(100, Math.max(0, ((clientX - rect.left) / rect.width) * 100))
            const nextLight = Math.min(100, Math.max(0, 100 - ((clientY - rect.top) / rect.height) * 100))
            setSat(nextSat)
            setLight(nextLight)
            emit(hslToHex(hue, nextSat, nextLight))
          }
          update(event.clientX, event.clientY)
          const move = (moveEvent: PointerEvent) => update(moveEvent.clientX, moveEvent.clientY)
          const up = () => {
            window.removeEventListener("pointermove", move)
            window.removeEventListener("pointerup", up)
          }
          window.addEventListener("pointermove", move)
          window.addEventListener("pointerup", up)
        }}
      >
        <span
          className="absolute size-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow"
          style={{ left: `${sat}%`, top: `${100 - light}%` }}
        />
      </button>
      <input
        type="range"
        min={0}
        max={360}
        value={hue}
        aria-label="色相"
        className="h-3 w-full cursor-pointer appearance-none rounded-full"
        style={{
          background:
            "linear-gradient(90deg,#f00,#ff0,#0f0,#0ff,#00f,#f0f,#f00)",
        }}
        onChange={(event) => {
          const nextHue = Number(event.target.value)
          setHue(nextHue)
          emit(hslToHex(nextHue, sat, light))
        }}
      />
      <div className="flex items-center gap-2">
        <span className="size-8 rounded-md border" style={{ backgroundColor: hex }} />
        <Input value={hex} onChange={(event) => setFromHex(event.target.value)} className="font-mono uppercase" />
        <Button type="button" variant="outline" size="icon" onClick={() => void pickFromScreen()} aria-label="吸管">
          <PipetteIcon />
        </Button>
      </div>
    </div>
  )
}

export { ColorPicker, hslToHex, hexToHsl }
