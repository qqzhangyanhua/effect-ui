"use client"

import * as React from "react"

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export interface FileUploadQueueProps {
  className?: string
}

type UploadStatus = "uploading" | "done" | "error"

interface QueueItem {
  id: string
  name: string
  progress: number
  status: UploadStatus
  fail: boolean
}

const SAMPLES = [
  { name: "封面.png", fail: false },
  { name: "笔记.pdf", fail: false },
  { name: "损坏.zip", fail: true },
]

function FileUploadQueue({ className }: FileUploadQueueProps) {
  const reduced = usePrefersReducedMotion()
  const nextId = React.useRef(1)
  const timers = React.useRef<number[]>([])
  const generation = React.useRef<Record<string, number>>({})
  const [items, setItems] = React.useState<QueueItem[]>([])

  React.useEffect(() => {
    const pending = timers.current
    return () => {
      pending.forEach((id) => window.clearTimeout(id))
    }
  }, [])

  const run = (id: string, fail: boolean) => {
    generation.current[id] = (generation.current[id] ?? 0) + 1
    const gen = generation.current[id] ?? 1
    const steps = 5
    for (let step = 1; step <= steps; step += 1) {
      const timer = window.setTimeout(() => {
        if (generation.current[id] !== gen) return
        setItems((current) =>
          current.map((item) => {
            if (item.id !== id || item.status === "done" || item.status === "error") return item
            const progress = step * 20
            if (fail && progress >= 40) return { ...item, status: "error", progress: 40, fail: false }
            if (step === steps) return { ...item, status: "done", progress: 100, fail: false }
            return { ...item, status: "uploading", progress }
          }),
        )
      }, reduced ? 0 : step * 160)
      timers.current.push(timer)
    }
  }

  const enqueue = (files: readonly { name: string; fail: boolean }[]) => {
    const created = files.map((file) => {
      nextId.current += 1
      return { id: `f-${nextId.current}`, name: file.name, progress: 0, status: "uploading" as const, fail: file.fail }
    })
    setItems((current) => [...created, ...current])
    created.forEach((item) => run(item.id, item.fail))
  }

  return (
    <section data-slot="file-upload-queue" className={cn("w-full space-y-3", className)}>
      <div className="flex flex-wrap items-center gap-2">
        <label className="rounded-md border px-3 py-1.5 text-sm outline-none focus-within:ring-2 focus-within:ring-primary">
          选择文件
          <input
            type="file"
            multiple
            className="sr-only"
            onChange={(event) => {
              const list = [...(event.target.files ?? [])].map((file) => ({ name: file.name, fail: false }))
              if (list.length > 0) enqueue(list)
              event.target.value = ""
            }}
          />
        </label>
        <button
          type="button"
          className="rounded-md bg-primary px-3 py-1.5 text-sm text-primary-foreground outline-none focus-visible:ring-2 focus-visible:ring-primary"
          onClick={() => enqueue(SAMPLES)}
        >
          加入示例
        </button>
      </div>
      {items.length === 0 ? <p className="text-sm text-muted-foreground">队列是空的。</p> : null}
      <ul className="space-y-2">
        {items.map((item) => (
          <li key={item.id} className="rounded-lg border px-3 py-2">
            <div className="flex items-center justify-between gap-3 text-sm">
              <span>{item.name}</span>
              <span className="text-xs text-muted-foreground">
                {item.status === "done" ? "完成" : item.status === "error" ? "失败" : `${item.progress}%`}
              </span>
            </div>
            <div
              className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted"
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={item.progress}
              aria-label={item.name}
            >
              <div className="h-full bg-primary" style={{ width: `${item.progress}%`, transition: reduced ? "none" : "width 140ms linear" }} />
            </div>
            <div className="mt-2 flex gap-2">
              {item.status === "error" ? (
                <button
                  type="button"
                  className="rounded-md border px-2 py-1 text-xs outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  onClick={() => {
                    setItems((current) => current.map((entry) => (entry.id === item.id ? { ...entry, status: "uploading", progress: 0 } : entry)))
                    run(item.id, false)
                  }}
                >
                  重试
                </button>
              ) : null}
              <button
                type="button"
                className="rounded-md border px-2 py-1 text-xs outline-none focus-visible:ring-2 focus-visible:ring-primary"
                onClick={() => setItems((current) => current.filter((entry) => entry.id !== item.id))}
              >
                移除
              </button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}

export { FileUploadQueue }
