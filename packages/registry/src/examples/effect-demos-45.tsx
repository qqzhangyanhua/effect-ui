"use client"

import { useState } from "react"

import { CollabAvatar } from "../effects/collab-avatar"
import { CosmicButton } from "../effects/cosmic-button"
import { ElapsedTimer } from "../effects/elapsed-timer"
import { FoldedCard } from "../effects/folded-card"
import { GlowTrackButton } from "../effects/glow-track-button"
import { HaloBadge } from "../effects/halo-badge"
import { HaloSwitch } from "../effects/halo-switch"
import { LightBoard } from "../effects/lightboard"
import { NeumorphButton } from "../effects/neumorph-button"
import { SecurityCheckpoint } from "../effects/security-checkpoint"
import { ShiftCard } from "../effects/shift-card"
import { SidePanel } from "../effects/side-panel"
import { SpeechBubble } from "../effects/speech-bubble"
import { SquiggleArrow } from "../effects/squiggle-arrow"
import { TextureCard, TextureCardContent, TextureCardDescription, TextureCardFooter, TextureCardHeader, TextureCardTitle, TextureSeparator } from "../effects/texture-card"

export function LightBoardDemo() {
  return (
    <LightBoard
      disableDrawing={false}
      font="default"
      gap={2}
      lightSize={8}
      palette={{ textBright: "rgba(186, 230, 253, 0.95)", background: "rgba(15, 23, 42, 0.35)", drawLine: "rgba(251, 191, 36, 0.9)" }}
      rows={7}
      text="HELLO"
      updateInterval={90}
    />
  )
}

export function CosmicButtonDemo() {
  return (
    <CosmicButton href="#cosmic">
      进入星图
    </CosmicButton>
  )
}

export function GlowTrackButtonDemo({
  text = "跟着光走",
  href = "#glow",
  glowColor = "#FFAA81",
}: { text?: string; href?: string; glowColor?: string } = {}) {
  return <GlowTrackButton backgroundColor="#d1d1d1" glowColor={glowColor} href={href} text={text} textColor="#1c1917" />
}

export function HaloBadgeDemo() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <HaloBadge live>在线</HaloBadge>
      <HaloBadge tabularNums variant="secondary">
        8
      </HaloBadge>
      <HaloBadge variant="destructive">注意</HaloBadge>
    </div>
  )
}

export function HaloSwitchDemo() {
  const [on, setOn] = useState(true)
  return <HaloSwitch aria-label="夜航模式" checked={on} onCheckedChange={setOn} />
}

export function ShiftCardDemo() {
  return (
    <ShiftCard
      bottomContent={<p className="text-foreground">底部说明会跟着悬停升高。</p>}
      middleContent={<p className="text-lg font-medium text-foreground">平时看这里</p>}
      topAnimateContent={<p className="text-xs text-muted-foreground">悬停后出现</p>}
      topContent={<p className="font-medium text-foreground">班次卡片</p>}
    />
  )
}

export function SquiggleArrowDemo() {
  return (
    <div className="flex flex-wrap items-center gap-6 text-foreground">
      <SquiggleArrow direction="right" variant="wavy" />
      <SquiggleArrow direction="up" variant="bouncy" />
      <SquiggleArrow direction="left" variant="smooth" />
    </div>
  )
}

export function SecurityCheckpointDemo() {
  return <SecurityCheckpoint message="为了让浏览更顺畅，我们正在确认这个浏览器。" subtitle="安全核对" title="检查点" />
}

export function SpeechBubbleDemo() {
  return <SpeechBubble>今晚的排班已经对齐。</SpeechBubble>
}

export function FoldedCardDemo({
  href = "#folded",
  title = "现场笔记",
  gridRows = 4,
}: { href?: string; title?: string; gridRows?: number } = {}) {
  return (
    <FoldedCard badge="草稿" description="折页固定在右上角，网格只是预览底纹。" gridRows={gridRows} href={href} title={title}>
      <div className="absolute inset-6 rounded-md bg-primary/15" />
    </FoldedCard>
  )
}

export function SidePanelDemo() {
  const [open, setOpen] = useState(false)
  return (
    <SidePanel
      handlePanelOpen={() => setOpen((value) => !value)}
      panelOpen={open}
      renderButton={(toggle) => (
        <button className="min-h-11 rounded-full bg-white/10 px-4 text-sm text-white" type="button" onClick={toggle}>
          {open ? "收起" : "展开"}
        </button>
      )}
    >
      <p>侧栏里可以放协作备注。高度会跟着内容弹簧展开。</p>
    </SidePanel>
  )
}

export function CollabAvatarDemo() {
  return (
    <div className="flex items-center gap-3">
      <CollabAvatar color="#7C3AED" name="林夏" size={44} />
      <CollabAvatar color="#0F766E" name="周宁" size={44} />
      <CollabAvatar color="#B45309" name="阿禾" size={44} />
    </div>
  )
}

export function ElapsedTimerDemo() {
  const [loading, setLoading] = useState(true)
  return (
    <div className="flex flex-wrap items-center gap-3">
      <ElapsedTimer format="SS.MS" loading={loading} />
      <button className="min-h-11 rounded-full border border-border px-4 text-sm" type="button" onClick={() => setLoading((value) => !value)}>
        {loading ? "暂停" : "继续"}
      </button>
    </div>
  )
}

export function NeumorphButtonDemo({
  intent = "primary",
  buttonSize = "medium",
  fullWidth = false,
}: {
  intent?: "default" | "primary" | "secondary" | "danger"
  buttonSize?: "small" | "medium" | "large"
  fullWidth?: boolean
} = {}) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <NeumorphButton buttonSize={buttonSize} fullWidth={fullWidth} intent={intent}>
        保存
      </NeumorphButton>
      <NeumorphButton intent="danger" loading>
        提交中
      </NeumorphButton>
    </div>
  )
}

export function TextureCardDemo() {
  return (
    <TextureCard className="max-w-sm">
      <TextureCardHeader>
        <TextureCardTitle>纹理卡片</TextureCardTitle>
        <TextureCardDescription>五层描边跟着主题圆角。</TextureCardDescription>
      </TextureCardHeader>
      <TextureSeparator />
      <TextureCardContent>内层是从卡片色过渡到次要色的渐变。</TextureCardContent>
      <TextureCardFooter>
        <span className="text-sm text-neutral-700 dark:text-neutral-200">今天</span>
      </TextureCardFooter>
    </TextureCard>
  )
}
