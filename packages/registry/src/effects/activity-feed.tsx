"use client"

import { motion } from "motion/react"
import * as React from "react"

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export interface ActivityItem {
  id: string
  title: string
  at: number
}

export interface ActivityFeedProps {
  className?: string
}

const NOW = Date.UTC(2026, 9, 20, 18, 0, 0)
const HOUR = 3600000

const INITIAL: readonly ActivityItem[] = [
  { id: "sync", title: "文件已对齐", at: NOW - 2 * HOUR },
  { id: "note", title: "留下一条批注", at: NOW - 5 * HOUR },
  { id: "share", title: "发出查看链接", at: NOW - 26 * HOUR },
  { id: "rename", title: "重命名了目录", at: NOW - 50 * HOUR },
]

function relative(at: number) {
  const hours = Math.max(0, Math.round((NOW - at) / HOUR))
  if (hours < 1) return "刚刚"
  if (hours < 24) return `${hours} 小时前`
  return `${Math.round(hours / 24)} 天前`
}

function groupOf(at: number) {
  return NOW - at < 24 * HOUR ? "今天" : "近 7 天"
}

function ActivityFeed({ className }: ActivityFeedProps) {
  const reduced = usePrefersReducedMotion()
  const nextId = React.useRef(1)
  const [items, setItems] = React.useState<ActivityItem[]>([...INITIAL])
  const [syncing, setSyncing] = React.useState(false)
  const groups = ["今天", "近 7 天"]
    .map((name) => ({ name, items: items.filter((item) => groupOf(item.at) === name) }))
    .filter((group) => group.items.length > 0)

  const addItem = () => {
    nextId.current += 1
    setItems((current) => [{ id: `new-${nextId.current}`, title: "新的同步记录", at: NOW - 10 * 60000 }, ...current])
  }

  const sync = () => {
    setSyncing(true)
    window.setTimeout(() => setSyncing(false), reduced ? 0 : 700)
  }

  return (
    <section data-slot="activity-feed" className={cn("w-full space-y-4", className)}>
      <div className="flex items-center gap-3">
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted" role="status" aria-live="polite">
          <div className={cn("h-full bg-primary", syncing ? "w-2/3" : "w-full")} style={{ transition: reduced ? "none" : "width 300ms ease" }} />
        </div>
        <span className="text-xs text-muted-foreground">{syncing ? "正在同步" : "已同步"}</span>
        <button type="button" className="rounded-md border px-2 py-1 text-xs" onClick={sync}>
          同步
        </button>
        <button type="button" className="rounded-md bg-primary px-2 py-1 text-xs text-primary-foreground" onClick={addItem}>
          新动态
        </button>
      </div>
      {groups.map((group) => (
        <section key={group.name}>
          <h2 className="mb-2 text-sm font-medium">{group.name}</h2>
          <ul className="space-y-2">
            {group.items.map((item) => (
              <motion.li
                key={item.id}
                layout
                initial={reduced ? false : { y: -10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: reduced ? 0 : 0.28 }}
                className="flex items-center justify-between rounded-lg border px-3 py-2 text-sm"
              >
                <span>{item.title}</span>
                <time dateTime={new Date(item.at).toISOString()} className="text-xs text-muted-foreground">
                  {relative(item.at)}
                </time>
              </motion.li>
            ))}
          </ul>
        </section>
      ))}
    </section>
  )
}

export { ActivityFeed }
