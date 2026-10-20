"use client"

import * as React from "react"

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export interface ChangelogEntry {
  id: string
  type: "added" | "fixed" | "improved"
  title: string
  body: string
  date: string
}

export interface ChangelogFeedProps {
  entries?: readonly ChangelogEntry[]
  className?: string
}

const TYPES = {
  added: "新增",
  fixed: "修复",
  improved: "改进",
} as const

const ENTRIES: readonly ChangelogEntry[] = [
  { id: "seat", type: "added", title: "选座键盘", body: "方向键可以走到已售座位并跳过。", date: "10-18" },
  { id: "wave", type: "improved", title: "海况滑杆", body: "风暴只加大浪高，不换一套画面。", date: "10-12" },
  { id: "glitch", type: "fixed", title: "拖影收束", body: "切回原画面时色块不再停在半路。", date: "10-02" },
  { id: "guide", type: "added", title: "安装进度", body: "全部勾完会放一小阵纸屑。", date: "09-28" },
]

function ChangelogFeed({ entries = ENTRIES, className }: ChangelogFeedProps) {
  usePrefersReducedMotion()
  const [type, setType] = React.useState<"all" | ChangelogEntry["type"]>("all")
  const [query, setQuery] = React.useState("")
  const [timeline, setTimeline] = React.useState(true)
  const needle = query.trim().toLowerCase()
  const visible = entries.filter((entry) => {
    const typeOk = type === "all" || entry.type === type
    const text = `${entry.title} ${entry.body}`.toLowerCase()
    return typeOk && (!needle || text.includes(needle))
  })

  return (
    <section data-slot="changelog-feed" className={cn("w-full", className)}>
      <div className="sticky top-0 z-10 flex flex-wrap items-center gap-2 bg-background/95 py-2">
        <div role="radiogroup" aria-label="类型" className="flex flex-wrap gap-2">
          {(["all", "added", "fixed", "improved"] as const).map((item) => (
            <button
              key={item}
              type="button"
              role="radio"
              aria-checked={type === item}
              className={cn("rounded-md border px-2.5 py-1 text-xs", type === item && "bg-primary text-primary-foreground")}
              onClick={() => setType(item)}
            >
              {item === "all" ? "全部" : TYPES[item]}
            </button>
          ))}
        </div>
        <input
          value={query}
          aria-label="搜索更新"
          placeholder="搜索"
          className="h-8 rounded-md border bg-background px-2 text-sm"
          onChange={(event) => setQuery(event.target.value)}
        />
        <button
          type="button"
          role="switch"
          aria-checked={timeline}
          className="text-xs"
          onClick={() => setTimeline((current) => !current)}
        >
          时间线
        </button>
      </div>
      <div className={cn("mt-2 space-y-3", timeline && "border-l pl-4")}>
        {visible.length === 0 ? <p className="text-sm text-muted-foreground">没有匹配的更新</p> : null}
        {visible.map((entry) => (
          <article key={entry.id} className="relative rounded-xl border p-3">
            {timeline ? <span aria-hidden className="absolute top-4 -left-[1.3rem] size-2 rounded-full bg-primary" /> : null}
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>{TYPES[entry.type]}</span>
              <time>{entry.date}</time>
            </div>
            <h3 className="mt-1 text-sm font-medium">{entry.title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{entry.body}</p>
          </article>
        ))}
      </div>
    </section>
  )
}

export { ChangelogFeed }
