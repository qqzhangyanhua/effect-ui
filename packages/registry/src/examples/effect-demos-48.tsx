"use client"

import { useCallback, useEffect, useRef, useState } from "react"

import { PawlTick, type PawlTickStatus } from "../effects/autosave-ratchet"
import { TearStub } from "../effects/banner-tear-stub"
import { TorsionRetry } from "../effects/button-retry-backoff"
import { ToppleRun } from "../effects/checkbox-domino-run"
import { RuleFrame } from "../effects/container-box-drawing"
import { ContraStrike } from "../effects/contra-strike"
import { CrazeRule } from "../effects/craze-rule"
import { CruetSettle, type CruetSettleLine } from "../effects/cruet-settle"
import { SpineStack, type SpineStackHandle, type SpineStackLevel } from "../effects/drill-down-spines"
import { DueSlip, type DueSlipReader } from "../effects/due-slip"
import { EscapementTick, type EscapementTickHandle } from "../effects/feed-escapement"
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

const baseLines: CruetSettleLine[] = [
  { key: "net", label: "净额", amount: 605 },
  { key: "tax", label: "增值税 20%", amount: 121 },
  { key: "fees", label: "刷卡费", amount: 12.5 },
  { key: "discount", label: "优惠 SAVE45", amount: 45, kind: "subtract" },
]

const rushLines: CruetSettleLine[] = [
  ...baseLines.slice(0, 3),
  { key: "rush", label: "加急运费", amount: 38 },
  baseLines[3]!,
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

export function SuccessPlumbBobDemo() {
  return (
    <div className="w-full max-w-xs">
      <PlumbTrue
        pendingCopy="订单合计 ¥49.00"
        pendingLabel="确认付款"
        armingLabel="正在确认…"
        successMessage="付款已确认"
        nextActionLabel="查看收据"
      />
    </div>
  )
}

export function CheckboxDominoRunDemo() {
  return (
    <ToppleRun
      className="w-full max-w-md"
      label="全部标为已读"
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

export function AutosaveRatchetDemo() {
  const [step, setStep] = useState(0)
  const current = saveScript[step % saveScript.length]!
  useEffect(() => {
    const timer = window.setTimeout(() => setStep((value) => value + 1), current.ms)
    return () => window.clearTimeout(timer)
  }, [step, current.ms])
  return (
    <div className="flex w-full max-w-md items-center justify-between rounded-md border border-border px-4 py-3">
      <span className="text-sm text-foreground">三季度回顾</span>
      <PawlTick status={current.status} />
    </div>
  )
}

export function ButtonRetryBackoffDemo() {
  const calls = useRef(0)
  return (
    <TorsionRetry
      label="重试"
      baseDelayMs={800}
      factor={1.6}
      maxDelayMs={2400}
      onRetry={() => {
        calls.current += 1
        return calls.current % 3 === 0
      }}
    />
  )
}

export function CrazeRuleDemo() {
  return (
    <div className="w-full max-w-xl">
      <h2 className="text-lg font-semibold text-foreground">冷存储</h2>
      <p className="mt-2 text-sm text-muted-foreground">写入一次，三地校验，之后只读。</p>
      <CrazeRule seed={7} className="my-6" />
      <h2 className="text-lg font-semibold text-foreground">取回</h2>
      <p className="mt-2 text-sm text-muted-foreground">标准恢复在十二小时内开始。</p>
    </div>
  )
}

export function BannerTearStubDemo() {
  return (
    <TearStub
      className="w-full max-w-md"
      title="计划维护"
      description="今晚 02:00 UTC 起，这个工作区大约只读十分钟。"
      dismissLabel="关闭"
    />
  )
}

export function FeedEscapementDemo() {
  const tickRef = useRef<EscapementTickHandle>(null)
  const timers = useRef<number[]>([])
  const burst = useCallback(() => {
    for (const id of timers.current) window.clearTimeout(id)
    tickRef.current?.clear()
    const items = [
      { title: "开始部署", detail: "8a41f0c → 生产" },
      { title: "构建完成", detail: "38 秒，缓存命中 94%" },
      { title: "打开拉取请求 482", detail: "修复 webhook 重试" },
      { title: "预览就绪", detail: "pr-482" },
    ]
    timers.current = items.map((item, index) => window.setTimeout(() => tickRef.current?.arrive(item), index * 140))
  }, [])
  useEffect(() => {
    burst()
    return () => {
      for (const id of timers.current) window.clearTimeout(id)
    }
  }, [burst])
  return (
    <div className="w-full max-w-sm">
      <EscapementTick ref={tickRef} aria-label="部署活动" emptyLabel="等待活动…" />
      <button type="button" className="mt-3 rounded-sm border border-border px-2.5 py-1 text-xs" onClick={burst}>
        再来一轮
      </button>
    </div>
  )
}

export function CruetSettleDemo() {
  const [rush, setRush] = useState(false)
  return (
    <div className="w-full max-w-xl">
      <CruetSettle lines={rush ? rushLines : baseLines} currency="¥" label="订单合计" />
      <button type="button" className="mt-4 rounded-sm border border-border px-3 py-1.5 text-xs" onClick={() => setRush((value) => !value)}>
        {rush ? "去掉加急运费" : "加上加急运费"}
      </button>
    </div>
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

export function DrillDownSpinesDemo() {
  const handleRef = useRef<SpineStackHandle>(null)
  const root: SpineStackLevel = {
    id: "root",
    title: "项目",
    content: (
      <div className="p-4">
        <h2 className="text-base font-semibold" tabIndex={-1}>
          项目
        </h2>
        <button
          type="button"
          className="mt-3 rounded-sm border border-border px-3 py-1.5 text-sm"
          onClick={() =>
            handleRef.current?.push({
              id: "eng",
              title: "工程",
              content: (
                <div className="p-4">
                  <h2 className="text-base font-semibold" tabIndex={-1}>
                    工程
                  </h2>
                  <p className="mt-2 text-sm text-muted-foreground">网关和网页都还在这一层。</p>
                </div>
              ),
            })
          }
        >
          进入工程
        </button>
      </div>
    ),
  }
  return (
    <div className="h-80 w-full max-w-3xl">
      <SpineStack ref={handleRef} initial={root} className="h-full" />
    </div>
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
