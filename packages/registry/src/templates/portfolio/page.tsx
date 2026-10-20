"use client"

import { AtroposCard } from "@/components/ui/atropos-card"
import { BlurFade } from "@/components/ui/blur-fade"
import { Dock } from "@/components/ui/dock"
import { ShimmerButton } from "@/components/ui/shimmer-button"
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

import { portfolioContent } from "./content"
import { portfolioTheme } from "./theme"

function PortfolioTemplate() {
  return (
    <div style={portfolioTheme} className="bg-background text-foreground">
      <div className="mx-auto max-w-3xl space-y-10 px-4 py-16">
        <BlurFade>
          <p className="text-xs tracking-[0.2em] text-muted-foreground uppercase">{portfolioContent.role}</p>
          <h1 className="font-display mt-2 text-5xl">{portfolioContent.name}</h1>
          <p className="mt-3 text-sm text-muted-foreground">{portfolioContent.bio}</p>
        </BlurFade>
        <BlurFade delay={0.05}>
          <div className="grid gap-4 sm:grid-cols-3">
            {portfolioContent.projects.map((project) => (
              <AtroposCard key={project.title} title={project.title} subtitle={project.subtitle} />
            ))}
          </div>
        </BlurFade>
        <BlurFade delay={0.1}>
          <Timeline value={portfolioContent.experience.length}>
            {portfolioContent.experience.map((item, index) => (
              <TimelineItem key={item.title} step={index + 1}>
                <TimelineSeparator />
                <TimelineIndicator />
                <TimelineHeader>
                  <TimelineDate>{item.year}</TimelineDate>
                  <TimelineTitle>{item.title}</TimelineTitle>
                </TimelineHeader>
                <TimelineContent>作品与组件</TimelineContent>
              </TimelineItem>
            ))}
          </Timeline>
        </BlurFade>
        <BlurFade delay={0.15} className="text-center">
          <ShimmerButton>联系</ShimmerButton>
        </BlurFade>
      </div>
      <div className="sticky bottom-4">
        <Dock>
          <span className="text-xs">作</span>
          <span className="text-xs">历</span>
          <span className="text-xs">信</span>
        </Dock>
      </div>
    </div>
  )
}

export { PortfolioTemplate }
