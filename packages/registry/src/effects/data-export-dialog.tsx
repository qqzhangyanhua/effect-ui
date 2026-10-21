"use client"

import * as React from "react"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { SortableList, type SortableItem } from "@/components/ui/sortable-list"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"

export type ExportFormat = "csv" | "json" | "xlsx"

export interface ExportField {
  id: string
  label: string
}

export interface ExportOptions {
  format: ExportFormat
  fields: string[]
  from: string
  to: string
}

export interface DataExportDialogProps {
  fields?: readonly ExportField[]
  onExport: (options: ExportOptions) => Promise<Blob | string>
  className?: string
}

const DEFAULT_FIELDS: readonly ExportField[] = [
  { id: "time", label: "时间" },
  { id: "actor", label: "操作者" },
  { id: "action", label: "动作" },
  { id: "target", label: "对象" },
]

function DataExportDialog({ fields = DEFAULT_FIELDS, onExport, className }: DataExportDialogProps) {
  const [format, setFormat] = React.useState<ExportFormat>("csv")
  const [checked, setChecked] = React.useState<string[]>(fields.map((field) => field.id))
  const [order, setOrder] = React.useState<SortableItem[]>(
    fields.map((field) => ({ id: field.id, title: field.label, detail: "拖动手柄调整导出顺序" })),
  )
  const [from, setFrom] = React.useState("")
  const [to, setTo] = React.useState("")
  const [phase, setPhase] = React.useState<"idle" | "running" | "done">("idle")
  const [progress, setProgress] = React.useState(0)
  const [href, setHref] = React.useState<string | null>(null)

  const toggle = (id: string, on: boolean) => {
    setChecked((current) => (on ? [...current, id] : current.filter((item) => item !== id)))
    setOrder((current) => {
      if (!on) return current.filter((item) => item.id !== id)
      if (current.some((item) => item.id === id)) return current
      const field = fields.find((item) => item.id === id)
      return field ? [...current, { id: field.id, title: field.label, detail: "拖动手柄调整导出顺序" }] : current
    })
    setPhase("idle")
    setHref(null)
  }

  const ordered = order.filter((item) => checked.includes(item.id))

  const start = async () => {
    setPhase("running")
    setProgress(12)
    setHref(null)
    const timer = window.setInterval(() => {
      setProgress((value) => (value >= 90 ? value : value + 8))
    }, 160)
    try {
      const result = await onExport({ format, fields: ordered.map((item) => item.id), from, to })
      window.clearInterval(timer)
      setProgress(100)
      setPhase("done")
      if (result instanceof Blob) setHref(URL.createObjectURL(result))
      else setHref(result)
    } catch {
      window.clearInterval(timer)
      setPhase("idle")
    }
  }

  return (
    <Dialog>
      <DialogTrigger className={cn("h-9 rounded-md bg-primary px-3 text-sm text-primary-foreground", className)}>导出数据</DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>导出数据</DialogTitle>
          <DialogDescription>选择格式、字段顺序和日期范围。</DialogDescription>
        </DialogHeader>
        <Tabs value={format} onValueChange={(value) => setFormat(value as ExportFormat)}>
          <TabsList>
            <TabsTrigger value="csv">CSV</TabsTrigger>
            <TabsTrigger value="json">JSON</TabsTrigger>
            <TabsTrigger value="xlsx">XLSX</TabsTrigger>
          </TabsList>
        </Tabs>
        <fieldset className="grid grid-cols-2 gap-2">
          <legend className="mb-1 text-sm font-medium">字段</legend>
          {fields.map((field) => (
            <label key={field.id} className="flex items-center gap-2 text-sm">
              <Checkbox
                aria-label={field.label}
                checked={checked.includes(field.id)}
                onCheckedChange={(value) => toggle(field.id, value === true)}
              />
              {field.label}
            </label>
          ))}
        </fieldset>
        <SortableList
          key={ordered.map((item) => item.id).slice().sort().join("|")}
          items={ordered}
          onReorder={(items) => {
            setOrder(items)
            setPhase("idle")
          }}
        />
        <div className="grid grid-cols-2 gap-3">
          <label className="grid gap-1 text-xs text-muted-foreground">
            开始日期
            <input aria-label="导出开始日期" type="date" value={from} onChange={(event) => setFrom(event.target.value)} className="h-9 rounded-md border bg-background px-2 text-sm text-foreground" />
          </label>
          <label className="grid gap-1 text-xs text-muted-foreground">
            结束日期
            <input aria-label="导出结束日期" type="date" value={to} onChange={(event) => setTo(event.target.value)} className="h-9 rounded-md border bg-background px-2 text-sm text-foreground" />
          </label>
        </div>
        {phase !== "idle" ? (
          <div className="space-y-1">
            <div className="h-2 overflow-hidden rounded-full bg-muted">
              <div className="h-full bg-primary transition-[width]" style={{ width: `${progress}%` }} />
            </div>
            <p className="text-xs text-muted-foreground">{phase === "done" ? "导出完成" : `正在导出 ${progress}%`}</p>
          </div>
        ) : null}
        <div className="flex justify-end gap-2">
          {phase === "done" && href ? (
            <a href={href} download={`export.${format === "xlsx" ? "xlsx" : format}`} className="inline-flex h-9 items-center rounded-md bg-primary px-3 text-sm text-primary-foreground">
              下载
            </a>
          ) : (
            <button type="button" className="h-9 rounded-md bg-primary px-3 text-sm text-primary-foreground disabled:opacity-50" disabled={phase === "running" || ordered.length === 0} onClick={() => void start()}>
              开始导出
            </button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

export { DataExportDialog }
