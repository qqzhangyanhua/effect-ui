"use client"

import * as React from "react"

import { CodeBlock } from "@/components/ui/code-block"
import { OrbitingCircles } from "@/components/ui/orbiting-circles"
import { Terminal } from "@/components/ui/terminal"
import {
  Timeline,
  TimelineContent,
  TimelineDate,
  TimelineHeader,
  TimelineIndicator,
  TimelineItem,
  TimelineSeparator,
  TimelineTitle,
} from "@/components/ui/timeline"
import { TracingBeam } from "@/components/ui/tracing-beam"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"

import { devtoolContent } from "./content"
import { devtoolTheme } from "./theme"

const FlickeringGrid = React.lazy(() =>
  import("@/components/ui/flickering-grid").then((mod) => ({ default: mod.FlickeringGrid })),
)
const FooterShaderWordmark = React.lazy(() =>
  import("@/components/ui/footer-shader-wordmark").then((mod) => ({ default: mod.FooterShaderWordmark })),
)

function DevtoolTemplate() {
  const reduced = usePrefersReducedMotion()

  return (
    <div style={devtoolTheme} className="bg-background text-foreground">
      <section className="relative overflow-hidden px-6 py-16">
        {reduced ? (
          <div className="absolute inset-0 bg-[linear-gradient(180deg,#042f2e,#0f172a)]" />
        ) : (
          <React.Suspense fallback={<div className="absolute inset-0 bg-[#042f2e]" />}>
            <FlickeringGrid className="absolute inset-0 size-full opacity-60" />
          </React.Suspense>
        )}
        <div className="relative mx-auto grid max-w-5xl gap-6 md:grid-cols-2">
          <div>
            <p className="text-xs tracking-[0.2em] text-muted-foreground uppercase">Devtool</p>
            <h1 className="font-display mt-2 text-4xl">{devtoolContent.title}</h1>
          </div>
          <Terminal lines={devtoolContent.lines} />
        </div>
      </section>
      <div className="mx-auto grid max-w-5xl gap-8 px-4 py-10 md:grid-cols-[0.7fr_1.3fr]">
        <div className="grid place-items-center">
          <OrbitingCircles>
            <span className="text-xs">CLI</span>
            <span className="text-xs">API</span>
            <span className="text-xs">SDK</span>
          </OrbitingCircles>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <CodeBlock files={[{ filename: "before.ts", language: "tsx", code: devtoolContent.before }]} />
          <CodeBlock files={[{ filename: "after.ts", language: "tsx", code: devtoolContent.after }]} />
        </div>
      </div>
      <div className="mx-auto max-w-3xl px-4 pb-12">
        <TracingBeam>
          <Timeline value={devtoolContent.changelog.length}>
            {devtoolContent.changelog.map((item, index) => (
              <TimelineItem key={item.title} step={index + 1}>
                <TimelineSeparator />
                <TimelineIndicator />
                <TimelineHeader>
                  <TimelineDate>{item.year}</TimelineDate>
                  <TimelineTitle>{item.title}</TimelineTitle>
                </TimelineHeader>
                <TimelineContent>registry 更新</TimelineContent>
              </TimelineItem>
            ))}
          </Timeline>
        </TracingBeam>
      </div>
      {reduced ? (
        <p className="bg-[linear-gradient(90deg,#99f6e4,#22d3ee)] bg-clip-text px-6 py-16 text-center font-display text-6xl text-transparent">
          effect-ui
        </p>
      ) : (
        <React.Suspense fallback={null}>
          <FooterShaderWordmark />
        </React.Suspense>
      )}
    </div>
  )
}

export { DevtoolTemplate }
