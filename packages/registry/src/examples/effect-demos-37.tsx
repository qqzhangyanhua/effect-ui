"use client"

import { useState } from "react"
import { Bell, Copy, FileText, Link2, Save } from "lucide-react"

import { ExpandableActionBar } from "../effects/expandable-action-bar"
import { FaceRating } from "../effects/face-rating"
import { FAQTabsCard } from "../effects/faq-tabs-card"
import { FollowButton } from "../effects/follow-button"
import { FolderFloat, type FolderFloatTrigger } from "../effects/folder-float"
import { HologramText } from "../effects/hologram-text"
import { InkMorphText } from "../effects/ink-morph"
import { NavListCard } from "../effects/nav-list-card"
import { NotificationBell } from "../effects/notification-bell"
import { OrbitalText } from "../effects/orbital-text"
import { ScratchCard } from "../effects/scratch-card"
import { ShareButton } from "../effects/share-button"
import { SkeletonReveal } from "../effects/skeleton-reveal"
import { TaskCheckbox } from "../effects/task-checkbox"
import { MorphButton } from "../effects/async-morph-button"

const faqTabs = [
  {
    label: "通用",
    faqs: [
      { question: "数据存在哪里？", answer: "内容留在你的项目里，组件只负责展示。" },
      { question: "可以换成自己的文案吗？", answer: "可以。页签和答案都从 tabs 传入。" },
    ],
  },
  {
    label: "动效",
    faqs: [
      { question: "减弱动效时会怎样？", answer: "页签和答案直接切换，不再滑动。" },
    ],
  },
]

export function HologramTextDemo({
  text = "全息",
  scanDuration = 1800,
  chromaJitter = 0.8,
}: {
  text?: string
  scanDuration?: number
  chromaJitter?: number
} = {}) {
  return (
    <div className="flex min-h-40 items-center justify-center px-6 py-10">
      <HologramText chromaJitter={chromaJitter} scanDuration={scanDuration} text={text} />
    </div>
  )
}

export function InkMorphDemo({
  text = "墨迹",
  intensityFrom = 0.28,
  settleMs = 2000,
}: {
  text?: string
  intensityFrom?: number
  settleMs?: number
} = {}) {
  return (
    <div className="flex min-h-40 items-center justify-center px-6 py-10">
      <InkMorphText
        colorEnd="var(--foreground)"
        colorStart="var(--primary)"
        intensityFrom={intensityFrom}
        settleMs={settleMs}
        text={text}
      />
    </div>
  )
}

export function OrbitalTextDemo({
  text = "轨道",
  radius = 18,
  decay = 0.9,
}: {
  text?: string
  radius?: number
  decay?: number
} = {}) {
  return (
    <div className="flex min-h-40 items-center justify-center px-6 py-10">
      <OrbitalText decay={decay} radius={radius} text={text} />
    </div>
  )
}

export function ScratchCardDemo({
  revealThreshold = 0.5,
  brushSize = 28,
  overlayLabel = "刮开查看",
}: {
  revealThreshold?: number
  brushSize?: number
  overlayLabel?: string
} = {}) {
  return (
    <div className="flex justify-center px-6 py-10">
      <ScratchCard brushSize={brushSize} className="h-40 w-72" overlayLabel={overlayLabel} revealThreshold={revealThreshold}>
        <div className="flex h-40 items-center justify-center text-sm">隐藏的优惠码 SPECTRUM</div>
      </ScratchCard>
    </div>
  )
}

export function SkeletonRevealDemo() {
  const [loading, setLoading] = useState(true)
  return (
    <div className="mx-auto w-72 px-6 py-10">
      <SkeletonReveal loading={loading} skeleton={<div className="h-10 rounded-md bg-muted" />}>
        <p className="text-sm">资料已经准备好。</p>
      </SkeletonReveal>
      <button type="button" className="mt-4 text-sm underline" onClick={() => setLoading((value) => !value)}>
        {loading ? "完成加载" : "重新加载"}
      </button>
    </div>
  )
}

export function NotificationBellDemo() {
  const [count, setCount] = useState(2)
  return (
    <div className="flex items-center justify-center gap-4 px-6 py-10">
      <NotificationBell count={count} onClick={() => setCount((value) => value + 1)} />
      <NotificationBell count={count} dot />
    </div>
  )
}

export function AsyncMorphButtonDemo({
  loadingLabel = "保存中",
  successLabel = "已保存",
  errorLabel = "失败",
}: {
  loadingLabel?: string
  successLabel?: string
  errorLabel?: string
} = {}) {
  return (
    <div className="flex justify-center px-6 py-10">
      <MorphButton
        errorLabel={errorLabel}
        loadingLabel={loadingLabel}
        onAction={async () => {
          await new Promise((resolve) => window.setTimeout(resolve, 600))
        }}
        successLabel={successLabel}
      >
        保存更改
      </MorphButton>
    </div>
  )
}

export function FaceRatingDemo() {
  return (
    <div className="flex justify-center px-6 py-10">
      <FaceRating labels={["很差", "较差", "一般", "不错", "很好"]} label="这次体验如何？" />
    </div>
  )
}

export function FollowButtonDemo({
  followLabel = "关注",
  followingLabel = "已关注",
  unfollowLabel = "取消关注",
}: {
  followLabel?: string
  followingLabel?: string
  unfollowLabel?: string
} = {}) {
  return (
    <div className="flex justify-center px-6 py-10">
      <FollowButton followLabel={followLabel} followingLabel={followingLabel} unfollowLabel={unfollowLabel} />
    </div>
  )
}

export function ShareButtonDemo({
  direction = "right",
  label = "分享",
  closeOnSelect = true,
}: {
  direction?: "left" | "right"
  label?: string
  closeOnSelect?: boolean
} = {}) {
  return (
    <div className="flex justify-center px-6 py-16">
      <ShareButton
        actions={[{ icon: <Link2 size={15} />, label: "复制标题", onSelect: () => undefined }]}
        closeOnSelect={closeOnSelect}
        copyValue="https://github.com/arihantcodes/spectrum-ui"
        direction={direction}
        label={label}
      />
    </div>
  )
}

export function TaskCheckboxDemo() {
  return (
    <div className="mx-auto w-72 px-6 py-10">
      <TaskCheckbox label="写完更新说明" description="发布前再看一眼" />
    </div>
  )
}

export function ExpandableActionBarDemo() {
  return (
    <div className="flex justify-center px-6 py-10">
      <ExpandableActionBar
        items={[
          { id: "save", label: "保存", icon: <Save /> },
          { id: "copy", label: "复制", icon: <Copy /> },
          { id: "bell", label: "提醒", icon: <Bell />, badge: "2" },
        ]}
      />
    </div>
  )
}

export function FaqTabsCardDemo() {
  return (
    <div className="mx-auto w-full max-w-md px-6 py-10">
      <FAQTabsCard tabs={faqTabs} footerLabel="联系支持" />
    </div>
  )
}

export function NavListCardDemo() {
  return (
    <div className="mx-auto w-64 px-6 py-10">
      <NavListCard
        title="规划"
        items={[
          { icon: <FileText />, label: "文档", href: "#docs" },
          { icon: <Copy />, label: "预算", href: "#budget" },
          { icon: <Bell />, label: "报告", href: "#reports" },
        ]}
      />
    </div>
  )
}

export function FolderFloatDemo({
  trigger = "hover",
  closeOnSelect = true,
  physics = true,
  drift = 0.5,
  folderColor,
  spread = 180,
  lift = 26,
  tilt = 8,
  flapAngle = 34,
  openDuration = 520,
  stagger = 45,
  bounce = 0.3,
}: {
  trigger?: FolderFloatTrigger
  closeOnSelect?: boolean
  physics?: boolean
  drift?: number
  folderColor?: string
  spread?: number
  lift?: number
  tilt?: number
  flapAngle?: number
  openDuration?: number
  stagger?: number
  bounce?: number
} = {}) {
  return (
    <div className="flex min-h-80 w-full items-end justify-center pt-28 pb-6">
      <FolderFloat
        trigger={trigger}
        closeOnSelect={closeOnSelect}
        physics={physics}
        drift={drift}
        folderColor={folderColor}
        spread={spread}
        lift={lift}
        tilt={tilt}
        flapAngle={flapAngle}
        openDuration={openDuration}
        stagger={stagger}
        bounce={bounce}
      />
    </div>
  )
}
