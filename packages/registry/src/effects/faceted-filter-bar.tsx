"use client"

import type { ColumnDef } from "@tanstack/react-table"
import * as React from "react"

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"
import { DataTable } from "@/components/ui/data-table"

export interface FilterRow {
  id: string
  name: string
  status: string
  score: number
}

export interface FilterChip {
  id: string
  field: "name" | "status" | "score"
  op: "contains" | "equals" | "is" | "isNot" | "gt" | "lt"
  value: string
}

export interface FacetedFilterBarProps {
  rows?: readonly FilterRow[]
  className?: string
}

const ROWS: readonly FilterRow[] = [
  { id: "1", name: "信号墙", status: "设计", score: 86 },
  { id: "2", name: "轨道列表", status: "开发", score: 64 },
  { id: "3", name: "遮罩过渡", status: "设计", score: 91 },
  { id: "4", name: "笔记本", status: "暂停", score: 40 },
  { id: "5", name: "热力年历", status: "开发", score: 73 },
  { id: "6", name: "主题检索", status: "设计", score: 58 },
]

const COLUMNS: ColumnDef<FilterRow>[] = [
  { accessorKey: "name", header: "名称" },
  { accessorKey: "status", header: "状态" },
  { accessorKey: "score", header: "分数" },
]

const FIELD_OPS = {
  name: ["contains", "equals"],
  status: ["is", "isNot"],
  score: ["gt", "lt"],
} as const

const OP_LABEL: Record<FilterChip["op"], string> = {
  contains: "包含",
  equals: "等于",
  is: "是",
  isNot: "不是",
  gt: "大于",
  lt: "小于",
}

function matches(row: FilterRow, chip: FilterChip) {
  if (!chip.value.trim()) return true
  if (chip.field === "name") {
    return chip.op === "equals" ? row.name === chip.value : row.name.includes(chip.value)
  }
  if (chip.field === "status") {
    return chip.op === "isNot" ? row.status !== chip.value : row.status === chip.value
  }
  const score = Number(chip.value)
  if (Number.isNaN(score)) return true
  return chip.op === "lt" ? row.score < score : row.score > score
}

function FacetedFilterBar({ rows = ROWS, className }: FacetedFilterBarProps) {
  const reduced = usePrefersReducedMotion()
  const nextId = React.useRef(1)
  const [open, setOpen] = React.useState(false)
  const [field, setField] = React.useState<FilterChip["field"]>("name")
  const [op, setOp] = React.useState<FilterChip["op"]>("contains")
  const [value, setValue] = React.useState("")
  const [chips, setChips] = React.useState<FilterChip[]>([])
  const ops = FIELD_OPS[field]
  const filtered = rows.filter((row) => chips.every((chip) => matches(row, chip)))

  const addChip = () => {
    if (!value.trim()) return
    nextId.current += 1
    setChips((current) => [...current, { id: `chip-${nextId.current}`, field, op, value: value.trim() }])
    setValue("")
    setOpen(false)
  }

  return (
    <div
      data-slot="faceted-filter-bar"
      data-reduced-motion={reduced ? "true" : undefined}
      className={cn("w-full space-y-3", className)}
    >
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          aria-expanded={open}
          className="rounded-md border px-3 py-1.5 text-sm"
          onClick={() => setOpen((current) => !current)}
        >
          + 筛选
        </button>
        {chips.map((chip) => (
          <span key={chip.id} className="inline-flex items-center gap-1 rounded-full border bg-muted/50 px-2 py-1 text-xs">
            <span>
              {chip.field === "name" ? "名称" : chip.field === "status" ? "状态" : "分数"} {OP_LABEL[chip.op]}
            </span>
            <input
              aria-label="编辑筛选值"
              value={chip.value}
              className="w-20 rounded border bg-background px-1.5 py-0.5 text-xs outline-none focus-visible:ring-2 focus-visible:ring-primary"
              onChange={(event) =>
                setChips((current) =>
                  current.map((item) => (item.id === chip.id ? { ...item, value: event.target.value } : item)),
                )
              }
            />
            <button
              type="button"
              aria-label="移除筛选"
              className="px-1"
              onClick={() => setChips((current) => current.filter((item) => item.id !== chip.id))}
            >
              ×
            </button>
          </span>
        ))}
      </div>
      {open ? (
        <div className="flex flex-wrap items-end gap-2 rounded-lg border p-3">
          <label className="text-xs">
            字段
            <select
              className="mt-1 block rounded-md border bg-background px-2 py-1.5 text-sm"
              value={field}
              onChange={(event) => {
                const next = event.target.value as FilterChip["field"]
                setField(next)
                setOp(FIELD_OPS[next][0])
                setValue("")
              }}
            >
              <option value="name">名称</option>
              <option value="status">状态</option>
              <option value="score">分数</option>
            </select>
          </label>
          <label className="text-xs">
            条件
            <select
              className="mt-1 block rounded-md border bg-background px-2 py-1.5 text-sm"
              value={op}
              onChange={(event) => setOp(event.target.value as FilterChip["op"])}
            >
              {ops.map((item) => (
                <option key={item} value={item}>
                  {OP_LABEL[item]}
                </option>
              ))}
            </select>
          </label>
          <label className="text-xs">
            值
            {field === "status" ? (
              <select
                className="mt-1 block rounded-md border bg-background px-2 py-1.5 text-sm"
                value={value}
                onChange={(event) => setValue(event.target.value)}
              >
                <option value="">选择</option>
                <option value="设计">设计</option>
                <option value="开发">开发</option>
                <option value="暂停">暂停</option>
              </select>
            ) : (
              <input
                className="mt-1 block rounded-md border bg-background px-2 py-1.5 text-sm"
                value={value}
                inputMode={field === "score" ? "numeric" : "text"}
                onChange={(event) => setValue(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") addChip()
                }}
              />
            )}
          </label>
          <button type="button" className="rounded-md bg-primary px-3 py-1.5 text-sm text-primary-foreground" onClick={addChip}>
            添加
          </button>
        </div>
      ) : null}
      <DataTable columns={COLUMNS} data={[...filtered]} />
    </div>
  )
}

export { FacetedFilterBar }
