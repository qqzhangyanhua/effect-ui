"use client"

import { useEffect, useRef, useState } from "react"

import { PawlTick, type PawlTickStatus } from "../effects/autosave-ratchet"
import { TearStub } from "../effects/banner-tear-stub"
import { TorsionRetry } from "../effects/button-retry-backoff"
import { ToppleRun } from "../effects/checkbox-domino-run"
import { RuleFrame } from "../effects/container-box-drawing"
import { ContraStrike } from "../effects/contra-strike"
import { CrazeRule } from "../effects/craze-rule"

import { DueSlip, type DueSlipReader } from "../effects/due-slip"

import { GalleyBracket, type GalleyBracketSelection } from "../effects/galley-bracket"
import { PlumbTrue } from "../effects/success-plumb-bob"
import { SiphonLift } from "../effects/transfer-list-siphon"
import { AfterImageList } from "../effects/undo-ghost-row"

const saveScript: { status: PawlTickStatus; ms: number }[] = [
  { status: "idle", ms: 1200 },
  { status: "saving", ms: 600 },
  { status: "saved", ms: 1600 },
  { status: "saving", ms: 600 },
  { status: "error", ms: 1600 },
  { status: "saving", ms: 600 },
  { status: "saved", ms: 1800 },
]

const galleyText =
  "远程协作者的选区应该像校样边上的批注，而不是叠在一起的色块。两个人同时选中同一段时，记号按到达顺序向外嵌套，后来的人也能看清谁停在哪里。"

function galleySpan(needle: string) {
  const start = galleyText.indexOf(needle)
  return { start, end: start + needle.length }
}

const galleyAna = galleySpan("远程协作者的选区")
const galleyBen = galleySpan("选区应该像校样边上的批注")
const galleyCleo = galleySpan("谁停在哪里")

export function SuccessPlumbBobDemo({
  pendingCopy = "订单合计 ¥49.00",
  pendingLabel = "确认付款",
  armingLabel = "正在确认…",
}: {
  pendingCopy?: string
  pendingLabel?: string
  armingLabel?: string
} = {}) {
  return (
    <div className="w-full max-w-xs">
      <PlumbTrue
        pendingCopy={pendingCopy}
        pendingLabel={pendingLabel}
        armingLabel={armingLabel}
        successMessage="付款已确认"
        nextActionLabel="查看收据"
      />
    </div>
  )
}

export function CheckboxDominoRunDemo({
  label = "全部标为已读",
  speed = 14,
  className = "w-full max-w-md",
}: {
  label?: string
  speed?: number
  className?: string
} = {}) {
  return (
    <ToppleRun
      className={className}
      label={label}
      speed={speed}
      items={[
        { id: "1", label: "三季度路线评审", description: "两小时前" },
        { id: "2", label: "发票 4471 已逾期", description: "五小时前" },
        { id: "3", label: "设计系统同步", description: "一天前" },
        { id: "4", label: "新设备登录", description: "一天前" },
        { id: "5", label: "团队周报", description: "两天前" },
        { id: "6", label: "拉取请求 892", description: "两天前" },
      ]}
    />
  )
}

export function AutosaveRatchetDemo({
  status,
  size = 20,
  className = "",
}: {
  status?: PawlTickStatus
  size?: number
  className?: string
} = {}) {
  const [step, setStep] = useState(0)
  const current = saveScript[step % saveScript.length]!
  useEffect(() => {
    const timer = window.setTimeout(() => setStep((value) => value + 1), current.ms)
    return () => window.clearTimeout(timer)
  }, [step, current.ms])
  return (
    <div className="flex w-full max-w-md items-center justify-between rounded-md border border-border px-4 py-3">
      <span className="text-sm text-foreground">三季度回顾</span>
      <PawlTick status={status ?? current.status} size={size} className={className} />
    </div>
  )
}

export function ButtonRetryBackoffDemo({
  baseDelayMs = 800,
  factor = 1.6,
  maxDelayMs = 2400,
}: {
  baseDelayMs?: number
  factor?: number
  maxDelayMs?: number
} = {}) {
  const calls = useRef(0)
  return (
    <TorsionRetry
      label="重试"
      baseDelayMs={baseDelayMs}
      factor={factor}
      maxDelayMs={maxDelayMs}
      onRetry={() => {
        calls.current += 1
        return calls.current % 3 === 0
      }}
    />
  )
}

export function CrazeRuleDemo({
  seed = 7,
  color = "var(--foreground)",
  className = "my-6",
}: {
  seed?: number
  color?: string
  className?: string
} = {}) {
  return (
    <div className="w-full max-w-xl">
      <h2 className="text-lg font-semibold text-foreground">冷存储</h2>
      <p className="mt-2 text-sm text-muted-foreground">写入一次，三地校验，之后只读。</p>
      <CrazeRule seed={seed} color={color} className={className} />
      <h2 className="text-lg font-semibold text-foreground">取回</h2>
      <p className="mt-2 text-sm text-muted-foreground">标准恢复在十二小时内开始。</p>
    </div>
  )
}

export function BannerTearStubDemo({
  title = "计划维护",
  variant = "info",
  defaultOpen = true,
}: {
  title?: string
  variant?: "info" | "urgent"
  defaultOpen?: boolean
} = {}) {
  return (
    <TearStub
      className="w-full max-w-md"
      title={title}
      variant={variant}
      defaultOpen={defaultOpen}
      description="今晚 02:00 UTC 起，这个工作区大约只读十分钟。"
      dismissLabel="关闭"
    />
  )
}
export function UndoGhostRowDemo() {
  return (
    <AfterImageList
      className="w-full max-w-md"
      items={[
        { id: "kickoff", title: "启动笔记", subtitle: "两天前编辑" },
        { id: "budget", title: "预算草案 v3", subtitle: "昨天编辑" },
        { id: "brief", title: "设计简报", subtitle: "六小时前编辑" },
      ]}
    />
  )
}

export function ContainerBoxDrawingDemo() {
  return (
    <RuleFrame title="会话" className="w-full max-w-md">
      <p className="text-sm text-foreground">悬停或聚焦，边框从左上角顺时针换成双线。</p>
      <button type="button" className="mt-3 rounded-sm border border-border px-3 py-1.5 text-xs">
        聚焦这里
      </button>
    </RuleFrame>
  )
}

export function TransferListSiphonDemo() {
  return (
    <SiphonLift
      className="w-full max-w-2xl"
      sourceLabel="候补"
      destinationLabel="极光小队"
      defaultSelectedIds={["wren", "castillo"]}
      defaultDestinationIds={["ling"]}
      items={[
        { id: "wren", label: "林夏", hint: "前端" },
        { id: "castillo", label: "周衡", hint: "后端" },
        { id: "ling", label: "陈可", hint: "设计" },
        { id: "haas", label: "赵宁", hint: "后端" },
        { id: "novak", label: "吴青", hint: "前端" },
      ]}
    />
  )
}

const readers: DueSlipReader[] = [
  { id: "mara", name: "陈玛", readAt: new Date(2026, 7, 17, 8, 3) },
  { id: "jonas", name: "韦伯", readAt: new Date(2026, 7, 17, 8, 22) },
  { id: "aiko", name: "田中爱子", readAt: new Date(2026, 7, 17, 8, 41) },
  { id: "sam", name: "奥卡福", readAt: new Date(2026, 7, 17, 9, 5) },
]

export function DueSlipDemo() {
  const [list, setList] = useState(readers)
  return (
    <div className="w-full max-w-sm">
      <DueSlip readers={list} label="已读" visibleRows={3} />
      <button
        type="button"
        className="mt-3 rounded-sm border border-border px-3 py-1.5 text-xs"
        onClick={() =>
          setList((current) => [
            ...current,
            { id: `new-${current.length}`, name: "新同事", readAt: new Date(2026, 7, 17, 10, current.length) },
          ])
        }
      >
        模拟打开
      </button>
    </div>
  )
}

export function ContraStrikeDemo() {
  return (
    <ContraStrike
      className="w-full max-w-md"
      orderLabel="订单 4471"
      locale="zh-CN"
      currency="CNY"
      lines={[
        { id: "mouse", description: "无线鼠标 ×6", qty: 6, unitPrice: 12.5 },
        { id: "keyboard", description: "键盘 ×2", qty: 2, unitPrice: 45 },
        { id: "shipping", description: "加急运费", qty: 1, unitPrice: 18, committedStruck: 1 },
      ]}
    />
  )
}

export function GalleyBracketDemo() {
  const [extra, setExtra] = useState(false)
  const selections: GalleyBracketSelection[] = [
    { id: "ana", name: "安娜", start: galleyAna.start, end: galleyAna.end, arrivedAt: 0 },
    { id: "ben", name: "本", start: galleyBen.start, end: galleyBen.end, arrivedAt: 1 },
    { id: "cleo", name: "克里奥", start: galleyCleo.start, end: galleyCleo.end, arrivedAt: 2 },
  ]
  if (extra) selections.push({ id: "dre", name: "德雷", start: galleyBen.start, end: galleyBen.end + 8, arrivedAt: 3 })
  return (
    <div className="w-full max-w-xl">
      <GalleyBracket text={galleyText} selections={selections} contextLabel="校样" />
      <button type="button" className="mt-3 rounded-sm border border-border px-3 py-1.5 text-xs" onClick={() => setExtra((value) => !value)}>
        {extra ? "德雷松开" : "德雷加入"}
      </button>
    </div>
  )
}
