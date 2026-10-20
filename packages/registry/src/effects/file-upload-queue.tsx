"use client"

import * as React from "react"

import { Dropzone, DropzoneEmptyState } from "@/components/ui/dropzone"
import { cn } from "@/lib/utils"

export interface UploadContext {
  onProgress: (loaded: number, total: number) => void
  signal: AbortSignal
}

export type Uploader = (file: File, context: UploadContext) => Promise<void>

export interface FileUploadQueueProps {
  className?: string
  uploader?: Uploader
  concurrency?: number
}

type UploadStatus = "queued" | "uploading" | "paused" | "error" | "done"

interface QueueItem {
  id: string
  file: File
  status: UploadStatus
  loaded: number
  total: number
  speed: number
  eta: number
  error?: string
}

const STATUS_LABEL: Record<UploadStatus, string> = {
  queued: "排队",
  uploading: "上传中",
  paused: "已暂停",
  error: "失败",
  done: "完成",
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${Math.round(bytes)} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function formatEta(seconds: number) {
  if (!Number.isFinite(seconds) || seconds <= 0) return "—"
  if (seconds < 60) return `${Math.ceil(seconds)} 秒`
  return `${Math.ceil(seconds / 60)} 分钟`
}

function defaultUploader(file: File, { onProgress, signal }: UploadContext) {
  const total = Math.max(file.size, 1)
  return new Promise<void>((resolve, reject) => {
    let loaded = 0
    const timer = window.setInterval(() => {
      if (signal.aborted) {
        window.clearInterval(timer)
        reject(new DOMException("Aborted", "AbortError"))
        return
      }
      loaded = Math.min(total, loaded + total / 6)
      onProgress(loaded, total)
      if (file.name.includes("损坏") && loaded >= total * 0.45) {
        window.clearInterval(timer)
        reject(new Error("上传失败"))
        return
      }
      if (loaded >= total) {
        window.clearInterval(timer)
        resolve()
      }
    }, 40)
  })
}

function sampleFiles() {
  return [
    new File([new Uint8Array(720_000)], "封面.png", { type: "image/png" }),
    new File([new Uint8Array(480_000)], "笔记.pdf", { type: "application/pdf" }),
    new File([new Uint8Array(260_000)], "损坏.zip", { type: "application/zip" }),
  ]
}

function FileUploadQueue({ className, uploader = defaultUploader, concurrency = 3 }: FileUploadQueueProps) {
  const [items, setItems] = React.useState<QueueItem[]>([])
  const itemsRef = React.useRef<QueueItem[]>([])
  const controllers = React.useRef(new Map<string, AbortController>())
  const samples = React.useMemo(() => sampleFiles(), [])

  const commit = React.useCallback((next: QueueItem[]) => {
    itemsRef.current = next
    setItems(next)
  }, [])

  const startRef = React.useRef<(id: string) => void>(() => {})

  const pump = React.useCallback(() => {
    const active = itemsRef.current.filter((item) => item.status === "uploading").length
    const waiting = itemsRef.current.filter((item) => item.status === "queued").slice(0, Math.max(0, concurrency - active))
    for (const item of waiting) startRef.current(item.id)
  }, [concurrency])

  const start = React.useCallback(
    (id: string) => {
      const current = itemsRef.current.find((item) => item.id === id)
      if (!current || current.status === "uploading" || current.status === "done") return
      const controller = new AbortController()
      controllers.current.set(id, controller)
      commit(itemsRef.current.map((item) => (item.id === id ? { ...item, status: "uploading", error: undefined } : item)))
      let lastLoaded = current.loaded
      let lastTime = performance.now()
      void uploader(current.file, {
        signal: controller.signal,
        onProgress: (loaded, total) => {
          if (!itemsRef.current.some((item) => item.id === id && (item.status === "uploading" || item.status === "queued"))) return
          const now = performance.now()
          const speed = ((loaded - lastLoaded) / Math.max(now - lastTime, 16)) * 1000
          lastLoaded = loaded
          lastTime = now
          commit(
            itemsRef.current.map((item) =>
              item.id === id
                ? { ...item, loaded, total, speed, eta: speed > 1 ? (total - loaded) / speed : 0, status: "uploading" }
                : item,
            ),
          )
        },
      })
        .then(() => {
          commit(
            itemsRef.current.map((item) =>
              item.id === id ? { ...item, status: "done", loaded: item.total || item.file.size, speed: 0, eta: 0 } : item,
            ),
          )
        })
        .catch((error: unknown) => {
          const aborted = controller.signal.aborted || (error instanceof DOMException && error.name === "AbortError")
          commit(
            itemsRef.current.map((item) =>
              item.id === id
                ? aborted
                  ? { ...item, status: "paused", speed: 0 }
                  : { ...item, status: "error", error: error instanceof Error ? error.message : "上传失败", speed: 0 }
                : item,
            ),
          )
        })
        .finally(() => {
          controllers.current.delete(id)
          pump()
        })
    },
    [commit, pump, uploader],
  )

  React.useEffect(() => {
    startRef.current = start
  }, [start])

  const add = (files: File[]) => {
    const next = files.map((file) => ({
      id: `${file.name}-${file.size}-${Math.random().toString(36).slice(2, 7)}`,
      file,
      status: "queued" as const,
      loaded: 0,
      total: file.size,
      speed: 0,
      eta: 0,
    }))
    commit([...itemsRef.current, ...next])
    pump()
  }

  const pause = (id: string) => {
    controllers.current.get(id)?.abort()
  }

  const resume = (id: string) => {
    commit(itemsRef.current.map((item) => (item.id === id ? { ...item, status: "queued" } : item)))
    pump()
  }

  const retry = (id: string) => {
    commit(itemsRef.current.map((item) => (item.id === id ? { ...item, status: "queued", loaded: 0, error: undefined } : item)))
    pump()
  }

  const remove = (id: string) => {
    controllers.current.get(id)?.abort()
    commit(itemsRef.current.filter((item) => item.id !== id))
  }

  const retryAll = () => {
    commit(itemsRef.current.map((item) => (item.status === "error" ? { ...item, status: "queued", loaded: 0, error: undefined } : item)))
    pump()
  }

  const total = items.reduce((sum, item) => sum + item.total, 0)
  const loaded = items.reduce((sum, item) => sum + item.loaded, 0)
  const ratio = total > 0 ? Math.round((loaded / total) * 100) : 0

  return (
    <div data-slot="file-upload-queue" className={cn("w-full max-w-xl space-y-3", className)}>
      <Dropzone maxFiles={8} onDrop={(accepted) => add(accepted)}>
        <DropzoneEmptyState />
      </Dropzone>
      <div className="flex flex-wrap gap-2">
        <button type="button" className="rounded-md border px-2 py-1 text-xs" onClick={() => add(samples)}>
          加入示例
        </button>
        <button type="button" className="rounded-md border px-2 py-1 text-xs" onClick={retryAll}>
          全部重试
        </button>
        <p className="ml-auto text-xs text-muted-foreground">总进度 {ratio}%</p>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-muted" aria-hidden>
        <div className="h-full bg-primary" style={{ width: `${ratio}%` }} />
      </div>
      <ul className="space-y-2">
        {items.map((item) => (
          <li key={item.id} className="rounded-lg border p-3 text-sm">
            <div className="flex items-center justify-between gap-2">
              <span className="truncate font-medium">{item.file.name}</span>
              <span>{STATUS_LABEL[item.status]}</span>
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full bg-primary"
                style={{ width: `${item.total ? Math.round((item.loaded / item.total) * 100) : 0}%` }}
              />
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {formatBytes(item.loaded)} / {formatBytes(item.total)} · {formatBytes(item.speed)}/s · 剩余 {formatEta(item.eta)}
              {item.error ? ` · ${item.error}` : ""}
            </p>
            <div className="mt-2 flex gap-2">
              {item.status === "uploading" ? (
                <button type="button" className="rounded-md border px-2 py-1 text-xs" onClick={() => pause(item.id)}>
                  暂停
                </button>
              ) : null}
              {item.status === "paused" ? (
                <button type="button" className="rounded-md border px-2 py-1 text-xs" onClick={() => resume(item.id)}>
                  继续
                </button>
              ) : null}
              {item.status === "error" ? (
                <button type="button" className="rounded-md border px-2 py-1 text-xs" onClick={() => retry(item.id)}>
                  重试
                </button>
              ) : null}
              <button type="button" className="rounded-md border px-2 py-1 text-xs" onClick={() => remove(item.id)}>
                移除
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

export { FileUploadQueue }
