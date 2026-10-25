"use client"

import { AuroraCurtain } from "../effects/aurora-curtain"
import { DurationPicker } from "../effects/duration-picker"
import { ExposureSlider } from "../effects/exposure-slider"
import { GravityStars } from "../effects/gravity-stars"
import { InteractiveImageSelector } from "../effects/interactive-image-selector"
import { LiquidMetal } from "../effects/liquid-metal"
import { MagneticField } from "../effects/magnetic-field"
import { RansomNote } from "../effects/ransom-note"
import { Scrubber } from "../effects/scrubber"

import { SwitchboardCard } from "../effects/switchboard-card"
import { TimeMachineStack } from "../effects/time-machine-stack"


const swatch = (color: string) =>
  `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="320" height="240"><rect width="320" height="240" fill="${color}"/></svg>`,
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

export function MagneticFieldDemo({
  mode = "attract",
  radius = 180,
  strength = 0.35,
}: { mode?: "attract" | "repel" | "orbit"; radius?: number; strength?: number } = {}) {
  return (
    <MagneticField className="flex h-48 w-full items-center justify-center gap-6 rounded-2xl border" mode={mode} radius={radius} strength={strength}>
      {["北", "窗", "夜"].map((label) => (
        <span className="rounded-full border bg-card px-4 py-2" data-magnetic="" key={label}>
          {label}
        </span>
      ))}
    </MagneticField>
  )
}

export function RansomNoteDemo({
  animate = "assemble",
  text = "北窗夜航",
  intensity = 0.6,
}: { animate?: "none" | "assemble" | "jitter"; text?: string; intensity?: number } = {}) {
  return <RansomNote animate={animate} className="text-3xl" intensity={intensity} text={text} />
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
