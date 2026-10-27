"use client"
import { CircularGallery } from "../effects/circular-gallery"
import { ContainerScroll3D } from "../effects/container-scroll-3d"
import { GlowingEdge } from "../effects/glowing-edge"
import { LampHeading } from "../effects/lamp-heading"
import { PixelTransition } from "../effects/pixel-transition"
import { ScrollImageSequence } from "../effects/scroll-image-sequence"
import { SvgScrollPath, TracingBeam } from "../effects/tracing-beam"

const frames = [
  "https://picsum.photos/id/1015/640/360",
  "https://picsum.photos/id/1018/640/360",
  "https://picsum.photos/id/1025/640/360",
  "https://picsum.photos/id/1035/640/360",
  "https://picsum.photos/id/1043/640/360",
]

const gallery = [
  { title: "A", src: "https://picsum.photos/id/1011/240/300" },
  { title: "B", src: "https://picsum.photos/id/1015/240/300" },
  { title: "C", src: "https://picsum.photos/id/1025/240/300" },
  { title: "D", src: "https://picsum.photos/id/1035/240/300" },
]

export function LampHeadingDemo({
  text = "effect-ui",
  color,
  fontSize,
  fontWeight,
  letterSpacing,
  align,
}: {
  text?: string
  color?: string
  fontSize?: number
  fontWeight?: number
  letterSpacing?: number
  align?: "left" | "center" | "right"
} = {}) {
  return (
    <LampHeading
      className="w-full"
      text={text}
      color={color}
      fontSize={fontSize}
      fontWeight={fontWeight}
      letterSpacing={letterSpacing}
      align={align}
    />
  )
}

export function TracingBeamDemo({
  speed,
  size,
  color,
}: {
  speed?: number
  size?: number
  color?: string
} = {}) {
  return (
    <div className="h-56 w-full overflow-auto rounded-xl border p-4">
      <TracingBeam speed={speed} size={size} color={color}>
        <p className="text-sm">滚动点亮竖线。</p>
        <p className="text-sm text-muted-foreground">灵感来自 tracing-beam，原创实现。</p>
        <SvgScrollPath />
      </TracingBeam>
    </div>
  )
}

export function ContainerScroll3DDemo({
  title = "滚动透视",
  angle,
  intensity,
  speed,
  scale,
}: {
  title?: string
  angle?: number
  intensity?: number
  speed?: number
  scale?: number
} = {}) {
  return (
    <div className="h-56 w-full overflow-auto rounded-xl border p-4">
      <div className="h-8" />
      <ContainerScroll3D title={title} angle={angle} intensity={intensity} speed={speed} scale={scale}>
        <div className="grid h-36 place-items-center bg-muted text-sm">透视卡片</div>
      </ContainerScroll3D>
      <div className="h-16" />
    </div>
  )
}

export function CircularGalleryDemo({ speed }: { speed?: number } = {}) {
  return <CircularGallery className="w-full" items={gallery} speed={speed} />
}

export function GlowingEdgeDemo({ duration, color, intensity, size }: { duration?: number; color?: string; intensity?: number; size?: number } = {}) {
  return (
    <GlowingEdge className="w-72" duration={duration} color={color} intensity={intensity} size={size}>
      <p className="font-medium">Linear 风格描边</p>
      <p className="mt-1 text-sm text-muted-foreground">灵感来自 Linear，原创实现。</p>
    </GlowingEdge>
  )
}

export function ScrollImageSequenceDemo({
  speed,
  intensity,
}: {
  speed?: number
  intensity?: number
} = {}) {
  return (
    <div className="h-56 w-full overflow-auto rounded-xl border p-3">
      <div className="h-8" />
      <ScrollImageSequence frames={frames} speed={speed} intensity={intensity} />
      <div className="h-16" />
    </div>
  )
}

export function PixelTransitionDemo({ count, duration, delay }: { count?: number; duration?: number; delay?: number } = {}) {
  return (
    <PixelTransition
      className="w-full max-w-lg"
      from="https://picsum.photos/id/1015/640/360"
      to="https://picsum.photos/id/1035/640/360"
      count={count}
      duration={duration}
      delay={delay}
    />
  )
}
