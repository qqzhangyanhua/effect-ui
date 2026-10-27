"use client"

import { useVirtualizer } from "@tanstack/react-virtual"
import * as React from "react"

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/cn"

export interface JsonViewerProps {
  data?: unknown
  className?: string
}

type JsonType = "object" | "array" | "string" | "number" | "boolean" | "null"

interface JsonRow {
  path: string
  keyLabel: string
  type: JsonType
  preview: string
  depth: number
  expandable: boolean
  raw: unknown
}

const SAMPLE = {
  name: "effect-ui",
  version: 1,
  active: true,
  note: null,
  items: Array.from({ length: 48 }, (_, index) => ({
    id: index + 1,
    name: `资源 ${index + 1}`,
    score: (index * 7) % 100,
    active: index % 3 !== 0,
  })),
}

function kindOf(value: unknown): JsonType {
  if (value === null) return "null"
  if (Array.isArray(value)) return "array"
  if (typeof value === "object") return "object"
  if (typeof value === "string") return "string"
  if (typeof value === "number") return "number"
  return "boolean"
}

function previewOf(value: unknown, type: JsonType) {
  if (type === "string") return JSON.stringify(value)
  if (type === "array") return `Array(${(value as unknown[]).length})`
  if (type === "object") return `Object(${Object.keys(value as object).length})`
  if (type === "null") return "null"
  return String(value)
}

function childPath(parent: string, key: string) {
  if (/^\d+$/.test(key)) return `${parent}[${key}]`
  if (/^[A-Za-z_$][\w$]*$/.test(key)) return `${parent}.${key}`
  return `${parent}[${JSON.stringify(key)}]`
}

function matchesQuery(path: string, preview: string, query: string) {
  if (!query) return false
  const needle = query.toLowerCase()
  return path.toLowerCase().includes(needle) || preview.toLowerCase().includes(needle)
}

function collect(
  value: unknown,
  path: string,
  keyLabel: string,
  depth: number,
  expanded: ReadonlySet<string>,
  query: string,
): { rows: JsonRow[]; hit: boolean } {
  const type = kindOf(value)
  const preview = previewOf(value, type)
  const expandable = type === "object" || type === "array"
  const selfHit = matchesQuery(path, preview, query)
  const row: JsonRow = { path, keyLabel, type, preview, depth, expandable, raw: value }
  if (!expandable) return { rows: query && !selfHit ? [] : [row], hit: selfHit || !query }
  const entries = Array.isArray(value)
    ? value.map((item, index) => [String(index), item] as const)
    : Object.entries(value as Record<string, unknown>)
  const children = entries.map(([key, child]) => collect(child, childPath(path, key), key, depth + 1, expanded, query))
  const childHit = children.some((child) => child.hit)
  const hit = selfHit || childHit
  if (query && !hit) return { rows: [], hit: false }
  const open = expanded.has(path) || (query.length > 0 && childHit)
  const rows = [row]
  if (open) {
    for (const child of children) rows.push(...child.rows)
  }
  return { rows, hit: hit || !query }
}

const TYPE_CLASS: Record<JsonType, string> = {
  string: "text-emerald-600 dark:text-emerald-300",
  number: "text-sky-600 dark:text-sky-300",
  boolean: "text-amber-600 dark:text-amber-300",
  null: "text-muted-foreground",
  object: "text-foreground",
  array: "text-foreground",
}

function highlight(text: string, query: string) {
  if (!query) return text
  const lower = text.toLowerCase()
  const needle = query.toLowerCase()
  const parts: React.ReactNode[] = []
  let cursor = 0
  while (cursor < text.length) {
    const at = lower.indexOf(needle, cursor)
    if (at < 0) {
      parts.push(text.slice(cursor))
      break
    }
    if (at > cursor) parts.push(text.slice(cursor, at))
    parts.push(
      <mark key={`${at}-${cursor}`} className="rounded-sm bg-amber-300/70 text-inherit">
        {text.slice(at, at + needle.length)}
      </mark>,
    )
    cursor = at + needle.length
  }
  return parts
}

function JsonViewer({ data = SAMPLE, className }: JsonViewerProps) {
  const reduced = usePrefersReducedMotion()
  const parentRef = React.useRef<HTMLDivElement>(null)
  const [expanded, setExpanded] = React.useState<Set<string>>(() => new Set(["$", "$.items"]))
  const [query, setQuery] = React.useState("")
  const [notice, setNotice] = React.useState("")
  const tree = collect(data, "$", "$", 0, expanded, query.trim())
  const rows = tree.rows
  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 32,
    overscan: 8,
  })

  const copyText = (text: string) => {
    void navigator.clipboard.writeText(text).then(
      () => setNotice("已复制"),
      () => setNotice("复制失败"),
    )
  }

  const toggle = (path: string) => {
    setExpanded((current) => {
      const next = new Set(current)
      if (next.has(path)) next.delete(path)
      else next.add(path)
      return next
    })
  }

  return (
    <div data-slot="json-viewer" className={cn("w-full space-y-2", className)}>
      <div className="flex items-center justify-between gap-3">
        <label className="text-sm">
          搜索
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="ml-2 rounded-md border bg-background px-2 py-1 text-sm"
            placeholder="路径或值"
          />
        </label>
        <p className="text-xs text-muted-foreground" aria-live="polite">
          {notice || `${rows.length} 行`}
        </p>
      </div>
      <div ref={parentRef} className="h-80 overflow-auto rounded-xl border">
        <div className="relative w-full" style={{ height: virtualizer.getTotalSize() }}>
          {virtualizer.getVirtualItems().map((virtualRow) => {
            const row = rows[virtualRow.index]
            if (!row) return null
            const open = expanded.has(row.path) || (query.trim().length > 0 && row.expandable)
            return (
              <div
                key={row.path}
                className="absolute top-0 left-0 flex w-full items-center gap-2 px-2 text-xs"
                style={{ height: virtualRow.size, transform: `translateY(${virtualRow.start}px)` }}
              >
                <span style={{ width: row.depth * 14 }} />
                {row.expandable ? (
                  <button
                    type="button"
                    aria-expanded={open}
                    className="w-5 shrink-0 rounded outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    onClick={() => toggle(row.path)}
                  >
                    {open ? "▾" : "▸"}
                  </button>
                ) : (
                  <span className="w-5 shrink-0" />
                )}
                <span className="truncate font-medium">{highlight(row.keyLabel, query.trim())}</span>
                <span className={cn("truncate", TYPE_CLASS[row.type])}>{highlight(row.preview, query.trim())}</span>
                <span className="ml-auto flex shrink-0 gap-1">
                  <button type="button" className="rounded border px-1.5 py-0.5" onClick={() => copyText(row.path)}>
                    路径
                  </button>
                  <button
                    type="button"
                    className="rounded border px-1.5 py-0.5"
                    onClick={() =>
                      copyText(row.type === "object" || row.type === "array" ? JSON.stringify(row.raw) : row.preview)
                    }
                  >
                    值
                  </button>
                </span>
              </div>
            )
          })}
        </div>
      </div>
      <p className="text-xs text-muted-foreground">{reduced ? "列表直接展开，没有过渡。" : "长列表按可见区域渲染。"}</p>
    </div>
  )
}

export { JsonViewer }
