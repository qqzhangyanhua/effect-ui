"use client"

import { useState } from "react"

import { ArcadePixel } from "../effects/arcade-pixel"
import { CardSwipeDeck } from "../effects/card-swipe-deck"


import { EmbossSurface } from "../effects/emboss-surface"
import { GridLoader } from "../effects/grid-loader"
import { KineticTypeScroll } from "../effects/kinetic-type-scroll"
import { MusicToggle } from "../effects/music-toggle"
import { NovatrixBackground } from "../effects/novatrix-background"

import { PinnedList } from "../effects/pinned-list"

import { UnlockFaceId } from "../effects/unlock-face-id"
import { VectorEditorToolbar, type VectorTool } from "../effects/vector-editor-toolbar"

function ToolIcon({ className }: { className?: string }) {
  return (
    <svg aria-hidden="true" className={className} viewBox="0 0 24 24">
      <path d="M5 19l4-1 9-9-3-3-9 9z" fill="currentColor" />
    </svg>
  )
}

const tools: VectorTool[] = [
  { icon: ToolIcon, id: "select", label: "选择", shortcut: "v" },
  {
    icon: ToolIcon,
    id: "shape",
    items: [{ icon: ToolIcon, id: "rect", label: "矩形", shortcut: "r" }],
    label: "形状",
  },
]

export function NovatrixBackgroundDemo({
  amplitude = 0.1,
  mouseReact = true,
  speed = 0.8,
}: {
  amplitude?: number
  mouseReact?: boolean
  speed?: number
} = {}) {
  return (
    <NovatrixBackground className="h-64 w-full rounded-2xl" color={[0.55, 0.75, 1]} amplitude={amplitude} mouseReact={mouseReact} speed={speed} />
  )
}
export function EmbossSurfaceDemo({
  depth = 3,
  lightAngle = 135,
  variant = "emboss",
}: { depth?: number; lightAngle?: number; variant?: "emboss" | "deboss" | "plaster" | "metal-stamp" } = {}) {
  return (
    <EmbossSurface className="rounded-2xl p-8 text-center text-lg" depth={depth} interactive lightAngle={lightAngle} variant={variant}>
      浮雕表面
    </EmbossSurface>
  )
}

export function ArcadePixelDemo({
  text = "NORTH",
  pixelSize = 8,
  speed = 1,
}: { text?: string; pixelSize?: number; speed?: number } = {}) {
  return (
    <ArcadePixel
      animate="type"
      className="rounded-xl bg-slate-950 p-4"
      crt
      glow
      pixelSize={pixelSize}
      scanlines
      speed={speed}
      text={text}
    />
  )
}

export function KineticTypeScrollDemo() {
  return (
    <div className="h-56 overflow-auto rounded-2xl border">
      <div className="h-[160%]">
        <KineticTypeScroll className="px-6 py-24 text-4xl" words={["北", "窗", "夜", "航"]} />
      </div>
    </div>
  )
}
export function CardSwipeDeckDemo({
  rotationFactor = 18,
  stackOffset = 14,
  threshold = 110,
}: { rotationFactor?: number; stackOffset?: number; threshold?: number } = {}) {
  return (
    <CardSwipeDeck
      className="mx-auto h-72 w-56"
      rotationFactor={rotationFactor}
      stackOffset={stackOffset}
      threshold={threshold}
      items={[
        { content: <div className="flex h-full items-center justify-center text-2xl">甲</div>, id: "a" },
        { content: <div className="flex h-full items-center justify-center text-2xl">乙</div>, id: "b" },
      ]}
    />
  )
}

export function PinnedListDemo({
  emptyPinnedMessage = "Pin an item to keep it at the top.",
  maxPinned = 5,
  showDivider = true,
}: {
  emptyPinnedMessage?: string
  maxPinned?: number
  showDivider?: boolean
} = {}) {
  return (
    <PinnedList
      emptyPinnedMessage={emptyPinnedMessage}
      items={[
        { id: "north", meta: "靠窗", title: "北窗" },
        { id: "night", meta: "航线", title: "夜航" },
      ]}
      maxPinned={maxPinned}
      showDivider={showDivider}
    />
  )
}

export function GridLoaderDemo({
  mode = "pulse",
  speed = "normal",
  size = "lg",
}: {
  mode?: "pulse" | "sequence" | "stagger"
  speed?: "slow" | "normal" | "fast"
  size?: "sm" | "md" | "lg" | "xl"
} = {}) {
  return <GridLoader color="blue" mode={mode} pattern="heartbeat" rounded size={size} speed={speed} />
}
export function VectorEditorToolbarDemo({
  floating = false,
  orientation = "horizontal",
  shortcutsEnabled = true,
}: {
  floating?: boolean
  orientation?: "horizontal" | "vertical"
  shortcutsEnabled?: boolean
} = {}) {
  const [tool, setTool] = useState("select")
  return (
    <VectorEditorToolbar
      activeTool={tool}
      floating={floating}
      onToolChange={setTool}
      orientation={orientation}
      properties={<p className="text-sm">当前：{tool}</p>}
      shortcutsEnabled={shortcutsEnabled}
      tools={tools}
    />
  )
}

export function UnlockFaceIdDemo({
  errorMessage = "Face not recognized. Try again.",
  scanDuration = 1200,
  size = 128,
}: {
  errorMessage?: string
  scanDuration?: number
  size?: number
} = {}) {
  return (
    <UnlockFaceId className="max-w-sm" errorMessage={errorMessage} scanDuration={scanDuration} size={size}>
      <p className="text-center text-sm">解锁后的航线备忘</p>
    </UnlockFaceId>
  )
}

export function MusicToggleDemo({
  artist = "北窗",
  defaultPlaying = true,
  progress = 0.35,
}: {
  artist?: string
  defaultPlaying?: boolean
  progress?: number
} = {}) {
  return <MusicToggle artist={artist} defaultPlaying={defaultPlaying} progress={progress} title="夜航" />
}
