"use client"

import * as React from "react"

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export interface ChecklistItem {
  id: string
  title: string
  owner: string
  status: string
  done: boolean
}

export interface GroupedChecklistProps {
  items?: readonly ChecklistItem[]
  className?: string
}

const ITEMS: readonly ChecklistItem[] = [
  { id: "brief", title: "写清交互", owner: "林夏", status: "设计", done: true },
  { id: "motion", title: "补上减弱动效", owner: "周宁", status: "设计", done: false },
  { id: "keys", title: "键盘能勾选", owner: "陈可", status: "开发", done: true },
  { id: "count", title: "分组计数", owner: "林夏", status: "开发", done: false },
  { id: "bar", title: "总进度条", owner: "赵衡", status: "文档", done: false },
  { id: "note", title: "记下例外", owner: "赵衡", status: "文档", done: true },
]

type GroupBy = "status" | "owner" | "none"

function GroupedChecklist({ items: initial = ITEMS, className }: GroupedChecklistProps) {
  const reduced = usePrefersReducedMotion()
  const [items, setItems] = React.useState(initial)
  const [groupBy, setGroupBy] = React.useState<GroupBy>("status")
  const done = items.filter((item) => item.done).length
  const percent = items.length === 0 ? 0 : Math.round((done / items.length) * 100)
  const groups = new Map<string, ChecklistItem[]>()
  for (const item of items) {
    const key = groupBy === "none" ? "全部" : groupBy === "owner" ? item.owner : item.status
    const list = groups.get(key) ?? []
    list.push(item)
    groups.set(key, list)
  }

  const toggle = (id: string) => {
    setItems((current) => current.map((item) => (item.id === id ? { ...item, done: !item.done } : item)))
  }

  return (
    <div data-slot="grouped-checklist" className={cn("w-full space-y-4", className)}>
      <div>
        <div className="mb-1 flex justify-between text-sm">
          <span>总进度</span>
          <span>
            {done}/{items.length}
          </span>
        </div>
        <div
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={percent}
          className="h-2 overflow-hidden rounded-full bg-muted"
        >
          <div
            className="h-full rounded-full bg-primary"
            style={{ width: `${percent}%`, transition: reduced ? "none" : "width 180ms ease" }}
          />
        </div>
      </div>
      <div role="radiogroup" aria-label="分组方式" className="flex flex-wrap gap-2">
        {(
          [
            ["status", "按状态"],
            ["owner", "按负责人"],
            ["none", "不分组"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            role="radio"
            aria-checked={groupBy === id}
            className={cn("rounded-md border px-3 py-1.5 text-sm", groupBy === id && "bg-primary text-primary-foreground")}
            onClick={() => setGroupBy(id)}
          >
            {label}
          </button>
        ))}
      </div>
      <div className="space-y-4">
        {[...groups.entries()].map(([name, group]) => {
          const groupDone = group.filter((item) => item.done).length
          return (
            <section key={name}>
              <h3 className="mb-2 text-sm font-medium">
                {name}
                <span className="ml-2 text-muted-foreground">
                  {groupDone}/{group.length}
                </span>
              </h3>
              <ul className="space-y-2">
                {group.map((item) => (
                  <li key={item.id}>
                    <label className="flex items-center gap-3 rounded-lg border px-3 py-2 text-sm">
                      <input
                        type="checkbox"
                        checked={item.done}
                        onChange={() => toggle(item.id)}
                        className="size-4"
                      />
                      <span className={cn(item.done && "text-muted-foreground line-through")}>{item.title}</span>
                      <span className="ml-auto text-xs text-muted-foreground">
                        {item.owner} · {item.status}
                      </span>
                    </label>
                  </li>
                ))}
              </ul>
            </section>
          )
        })}
      </div>
    </div>
  )
}

export { GroupedChecklist }
