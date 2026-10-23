"use client"

import { ApiKeyManager } from "../effects/api-key-manager"
import { CardBeamScanner } from "../effects/card-beam-scanner"
import { HyperspaceText } from "../effects/hyperspace-text"
import { LenticularCard } from "../effects/lenticular-card"
import { RainPuddle } from "../effects/rain-puddle"
import { RepetitionImageHover } from "../effects/repetition-image-hover"
import { RubberBandDrag } from "../effects/rubber-band-drag"
import { TiledSwirlLoader } from "../effects/tiled-swirl-loader"
import { UptimeBars } from "../effects/uptime-bars"
import { HelpCenterIndex } from "../sections/help-center-index"
import { IntegrationsDirectory } from "../sections/integrations-directory"
import { KeyholeScrollReveal } from "../sections/keyhole-scroll-reveal"
import { StatusPage } from "../templates/status-page"

export function LenticularCardDemo() {
  return <LenticularCard className="w-full" />
}

export function CardBeamScannerDemo() {
  return <CardBeamScanner className="w-full" />
}

export function RepetitionImageHoverDemo() {
  return <RepetitionImageHover className="w-full" />
}

export function HyperspaceTextDemo() {
  return <HyperspaceText className="w-full" />
}

export function TiledSwirlLoaderDemo({
  size = 168,
  color = "#38bdf8",
  speed = 1,
}: { size?: number; color?: string; speed?: number } = {}) {
  return <TiledSwirlLoader color={color} size={size} speed={speed} />
}

export function RainPuddleDemo() {
  return <RainPuddle className="w-full" />
}

export function KeyholeScrollRevealDemo() {
  return <KeyholeScrollReveal className="w-full" />
}

export function RubberBandDragDemo() {
  return <RubberBandDrag className="w-full" />
}

export function UptimeBarsDemo() {
  return <UptimeBars />
}

export function StatusPageDemo() {
  return <StatusPage />
}

export function IntegrationsDirectoryDemo() {
  return <IntegrationsDirectory />
}

export function ApiKeyManagerDemo() {
  return (
    <ApiKeyManager
      keys={[
        {
          id: "north",
          name: "北窗",
          masked: "sk_live_••••91",
          scopes: ["读取"],
          lastUsed: "2026-10-20",
          createdAt: "2026-09-01",
        },
      ]}
      onCreate={async (input) => ({
        id: `key-${input.name}`,
        name: input.name,
        masked: "sk_live_••••91",
        secret: "sk_live_north_91",
        scopes: input.scopes,
        lastUsed: "从未",
        createdAt: "2026-10-21",
      })}
      onRevoke={async () => {}}
    />
  )
}

export function HelpCenterIndexDemo() {
  return <HelpCenterIndex />
}
