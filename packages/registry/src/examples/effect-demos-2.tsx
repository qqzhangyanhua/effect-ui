"use client"

import { useState, type ReactNode } from "react"
import { Home, Sparkle, Star } from "lucide-react"

import { AnimatedGrid } from "../effects/animated-grid"
import { AnimatedList } from "../effects/animated-list"
import { AnimatedSidebar } from "../effects/animated-sidebar"
import { AnimatedTabs } from "../effects/animated-tabs"
import { BentoCard, BentoGrid } from "../effects/bento-grid"
import { BorderBeam } from "../effects/border-beam"
import { ConfettiBurst } from "../effects/confetti-burst"
import { Dock } from "../effects/dock"
import { ExpandableCard } from "../effects/expandable-card"
import { FloatingNavbar } from "../effects/floating-navbar"
import { GlobeSphere } from "../effects/globe-sphere"
import { GooeyButton } from "../effects/gooey-button"
import { InteractiveHoverButton } from "../effects/interactive-hover-button"
import { LightBeams } from "../effects/light-beams"
import { Marquee } from "../effects/marquee"
import { MorphingText } from "../effects/morphing-text"
import { NoiseGradient } from "../effects/noise-gradient"
import { OrbitingCircles } from "../effects/orbiting-circles"
import { PageTransition } from "../effects/page-transition"
import { PerspectiveCard } from "../effects/perspective-card"
import { RainbowButton } from "../effects/rainbow-button"
import { RetroGrid } from "../effects/retro-grid"
import { RevealSection } from "../effects/reveal-section"
import { RollingNumber } from "../effects/rolling-number"
import { ScrambleText } from "../effects/scramble-text"
import { Sparkles } from "../effects/sparkles"
import { Starfield } from "../effects/starfield"
import { TextReveal } from "../effects/text-reveal"
import { TextRotate } from "../effects/text-rotate"
import { WaveBackground } from "../effects/wave-background"
import { WordRotate } from "../effects/word-rotate"
import { Badge } from "../ui/badge"

function Frame({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex min-h-48 w-full items-center justify-center overflow-hidden rounded-xl border bg-card/40 p-8">
      {children}
    </div>
  )
}

export function ScrambleTextDemo({
  text = "DECRYPT COMPLETE",
  duration = 900,
}: { text?: string; duration?: number } = {}) {
  return <ScrambleText className="text-2xl" text={text} duration={duration} />
}

export function TextRotateDemo({
  interval = 1800,
  animation = "slide",
  fontSize,
  fontWeight,
  letterSpacing,
  align,
}: {
  interval?: number
  animation?: "slide" | "blur" | "glyph"
  fontSize?: number
  fontWeight?: number
  letterSpacing?: number
  align?: "left" | "center" | "right"
} = {}) {
  return (
    <TextRotate
      texts={["Motion", "Tailwind", "Registry"]}
      interval={interval}
      animation={animation}
      className="text-2xl font-semibold"
      fontSize={fontSize}
      fontWeight={fontWeight}
      letterSpacing={letterSpacing}
      align={align}
    />
  )
}

export function WordRotateDemo({
  interval = 1800,
  fontSize,
  fontWeight,
  letterSpacing,
  align,
}: {
  interval?: number
  fontSize?: number
  fontWeight?: number
  letterSpacing?: number
  align?: "left" | "center" | "right"
} = {}) {
  return (
    <p className="text-2xl">
      Build with{" "}
      <WordRotate
        words={["Motion", "Tailwind", "Registry"]}
        interval={interval}
        fontSize={fontSize}
        fontWeight={fontWeight}
        letterSpacing={letterSpacing}
        align={align}
      />
    </p>
  )
}

export function MorphingTextDemo({
  interval = 2200,
  fontSize,
  fontWeight,
  letterSpacing,
  align,
}: {
  interval?: number
  fontSize?: number
  fontWeight?: number
  letterSpacing?: number
  align?: "left" | "center" | "right"
} = {}) {
  return (
    <MorphingText
      className="text-3xl font-semibold"
      texts={["Copy.", "Tweak.", "Ship."]}
      interval={interval}
      fontSize={fontSize}
      fontWeight={fontWeight}
      letterSpacing={letterSpacing}
      align={align}
    />
  )
}

export function RollingNumberDemo({
  value = 2048,
  fontSize,
  fontWeight,
  letterSpacing,
  align,
}: {
  value?: number
  fontSize?: number
  fontWeight?: number
  letterSpacing?: number
  align?: "left" | "center" | "right"
} = {}) {
  return (
    <RollingNumber
      className="text-5xl"
      value={value}
      fontSize={fontSize}
      fontWeight={fontWeight}
      letterSpacing={letterSpacing}
      align={align}
    />
  )
}

export function TextRevealDemo({
  text = "滚动这段文字，单词会依次从淡到实。",
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
    <div className="h-40 w-full overflow-auto rounded-xl border p-4">
      <div className="h-16" />
      <TextReveal
        text={text}
        fontSize={fontSize}
        fontWeight={fontWeight}
        letterSpacing={letterSpacing}
        align={align}
      />
      <div className="h-24" />
    </div>
  )
}

export function LightBeamsDemo({
  beams = 6,
  speed = 1,
  color,
  intensity = 0.5,
}: {
  beams?: number
  speed?: number
  color?: string
  intensity?: number
} = {}) {
  return (
    <Frame>
      <LightBeams beams={beams} speed={speed} color={color} intensity={intensity} />
      <p className="relative z-10 text-sm">光束</p>
    </Frame>
  )
}

export function StarfieldDemo({
  count = 90,
  speed = 1,
  color,
  size = 1,
}: {
  count?: number
  speed?: number
  color?: string
  size?: number
} = {}) {
  return (
    <Frame>
      <div className="absolute inset-0 bg-zinc-950" />
      <Starfield className="text-white" count={count} speed={speed} color={color} size={size} />
      <p className="relative z-10 text-sm text-zinc-100">星空</p>
    </Frame>
  )
}

export function WaveBackgroundDemo({
  speed = 1,
  color,
  intensity = 0.25,
  size = 112,
}: {
  speed?: number
  color?: string
  intensity?: number
  size?: number
} = {}) {
  return (
    <WaveBackground
      className="flex min-h-40 w-full items-center justify-center p-8"
      speed={speed}
      color={color}
      intensity={intensity}
      size={size}
    >
      波浪背景
    </WaveBackground>
  )
}

export function NoiseGradientDemo({
  colors = ["#7c3aed", "#d946ef", "#22d3ee"],
  angle = 135,
  intensity = 0.25,
  scale = 1,
}: {
  colors?: string[]
  angle?: number
  intensity?: number
  scale?: number
} = {}) {
  return (
    <NoiseGradient
      className="flex min-h-40 w-full items-center justify-center p-8 text-white"
      colors={colors}
      angle={angle}
      intensity={intensity}
      scale={scale}
    >
      噪点渐变
    </NoiseGradient>
  )
}

export function AnimatedGridDemo({
  cell = 36,
  speed = 1,
  color,
  intensity = 0.15,
}: {
  cell?: number
  speed?: number
  color?: string
  intensity?: number
} = {}) {
  return (
    <Frame>
      <AnimatedGrid cell={cell} speed={speed} color={color} intensity={intensity} />
      <p className="relative z-10 text-sm">漂移网格</p>
    </Frame>
  )
}

export function RetroGridDemo({
  size = 48,
  speed = 1,
  color,
  intensity = 0.28,
  angle = 62,
}: {
  size?: number
  speed?: number
  color?: string
  intensity?: number
  angle?: number
} = {}) {
  return (
    <Frame>
      <RetroGrid size={size} speed={speed} color={color} intensity={intensity} angle={angle} />
      <p className="relative z-10 text-sm">复古透视网格</p>
    </Frame>
  )
}

export function DockDemo() {
  return (
    <Dock>
      <Home className="size-5" />
      <Star className="size-5" />
      <Sparkle className="size-5" />
    </Dock>
  )
}

export function MarqueeDemo({ pauseOnHover, reverse, repeat, duration, gap }: { pauseOnHover?: boolean; reverse?: boolean; repeat?: number; duration?: number; gap?: number } = {}) {
  return (
    <Marquee className="w-80" pauseOnHover={pauseOnHover} reverse={reverse} repeat={repeat} duration={duration} gap={gap}>
      {["Dock", "Marquee", "Orbit", "Bento"].map((item) => (
        <Badge key={item} variant="secondary">{item}</Badge>
      ))}
    </Marquee>
  )
}

export function OrbitingCirclesDemo({ radius, duration, size }: { radius?: number; duration?: number; size?: number } = {}) {
  const chip = "grid size-8 place-items-center rounded-full text-xs"
  return (
    <OrbitingCircles radius={radius} duration={duration} size={size}>
      <span className={`${chip} bg-primary text-primary-foreground`}>A</span>
      <span className={`${chip} bg-chart-2`}>B</span>
      <span className={`${chip} bg-chart-3`}>C</span>
    </OrbitingCircles>
  )
}

export function AnimatedListDemo({ delay, duration, gap }: { delay?: number; duration?: number; gap?: number } = {}) {
  return (
    <AnimatedList
      className="w-64"
      delay={delay}
      duration={duration}
      gap={gap}
      items={["新组件已发布", "Registry 构建完成", "文档站已更新"].map((text) => (
        <div key={text} className="rounded-lg border bg-card px-3 py-2 text-sm">{text}</div>
      ))}
    />
  )
}

export function GlobeSphereDemo({ dots, duration, size, color }: { dots?: number; duration?: number; size?: number; color?: string } = {}) {
  return <GlobeSphere className="[transform-style:preserve-3d]" dots={dots} duration={duration} size={size} color={color} />
}

export function ConfettiBurstDemo({ pieces, duration, scale, colors }: { pieces?: number; duration?: number; scale?: number; colors?: string[] } = {}) {
  return <ConfettiBurst pieces={pieces} duration={duration} scale={scale} colors={colors}>庆祝一下</ConfettiBurst>
}

export function SparklesDemo({ count, duration, delay, size, color }: { count?: number; duration?: number; delay?: number; size?: number; color?: string } = {}) {
  return <Sparkles className="px-6 py-3 text-2xl font-medium" count={count} duration={duration} delay={delay} size={size} color={color}>Sparkles</Sparkles>
}

export function BorderBeamDemo({ duration = 8, colorFrom, colorTo, size, intensity }: { duration?: number; colorFrom?: string; colorTo?: string; size?: number; intensity?: number } = {}) {
  return (
    <BorderBeam className="w-72" duration={duration} colorFrom={colorFrom} colorTo={colorTo} size={size} intensity={intensity}>
      <h3 className="font-medium">Border Beam</h3>
      <p className="mt-2 text-sm text-muted-foreground">光束沿着边框跑。</p>
    </BorderBeam>
  )
}

export function BentoGridDemo({ gap, count, size }: { gap?: number; count?: number; size?: number } = {}) {
  return (
    <BentoGrid className="max-w-lg" gap={gap} count={count} size={size}>
      <BentoCard colSpan={2}>宽卡片</BentoCard>
      <BentoCard>窄</BentoCard>
      <BentoCard>A</BentoCard>
      <BentoCard colSpan={2}>另一张宽卡片</BentoCard>
    </BentoGrid>
  )
}

export function PerspectiveCardDemo({ angle, size }: { angle?: number; size?: number } = {}) {
  return (
    <PerspectiveCard className="w-72" angle={angle} size={size}>
      <h3 className="font-medium">Perspective</h3>
      <p className="mt-2 text-sm text-muted-foreground">指针移动时透视倾斜。</p>
    </PerspectiveCard>
  )
}

export function ExpandableCardDemo({ title = "可展开卡片" }: { title?: string } = {}) {
  return (
    <ExpandableCard
      className="max-w-sm"
      title={title}
      preview="点击查看更多细节"
    >
      这里是展开后的说明，适合放次要内容。
    </ExpandableCard>
  )
}

export function RainbowButtonDemo({ duration, colors, scale }: { duration?: number; colors?: string[]; scale?: number } = {}) {
  return <RainbowButton duration={duration} colors={colors} scale={scale}>Rainbow</RainbowButton>
}

export function InteractiveHoverButtonDemo({ duration, scale }: { duration?: number; scale?: number } = {}) {
  return <InteractiveHoverButton duration={duration} scale={scale}>继续阅读</InteractiveHoverButton>
}

export function GooeyButtonDemo({ scale, intensity }: { scale?: number; intensity?: number } = {}) {
  return <GooeyButton scale={scale} intensity={intensity}>Gooey</GooeyButton>
}

export function AnimatedTabsDemo() {
  return (
    <AnimatedTabs
      className="w-80"
      items={[
        { value: "one", label: "预览", content: "实时预览区域" },
        { value: "two", label: "代码", content: "npx shadcn add …" },
      ]}
    />
  )
}

export function FloatingNavbarDemo() {
  return (
    <div className="h-40 w-full overflow-auto rounded-xl border">
      <FloatingNavbar>
        <span className="text-sm">Home</span>
        <span className="text-sm">Docs</span>
      </FloatingNavbar>
      <div className="h-64 p-4 text-sm text-muted-foreground">向下滚动，导航会收起。</div>
    </div>
  )
}

export function AnimatedSidebarDemo() {
  return (
    <AnimatedSidebar>
      <p className="text-sm">侧栏内容</p>
    </AnimatedSidebar>
  )
}

export function PageTransitionDemo() {
  const [key, setKey] = useState("a")
  return (
    <div className="space-y-3">
      <button
        type="button"
        className="rounded-md border px-3 py-1.5 text-sm"
        onClick={() => setKey((current) => (current === "a" ? "b" : "a"))}
      >
        切换页面
      </button>
      <PageTransition transitionKey={key} className="rounded-xl border bg-card p-6">
        当前视图：{key === "a" ? "概览" : "详情"}
      </PageTransition>
    </div>
  )
}

export function RevealSectionDemo() {
  return (
    <RevealSection className="rounded-xl border bg-card p-6">
      滚动到这里时区块揭开
    </RevealSection>
  )
}
