"use client"

/* eslint-disable @next/next/no-img-element -- registry 组件不能依赖 next/image */

import { useVirtualizer } from "@tanstack/react-virtual"
import * as React from "react"

import { JsonViewer } from "@/components/ui/json-viewer"
import { cn } from "@/lib/utils"

export interface AuditActor {
  name: string
  avatar?: string
}

export interface AuditEvent {
  id: string
  time: string
  actor: AuditActor
  action: string
  target: string
  ip: string
  details: unknown
}

export interface AuditLogTableProps {
  events: readonly AuditEvent[]
  className?: string
}

const ACTION_TONE: Record<string, string> = {
  创建: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
  更新: "bg-sky-500/15 text-sky-700 dark:text-sky-300",
  删除: "bg-rose-500/15 text-rose-700 dark:text-rose-300",
  登录: "bg-amber-500/15 text-amber-800 dark:text-amber-200",
}

function formatTime(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat("zh-Hans", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date)
}

function AuditLogTable({ events, className }: AuditLogTableProps) {
  const [action, setAction] = React.useState("全部")
  const [from, setFrom] = React.useState("")
  const [to, setTo] = React.useState("")
  const [openId, setOpenId] = React.useState<string | null>(null)
  const [fresh, setFresh] = React.useState<readonly string[]>([])
  const [previous, setPrevious] = React.useState(events)
  const parentRef = React.useRef<HTMLDivElement>(null)

  if (events !== previous) {
    const known = new Set(previous.map((event) => event.id))
    const added = events.filter((event) => !known.has(event.id)).map((event) => event.id)
    setPrevious(events)
    if (added.length > 0) setFresh(added)
  }

  React.useEffect(() => {
    if (fresh.length === 0) return
    const timer = window.setTimeout(() => setFresh([]), 2000)
    return () => window.clearTimeout(timer)
  }, [fresh])

  const actions = ["全部", ...new Set(events.map((event) => event.action))]
  const rows = events.filter((event) => {
    if (action !== "全部" && event.action !== action) return false
    const day = event.time.slice(0, 10)
    if (from && day < from) return false
    if (to && day > to) return false
    return true
  })

  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 64,
    overscan: 6,
    measureElement: (element) => (element instanceof HTMLElement ? element.offsetHeight : 64),
  })

  React.useLayoutEffect(() => {
    virtualizer.measure()
  }, [openId, rows.length, virtualizer])
  const freshSet = new Set(fresh)

  return (
    <section data-slot="audit-log-table" className={cn("w-full space-y-3", className)}>
      <div className="flex flex-wrap items-end gap-3">
        <label className="grid gap-1 text-xs text-muted-foreground">
          动作
          <select
            aria-label="按动作筛选"
            value={action}
            onChange={(event) => setAction(event.target.value)}
            className="h-9 rounded-md border bg-background px-2 text-sm text-foreground"
          >
            {actions.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </label>
        <label className="grid gap-1 text-xs text-muted-foreground">
          开始日期
          <input aria-label="开始日期" type="date" value={from} onChange={(event) => setFrom(event.target.value)} className="h-9 rounded-md border bg-background px-2 text-sm" />
        </label>
        <label className="grid gap-1 text-xs text-muted-foreground">
          结束日期
          <input aria-label="结束日期" type="date" value={to} onChange={(event) => setTo(event.target.value)} className="h-9 rounded-md border bg-background px-2 text-sm" />
        </label>
      </div>
      <div className="grid grid-cols-[8rem_9rem_6rem_1fr_8rem] gap-2 px-3 text-xs text-muted-foreground">
        <span>时间</span>
        <span>操作者</span>
        <span>动作</span>
        <span>对象</span>
        <span>IP</span>
      </div>
      <div ref={parentRef} className="h-96 overflow-auto rounded-xl border">
        <div className="relative w-full" style={{ height: virtualizer.getTotalSize() }}>
          {virtualizer.getVirtualItems().map((virtualRow) => {
            const event = rows[virtualRow.index]
            if (!event) return null
            const open = openId === event.id
            return (
              <div
                key={event.id}
                data-index={virtualRow.index}
                ref={virtualizer.measureElement}
                className="absolute top-0 left-0 w-full"
                style={{ transform: `translateY(${virtualRow.start}px)` }}
              >
                <button
                  type="button"
                  data-fresh={freshSet.has(event.id) ? "true" : "false"}
                  aria-expanded={open}
                  onClick={() => setOpenId(open ? null : event.id)}
                  className={cn(
                    "grid w-full grid-cols-[8rem_9rem_6rem_1fr_8rem] items-center gap-2 px-3 py-2 text-left text-sm transition-colors",
                    freshSet.has(event.id) ? "bg-primary/15" : "hover:bg-muted/60",
                  )}
                >
                  <time dateTime={event.time}>{formatTime(event.time)}</time>
                  <span className="flex items-center gap-2">
                    {event.actor.avatar ? (
                      <img src={event.actor.avatar} alt="" className="size-7 rounded-full object-cover" />
                    ) : (
                      <span className="grid size-7 place-items-center rounded-full bg-secondary text-xs">{event.actor.name.slice(0, 1)}</span>
                    )}
                    <span className="truncate">{event.actor.name}</span>
                  </span>
                  <span className={cn("w-fit rounded-full px-2 py-0.5 text-xs", ACTION_TONE[event.action] ?? "bg-muted")}>{event.action}</span>
                  <span className="truncate">{event.target}</span>
                  <span className="font-mono text-xs">{event.ip}</span>
                </button>
                {open ? (
                  <div className="border-t bg-muted/30 px-3 py-2">
                    <JsonViewer data={event.details} />
                  </div>
                ) : null}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export { AuditLogTable }
