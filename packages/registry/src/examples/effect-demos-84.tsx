"use client"

import { CiteHandleMark } from "../effects/cite-handle-mark"
import { HunkDeltaBar } from "../effects/hunk-delta-bar"
import { MarginNotePop } from "../effects/margin-note-pop"
import { QuietNudgePill } from "../effects/quiet-nudge-pill"
import { SignoffBeadPath } from "../effects/signoff-bead-path"
import { VerdictLaneSlide } from "../effects/verdict-lane-slide"

export function MarginNotePopDemo({
  pace = 1,
  intensity = 0.7,
  oneOpen = true,
  side = "end",
}: {
  pace?: number
  intensity?: number
  oneOpen?: boolean
  side?: "start" | "end"
} = {}) {
  return (
    <div className="w-full max-w-xl px-6 py-10">
      <MarginNotePop pace={pace} intensity={intensity} oneOpen={oneOpen} side={side} />
    </div>
  )
}

export function VerdictLaneSlideDemo({
  pace = 1,
  intensity = 0.4,
  threshold = 0.65,
  showLabels = true,
}: {
  pace?: number
  intensity?: number
  threshold?: number
  showLabels?: boolean
} = {}) {
  return (
    <div className="w-full max-w-xl px-6 py-10">
      <VerdictLaneSlide pace={pace} intensity={intensity} threshold={threshold} showLabels={showLabels} />
    </div>
  )
}

export function CiteHandleMarkDemo({
  pace = 1,
  intensity = 0.55,
  count = 4,
  cycle = false,
}: {
  pace?: number
  intensity?: number
  count?: number
  cycle?: boolean
} = {}) {
  return (
    <div className="w-full max-w-xl px-6 py-10">
      <CiteHandleMark pace={pace} intensity={intensity} count={count} cycle={cycle} />
    </div>
  )
}

export function HunkDeltaBarDemo({
  pace = 1,
  intensity = 0.55,
  showLabels = true,
  compact = false,
}: {
  pace?: number
  intensity?: number
  showLabels?: boolean
  compact?: boolean
} = {}) {
  return (
    <div className="w-full max-w-xl px-6 py-10">
      <HunkDeltaBar pace={pace} intensity={intensity} showLabels={showLabels} compact={compact} />
    </div>
  )
}

export function SignoffBeadPathDemo({
  pace = 1,
  intensity = 0.55,
  showChecks = true,
  count = 4,
  advanceOnEnter = false,
}: {
  pace?: number
  intensity?: number
  showChecks?: boolean
  count?: number
  advanceOnEnter?: boolean
} = {}) {
  return (
    <div className="w-full max-w-xl px-6 py-10">
      <SignoffBeadPath
        pace={pace}
        intensity={intensity}
        showChecks={showChecks}
        count={count}
        advanceOnEnter={advanceOnEnter}
      />
    </div>
  )
}

export function QuietNudgePillDemo({
  pace = 1,
  intensity = 0.3,
  count = 1,
  autoBreathe = true,
}: {
  pace?: number
  intensity?: number
  count?: number
  autoBreathe?: boolean
} = {}) {
  return (
    <div className="w-full max-w-xl px-6 py-10">
      <QuietNudgePill pace={pace} intensity={intensity} count={count} autoBreathe={autoBreathe} />
    </div>
  )
}
