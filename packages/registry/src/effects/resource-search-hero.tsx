"use client"

import { motion } from "motion/react"
import * as React from "react"

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/cn"

export interface ResourceCard {
  id: string
  title: string
  topic: string
  summary: string
  hue: number
}

export interface ResourceSearchHeroProps {
  cards?: readonly ResourceCard[]
  className?: string
}

const CARDS: readonly ResourceCard[] = [
  { id: "signal", title: "信号墙", topic: "背景", summary: "滚动速度拖出残影", hue: 262 },
  { id: "orbit", title: "轨道列表", topic: "文字", summary: "两列反向波动", hue: 190 },
  { id: "lens", title: "方形透镜", topic: "指针", summary: "放大、扭曲、分色", hue: 28 },
  { id: "mask", title: "遮罩过渡", topic: "滚动", summary: "圆形、色块、条纹、文字", hue: 330 },
  { id: "lid", title: "笔记本", topic: "滚动", summary: "屏幕随滚动打开", hue: 210 },
  { id: "heat", title: "热力年历", topic: "数据", summary: "一年的密度格", hue: 152 },
  { id: "json", title: "JSON 树", topic: "数据", summary: "折叠、搜索、复制路径", hue: 48 },
  { id: "filter", title: "分面筛选", topic: "表格", summary: "字段、条件、可编辑标签", hue: 12 },
]

interface FuseLike {
  search: (query: string) => { item: ResourceCard }[]
}

function includesMatch(cards: readonly ResourceCard[], query: string) {
  const needle = query.toLowerCase()
  return cards.filter((card) =>
    `${card.title} ${card.topic} ${card.summary}`.toLowerCase().includes(needle),
  )
}

function ResourceSearchHero({ cards = CARDS, className }: ResourceSearchHeroProps) {
  const reduced = usePrefersReducedMotion()
  const [query, setQuery] = React.useState("")
  const [fuse, setFuse] = React.useState<FuseLike | null>(null)
  const inputId = React.useId()

  React.useEffect(() => {
    let cancelled = false
    void import("fuse.js").then((mod) => {
      if (cancelled) return
      const Fuse = mod.default
      setFuse(new Fuse([...cards], { keys: ["title", "topic", "summary"], threshold: 0.42 }))
    })
    return () => {
      cancelled = true
    }
  }, [cards])

  const results = !query.trim()
    ? [...cards]
    : fuse
      ? fuse.search(query.trim()).map((item) => item.item)
      : includesMatch(cards, query.trim())

  return (
    <section data-slot="resource-search-hero" className={cn("w-full space-y-5", className)}>
      <style>
        {`@keyframes effect-ui-search-glow {
          50% { box-shadow: 0 0 0 4px color-mix(in oklab, var(--primary) 30%, transparent), 0 0 28px color-mix(in oklab, var(--primary) 45%, transparent); }
        }`}
      </style>
      <div className="space-y-2 text-center">
        <h2 className="font-display text-4xl tracking-tight">找一个主题</h2>
        <p className="text-sm text-muted-foreground">输入后卡片会按匹配重新排列。</p>
      </div>
      <label htmlFor={inputId} className="sr-only">
        搜索主题
      </label>
      <input
        id={inputId}
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="试试 滚动、数据、透镜"
        className={cn(
          "mx-auto block h-12 w-full max-w-xl rounded-full border bg-background px-5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-primary",
          !reduced && "motion-safe:animate-[effect-ui-search-glow_2.8s_ease-in-out_infinite]",
        )}
      />
      {results.length === 0 ? (
        <p className="text-center text-sm text-muted-foreground">没有匹配的主题</p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {results.map((card) => (
            <motion.article
              key={card.id}
              layout
              transition={reduced ? { duration: 0 } : { type: "spring", stiffness: 360, damping: 32 }}
              className="rounded-xl border p-3"
            >
              <div
                className="mb-3 h-16 rounded-lg"
                style={{ background: `linear-gradient(145deg, hsl(${card.hue} 55% 36%), hsl(${card.hue} 75% 58%))` }}
              />
              <p className="text-xs text-muted-foreground">{card.topic}</p>
              <h3 className="text-sm font-medium">{card.title}</h3>
              <p className="mt-1 text-xs text-muted-foreground">{card.summary}</p>
            </motion.article>
          ))}
        </div>
      )}
    </section>
  )
}

export { ResourceSearchHero }
