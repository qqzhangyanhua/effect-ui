"use client"

import { useRef, useState, type ReactNode, type RefObject } from "react"
import { Pause, Play, Signal } from "lucide-react"

import { AnimatedBeam } from "../effects/animated-beam"
import { DynamicIsland, type DynamicIslandSize } from "../effects/dynamic-island"
import {
  ImageComparison,
  ImageComparisonImage,
  ImageComparisonSlider,
} from "../effects/image-comparison"
import {
  MorphingDialog,
  MorphingDialogClose,
  MorphingDialogContainer,
  MorphingDialogContent,
  MorphingDialogDescription,
  MorphingDialogTitle,
  MorphingDialogTrigger,
} from "../effects/morphing-dialog"
import { ProgressiveBlur } from "../effects/progressive-blur"
import { ScrollProgress } from "../effects/scroll-progress"
import { ScrollVelocity, ScrollVelocityRow } from "../effects/scroll-velocity"
import { StackingCardItem, StackingCards } from "../effects/stacking-cards"
import { VariableFontProximity } from "../effects/variable-font-proximity"

function Frame({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={`relative flex min-h-48 w-full items-center justify-center overflow-hidden rounded-xl border bg-card/40 p-6 ${className ?? ""}`}>
      {children}
    </div>
  )
}

function Circle({
  label,
  nodeRef,
}: {
  label: string
  nodeRef: RefObject<HTMLDivElement | null>
}) {
  return (
    <div
      ref={nodeRef}
      className="z-10 flex size-12 items-center justify-center rounded-full border bg-background text-xs font-medium shadow"
    >
      {label}
    </div>
  )
}

export function AnimatedBeamDemo() {
  const container = useRef<HTMLDivElement>(null)
  const a = useRef<HTMLDivElement>(null)
  const b = useRef<HTMLDivElement>(null)
  const c = useRef<HTMLDivElement>(null)
  return (
    <Frame>
      <div ref={container} className="relative flex h-40 w-full max-w-md items-center justify-between px-6">
        <Circle nodeRef={a} label="A" />
        <Circle nodeRef={b} label="Hub" />
        <Circle nodeRef={c} label="B" />
        <AnimatedBeam containerRef={container} fromRef={a} toRef={b} curvature={40} />
        <AnimatedBeam containerRef={container} fromRef={c} toRef={b} curvature={40} reverse />
      </div>
    </Frame>
  )
}

export function MorphingDialogDemo() {
  return (
    <Frame>
      <MorphingDialog>
        <MorphingDialogTrigger className="w-56 rounded-xl border bg-background p-4 shadow-sm">
          <MorphingDialogTitle>共享布局</MorphingDialogTitle>
          <p className="mt-1 text-sm text-muted-foreground">点击卡片展开。</p>
        </MorphingDialogTrigger>
        <MorphingDialogContainer>
          <MorphingDialogContent className="w-full max-w-md p-6">
            <MorphingDialogClose />
            <MorphingDialogTitle>共享布局</MorphingDialogTitle>
            <MorphingDialogDescription className="mt-3">
              标题与容器使用 layoutId，从卡片平滑变形到对话框。
            </MorphingDialogDescription>
          </MorphingDialogContent>
        </MorphingDialogContainer>
      </MorphingDialog>
    </Frame>
  )
}

const before =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="360"><defs><linearGradient id="g" x1="0" x2="1"><stop stop-color="#1e293b"/><stop offset="1" stop-color="#334155"/></linearGradient></defs><rect width="100%" height="100%" fill="url(#g)"/><text x="40" y="190" fill="white" font-size="42" font-family="sans-serif">Before</text></svg>`,
  )
const after =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="360"><defs><linearGradient id="g" x1="0" x2="1"><stop stop-color="#4f46e5"/><stop offset="1" stop-color="#ec4899"/></linearGradient></defs><rect width="100%" height="100%" fill="url(#g)"/><text x="40" y="190" fill="white" font-size="42" font-family="sans-serif">After</text></svg>`,
  )

export function ImageComparisonDemo() {
  return (
    <Frame>
      <ImageComparison className="h-44 w-full max-w-md rounded-xl" enableHover>
        <ImageComparisonImage src={before} alt="Before" position="left" />
        <ImageComparisonImage src={after} alt="After" position="right" />
        <ImageComparisonSlider />
      </ImageComparison>
    </Frame>
  )
}

export function ProgressiveBlurDemo() {
  return (
    <Frame>
      <div className="relative h-40 w-full max-w-md overflow-hidden rounded-xl border">
        <div className="space-y-2 p-4 text-sm">
          {["预览", "安装", "源码", "Props", "主题", "Registry"].map((item) => (
            <div key={item} className="rounded-md bg-muted px-3 py-2">
              {item}
            </div>
          ))}
        </div>
        <ProgressiveBlur className="absolute inset-x-0 bottom-0 h-16" />
      </div>
    </Frame>
  )
}

export function ScrollProgressDemo() {
  const container = useRef<HTMLDivElement>(null)
  return (
    <Frame>
      <div className="w-full max-w-md overflow-hidden rounded-xl border">
        <ScrollProgress containerRef={container} className="sticky top-0 z-10" />
        <div ref={container} className="h-40 overflow-auto p-4 text-sm leading-7">
          {Array.from({ length: 12 }, (_, index) => (
            <p key={index}>滚动这段内容，顶部进度条会跟着走。第 {index + 1} 段。</p>
          ))}
        </div>
      </div>
    </Frame>
  )
}

export function ScrollVelocityDemo() {
  return (
    <Frame>
      <div className="w-full">
        <p className="mb-3 text-center text-xs text-muted-foreground">滚动页面可改变速度</p>
        <ScrollVelocity>
          <ScrollVelocityRow className="text-2xl font-semibold tracking-tight">
            <span className="px-6">effect-ui</span>
            <span className="px-6">Motion</span>
            <span className="px-6">Registry</span>
            <span className="px-6">shadcn</span>
          </ScrollVelocityRow>
        </ScrollVelocity>
      </div>
    </Frame>
  )
}

export function StackingCardsDemo() {
  const cards = ["设计", "开发", "发布"]
  return (
    <div className="h-64 w-full overflow-auto rounded-xl border">
      <StackingCards totalCards={cards.length} className="min-h-[420px] px-4 pt-4">
        {cards.map((title, index) => (
          <StackingCardItem key={title} index={index} className="h-36">
            <div className="rounded-xl border bg-card p-5 shadow-sm">
              <p className="text-xs text-muted-foreground">0{index + 1}</p>
              <p className="text-lg font-medium">{title}</p>
            </div>
          </StackingCardItem>
        ))}
      </StackingCards>
    </div>
  )
}

export function DynamicIslandDemo() {
  const [size, setSize] = useState<DynamicIslandSize>("idle")
  return (
    <Frame className="flex-col gap-4">
      <DynamicIsland size={size}>
        {size === "compact" ? (
          <Signal className="mx-auto size-4" />
        ) : size === "expanded" ? (
          <div className="flex w-full items-center justify-between text-sm">
            <span>Now Playing</span>
            <Play className="size-4" />
          </div>
        ) : size === "tall" ? (
          <div className="flex w-full flex-col gap-2 text-sm">
            <div className="flex items-center justify-between">
              <span>Midnight City</span>
              <Pause className="size-4" />
            </div>
            <div className="h-1 rounded-full bg-white/20">
              <div className="h-1 w-2/3 rounded-full bg-white" />
            </div>
          </div>
        ) : (
          <div className="flex w-full items-center justify-between text-xs">
            <span>9:41</span>
            <span className="size-2 rounded-full bg-emerald-400" />
          </div>
        )}
      </DynamicIsland>
      <div className="flex flex-wrap justify-center gap-2">
        {(["compact", "idle", "expanded", "tall"] as const).map((item) => (
          <button
            key={item}
            type="button"
            className="rounded-full border px-3 py-1 text-xs"
            onClick={() => setSize(item)}
          >
            {item}
          </button>
        ))}
      </div>
    </Frame>
  )
}

export function VariableFontProximityDemo({
  label = "Move closer",
  radius = 90,
  falloff = "linear",
  fontSize,
  letterSpacing,
  align,
}: {
  label?: string
  radius?: number
  falloff?: "linear" | "exponential" | "gaussian"
  fontSize?: number
  letterSpacing?: number
  align?: "left" | "center" | "right"
} = {}) {
  const container = useRef<HTMLDivElement>(null)
  return (
    <Frame>
      <div ref={container} className="w-full max-w-lg py-6 text-center">
        <VariableFontProximity
          label={label}
          fromFontVariationSettings="'wght' 400"
          toFontVariationSettings="'wght' 900"
          containerRef={container}
          radius={radius}
          falloff={falloff}
          fontSize={fontSize}
          letterSpacing={letterSpacing}
          align={align}
          className="text-4xl tracking-tight"
        />
      </div>
    </Frame>
  )
}
