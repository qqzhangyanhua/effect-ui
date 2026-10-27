import { cn } from "@/lib/cn"

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
  return (
    <section className={cn("space-y-8 rounded-2xl border bg-background px-6 py-12", className)}>
      <div className="text-center">
        <p className="text-xs tracking-[0.28em] text-muted-foreground uppercase">Logo cloud</p>
        <h2 className="font-display mt-2 text-3xl">被这些团队用在生产页</h2>
      </div>
      <div className="flex flex-wrap justify-center gap-3 py-2">
        {logos.map((logo) => (
          <span
            key={logo.name}
            className="rounded-full border bg-card px-5 py-2 text-sm font-medium text-muted-foreground grayscale transition hover:text-foreground hover:grayscale-0"
          >
            {logo.name}
          </span>
        ))}
      </div>
      <ol className="grid gap-4 pt-2 sm:grid-cols-3">
        {milestones.map((item) => (
          <li key={item.year} className="min-w-0">
            <p className="text-xs text-muted-foreground">{item.year}</p>
            <h3 className="text-sm font-medium">{item.title}</h3>
            <p className="text-sm text-muted-foreground">落地页区块批次</p>
          </li>
        ))}
      </ol>
    </section>
  )
}

export { SectionLogoCloud }
