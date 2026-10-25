"use client"

import { ActivityTerrain } from "../effects/activity-terrain"
import { AIContextMeter } from "../effects/ai-context-meter"
import { AIToolApproval } from "../effects/ai-tool-approval"
import { CradleText } from "../effects/cradle-text"
import { DrapeBackground } from "../effects/drape-background"
import { MarkingMenu } from "../effects/marking-menu"
import { PluckedText } from "../effects/plucked-text"
import { PullCord } from "../effects/pull-cord"
import { ShapeHero } from "../effects/shape-hero"
import { SwooshText } from "../effects/swoosh-text"
import { SyncedTranscript } from "../effects/synced-transcript"
import { TopoBackground } from "../effects/topo-background"
import { UndoButton } from "../effects/undo-button"

export function ActivityTerrainDemo({
  endDate = "2026-10-11",
  title = "活动",
  defaultFlat = false,
}: { endDate?: string; title?: string; defaultFlat?: boolean } = {}) {
  return <ActivityTerrain className="w-full" endDate={endDate} title={title} defaultFlat={defaultFlat} />
}

export function CradleTextDemo({
  text = "摇篮",
  intro = true,
  bounce = 0.97,
}: { text?: string; intro?: boolean; bounce?: number } = {}) {
  return <CradleText bounce={bounce} className="w-full" intro={intro} text={text} />
}

export function DrapeBackgroundDemo({
  wind = 1,
  pleat = 34,
  interactive = true,
}: {
  wind?: number
  pleat?: number
  interactive?: boolean
} = {}) {
  return <DrapeBackground className="min-h-96 w-full" wind={wind} pleat={pleat} interactive={interactive} />
}

export function PluckedTextDemo({
  text = "拨弦",
  tension = 1,
  strum = true,
}: { text?: string; tension?: number; strum?: boolean } = {}) {
  return <PluckedText className="w-full" strum={strum} tension={tension} text={text} />
}

export function SwooshTextDemo({
  text = "挤出",
  as = "div",
  depth = 12,
}: {
  text?: string
  as?: "div" | "span" | "p" | "h1" | "h2" | "h3" | "h4" | "h5" | "h6"
  depth?: number
} = {}) {
  return <SwooshText as={as} className="w-full text-center" depth={depth} text={text} />
}

export function TopoBackgroundDemo({
  interval = 0.07,
  speed = 1,
  interactive = true,
}: {
  interval?: number
  speed?: number
  interactive?: boolean
} = {}) {
  return <TopoBackground className="min-h-96 w-full" interval={interval} speed={speed} interactive={interactive} />
}

export function ShapeHeroDemo() {
  return <ShapeHero className="min-h-[32rem] w-full" title="有一点重力" description="抓住形状，扔出去。" />
}

export function PullCordDemo() {
  return (
    <div className="flex w-full justify-center">
      <PullCord label="台灯" />
    </div>
  )
}

export function AIContextMeterDemo({
  limit = 200000,
  compactAt = 0.8,
  model = "Claude Opus",
}: {
  limit?: number
  compactAt?: number
  model?: string
} = {}) {
  return (
    <div className="flex w-full justify-center">
      <AIContextMeter className="w-full" limit={limit} compactAt={compactAt} model={model} />
    </div>
  )
}

export function AIToolApprovalDemo() {
  return (
    <div className="flex w-full justify-center">
      <AIToolApproval className="w-full" />
    </div>
  )
}

export function MarkingMenuDemo() {
  return <MarkingMenu className="w-full" />
}

export function UndoButtonDemo({
  label = "Archive",
  doneLabel = "Archived",
  duration = 5000,
}: { label?: string; doneLabel?: string; duration?: number } = {}) {
  return (
    <div className="flex w-full justify-center">
      <UndoButton doneLabel={doneLabel} duration={duration} label={label} />
    </div>
  )
}

export function SyncedTranscriptDemo() {
  return (
    <SyncedTranscript
      className="w-full"
      segments={[
        { speaker: "林", start: 0.4, end: 2.6, text: "今天看上下文怎么被填满。" },
        { speaker: "周", start: 3.2, end: 5.4, text: "点一句就能跳到那里。" },
      ]}
      title="逐词转录"
    />
  )
}
