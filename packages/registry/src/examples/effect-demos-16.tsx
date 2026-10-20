"use client"

import { ActivityFeed } from "../effects/activity-feed"
import { ChangelogFeed } from "../effects/changelog-feed"
import { CinemaSeatPicker } from "../effects/cinema-seat-picker"
import { DatamoshTransition } from "../effects/datamosh-transition"
import { HologramCard } from "../effects/hologram-card"
import { LoomThreadsMarquee } from "../effects/loom-threads-marquee"
import { ProjectUpdateCard } from "../effects/project-update-card"
import { PublicationFilterList } from "../effects/publication-filter-list"
import { Scroll3dImageRotate } from "../effects/scroll-3d-image-rotate"
import { SeaWavesBackground } from "../effects/sea-waves-background"
import { SetupGuide } from "../effects/setup-guide"
import { ShaderGridWide } from "../effects/shader-grid-wide"
import { ShareInvitePanel } from "../effects/share-invite-panel"
import { SketchHatchImage } from "../effects/sketch-hatch-image"
import { ThumbnailFlowPath } from "../effects/thumbnail-flow-path"

export function DatamoshTransitionDemo() {
  return <DatamoshTransition className="w-full" />
}

export function LoomThreadsMarqueeDemo() {
  return <LoomThreadsMarquee className="w-full" />
}

export function HologramCardDemo() {
  return (
    <div className="flex w-full justify-center py-6">
      <HologramCard />
    </div>
  )
}

export function SketchHatchImageDemo() {
  return <SketchHatchImage className="w-full" />
}

export function Scroll3dImageRotateDemo() {
  return <Scroll3dImageRotate className="w-full" />
}

export function ThumbnailFlowPathDemo() {
  return <ThumbnailFlowPath className="w-full" />
}

export function ShaderGridWideDemo() {
  return <ShaderGridWide className="w-full" />
}

export function SeaWavesBackgroundDemo() {
  return <SeaWavesBackground className="w-full" />
}

export function CinemaSeatPickerDemo() {
  return <CinemaSeatPicker className="w-full" />
}

export function PublicationFilterListDemo() {
  return <PublicationFilterList className="w-full" />
}

export function ActivityFeedDemo() {
  return <ActivityFeed className="w-full" />
}

export function ProjectUpdateCardDemo() {
  return <ProjectUpdateCard className="w-full" />
}

export function ShareInvitePanelDemo() {
  return <ShareInvitePanel className="w-full" />
}

export function ChangelogFeedDemo() {
  return <ChangelogFeed className="w-full" />
}

export function SetupGuideDemo() {
  return <SetupGuide className="w-full" />
}
