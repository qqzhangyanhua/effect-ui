"use client"

import * as React from "react"

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export type ProjectHealth = "on-track" | "at-risk" | "off-track"

export interface ProjectUpdate {
  id: string
  author: string
  body: string
  health: ProjectHealth
  unread: boolean
}

export interface ProjectUpdateCardProps {
  className?: string
}

const HEALTH: Record<ProjectHealth, { label: string; className: string }> = {
  "on-track": { label: "正常", className: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300" },
  "at-risk": { label: "有风险", className: "bg-amber-500/15 text-amber-700 dark:text-amber-300" },
  "off-track": { label: "偏离", className: "bg-rose-500/15 text-rose-700 dark:text-rose-300" },
}

const INITIAL: readonly ProjectUpdate[] = [
  { id: "1", author: "林夏", body: "透镜预览已经能跟上指针。", health: "on-track", unread: false },
  { id: "2", author: "周宁", body: "选座键盘还差价格汇总。", health: "at-risk", unread: true },
  { id: "3", author: "赵衡", body: "海浪在减弱动效下停住了。", health: "off-track", unread: true },
]

function ProjectUpdateCard({ className }: ProjectUpdateCardProps) {
  usePrefersReducedMotion()
  const nextId = React.useRef(4)
  const [updates, setUpdates] = React.useState<ProjectUpdate[]>([...INITIAL])
  const [health, setHealth] = React.useState<ProjectHealth>("on-track")
  const [body, setBody] = React.useState("")
  const [unreadOnly, setUnreadOnly] = React.useState(false)
  const visible = unreadOnly ? updates.filter((item) => item.unread) : updates

  const publish = () => {
    const text = body.trim()
    if (!text) return
    nextId.current += 1
    setUpdates((current) => [
      { id: `u-${nextId.current}`, author: "你", body: text, health, unread: true },
      ...current,
    ])
    setBody("")
  }

  return (
    <section data-slot="project-update-card" className={cn("w-full space-y-3 rounded-xl border p-4", className)}>
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-sm font-medium">项目更新</h2>
        <button
          type="button"
          role="switch"
          aria-checked={unreadOnly}
          className="text-xs text-muted-foreground"
          onClick={() => setUnreadOnly((current) => !current)}
        >
          {unreadOnly ? "只看未读" : "全部更新"}
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        <label className="text-xs">
          状态
          <select
            className="ml-2 rounded-md border bg-background px-2 py-1 text-sm"
            value={health}
            onChange={(event) => setHealth(event.target.value as ProjectHealth)}
          >
            {(Object.keys(HEALTH) as ProjectHealth[]).map((key) => (
              <option key={key} value={key}>
                {HEALTH[key].label}
              </option>
            ))}
          </select>
        </label>
        <textarea
          value={body}
          aria-label="更新内容"
          rows={2}
          className="min-w-48 flex-1 rounded-md border bg-background px-2 py-1 text-sm"
          onChange={(event) => setBody(event.target.value)}
        />
        <button type="button" className="rounded-md bg-primary px-3 py-1.5 text-sm text-primary-foreground" onClick={publish}>
          发布
        </button>
      </div>
      <ul className="space-y-2">
        {visible.map((item) => (
          <li key={item.id} className="rounded-lg border px-3 py-2">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">{item.author}</span>
              <span className={cn("rounded-full px-2 py-0.5 text-xs", HEALTH[item.health].className)}>{HEALTH[item.health].label}</span>
              {item.unread ? <span className="text-xs text-muted-foreground">未读</span> : null}
            </div>
            <p className="mt-1 text-sm">{item.body}</p>
          </li>
        ))}
      </ul>
    </section>
  )
}

export { ProjectUpdateCard }
