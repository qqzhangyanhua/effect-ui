"use client"

import { useState } from "react"

import { AuroraCurtain } from "../effects/aurora-curtain"
import { DurationPicker } from "../effects/duration-picker"
import { ExposureSlider } from "../effects/exposure-slider"
import { GravityStars } from "../effects/gravity-stars"
import { InteractiveImageSelector } from "../effects/interactive-image-selector"
import { LiquidMetal } from "../effects/liquid-metal"
import { MagneticField } from "../effects/magnetic-field"
import { PixelBrushCanvas } from "../effects/pixel-brush-canvas"
import { RansomNote } from "../effects/ransom-note"
import { Scrubber } from "../effects/scrubber"
import { SdfBlobTransition } from "../effects/sdf-blob-transition"
import { SwitchboardCard } from "../effects/switchboard-card"
import { TimeMachineStack } from "../effects/time-machine-stack"
import { VideoAmbient } from "../effects/video-ambient"

const swatch = (color: string) =>
  `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="320" height="240"><rect width="320" height="240" fill="${color}"/></svg>`,
  )}`

const poster = `data:image/svg+xml,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="360"><rect width="640" height="360" fill="#0f172a"/><circle cx="180" cy="140" r="70" fill="#38bdf8"/><circle cx="430" cy="210" r="96" fill="#f59e0b"/></svg>`,
)}`

export function AuroraCurtainDemo({
  bands = 4,
  speed = 1,
  intensity = 0.9,
}: {
  bands?: number
  speed?: number
  intensity?: number
} = {}) {
  return (
    <AuroraCurtain className="h-64 w-full rounded-2xl" bands={bands} speed={speed} intensity={intensity} noise={0.35}>
      <div className="flex h-64 items-end p-6 text-2xl font-semibold text-white">极光帷幕</div>
    </AuroraCurtain>
  )
}

export function GravityStarsDemo({
  color = "#e2e8f0",
  count = 80,
  speed = 1,
}: {
  color?: string
  count?: number
  speed?: number
} = {}) {
  return (
    <GravityStars className="h-64 w-full rounded-2xl bg-slate-950" color={color} count={count} speed={speed}>
      <div className="flex h-64 items-end p-6 text-sm text-slate-200">把指针移近星群</div>
    </GravityStars>
  )
}

export function MagneticFieldDemo() {
  return (
    <MagneticField className="flex h-48 w-full items-center justify-center gap-6 rounded-2xl border" mode="attract" radius={180}>
      {["北", "窗", "夜"].map((label) => (
        <span className="rounded-full border bg-card px-4 py-2" data-magnetic="" key={label}>
          {label}
        </span>
      ))}
    </MagneticField>
  )
}

export function RansomNoteDemo() {
  return <RansomNote animate="assemble" className="text-3xl" text="北窗夜航" />
}

export function LiquidMetalDemo({
  variant = "gold",
  speed = 1,
  distortion = 1,
}: {
  variant?: "chrome" | "gold" | "mercury" | "oil"
  speed?: number
  distortion?: number
} = {}) {
  return (
    <LiquidMetal className="h-56 w-full" variant={variant} speed={speed} distortion={distortion}>
      <div className="flex h-56 items-end p-6 text-2xl font-semibold text-white">液态金属</div>
    </LiquidMetal>
  )
}

export function SdfBlobTransitionDemo() {
  const [page, setPage] = useState(0)
  const scenes = ["圆", "扭曲", "融合"]
  return (
    <div className="w-full space-y-3">
      <button className="rounded-md border px-3 py-1 text-sm" onClick={() => setPage((value) => (value + 1) % scenes.length)} type="button">
        下一幕
      </button>
      <SdfBlobTransition className="h-48" transitionKey={page} variant={page === 1 ? "warped" : page === 2 ? "merge" : "circle"}>
        <div className="flex h-48 items-center justify-center text-4xl font-semibold">{scenes[page] ?? "圆"}</div>
      </SdfBlobTransition>
    </div>
  )
}

export function VideoAmbientDemo() {
  return (
    <VideoAmbient
      alt="城市夜色"
      autoPlay={false}
      className="mx-auto w-full max-w-xl"
      controls
      poster={poster}
      src={poster}
    />
  )
}

export function PixelBrushCanvasDemo({
  grid = true,
  pixelSize = 18,
  showTools = true,
}: {
  grid?: boolean
  pixelSize?: number
  showTools?: boolean
} = {}) {
  return <PixelBrushCanvas grid={grid} height={8} pixelSize={pixelSize} showTools={showTools} width={12} />
}

export function DurationPickerDemo() {
  return <DurationPicker defaultValue={3661} label="航程" scrub />
}

export function ExposureSliderDemo() {
  return <ExposureSlider defaultValue={2} />
}

export function ScrubberDemo() {
  return <Scrubber defaultValue={1.5} label="光圈" max={8} min={1} step={0.1} ticks={8} />
}

export function SwitchboardCardDemo({
  columns = 18,
  subtitle = "机房指示灯会自己换班。",
  transitionDuration = 200,
}: { columns?: number; subtitle?: string; transitionDuration?: number } = {}) {
  return (
    <SwitchboardCard
      className="max-w-sm"
      columns={columns}
      randomLights
      subtitle={subtitle}
      title="交换台"
      transitionDuration={transitionDuration}
    />
  )
}

export function TimeMachineStackDemo({
  depth = 50,
  offsetY = 36,
  visibleCount = 4,
}: { depth?: number; offsetY?: number; visibleCount?: number } = {}) {
  return (
    <TimeMachineStack
      className="h-72"
      depth={depth}
      offsetY={offsetY}
      visibleCount={visibleCount}
      items={[
        { id: "dawn", content: <div className="flex h-full items-end bg-amber-200 p-5 text-lg">黎明</div> },
        { id: "noon", content: <div className="flex h-full items-end bg-sky-200 p-5 text-lg">正午</div> },
        { id: "dusk", content: <div className="flex h-full items-end bg-orange-300 p-5 text-lg">黄昏</div> },
      ]}
    />
  )
}

export function InteractiveImageSelectorDemo() {
  return (
    <div className="h-80 w-full max-w-md">
      <InteractiveImageSelector
        images={[
          { id: 1, src: swatch("#0f172a") },
          { id: 2, src: swatch("#0369a1") },
          { id: 3, src: swatch("#b45309") },
          { id: 4, src: swatch("#166534") },
        ]}
        selectable
      />
    </div>
  )
}
