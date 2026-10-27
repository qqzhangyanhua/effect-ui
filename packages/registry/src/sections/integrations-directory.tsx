"use client"

import * as React from "react"
import { LayoutGroup, motion } from "motion/react"

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/cn"

export interface IntegrationItem {
  id: string
  name: string
  description: string
  category: string
  badge?: string
  icon?: React.ReactNode
}

export interface IntegrationsDirectoryProps {
  items?: IntegrationItem[]
  className?: string
}

const DEFAULTS: IntegrationItem[] = [
  { id: "form", name: "北窗表单", description: "把提交收进一张表。", category: "数据", badge: "Beta" },
  { id: "sheet", name: "样张仓库", description: "存放导出的样张。", category: "数据" },
  { id: "mail", name: "夜航邮件", description: "把通知送进收件箱。", category: "沟通", badge: "模板" },
  { id: "bell", name: "长廊通知", description: "按频道推送提醒。", category: "沟通" },
  { id: "chart", name: "庭院分析", description: "看每天的访问起伏。", category: "效率" },
  { id: "cal", name: "雪线日历", description: "把截止日期写进日程。", category: "效率", badge: "Beta" },
  { id: "log", name: "港口日志", description: "集中查看运行记录。", category: "数据" },
  { id: "cup", name: "灰杯子", description: "把待办倒进个人清单。", category: "效率" },
]

function Mark({ name }: { name: string }) {
  return <span className="flex size-8 items-center justify-center rounded-lg bg-primary/15 text-sm">{name.slice(0, 1)}</span>
}

function IntegrationsDirectory({ items = DEFAULTS, className }: IntegrationsDirectoryProps) {
  const reduced = usePrefersReducedMotion()
  const categories = ["全部", ...Array.from(new Set(items.map((item) => item.category)))]
  const [category, setCategory] = React.useState("全部")
  const [query, setQuery] = React.useState("")
  const [expanded, setExpanded] = React.useState(false)
  const filtered = items.filter((item) => (category === "全部" || item.category === category) && (item.name.includes(query) || item.description.includes(query)))
  const visible = expanded ? filtered : filtered.slice(0, 6)

  return (
    <section data-slot="integrations-directory" className={cn("grid w-full gap-4 md:grid-cols-[10rem_1fr]", className)}>
      <nav aria-label="集成分类" className="flex gap-2 md:flex-col">
        {categories.map((item) => (
          <button key={item} type="button" aria-pressed={category === item} className={cn("rounded-md px-2 py-1 text-left text-sm", category === item && "bg-primary text-primary-foreground")} onClick={() => setCategory(item)}>
            {item}
          </button>
        ))}
      </nav>
      <div>
        <input aria-label="搜索集成" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜索名称或说明" className="mb-3 h-10 w-full rounded-md border px-3" />
        <LayoutGroup>
          <div className="grid gap-3 sm:grid-cols-2">
            {visible.map((item) => (
              <motion.article key={item.id} layout={reduced ? false : true} className="rounded-xl border p-3">
                <div className="flex items-center gap-2">
                  {item.icon ?? <Mark name={item.name} />}
                  <h3 className="font-medium">{item.name}</h3>
                  {item.badge ? <span className="rounded-full bg-muted px-2 py-0.5 text-xs">{item.badge}</span> : null}
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{item.description}</p>
              </motion.article>
            ))}
          </div>
        </LayoutGroup>
        {filtered.length === 0 ? <p className="text-sm text-muted-foreground">没有匹配的集成。</p> : null}
        {filtered.length > 6 && !expanded ? (
          <button type="button" className="mt-3 text-sm underline" onClick={() => setExpanded(true)}>查看更多</button>
        ) : null}
      </div>
    </section>
  )
}

export { IntegrationsDirectory }
