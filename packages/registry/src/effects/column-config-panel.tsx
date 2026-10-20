"use client"

import { Reorder, useDragControls } from "motion/react"
import * as React from "react"

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export interface ConfigColumn {
  id: string
  label: string
  visible: boolean
}

export interface ColumnConfigPanelProps {
  columns?: readonly ConfigColumn[]
  className?: string
}

interface PreviewRow {
  name: string
  status: string
  owner: string
  updated: string
}

const COLUMNS: readonly ConfigColumn[] = [
  { id: "name", label: "名称", visible: true },
  { id: "status", label: "状态", visible: true },
  { id: "owner", label: "负责人", visible: true },
  { id: "updated", label: "更新", visible: true },
]

const PREVIEW: readonly PreviewRow[] = [
  { name: "信号墙", status: "设计", owner: "林夏", updated: "03-12" },
  { name: "轨道列表", status: "开发", owner: "周宁", updated: "03-18" },
  { name: "热力年历", status: "文档", owner: "赵衡", updated: "04-02" },
]

function ColumnRow({
  column,
  reduced,
  onToggle,
  onMove,
}: {
  column: ConfigColumn
  reduced: boolean
  onToggle: (id: string) => void
  onMove: (id: string, direction: -1 | 1) => void
}) {
  const controls = useDragControls()
  return (
    <Reorder.Item
      value={column}
      dragListener={false}
      dragControls={controls}
      transition={reduced ? { duration: 0 } : { type: "spring", stiffness: 420, damping: 34 }}
      className="flex items-center gap-2 rounded-lg border bg-background px-2 py-1.5"
    >
      <button
        type="button"
        aria-label={`移动 ${column.label}。上下方向键调整顺序。`}
        className="grid size-8 cursor-grab place-items-center rounded-md border text-muted-foreground"
        style={{ touchAction: "none" }}
        onPointerDown={(event) => controls.start(event)}
        onKeyDown={(event) => {
          if (event.key !== "ArrowUp" && event.key !== "ArrowDown") return
          event.preventDefault()
          onMove(column.id, event.key === "ArrowUp" ? -1 : 1)
        }}
      >
        <svg viewBox="0 0 12 16" className="h-4 w-3" aria-hidden>
          <path
            fill="currentColor"
            d="M1 2h2v2H1zm4 0h2v2H5zm4 0h2v2H9zM1 7h2v2H1zm4 0h2v2H5zm4 0h2v2H9zM1 12h2v2H1zm4 0h2v2H5zm4 0h2v2H9z"
          />
        </svg>
      </button>
      <span className="text-sm">{column.label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={column.visible}
        aria-label={`${column.visible ? "隐藏" : "显示"}${column.label}`}
        className={cn("ml-auto h-5 w-9 rounded-full", column.visible ? "bg-primary" : "bg-muted-foreground/30")}
        onClick={() => onToggle(column.id)}
      >
        <span className={cn("block size-4 rounded-full bg-white", column.visible ? "ml-4" : "ml-0.5")} />
      </button>
    </Reorder.Item>
  )
}

function ColumnConfigPanel({ columns: initial = COLUMNS, className }: ColumnConfigPanelProps) {
  const reduced = usePrefersReducedMotion()
  const [columns, setColumns] = React.useState<ConfigColumn[]>(() => initial.map((column) => ({ ...column })))
  const [sortId, setSortId] = React.useState("name")
  const [descending, setDescending] = React.useState(false)
  const [zebra, setZebra] = React.useState(true)
  const [dense, setDense] = React.useState(false)
  const visible = columns.filter((column) => column.visible)
  const rows = [...PREVIEW].sort((a, b) => {
    const left = a[sortId as keyof PreviewRow] ?? ""
    const right = b[sortId as keyof PreviewRow] ?? ""
    const order = String(left).localeCompare(String(right), "zh")
    return descending ? -order : order
  })

  const move = (id: string, direction: -1 | 1) => {
    setColumns((current) => {
      const index = current.findIndex((column) => column.id === id)
      const nextIndex = index + direction
      if (index < 0 || nextIndex < 0 || nextIndex >= current.length) return current
      const next = current.slice()
      const [item] = next.splice(index, 1)
      if (!item) return current
      next.splice(nextIndex, 0, item)
      return next
    })
    window.requestAnimationFrame(() => {
      document.querySelector<HTMLElement>(`[aria-label="移动 ${columns.find((column) => column.id === id)?.label}。上下方向键调整顺序。"]`)?.focus()
    })
  }

  return (
    <div data-slot="column-config-panel" className={cn("grid w-full gap-4 md:grid-cols-[16rem_1fr]", className)}>
      <div className="space-y-3">
        <Reorder.Group axis="y" values={columns} onReorder={setColumns} className="flex list-none flex-col gap-2 p-0">
          {columns.map((column) => (
            <ColumnRow
              key={column.id}
              column={column}
              reduced={reduced}
              onToggle={(id) =>
                setColumns((current) =>
                  current.map((item) => (item.id === id ? { ...item, visible: !item.visible } : item)),
                )
              }
              onMove={move}
            />
          ))}
        </Reorder.Group>
        <label className="block text-xs">
          默认排序
          <select
            className="mt-1 w-full rounded-md border bg-background px-2 py-1.5 text-sm"
            value={sortId}
            onChange={(event) => setSortId(event.target.value)}
          >
            {columns.map((column) => (
              <option key={column.id} value={column.id}>
                {column.label}
              </option>
            ))}
          </select>
        </label>
        <button
          type="button"
          role="switch"
          aria-checked={descending}
          className="flex w-full items-center justify-between text-sm"
          onClick={() => setDescending((current) => !current)}
        >
          降序
          <span className={cn("h-5 w-9 rounded-full", descending ? "bg-primary" : "bg-muted-foreground/30")}>
            <span className={cn("mt-0.5 block size-4 rounded-full bg-white", descending ? "ml-4" : "ml-0.5")} />
          </span>
        </button>
        <button
          type="button"
          role="switch"
          aria-checked={zebra}
          className="flex w-full items-center justify-between text-sm"
          onClick={() => setZebra((current) => !current)}
        >
          斑马纹
          <span className={cn("h-5 w-9 rounded-full", zebra ? "bg-primary" : "bg-muted-foreground/30")}>
            <span className={cn("mt-0.5 block size-4 rounded-full bg-white", zebra ? "ml-4" : "ml-0.5")} />
          </span>
        </button>
        <button
          type="button"
          role="switch"
          aria-checked={dense}
          className="flex w-full items-center justify-between text-sm"
          onClick={() => setDense((current) => !current)}
        >
          紧凑
          <span className={cn("h-5 w-9 rounded-full", dense ? "bg-primary" : "bg-muted-foreground/30")}>
            <span className={cn("mt-0.5 block size-4 rounded-full bg-white", dense ? "ml-4" : "ml-0.5")} />
          </span>
        </button>
      </div>
      <div className="overflow-auto rounded-xl border">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b">
              {visible.map((column) => (
                <th key={column.id} className={cn("px-3 font-medium", dense ? "py-1" : "py-2")}>
                  {column.label}
                  {column.id === sortId ? (descending ? " ↓" : " ↑") : ""}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={row.name} className={cn("border-b last:border-0", zebra && index % 2 === 1 && "bg-muted/50")}>
                {visible.map((column) => (
                  <td key={column.id} className={cn("px-3", dense ? "py-1" : "py-2")}>
                    {row[column.id as keyof PreviewRow]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export { ColumnConfigPanel }
