"use client"

import { AsciiRender } from "../effects/ascii-render"
import { CircularGallery } from "../effects/circular-gallery"
import { ContainerScroll3D } from "../effects/container-scroll-3d"
import { GlowingEdge } from "../effects/glowing-edge"
import { Gravity } from "../effects/gravity"
import { LampHeading } from "../effects/lamp-heading"
import { PixelTransition } from "../effects/pixel-transition"
import { ScrollImageSequence } from "../effects/scroll-image-sequence"
import { ScrollTypography } from "../effects/scroll-typography"
import { ShaderPack2 } from "../effects/shader-pack-2"
import { SiriOrb } from "../effects/siri-orb"
import { SplashCursor } from "../effects/splash-cursor"
import { TextAlongPath } from "../effects/text-along-path"
import { ThreeDCarousel } from "../effects/three-d-carousel"
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

export function SplashCursorDemo({
  splatRadius = 0.012,
  fade = 0.975,
  speed,
  intensity,
  color,
}: {
  splatRadius?: number
  fade?: number
  speed?: number
  intensity?: number
  color?: string
} = {}) {
  return (
    <SplashCursor
      className="h-56 w-full"
      splatRadius={splatRadius}
      fade={fade}
      speed={speed}
      intensity={intensity}
      color={color}
    />
  )
}

export function ShaderPack2Demo({
  variant = "god-rays",
  speed = 1,
  scale = 1,
}: {
  variant?:
    | "liquid-metal"
    | "god-rays"
    | "water"
    | "smoke-ring"
    | "pulsing-border"
    | "voronoi"
    | "swirl"
    | "fluted-glass"
  speed?: number
  scale?: number
} = {}) {
  return (
    <ShaderPack2 variant={variant} speed={speed} scale={scale} className="h-56 w-full rounded-xl">
      <div className="flex h-56 items-end p-4 text-sm text-white/80">{variant}</div>
    </ShaderPack2>
  )
}

export function TextAlongPathDemo({
  text = "effect-ui · text along a curve · MIT",
  fontSize,
  fontWeight,
  letterSpacing,
  align,
}: {
  text?: string
  fontSize?: number
  fontWeight?: number
  letterSpacing?: number
  align?: "left" | "center" | "right"
} = {}) {
  return (
    <TextAlongPath
      className="h-36 w-full"
      text={text}
      fontSize={fontSize}
      fontWeight={fontWeight}
      letterSpacing={letterSpacing}
      align={align}
    />
  )
}

export function ScrollTypographyDemo({
  text = "Scroll Type",
  variant = "blur",
  fontSize,
  fontWeight,
  letterSpacing,
  align,
}: {
  text?: string
  variant?: "clip" | "blur" | "scale" | "slide"
  fontSize?: number
  fontWeight?: number
  letterSpacing?: number
  align?: "left" | "center" | "right"
} = {}) {
  return (
    <div className="h-40 w-full overflow-auto rounded-xl border p-4">
      <div className="h-10" />
      <ScrollTypography
        text={text}
        variant={variant}
        fontSize={fontSize}
        fontWeight={fontWeight}
        letterSpacing={letterSpacing}
        align={align}
      />
      <div className="h-24" />
    </div>
  )
}

export function ThreeDCarouselDemo() {
  return <ThreeDCarousel className="w-full" items={gallery} />
}

export function SiriOrbDemo({ size = 160 }: { size?: number } = {}) {
  return <SiriOrb size={size} />
}

export function GravityDemo() {
  return <Gravity className="h-56 w-full" />
}

export function AsciiRenderDemo() {
  return <AsciiRender className="w-full max-w-lg" src="https://picsum.photos/id/1025/400/260" />
}

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

export function CircularGalleryDemo() {
  return <CircularGallery className="w-full" items={gallery} />
}

export function GlowingEdgeDemo() {
  return (
    <GlowingEdge className="w-72">
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

export function PixelTransitionDemo() {
  return (
    <PixelTransition
      className="w-full max-w-lg"
      from="https://picsum.photos/id/1015/640/360"
      to="https://picsum.photos/id/1035/640/360"
    />
  )
}
