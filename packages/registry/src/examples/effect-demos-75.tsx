"use client"

import { ArcFilmCarousel } from "../effects/arc-film-carousel"
import { BorderFocusStrip } from "../effects/border-focus-strip"
import { DepthBlurLine } from "../effects/depth-blur-line"
import { FilmstripFramePick } from "../effects/filmstrip-frame-pick"
import { KnurlScrubDial } from "../effects/knurl-scrub-dial"
import { VinylClipWindow } from "../effects/vinyl-clip-window"

export function FilmstripFramePickDemo({
  pace = 1,
  intensity = 0.65,
  count = 10,
  snap = true,
}: {
  pace?: number
  intensity?: number
  count?: number
  snap?: boolean
} = {}) {
  return (
    <div className="w-full max-w-xl px-6 py-10">
      <FilmstripFramePick pace={pace} intensity={intensity} count={count} snap={snap} />
    </div>
  )
}

export function KnurlScrubDialDemo({
  pace = 1,
  intensity = 0.7,
  step = 1,
  axis = "x",
}: {
  pace?: number
  intensity?: number
  step?: number
  axis?: "x" | "y"
} = {}) {
  return (
    <div className="w-full max-w-md px-6 py-10">
      <KnurlScrubDial pace={pace} intensity={intensity} step={step} axis={axis} />
    </div>
  )
}

export function ArcFilmCarouselDemo({
  pace = 1,
  intensity = 0.65,
  count = 7,
  depth = 0.55,
}: {
  pace?: number
  intensity?: number
  count?: number
  depth?: number
} = {}) {
  return (
    <div className="w-full max-w-3xl px-6 py-10">
      <ArcFilmCarousel pace={pace} intensity={intensity} count={count} depth={depth} />
    </div>
  )
}

export function VinylClipWindowDemo({
  pace = 1,
  intensity = 0.65,
  spin = true,
  window: clipWindow = 0.35,
}: {
  pace?: number
  intensity?: number
  spin?: boolean
  window?: number
} = {}) {
  return (
    <div className="w-full max-w-md px-6 py-10">
      <VinylClipWindow pace={pace} intensity={intensity} spin={spin} window={clipWindow} />
    </div>
  )
}

export function DepthBlurLineDemo({
  pace = 1,
  intensity = 0.65,
  lines = 5,
  falloff = "linear",
}: {
  pace?: number
  intensity?: number
  lines?: number
  falloff?: "linear" | "quadratic"
} = {}) {
  return (
    <div className="w-full max-w-xl px-6 py-10">
      <DepthBlurLine pace={pace} intensity={intensity} lines={lines} falloff={falloff} />
    </div>
  )
}

export function BorderFocusStripDemo({
  pace = 1,
  intensity = 0.7,
  count = 8,
  snap = true,
}: {
  pace?: number
  intensity?: number
  count?: number
  snap?: boolean
} = {}) {
  return (
    <div className="w-full max-w-3xl px-6 py-10">
      <BorderFocusStrip pace={pace} intensity={intensity} count={count} snap={snap} />
    </div>
  )
}
