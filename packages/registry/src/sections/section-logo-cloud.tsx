import { Marquee } from "@/components/ui/marquee"
import { ProgressiveBlur } from "@/components/ui/progressive-blur"
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
import { cn } from "@/lib/utils"

export interface LogoCloudItem {
  name: string
}

export interface LogoCloudMilestone {
  year: string
  title: string
}

export interface SectionLogoCloudProps {
  logos?: LogoCloudItem[]
  milestones?: LogoCloudMilestone[]
  className?: string
}

const defaultLogos: LogoCloudItem[] = [
  { name: "Northwind" },
  { name: "Helix" },
  { name: "Lumen" },
  { name: "Orbital" },
  { name: "Nimbus" },
  { name: "Cascade" },
  { name: "Vertex" },
  { name: "Harbor" },
]

const defaultMilestones: LogoCloudMilestone[] = [
  { year: "2024", title: "开源 registry" },
  { year: "2025", title: "特效批次" },
  { year: "2026", title: "落地页区块" },
]

function SectionLogoCloud({
  logos = defaultLogos,
  milestones = defaultMilestones,
  className,
}: SectionLogoCloudProps) {
  const step = milestones.length

  return (
    <section className={cn("space-y-8 rounded-2xl border bg-background px-6 py-12", className)}>
      <div className="text-center">
        <p className="text-xs tracking-[0.28em] text-muted-foreground uppercase">Logo cloud</p>
        <h2 className="font-display mt-2 text-3xl">被这些团队用在生产页</h2>
      </div>
      <div className="relative">
        <Marquee className="py-2" pauseOnHover>
          {logos.map((logo) => (
            <span
              key={logo.name}
              className="rounded-full border bg-card px-5 py-2 text-sm font-medium text-muted-foreground grayscale transition hover:text-foreground hover:grayscale-0"
            >
              {logo.name}
            </span>
          ))}
        </Marquee>
        <ProgressiveBlur direction="left" className="absolute inset-y-0 left-0 w-16" />
        <ProgressiveBlur direction="right" className="absolute inset-y-0 right-0 w-16" />
      </div>
      <Timeline value={step} orientation="horizontal" className="pt-2">
        {milestones.map((item, index) => (
          <TimelineItem key={item.year} step={index + 1} className="min-w-0">
            <TimelineSeparator />
            <TimelineIndicator />
            <TimelineHeader>
              <TimelineDate>{item.year}</TimelineDate>
              <TimelineTitle>{item.title}</TimelineTitle>
            </TimelineHeader>
            <TimelineContent>落地页区块批次</TimelineContent>
          </TimelineItem>
        ))}
      </Timeline>
    </section>
  )
}

export { SectionLogoCloud }
