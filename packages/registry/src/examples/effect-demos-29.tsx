"use client"

import { useRef, useState } from "react"

import { ArcadePixel } from "../effects/arcade-pixel"
import { CardSwipeDeck } from "../effects/card-swipe-deck"
import { ChromaBlurTransition } from "../effects/chroma-blur-transition"
import { DitherChart } from "../effects/dither-chart"
import { DrawingCursor, type DrawingCursorHandle } from "../effects/drawing-cursor"
import { EmbossSurface } from "../effects/emboss-surface"
import { GridLoader } from "../effects/grid-loader"
import { KineticTypeScroll } from "../effects/kinetic-type-scroll"
import { MusicToggle } from "../effects/music-toggle"
import { NovatrixBackground } from "../effects/novatrix-background"
import { OrbitalImageWheel } from "../effects/orbital-image-wheel"
import { PinnedList } from "../effects/pinned-list"
import { Squircle } from "../effects/squircle"
import { UnlockFaceId } from "../effects/unlock-face-id"
import { VectorEditorToolbar, type VectorTool } from "../effects/vector-editor-toolbar"

const swatch = (color: string) =>
  `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="160" height="160"><rect width="160" height="160" fill="${color}"/></svg>`,
  )}`

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

export function DrawingCursorDemo() {
  const cursor = useRef<DrawingCursorHandle>(null)
  return (
    <div className="space-y-3">
      <button className="rounded-md border px-3 py-1 text-sm" onClick={() => cursor.current?.clear()} type="button">
        清空笔迹
      </button>
      <DrawingCursor className="h-48 w-full rounded-2xl border bg-muted" color="#6366f1" ref={cursor}>
        <p className="p-4 text-sm text-muted-foreground">在这块区域里移动指针</p>
      </DrawingCursor>
    </div>
  )
}

export function EmbossSurfaceDemo() {
  return (
    <EmbossSurface className="rounded-2xl p-8 text-center text-lg" depth={3} interactive variant="emboss">
      浮雕表面
    </EmbossSurface>
  )
}

export function ChromaBlurTransitionDemo() {
  const [page, setPage] = useState(0)
  const scenes = ["洋红", "香槟", "海沫"]
  return (
    <div className="w-full space-y-3">
      <button className="rounded-md border px-3 py-1 text-sm" onClick={() => setPage((value) => (value + 1) % scenes.length)} type="button">
        下一幕
      </button>
      <ChromaBlurTransition className="h-40" transitionKey={page}>
        <div className="flex h-40 items-center justify-center text-3xl font-semibold">{scenes[page] ?? "洋红"}</div>
      </ChromaBlurTransition>
    </div>
  )
}

export function ArcadePixelDemo() {
  return <ArcadePixel animate="type" className="rounded-xl bg-slate-950 p-4" crt glow scanlines text="NORTH" />
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

export function OrbitalImageWheelDemo({
  autoRotateSpeed = 12,
  faceOutward = false,
  radius = 92,
}: { autoRotateSpeed?: number; faceOutward?: boolean; radius?: number } = {}) {
  return (
    <OrbitalImageWheel
      autoRotate
      autoRotateSpeed={autoRotateSpeed}
      faceOutward={faceOutward}
      items={[
        { alt: "靛蓝", id: "a", image: swatch("#312e81") },
        { alt: "琥珀", id: "b", image: swatch("#b45309") },
        { alt: "青绿", id: "c", image: swatch("#0f766e") },
        { alt: "玫红", id: "d", image: swatch("#9f1239") },
      ]}
      radius={radius}
      snap
    />
  )
}

export function DitherChartDemo({
  caption = "夜间流量",
  pixelSize = 3,
  variant = "bar",
}: {
  caption?: string
  pixelSize?: number
  variant?: "donut" | "line" | "bar" | "stacked" | "gauge" | "funnel" | "heatmap" | "bubbles"
} = {}) {
  return (
    <DitherChart
      caption={caption}
      data={[{ name: "夜航", points: [{ label: "一", value: 2 }, { label: "二", value: 5 }, { label: "三", value: 3 }] }]}
      label="点阵图"
      pixelSize={pixelSize}
      variant={variant}
    />
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

export function GridLoaderDemo() {
  return <GridLoader color="blue" pattern="heartbeat" rounded size="lg" />
}

export function SquircleDemo() {
  return (
    <Squircle border className="h-32 w-full bg-muted p-4" radius={36} smoothing={0.8}>
      平滑圆角
    </Squircle>
  )
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
