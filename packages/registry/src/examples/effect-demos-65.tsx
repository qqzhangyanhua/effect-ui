"use client"

import { EntrancePresets } from "../effects/entrance-presets"
import { LogoMarquee } from "../effects/logo-marquee"
import { ScrollParallaxLayers, ScrollParallaxLayersBack, ScrollParallaxLayersFront, ScrollParallaxLayersMid } from "../effects/scroll-parallax-layers"

const frame = "flex min-h-80 w-full items-center justify-center px-6 py-10"

export function ScrollParallaxLayersDemo({
  intensity = 0.6,
  layers = 3,
  direction = "up",
}: {
  intensity?: number
  layers?: number
  direction?: "left" | "right" | "up" | "down"
} = {}) {
  return (
    <div className="w-full">
      <p className="px-6 pt-8 text-center text-sm text-muted-foreground">向下滚动，三层会分开走。</p>
      <div className="h-[45vh]" />
      <div className="px-6">
        <ScrollParallaxLayers intensity={intensity} layers={layers} direction={direction}>
          <ScrollParallaxLayersBack>
            <div className="absolute inset-0 bg-primary/15" />
          </ScrollParallaxLayersBack>
          <ScrollParallaxLayersMid>
            <div className="absolute left-[14%] top-[22%] h-36 w-52 rounded-3xl bg-chart-2/50" />
          </ScrollParallaxLayersMid>
          <ScrollParallaxLayersFront>
            <div className="absolute bottom-[16%] right-[12%] max-w-xs rounded-2xl border border-border bg-card p-5 text-card-foreground shadow-sm">
              <p className="font-display text-2xl tracking-tight">前景先走一步</p>
              <p className="mt-2 text-sm text-muted-foreground">后面的两层跟得更慢。</p>
            </div>
          </ScrollParallaxLayersFront>
        </ScrollParallaxLayers>
      </div>
      <div className="h-[40vh]" />
    </div>
  )
}

export function LogoMarqueeDemo({
  speed = 1,
  gap = 32,
  direction = "left",
  pauseOnHover = true,
}: {
  speed?: number
  gap?: number
  direction?: "left" | "right"
  pauseOnHover?: boolean
} = {}) {
  return (
    <div className="w-full px-6 py-10">
      <LogoMarquee speed={speed} gap={gap} direction={direction} pauseOnHover={pauseOnHover} />
    </div>
  )
}

export function EntrancePresetsDemo({
  preset = "grow",
  pace = 1,
  intensity = 0.7,
  from = "up",
}: {
  preset?: "grow" | "slide" | "fade" | "spin" | "soft"
  pace?: number
  intensity?: number
  from?: "left" | "right" | "up" | "down"
} = {}) {
  return (
    <div className={frame}>
      <EntrancePresets preset={preset} pace={pace} intensity={intensity} from={from}>
        <div className="max-w-md text-center">
          <p className="font-display text-4xl tracking-tight">任意一块内容</p>
          <p className="mt-3 text-muted-foreground">进到视口之后，再按选定的方式出现。</p>
        </div>
      </EntrancePresets>
    </div>
  )
}
