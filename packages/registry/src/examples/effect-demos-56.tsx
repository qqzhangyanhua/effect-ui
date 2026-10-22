"use client"

import { useState } from "react"

import { AnalogStick } from "../effects/analog-stick"
import { ClientCard } from "../effects/client-card"
import { CornerVideo } from "../effects/corner-video"
import { CreateMenu } from "../effects/create-menu"
import { DayPicker } from "../effects/day-picker"
import { DiscoverSearchPill } from "../effects/discover-search-pill"
import { DynamicGridGallery } from "../effects/dynamic-grid-gallery"
import { GetInTouch } from "../effects/get-in-touch"
import { GooeyNavbar } from "../effects/gooey-navbar"
import { OverlappingSlider } from "../effects/overlapping-slider"
import { PaperShredButton } from "../effects/paper-shred-button"
import { PhotoAlbums, type AlbumCollection } from "../effects/photo-albums"
import { ScanDocument } from "../effects/scan-document"
import { StackedList } from "../effects/stacked-list"
import { TactileRocker } from "../effects/tactile-rocker"

const frame = "flex min-h-80 w-full items-center justify-center px-6 py-10"

function swatch(title: string, hue: number) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="480" height="360"><rect width="480" height="360" fill="hsl(${hue} 42% 46%)"/><text x="28" y="64" fill="white" font-size="32" font-family="sans-serif">${title}</text></svg>`
  return `data:image/svg+xml,${encodeURIComponent(svg)}`
}

const albums: AlbumCollection[] = [
  {
    id: "travel",
    title: "旅行",
    subtitle: "私人",
    photos: [0, 1, 2, 3, 4, 5].map((index) => ({ id: `t${index}`, src: swatch("旅行", 190 + index * 8) })),
  },
  {
    id: "industry",
    title: "工业",
    subtitle: "私人",
    photos: [0, 1, 2, 3, 4, 5].map((index) => ({ id: `i${index}`, src: swatch("工业", 210 + index * 6) })),
  },
  {
    id: "city",
    title: "建筑",
    subtitle: "私人",
    photos: [0, 1, 2, 3, 4, 5].map((index) => ({ id: `c${index}`, src: swatch("建筑", 200 + index * 4) })),
  },
  {
    id: "art",
    title: "抽象",
    subtitle: "公开",
    photos: [0, 1, 2, 3, 4, 5].map((index) => ({ id: `a${index}`, src: swatch("抽象", 280 + index * 8) })),
  },
]

export function AnalogStickDemo({
  color = "var(--primary)",
  duration = 250,
  size = 300,
  intensity = 8,
}: {
  color?: string
  duration?: number
  size?: number
  intensity?: number
} = {}) {
  return (
    <div className={frame}>
      <AnalogStick color={color} duration={duration} size={size} intensity={intensity} label="方向摇杆" />
    </div>
  )
}

export function PaperShredButtonDemo({
  color = "var(--destructive)",
  duration = 1150,
  size = 56,
  intensity = 1,
}: {
  color?: string
  duration?: number
  size?: number
  intensity?: number
} = {}) {
  return (
    <div className={frame}>
      <PaperShredButton color={color} duration={duration} size={size} intensity={intensity} label="粉碎文件">
        粉碎
      </PaperShredButton>
    </div>
  )
}

export function ScanDocumentDemo({
  color = "var(--primary)",
  duration = 5000,
  size = 16,
  intensity = 1,
}: {
  color?: string
  duration?: number
  size?: number
  intensity?: number
} = {}) {
  return (
    <div className={frame}>
      <ScanDocument color={color} duration={duration} size={size} intensity={intensity} idleLabel="扫描" scanningLabel="扫描中" doneLabel="完成" />
    </div>
  )
}

export function DynamicGridGalleryDemo({
  color = "var(--foreground)",
  duration = 500,
  intensity = 1.95,
  size = 280,
}: {
  color?: string
  duration?: number
  intensity?: number
  size?: number
} = {}) {
  return (
    <div className="flex min-h-80 w-full items-center px-6 py-10">
      <DynamicGridGallery color={color} duration={duration} intensity={intensity} size={size} className="max-w-3xl" />
    </div>
  )
}

export function PhotoAlbumsDemo({
  color = "var(--foreground)",
  duration = 480,
  intensity = 14,
  size = 136,
}: {
  color?: string
  duration?: number
  intensity?: number
  size?: number
} = {}) {
  return (
    <div className={frame}>
      <PhotoAlbums collections={albums} color={color} duration={duration} intensity={intensity} size={size} />
    </div>
  )
}

export function GooeyNavbarDemo({
  color = "var(--foreground)",
  fontSize = 15,
  intensity = 32,
  duration = 420,
}: {
  color?: string
  fontSize?: number
  intensity?: number
  duration?: number
} = {}) {
  return (
    <div className={frame}>
      <GooeyNavbar
        color={color}
        fontSize={fontSize}
        intensity={intensity}
        duration={duration}
        items={[
          { label: "首页", link: "#home" },
          { label: "作品", link: "#work" },
          { label: "关于", link: "#about" },
          { label: "实验", link: "#lab" },
          { label: "联系", link: "#contact" },
        ]}
      />
    </div>
  )
}

export function OverlappingSliderDemo({
  color = "var(--foreground)",
  duration = 380,
  size = 240,
  intensity = 0.04,
}: {
  color?: string
  duration?: number
  size?: number
  intensity?: number
} = {}) {
  return (
    <div className="flex min-h-80 w-full items-center px-4 py-8">
      <OverlappingSlider color={color} duration={duration} size={size} intensity={intensity} />
    </div>
  )
}

export function GetInTouchDemo({
  color = "var(--foreground)",
  duration = 460,
  size = 48,
  intensity = 1,
}: {
  color?: string
  duration?: number
  size?: number
  intensity?: number
} = {}) {
  return (
    <div className={frame}>
      <GetInTouch color={color} duration={duration} size={size} intensity={intensity} defaultText="联系我们" hoverText="聊聊吧" />
    </div>
  )
}

export function ClientCardDemo() {
  return (
    <div className={frame}>
      <ClientCard name="林夏" country="中国" service="品牌内容与社媒排期" plan="Professional" />
    </div>
  )
}

export function CornerVideoDemo() {
  return (
    <div className="min-h-96 w-full">
      <CornerVideo title="看工作室" />
    </div>
  )
}

export function CreateMenuDemo() {
  const [picked, setPicked] = useState("尚未选择")
  return (
    <div className={`${frame} flex-col gap-6`}>
      <CreateMenu label="开始创建" onSelect={setPicked} />
      <p className="text-sm text-[var(--muted-foreground)]">{picked}</p>
    </div>
  )
}

export function DayPickerDemo() {
  return (
    <div className={frame}>
      <DayPicker />
    </div>
  )
}

export function StackedListDemo() {
  return (
    <div className="flex min-h-[32rem] w-full items-center justify-center px-6 py-10">
      <StackedList />
    </div>
  )
}

export function DiscoverSearchPillDemo() {
  return (
    <div className={frame}>
      <DiscoverSearchPill />
    </div>
  )
}

export function TactileRockerDemo() {
  return (
    <div className={frame}>
      <TactileRocker>开始</TactileRocker>
    </div>
  )
}
