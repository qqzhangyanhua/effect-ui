"use client"

import { Bell, Heart, Search, Settings } from "lucide-react"
import { useState } from "react"

import { IconMoves } from "../effects/icon-moves"
import { ListCut } from "../effects/list-cut"
import { LoadCut } from "../effects/load-cut"
import { StateCut } from "../effects/state-cut"
import { WavePhysicsLoader } from "../effects/wave-physics-loader"
import { useWebHaptics } from "../hooks/use-web-haptics"

const frame = "flex min-h-80 w-full items-center justify-center px-6 py-10"

const buttonClass = "inline-flex items-center gap-2 rounded-md border bg-background px-3 py-2 text-sm text-foreground"

export function IconMovesDemo({
  on = "press",
  color = "var(--foreground)",
  speed = 1,
  size = 24,
  duration = 420,
}: {
  on?: "press" | "hover"
  color?: string
  speed?: number
  size?: number
  duration?: number
} = {}) {
  return (
    <div className={frame}>
      <IconMoves on={on} color={color} speed={speed} size={size} duration={duration} className="flex flex-wrap justify-center gap-3">
        <button type="button" className={buttonClass}>
          <Settings />
          设置
        </button>
        <button type="button" className={buttonClass}>
          <Bell />
          提醒
        </button>
        <button type="button" className={buttonClass}>
          <Heart />
          收藏
        </button>
        <button type="button" className={buttonClass}>
          <Search />
          搜索
        </button>
      </IconMoves>
    </div>
  )
}

export function WavePhysicsLoaderDemo({
  color = "var(--foreground)",
  count = 15,
  duration = 4000,
  speed = 1,
  intensity = 48,
  size = 12,
  gap = 8,
}: {
  color?: string
  count?: number
  duration?: number
  speed?: number
  intensity?: number
  size?: number
  gap?: number
} = {}) {
  return (
    <div className={frame}>
      <div className="space-y-4 text-center">
        <WavePhysicsLoader color={color} count={count} duration={duration} speed={speed} intensity={intensity} size={size} gap={gap} />
        <p className="text-sm text-muted-foreground">小球沿着这排柱子弹。</p>
      </div>
    </div>
  )
}

export function ListCutDemo() {
  const [items, setItems] = useState(["清晨", "午后"])
  return (
    <div className={`${frame} flex-col gap-4`}>
      <button type="button" className={buttonClass} onClick={() => setItems((current) => [...current, `第 ${current.length + 1} 条`])}>
        加入一条
      </button>
      <ListCut className="w-full max-w-sm space-y-2">
        {items.map((item) => (
          <ListCut.Item key={item} id={item} className="rounded-md border bg-card px-3 py-2 text-sm text-card-foreground">
            {item}
          </ListCut.Item>
        ))}
      </ListCut>
    </div>
  )
}

export function LoadCutDemo() {
  const [loading, setLoading] = useState(true)
  return (
    <div className={`${frame} flex-col gap-4`}>
      <button type="button" className={buttonClass} onClick={() => setLoading((current) => !current)}>
        {loading ? "完成" : "重新加载"}
      </button>
      <LoadCut
        loading={loading}
        className="w-full max-w-sm"
        skeleton={<div className="h-16 rounded-md bg-muted" aria-hidden="true" />}
      >
        <p className="rounded-md border bg-card px-3 py-4 text-sm text-card-foreground">笔记已经到了。</p>
      </LoadCut>
    </div>
  )
}

export function StateCutDemo() {
  const [done, setDone] = useState(false)
  return (
    <div className={`${frame} flex-col gap-4`}>
      <button type="button" className={buttonClass} onClick={() => setDone((current) => !current)}>
        切换状态
      </button>
      <StateCut state={done ? "done" : "empty"} className="w-full max-w-sm">
        <p className="rounded-md border bg-card px-3 py-4 text-sm text-card-foreground">{done ? "这一条已经完成。" : "这里还空着。"}</p>
      </StateCut>
    </div>
  )
}

export function UseWebHapticsDemo() {
  const { trigger } = useWebHaptics()
  const [result, setResult] = useState<boolean | null>(null)
  return (
    <div className={`${frame} flex-col gap-3`}>
      <button
        type="button"
        className={buttonClass}
        onClick={() => setResult(trigger("light"))}
      >
        轻触
      </button>
      <p className="text-sm text-muted-foreground">{result === null ? "点一下试试振动。" : result ? "设备接受了振动。" : "当前环境不支持振动。"}</p>
    </div>
  )
}
