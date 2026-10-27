"use client"

import * as React from "react"

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/cn"

export interface HelpArticle {
  title: string
}

export interface HelpChapter {
  id: string
  number: string
  title: string
  articles: HelpArticle[]
  children?: HelpChapter[]
}

export interface HelpCenterIndexProps {
  chapters?: HelpChapter[]
  className?: string
}

const DEFAULTS: HelpChapter[] = [
  {
    id: "start",
    number: "01",
    title: "开始使用",
    articles: [{ title: "创建工作区" }, { title: "邀请同事" }, { title: "快捷键" }, { title: "导入样张" }, { title: "第一份文档" }],
    children: [{ id: "start-keys", number: "01.1", title: "键盘", articles: [{ title: "快捷键一览" }] }],
  },
  {
    id: "edit",
    number: "02",
    title: "编辑与发布",
    articles: [{ title: "排版" }, { title: "评论" }, { title: "发布页面" }, { title: "版本记录" }],
  },
  {
    id: "team",
    number: "03",
    title: "团队",
    articles: [{ title: "角色" }, { title: "账单" }, { title: "离开团队" }],
  },
]

function highlight(text: string, query: string) {
  const needle = query.trim()
  if (!needle) return text
  const escaped = needle.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
  const parts = text.split(new RegExp(`(${escaped})`, "ig"))
  return parts.map((part, index) => (part.toLowerCase() === needle.toLowerCase() ? <mark key={index}>{part}</mark> : <React.Fragment key={index}>{part}</React.Fragment>))
}

function Tree({ nodes, query, collapsed, toggle }: { nodes: HelpChapter[]; query: string; collapsed: Set<string>; toggle: (id: string) => void }) {
  return (
    <ul className="space-y-1 pl-2">
      {nodes.map((node) => {
        const open = !collapsed.has(node.id)
        return (
          <li key={node.id}>
            <button type="button" aria-expanded={node.children ? open : undefined} className="text-sm" onClick={() => toggle(node.id)}>
              {highlight(node.title, query)}
            </button>
            {open && node.children ? <Tree nodes={node.children} query={query} collapsed={collapsed} toggle={toggle} /> : null}
          </li>
        )
      })}
    </ul>
  )
}

function HelpCenterIndex({ chapters = DEFAULTS, className }: HelpCenterIndexProps) {
  const reduced = usePrefersReducedMotion()
  const [query, setQuery] = React.useState("")
  const [collapsed, setCollapsed] = React.useState<Set<string>>(() => new Set())
  const visible = chapters.filter((chapter) => {
    const blob = `${chapter.title} ${chapter.articles.map((article) => article.title).join(" ")}`
    return blob.includes(query.trim())
  })

  return (
    <section data-slot="help-center-index" className={cn("grid w-full gap-6 md:grid-cols-[12rem_1fr]", className)}>
      <aside>
        <input aria-label="搜索帮助" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜索文章" className="mb-3 h-10 w-full rounded-md border px-3" />
        <Tree
          nodes={chapters}
          query={query}
          collapsed={collapsed}
          toggle={(id) => {
            setCollapsed((current) => {
              const next = new Set(current)
              if (next.has(id)) next.delete(id)
              else next.add(id)
              return next
            })
          }}
        />
      </aside>
      <div className={cn("grid gap-4", reduced ? "" : "sm:grid-cols-2")}>
        {visible.map((chapter) => {
          const extra = Math.max(0, chapter.articles.length - 3)
          return (
            <article key={chapter.id} className="rounded-xl border p-4">
              <div className="mb-3 flex h-16 items-end rounded-lg bg-linear-to-br from-primary/20 to-muted p-2 text-2xl font-medium" aria-hidden>{chapter.number}</div>
              <h2 className="text-lg font-medium">{highlight(chapter.title, query)}</h2>
              <ul className="mt-2 space-y-1 text-sm">
                {chapter.articles.slice(0, 3).map((article) => (
                  <li key={article.title}>{highlight(article.title, query)}</li>
                ))}
              </ul>
              {extra > 0 ? <p className="mt-3 text-sm text-muted-foreground">还有 {extra} 篇 →</p> : null}
            </article>
          )
        })}
      </div>
    </section>
  )
}

export { HelpCenterIndex }
