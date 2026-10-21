"use client"

import { ActivityTerrain } from "../effects/activity-terrain"
import { AIContextMeter } from "../effects/ai-context-meter"
import { AIToolApproval } from "../effects/ai-tool-approval"
import { CradleText } from "../effects/cradle-text"
import { DrapeBackground } from "../effects/drape-background"
import { FocalPointPicker } from "../effects/focal-point-picker"
import { MarkingMenu } from "../effects/marking-menu"
import { PluckedText } from "../effects/plucked-text"
import { PullCord } from "../effects/pull-cord"
import { ShapeHero } from "../effects/shape-hero"
import { SwooshText } from "../effects/swoosh-text"
import { SyncedTranscript } from "../effects/synced-transcript"
import { TopoBackground } from "../effects/topo-background"
import { UndoButton } from "../effects/undo-button"
import { WheelPicker } from "../effects/wheel-picker"

const photo = `data:image/svg+xml,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="1067"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#0ea5e9"/><stop offset="1" stop-color="#f59e0b"/></linearGradient></defs><rect width="1600" height="1067" fill="url(#g)"/><circle cx="1080" cy="390" r="140" fill="#fff"/></svg>`,
)}`

export function ActivityTerrainDemo() {
  return <ActivityTerrain className="w-full" title="活动" />
}

export function CradleTextDemo() {
  return <CradleText className="w-full" text="摇篮" />
}

export function DrapeBackgroundDemo() {
  return <DrapeBackground className="min-h-96 w-full" />
}

export function PluckedTextDemo() {
  return <PluckedText className="w-full" text="拨弦" />
}

export function SwooshTextDemo() {
  return <SwooshText className="w-full text-center" text="挤出" />
}

export function TopoBackgroundDemo() {
  return <TopoBackground className="min-h-96 w-full" />
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

export function AIContextMeterDemo() {
  return (
    <div className="flex w-full justify-center">
      <AIContextMeter className="w-full" />
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

export function WheelPickerDemo() {
  return (
    <div className="flex w-full justify-center">
      <WheelPicker className="w-full max-w-sm" />
    </div>
  )
}

export function UndoButtonDemo() {
  return (
    <div className="flex w-full justify-center">
      <UndoButton />
    </div>
  )
}

export function FocalPointPickerDemo() {
  return <FocalPointPicker alt="渐变里的白点" className="w-full" src={photo} />
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
