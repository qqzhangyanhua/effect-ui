"use client"

import * as React from "react"

import { RoughAnnotation } from "@/components/ui/rough-annotation"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export interface ShowcaseScreen {
  id: string
  label: string
  tint: string
  note: string
}

export interface HeroAnnotatedShowcaseProps {
  title?: string
  screens?: ShowcaseScreen[]
  className?: string
}

const defaultScreens: ShowcaseScreen[] = [
  { id: "board", label: "看板", tint: "#7c3aed", note: "列与列之间的间距" },
  { id: "chart", label: "图表", tint: "#22d3ee", note: "这一周的峰值" },
  { id: "inbox", label: "收件", tint: "#f472b6", note: "未读会沉到底部" },
]

function ScreenBody({ screen }: { screen: ShowcaseScreen }) {
  if (screen.id === "chart") {
    return (
      <div className="flex h-full items-end gap-2 px-6 pb-6">
        {[40, 68, 46, 82, 58, 90].map((height) => (
          <div key={height} className="flex-1 rounded-t-md" style={{ height: `${height}%`, background: screen.tint }} />
        ))}
      </div>
    )
  }
  if (screen.id === "inbox") {
    return (
      <div className="space-y-2 p-4">
        {["北线更新", "周报草稿", "设计评审"].map((item, index) => (
          <div key={item} className="flex items-center gap-3 rounded-lg bg-white/80 px-3 py-2 text-sm text-zinc-800">
            <span className="size-2 rounded-full" style={{ background: index === 0 ? screen.tint : "#d4d4d8" }} />
            {item}
          </div>
        ))}
      </div>
    )
  }
  return (
    <div className="grid h-full grid-cols-3 gap-2 p-4">
      {["待办", "进行", "完成"].map((column) => (
        <div key={column} className="rounded-lg bg-white/75 p-2 text-xs text-zinc-700">
          <p className="mb-2 font-medium">{column}</p>
          <div className="h-8 rounded-md" style={{ background: screen.tint }} />
          <div className="mt-2 h-8 rounded-md bg-zinc-200" />
        </div>
      ))}
    </div>
  )
}

function HeroAnnotatedShowcase({
  title = "把产品窗口摊开，再用手绘箭头标出来",
  screens = defaultScreens,
  className,
}: HeroAnnotatedShowcaseProps) {
  const reduced = usePrefersReducedMotion()
  const [active, setActive] = React.useState(0)
  const screen = screens[active] ?? screens[0]
  const draw = reduced ? undefined : "eu-draw 1.3s ease forwards"

  if (!screen) return null

  return (
    <section className={cn("rounded-2xl border bg-background px-4 py-10 sm:px-8", className)}>
      <style>
        {`@keyframes eu-draw { from { stroke-dashoffset: 140; } to { stroke-dashoffset: 0; } }`}
      </style>
      <div className="mx-auto max-w-3xl text-center">
        <p className="text-xs tracking-[0.28em] text-muted-foreground uppercase">Annotated showcase</p>
        <h2 className="font-display mt-3 text-4xl tracking-tight text-balance sm:text-5xl">{title}</h2>
        <p className="mx-auto mt-3 max-w-md text-sm text-muted-foreground">
          底部图标切换画面。箭头是描边画出来的，重点用{" "}
          <RoughAnnotation type="circle">{screen.note}</RoughAnnotation> 圈住。
        </p>
      </div>
      <div className="relative mx-auto mt-8 max-w-3xl">
        <svg className="pointer-events-none absolute -top-2 right-6 z-20 hidden h-24 w-40 text-foreground sm:block" viewBox="0 0 160 90" aria-hidden>
          <path d="M10 10 C 70 8, 90 40, 140 72" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeDasharray="140" style={{ strokeDashoffset: reduced ? 0 : 140, animation: draw }} />
          <path d="M140 72 l-14 -2 l4 12" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
        </svg>
        <p className="absolute -top-1 right-2 z-20 hidden max-w-32 text-right font-mono text-[11px] text-muted-foreground sm:block">
          {screen.note}
        </p>
        <div className="overflow-hidden rounded-xl border bg-zinc-100 shadow-xl">
          <div className="flex items-center gap-1.5 border-b bg-white px-3 py-2">
            <span className="size-2 rounded-full bg-zinc-300" />
            <span className="size-2 rounded-full bg-zinc-300" />
            <span className="size-2 rounded-full bg-zinc-300" />
            <span className="ml-3 text-xs text-zinc-500">{screen.label}</span>
          </div>
          <div className="h-52" style={{ background: `linear-gradient(160deg, ${screen.tint}33, #f4f4f5)` }}>
            <ScreenBody screen={screen} />
          </div>
        </div>
        <div className="mx-auto mt-4 flex w-fit gap-1 rounded-2xl border bg-card p-1.5 shadow-sm">
          {screens.map((item, index) => (
            <button
              key={item.id}
              type="button"
              aria-pressed={index === active}
              onClick={() => setActive(index)}
              className={cn(
                "grid size-11 place-items-center rounded-xl text-[10px]",
                index === active ? "bg-foreground text-background" : "hover:bg-muted",
              )}
            >
              <span className="size-4 rounded-md" style={{ background: item.tint }} />
              <span className="sr-only">{item.label}</span>
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}

export { HeroAnnotatedShowcase }
