"use client"

import * as React from "react"

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/cn"

export interface DottedFeature {
  id: string
  label: string
  title: string
}

export interface SectionDottedFeatureTabsProps {
  features?: DottedFeature[]
  className?: string
}

const defaultFeatures: DottedFeature[] = [
  { id: "chart", label: "图表", title: "这一周的起伏" },
  { id: "list", label: "列表", title: "待处理的三条" },
  { id: "calendar", label: "日历", title: "下周的空档" },
]

function Mini({ id }: { id: string }) {
  if (id === "list") {
    return (
      <div className="space-y-2 p-4">
        {["对齐标题", "补上页脚", "检查减弱动效"].map((item) => (
          <div key={item} className="rounded-md bg-muted px-3 py-2 text-xs">{item}</div>
        ))}
      </div>
    )
  }
  if (id === "calendar") {
    return (
      <div className="grid grid-cols-7 gap-1 p-4">
        {Array.from({ length: 14 }, (_, index) => (
          <span key={index} className={cn("grid h-6 place-items-center rounded text-[10px]", index === 9 && "bg-primary text-primary-foreground")}>
            {index + 1}
          </span>
        ))}
      </div>
    )
  }
  return (
    <div className="flex h-full items-end gap-2 p-4">
      {[36, 64, 48, 80].map((height) => (
        <span key={height} className="flex-1 rounded-t bg-primary/80" style={{ height }} />
      ))}
    </div>
  )
}

function SectionDottedFeatureTabs({
  features = defaultFeatures,
  className,
}: SectionDottedFeatureTabsProps) {
  const reduced = usePrefersReducedMotion()
  const [index, setIndex] = React.useState(0)
  const feature = features[index] ?? features[0]

  if (!feature) return null

  return (
    <section className={cn("relative overflow-hidden rounded-2xl border bg-background px-4 py-12", className)}>
      <style>
        {`@keyframes eu-card { 50% { transform: translateY(-8px); } }`}
      </style>
      <div
        className="pointer-events-none absolute inset-0 opacity-50"
        style={{
          backgroundImage:
            "radial-gradient(circle, color-mix(in oklab, var(--foreground) 40%, transparent) 1.1px, transparent 1.2px)",
          backgroundSize: "12px 12px",
        }}
      />
      <div className="relative mx-auto grid max-w-4xl items-center gap-8 md:grid-cols-2">
        <div>
          <div className="flex flex-wrap gap-2">
            {features.map((item, itemIndex) => (
              <button
                key={item.id}
                type="button"
                aria-pressed={itemIndex === index}
                onClick={() => setIndex(itemIndex)}
                className={cn(
                  "rounded-full border px-3 py-1 text-sm",
                  itemIndex === index && "bg-foreground text-background",
                )}
              >
                {item.label}
              </button>
            ))}
          </div>
          <h2 className="font-display mt-4 text-4xl">{feature.title}</h2>
        </div>
        <div
          className="h-44 overflow-hidden rounded-2xl border bg-card shadow-lg"
          style={{ animation: reduced ? undefined : "eu-card 4.5s ease-in-out infinite" }}
        >
          <Mini id={feature.id} />
        </div>
      </div>
    </section>
  )
}

export { SectionDottedFeatureTabs }
