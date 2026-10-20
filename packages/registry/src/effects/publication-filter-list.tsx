"use client"

import { motion } from "motion/react"
import * as React from "react"

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export interface Publication {
  id: string
  title: string
  category: string
  summary: string
}

export interface PublicationFilterListProps {
  items?: readonly Publication[]
  className?: string
}

const ITEMS: readonly Publication[] = [
  { id: "signal", title: "信号笔记", category: "研究", summary: "滚动速度怎样留下残影" },
  { id: "seat", title: "座位草案", category: "产品", summary: "键盘能走到每一座" },
  { id: "wave", title: "海况参数", category: "视觉", summary: "平静和风暴共用一个值" },
  { id: "thread", title: "丝线走马灯", category: "视觉", summary: "画面拆开再织回去" },
  { id: "guide", title: "安装清单", category: "产品", summary: "分组任务和总进度" },
  { id: "feed", title: "动态分组", category: "研究", summary: "今天和近七天" },
]

function PublicationFilterList({ items = ITEMS, className }: PublicationFilterListProps) {
  const reduced = usePrefersReducedMotion()
  const categories = ["全部", ...new Set(items.map((item) => item.category))]
  const [category, setCategory] = React.useState("全部")
  const [query, setQuery] = React.useState("")
  const needle = query.trim().toLowerCase()
  const visible = items.filter((item) => {
    const categoryOk = category === "全部" || item.category === category
    const text = `${item.title} ${item.summary}`.toLowerCase()
    return categoryOk && (!needle || text.includes(needle))
  })

  return (
    <section data-slot="publication-filter-list" className={cn("w-full space-y-4", className)}>
      <div className="flex flex-wrap items-center gap-2">
        <div role="tablist" aria-label="分类" className="flex flex-wrap gap-2">
          {categories.map((item) => (
            <button
              key={item}
              type="button"
              role="tab"
              aria-selected={category === item}
              className={cn(
                "rounded-md border px-3 py-1.5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-primary",
                category === item && "bg-primary text-primary-foreground",
              )}
              onClick={() => setCategory(item)}
            >
              {item}
            </button>
          ))}
        </div>
        <input
          value={query}
          aria-label="搜索出版物"
          placeholder="搜索标题"
          className="ml-auto h-9 rounded-md border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-primary"
          onChange={(event) => setQuery(event.target.value)}
        />
      </div>
      {visible.length === 0 ? (
        <p className="text-sm text-muted-foreground">没有匹配的条目</p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((item) => (
            <motion.article
              key={item.id}
              layout
              transition={reduced ? { duration: 0 } : { type: "spring", stiffness: 380, damping: 32 }}
              className="rounded-xl border p-3"
            >
              <p className="text-xs text-muted-foreground">{item.category}</p>
              <h3 className="mt-1 text-sm font-medium">{item.title}</h3>
              <p className="mt-1 text-xs text-muted-foreground">{item.summary}</p>
            </motion.article>
          ))}
        </div>
      )}
    </section>
  )
}

export { PublicationFilterList }
