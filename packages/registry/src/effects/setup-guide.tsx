"use client"

import * as React from "react"

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export interface SetupTask {
  id: string
  stage: string
  title: string
}

export interface SetupGuideProps {
  tasks?: readonly SetupTask[]
  className?: string
}

const TASKS: readonly SetupTask[] = [
  { id: "name", stage: "准备", title: "写下项目名" },
  { id: "theme", stage: "准备", title: "选定主题色" },
  { id: "motion", stage: "配置", title: "确认减弱动效" },
  { id: "keys", stage: "配置", title: "走一遍键盘" },
  { id: "ship", stage: "发布", title: "核对预览" },
]

const COLORS = ["#a78bfa", "#22d3ee", "#f472b6", "#facc15", "#34d399"]

function SetupGuide({ tasks = TASKS, className }: SetupGuideProps) {
  const reduced = usePrefersReducedMotion()
  const [done, setDone] = React.useState<Record<string, boolean>>({})
  const [open, setOpen] = React.useState<Record<string, boolean>>({ 准备: true, 配置: true, 发布: true })
  const [pieces, setPieces] = React.useState<{ id: number; x: number; y: number; color: string; rotate: number }[]>([])
  const celebrated = React.useRef(false)
  const finished = tasks.every((task) => done[task.id])
  const count = tasks.filter((task) => done[task.id]).length
  const percent = tasks.length === 0 ? 0 : Math.round((count / tasks.length) * 100)
  const stages = [...new Set(tasks.map((task) => task.stage))]

  const toggle = (id: string) => {
    const next = { ...done, [id]: !done[id] }
    setDone(next)
    const all = tasks.every((task) => next[task.id])
    if (all && !celebrated.current && !reduced) {
      celebrated.current = true
      setPieces(
        Array.from({ length: 16 }, (_, index) => ({
          id: index + 1,
          x: (index - 8) * 14,
          y: -30 - (index % 5) * 16,
          color: COLORS[index % COLORS.length] ?? "#a78bfa",
          rotate: index * 20,
        })),
      )
      window.setTimeout(() => setPieces([]), 800)
    }
    if (!all) celebrated.current = false
  }

  return (
    <section data-slot="setup-guide" className={cn("relative w-full space-y-4", className)}>
      <style>
        {`@keyframes effect-ui-setup-confetti { to { transform: translate(var(--dx), var(--dy)) rotate(var(--rot)); opacity: 0; } }`}
      </style>
      <div>
        <div className="mb-1 flex justify-between text-sm">
          <span>安装进度</span>
          <span>
            {count}/{tasks.length}
          </span>
        </div>
        <div role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={percent} className="h-2 rounded-full bg-muted">
          <div className="h-full rounded-full bg-primary" style={{ width: `${percent}%`, transition: reduced ? "none" : "width 180ms ease" }} />
        </div>
        <ol className="mt-3 flex gap-2 text-xs">
          {stages.map((stage, index) => {
            const stageTasks = tasks.filter((task) => task.stage === stage)
            const stageDone = stageTasks.every((task) => done[task.id])
            return (
              <li key={stage} className={cn("rounded-full border px-2 py-1", stageDone && "bg-primary text-primary-foreground")}>
                {index + 1}. {stage}
              </li>
            )
          })}
        </ol>
      </div>
      {stages.map((stage) => (
        <section key={stage} className="rounded-xl border">
          <button
            type="button"
            aria-expanded={open[stage] ?? false}
            className="flex w-full items-center justify-between px-3 py-2 text-sm font-medium"
            onClick={() => setOpen((current) => ({ ...current, [stage]: !current[stage] }))}
          >
            {stage}
            <span className="text-xs text-muted-foreground">{open[stage] ? "收起" : "展开"}</span>
          </button>
          {open[stage] ? (
            <ul className="space-y-2 px-3 pb-3">
              {tasks
                .filter((task) => task.stage === stage)
                .map((task) => (
                  <li key={task.id}>
                    <label className="flex items-center gap-2 text-sm">
                      <input type="checkbox" checked={Boolean(done[task.id])} onChange={() => toggle(task.id)} />
                      <span className={cn(done[task.id] && "text-muted-foreground line-through")}>{task.title}</span>
                    </label>
                  </li>
                ))}
            </ul>
          ) : null}
        </section>
      ))}
      {finished ? <p className="text-sm">全部完成。</p> : null}
      {pieces.map((piece) => (
        <span
          key={piece.id}
          aria-hidden
          className="pointer-events-none absolute top-8 left-1/2 size-2"
          style={{
            background: piece.color,
            ["--dx" as string]: `${piece.x}px`,
            ["--dy" as string]: `${piece.y}px`,
            ["--rot" as string]: `${piece.rotate}deg`,
            animation: "effect-ui-setup-confetti 0.8s ease-out forwards",
          }}
        />
      ))}
    </section>
  )
}

export { SetupGuide }
