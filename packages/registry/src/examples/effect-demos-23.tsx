"use client"

/* eslint-disable @next/next/no-img-element -- registry 组件不能依赖 next/image */

import { useState } from "react"

import { ActiveSessionsList, type ActiveSession } from "../effects/active-sessions-list"
import { AnimatedSubscribeButton } from "../effects/animated-subscribe-button"
import { AuditLogTable, type AuditEvent } from "../effects/audit-log-table"
import { Backlight } from "../effects/backlight"
import { DataExportDialog } from "../effects/data-export-dialog"
import { DiaTextReveal } from "../effects/dia-text-reveal"
import { Floating3DParticles } from "../effects/floating-3d-particles"
import { GlyphMatrix } from "../effects/glyph-matrix"
import { HeroVideoDialog } from "../effects/hero-video-dialog"
import { LineShadowText } from "../effects/line-shadow-text"
import { NotificationPreferences, type NotificationMatrix } from "../effects/notification-preferences"
import { SmoothCursor } from "../effects/smooth-cursor"
import { TwoFactorSetup } from "../effects/two-factor-setup"
import { VideoText } from "../effects/video-text"
import { WarpBackground } from "../effects/warp-background"

const poster =
  "data:image/svg+xml," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="360"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#7c3aed"/><stop offset="1" stop-color="#22d3ee"/></linearGradient></defs><rect width="640" height="360" fill="url(#g)"/></svg>`,
  )

const videoSrc = "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4"

const qrSrc =
  "data:image/svg+xml," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 29 29"><rect width="29" height="29" fill="white"/>${Array.from({ length: 29 }, (_, y) =>
      Array.from({ length: 29 }, (_, x) => ((x * 7 + y * 3) % 5 < 2 ? `<rect x="${x}" y="${y}" width="1" height="1"/>` : "")).join(""),
    ).join("")}</svg>`,
  )

function seedEvents(): AuditEvent[] {
  return Array.from({ length: 24 }, (_, index) => {
    const action = ["创建", "更新", "删除", "登录"][index % 4] ?? "更新"
    return {
      id: `evt-${index}`,
      time: `2026-10-${String((index % 20) + 1).padStart(2, "0")}T08:${String(index % 60).padStart(2, "0")}:00.000Z`,
      actor: { name: index % 2 === 0 ? "林夏" : "周宁" },
      action,
      target: `项目 ${index + 1}`,
      ip: `10.0.0.${index + 4}`,
      details: { id: `evt-${index}`, action, note: index === 0 ? "north-window" : "ok" },
    }
  })
}

function seedMatrix(): NotificationMatrix {
  const events = ["sign-in", "billing", "mention", "assign"]
  return Object.fromEntries(
    events.map((event, index) => [
      event,
      {
        email: index % 2 === 0,
        "in-app": index % 2 === 1,
        push: true,
        slack: false,
      },
    ]),
  )
}

const sessions: ActiveSession[] = [
  { id: "here", device: "desktop", browser: "Chrome", os: "macOS", city: "上海", lastActive: new Date().toISOString(), current: true },
  { id: "phone", device: "mobile", browser: "Safari", os: "iOS", city: "杭州", lastActive: new Date(Date.now() - 1000 * 60 * 40).toISOString() },
  { id: "pad", device: "tablet", browser: "Firefox", os: "Android", city: "成都", lastActive: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString() },
]

export function GlyphMatrixDemo() {
  return <GlyphMatrix text="北窗" className="h-56 w-full" />
}

export function DiaTextRevealDemo() {
  return <DiaTextReveal text="斜向扫过这段文字" />
}

export function WarpBackgroundDemo() {
  return (
    <WarpBackground className="h-80 w-full">
      <p className="mx-auto w-fit rounded-xl border bg-card px-4 py-3 text-sm">网格中的内容</p>
    </WarpBackground>
  )
}

export function BacklightDemo() {
  return (
    <Backlight>
      <img src={poster} alt="辉光示例" className="h-40 w-64 rounded-xl object-cover" />
    </Backlight>
  )
}

export function Floating3DParticlesDemo() {
  return (
    <div className="relative h-72 w-full overflow-hidden rounded-xl border bg-background">
      <Floating3DParticles />
    </div>
  )
}

export function VideoTextDemo() {
  return <VideoText src={videoSrc} poster={poster}>北窗</VideoText>
}

export function SmoothCursorDemo() {
  return (
    <div className="grid h-40 w-full place-items-center rounded-xl border text-sm text-muted-foreground">
      在页面上移动指针
      <SmoothCursor />
    </div>
  )
}

export function LineShadowTextDemo() {
  return <LineShadowText>斜纹阴影</LineShadowText>
}

export function HeroVideoDialogDemo() {
  return <HeroVideoDialog videoSrc={videoSrc} thumbnailSrc={poster} thumbnailAlt="花" className="w-full max-w-xl" />
}

export function AnimatedSubscribeButtonDemo() {
  const [subscribed, setSubscribed] = useState(false)
  return <AnimatedSubscribeButton subscribed={subscribed} onChange={setSubscribed} />
}

export function AuditLogTableDemo() {
  const [events, setEvents] = useState(seedEvents)
  return (
    <div className="w-full space-y-3">
      <button
        type="button"
        className="h-9 rounded-md border px-3 text-sm"
        onClick={() =>
          setEvents((current) => [
            {
              id: `evt-new-${current.length}`,
              time: new Date().toISOString(),
              actor: { name: "林夏" },
              action: "创建",
              target: "新事件",
              ip: "10.1.1.8",
              details: { fresh: true },
            },
            ...current,
          ])
        }
      >
        插入事件
      </button>
      <AuditLogTable events={events} />
    </div>
  )
}

export function NotificationPreferencesDemo() {
  const [value, setValue] = useState(seedMatrix)
  return <NotificationPreferences value={value} onChange={setValue} />
}

export function DataExportDialogDemo() {
  return (
    <DataExportDialog
      onExport={async (options) => {
        await new Promise((resolve) => setTimeout(resolve, 400))
        return new Blob([JSON.stringify(options)], { type: "application/json" })
      }}
    />
  )
}

export function TwoFactorSetupDemo() {
  return (
    <TwoFactorSetup
      qrSrc={qrSrc}
      secret="NORTH-WINDOW-91"
      recoveryCodes={["4qog-gxfx", "yajc-2zkq", "pb3c-6gvr", "hv5n-ckiy"]}
      onVerify={async (code) => code === "123456"}
    />
  )
}

export function ActiveSessionsListDemo() {
  return <ActiveSessionsList sessions={sessions} />
}
