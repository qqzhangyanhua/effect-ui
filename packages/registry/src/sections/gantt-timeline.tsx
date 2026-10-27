"use client"

import * as React from "react"
import { motion, useMotionValue, useTransform } from "motion/react"

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/cn"

export interface GanttTask {
  id: string
  name: string
  start: string
  days: number
  dependsOn?: string[]
}

export interface GanttTimelineProps {
  tasks?: GanttTask[]
  today?: string
  onChange?: (tasks: GanttTask[]) => void
  className?: string
}

const DEFAULTS: GanttTask[] = [
  { id: "north", name: "北窗", start: "2026-10-16", days: 5 },
  { id: "proof", name: "样张", start: "2026-10-20", days: 4, dependsOn: ["north"] },
  { id: "ship", name: "发布", start: "2026-10-24", days: 3, dependsOn: ["proof"] },
]

type Zoom = "day" | "week" | "month"

const PX: Record<Zoom, number> = { day: 28, week: 14, month: 6 }

function parseDay(iso: string) {
  const [year, month, day] = iso.split("-").map(Number)
  return Date.UTC(year ?? 1970, (month ?? 1) - 1, day ?? 1)
}

function formatDay(ms: number) {
  const date = new Date(ms)
  const month = String(date.getUTCMonth() + 1).padStart(2, "0")
  const day = String(date.getUTCDate()).padStart(2, "0")
  return `${date.getUTCFullYear()}-${month}-${day}`
}

function addDays(iso: string, days: number) {
  return formatDay(parseDay(iso) + days * 86400000)
}

function TaskBar({
  task,
  px,
  origin,
  reduced,
  onCommit,
}: {
  task: GanttTask
  px: number
  origin: number
  reduced: boolean
  onCommit: (next: GanttTask) => void
}) {
  const x = useMotionValue(0)
  const widthDrag = useMotionValue(0)
  const left = ((parseDay(task.start) - origin) / 86400000) * px
  const width = useTransform(widthDrag, (drag) => Math.max(px, task.days * px + drag))

  return (
    <motion.div
      drag={reduced ? false : "x"}
      dragMomentum={false}
      dragElastic={0}
      style={{ x, width, left }}
      className="absolute top-1 flex h-7 items-center overflow-hidden rounded-md bg-sky-500/80 px-2 text-xs text-slate-950"
      onDragEnd={(_event, info) => {
        const delta = Math.round(info.offset.x / px)
        x.set(0)
        if (delta !== 0) onCommit({ ...task, start: addDays(task.start, delta) })
      }}
      aria-label={`${task.name} ${task.days} 天`}
      role="button"
    >
      <span className="pointer-events-none truncate">{task.name}</span>
      <motion.span
        drag={reduced ? false : "x"}
        dragMomentum={false}
        dragElastic={0}
        style={{ x: widthDrag }}
        className="absolute top-0 right-0 h-full w-2 cursor-ew-resize rounded-r-md bg-sky-950/40"
        onPointerDown={(event) => event.stopPropagation()}
        onDragEnd={(_event, info) => {
          const delta = Math.round(info.offset.x / px)
          widthDrag.set(0)
          if (delta !== 0) onCommit({ ...task, days: Math.max(1, task.days + delta) })
        }}
        aria-label={`调整 ${task.name} 时长`}
      />
    </motion.div>
  )
}

function GanttTimeline({ tasks: tasksProp = DEFAULTS, today = "2026-10-21", onChange, className }: GanttTimelineProps) {
  const reduced = usePrefersReducedMotion()
  const [tasks, setTasks] = React.useState(tasksProp)
  const [zoom, setZoom] = React.useState<Zoom>("day")
  const listRef = React.useRef<HTMLDivElement>(null)
  const timeRef = React.useRef<HTMLDivElement>(null)
  const lockRef = React.useRef(false)
  const px = PX[zoom]
  const [origin, setOrigin] = React.useState(() => tasks.reduce((min, task) => Math.min(min, parseDay(task.start)), parseDay(tasks[0]?.start ?? today)) - 86400000)
  const end = tasks.reduce((max, task) => Math.max(max, parseDay(addDays(task.start, task.days))), parseDay(today)) + 86400000 * 2
  const days = Math.max(1, Math.round((end - origin) / 86400000))
  const todayLeft = ((parseDay(today) - origin) / 86400000) * px

  const commit = (nextTask: GanttTask) => {
    const next = tasks.map((task) => (task.id === nextTask.id ? nextTask : task))
    const earliest = next.reduce((min, task) => Math.min(min, parseDay(task.start)), parseDay(next[0]?.start ?? today)) - 86400000
    setOrigin((current) => Math.min(current, earliest))
    setTasks(next)
    onChange?.(next)
  }

  const sync = (source: "list" | "time") => {
    if (lockRef.current) return
    const from = source === "list" ? listRef.current : timeRef.current
    const to = source === "list" ? timeRef.current : listRef.current
    if (!from || !to) return
    lockRef.current = true
    to.scrollTop = from.scrollTop
    lockRef.current = false
  }

  return (
    <section data-slot="gantt-timeline" className={cn("w-full overflow-hidden rounded-xl border", className)}>
      <div className="flex items-center justify-between gap-2 border-b px-3 py-2">
        <h2 className="text-sm font-medium">时间表</h2>
        <div className="flex gap-1">
          {(["day", "week", "month"] as const).map((item) => (
            <button key={item} type="button" aria-pressed={zoom === item} className={cn("rounded-md border px-2 py-1 text-xs", zoom === item && "bg-primary text-primary-foreground")} onClick={() => setZoom(item)}>
              {item === "day" ? "日" : item === "week" ? "周" : "月"}
            </button>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-[8rem_1fr]">
        <div ref={listRef} className="max-h-64 overflow-auto border-r" onScroll={() => sync("list")}>
          <div className="h-8 border-b" />
          {tasks.map((task) => (
            <div key={task.id} className="flex h-9 items-center px-3 text-sm">{task.name}</div>
          ))}
        </div>
        <div ref={timeRef} className="max-h-64 overflow-auto" onScroll={() => sync("time")}>
          <div className="relative h-8 border-b" style={{ width: days * px }}>
            {Array.from({ length: days }, (_, index) => {
              const step = zoom === "day" ? 2 : zoom === "week" ? 7 : 30
              if (index % step !== 0) return null
              return (
                <span key={index} className="absolute top-1 text-[10px] text-muted-foreground" style={{ left: index * px }}>
                  {formatDay(origin + index * 86400000).slice(5)}
                </span>
              )
            })}
            <span className="pointer-events-none absolute top-1 text-[10px] text-rose-500" style={{ left: todayLeft }}>今天</span>
          </div>
          <div className="relative" style={{ width: days * px }}>
            <div className="pointer-events-none absolute top-0 bottom-0 z-10 w-px bg-rose-500" style={{ left: todayLeft }} aria-hidden />
            <svg className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden>
              {tasks.map((task, index) => (task.dependsOn ?? []).map((dependency) => {
                const from = tasks.find((item) => item.id === dependency)
                const fromIndex = tasks.findIndex((item) => item.id === dependency)
                if (!from || fromIndex < 0) return null
                const x1 = ((parseDay(addDays(from.start, from.days)) - origin) / 86400000) * px
                const x2 = ((parseDay(task.start) - origin) / 86400000) * px
                const y1 = fromIndex * 36 + 18
                const y2 = index * 36 + 18
                return <path key={`${from.id}-${task.id}`} d={`M ${x1} ${y1} H ${(x1 + x2) / 2} V ${y2} H ${x2}`} fill="none" stroke="currentColor" strokeOpacity="0.45" />
              }))}
            </svg>
            {tasks.map((task) => (
              <div key={task.id} className="relative h-9">
                <TaskBar task={task} px={px} origin={origin} reduced={reduced} onCommit={commit} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export { GanttTimeline }
