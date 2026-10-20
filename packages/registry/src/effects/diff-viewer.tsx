"use client"

import * as React from "react"

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export interface DiffViewerProps {
  oldText?: string
  newText?: string
  className?: string
}

type LineKind = "same" | "add" | "remove" | "empty"

interface Word {
  text: string
  mark: boolean
}

interface Cell {
  no: number | null
  text: string
  kind: LineKind
  words: Word[]
}

interface Row {
  left: Cell
  right: Cell
}

interface Hunk {
  id: number
  rows: Row[]
  collapsible: boolean
}

interface Change {
  value: string
  added?: boolean
  removed?: boolean
}

const CONTEXT = [
  "// 上下文 1",
  "// 上下文 2",
  "// 上下文 3",
  "// 上下文 4",
  "// 上下文 5",
  "// 上下文 6",
  "// 上下文 7",
  "// 上下文 8",
].join("\n")

const OLD_TEXT = `function greet(name) {
  const message = "hello"
  console.log(message)
  return message + " " + name
}

${CONTEXT}

function unused() {
  return 1
}

export function main() {
  greet("world")
}
`

const NEW_TEXT = `function greet(name) {
  const message = "hello"
  console.log(message.toUpperCase())
  return message + ", " + name
}

${CONTEXT}

export function main() {
  greet("effect-ui")
  return greet("reader")
}
`

function splitLines(value: string) {
  const trimmed = value.endsWith("\n") ? value.slice(0, -1) : value
  if (trimmed === "") return []
  return trimmed.split("\n")
}

function wordsOf(text: string, changes: Change[] | null, side: "add" | "remove") {
  if (!changes) return [{ text, mark: false }]
  return changes
    .filter((change) => (side === "add" ? !change.removed : !change.added))
    .map((change) => ({
      text: change.value,
      mark: side === "add" ? Boolean(change.added) : Boolean(change.removed),
    }))
}

function emptyCell(): Cell {
  return { no: null, text: "", kind: "empty", words: [] }
}

function buildRows(
  oldText: string,
  newText: string,
  lineDiff: (before: string, after: string) => Change[],
  wordDiff: (before: string, after: string) => Change[],
) {
  const changes = lineDiff(oldText, newText)
  const rows: Row[] = []
  let oldNo = 1
  let newNo = 1
  for (let index = 0; index < changes.length; index += 1) {
    const change = changes[index]
    if (!change) continue
    const next = changes[index + 1]
    if (change.removed && next?.added) {
      const removed = splitLines(change.value)
      const added = splitLines(next.value)
      const count = Math.max(removed.length, added.length)
      for (let line = 0; line < count; line += 1) {
        const removedLine = removed[line]
        const addedLine = added[line]
        const wordChanges =
          removedLine !== undefined && addedLine !== undefined ? wordDiff(removedLine, addedLine) : null
        rows.push({
          left:
            removedLine === undefined
              ? emptyCell()
              : {
                  no: oldNo++,
                  text: removedLine,
                  kind: "remove",
                  words: wordsOf(removedLine, wordChanges, "remove"),
                },
          right:
            addedLine === undefined
              ? emptyCell()
              : {
                  no: newNo++,
                  text: addedLine,
                  kind: "add",
                  words: wordsOf(addedLine, wordChanges, "add"),
                },
        })
      }
      index += 1
      continue
    }
    for (const text of splitLines(change.value)) {
      if (change.added) {
        rows.push({
          left: emptyCell(),
          right: { no: newNo++, text, kind: "add", words: [{ text, mark: false }] },
        })
      } else if (change.removed) {
        rows.push({
          left: { no: oldNo++, text, kind: "remove", words: [{ text, mark: false }] },
          right: emptyCell(),
        })
      } else {
        rows.push({
          left: { no: oldNo++, text, kind: "same", words: [{ text, mark: false }] },
          right: { no: newNo++, text, kind: "same", words: [{ text, mark: false }] },
        })
      }
    }
  }
  return rows
}

function groupHunks(rows: readonly Row[]): Hunk[] {
  const hunks: Hunk[] = []
  let buffer: Row[] = []
  const flush = () => {
    if (buffer.length === 0) return
    hunks.push({ id: hunks.length, rows: buffer, collapsible: buffer.length > 6 })
    buffer = []
  }
  for (const row of rows) {
    const same = row.left.kind === "same" && row.right.kind === "same"
    if (same) buffer.push(row)
    else {
      flush()
      hunks.push({ id: hunks.length, rows: [row], collapsible: false })
    }
  }
  flush()
  return hunks
}

function cellClass(kind: LineKind) {
  if (kind === "add") return "bg-emerald-500/15"
  if (kind === "remove") return "bg-rose-500/15"
  return ""
}

function Words({ cell }: { cell: Cell }) {
  if (cell.kind === "empty") return <span className="text-transparent">.</span>
  return (
    <>
      {cell.words.map((word, index) => (
        <span
          key={`${index}-${word.text}`}
          className={cn(
            word.mark && cell.kind === "add" && "rounded-sm bg-emerald-500/35",
            word.mark && cell.kind === "remove" && "rounded-sm bg-rose-500/35",
          )}
        >
          {word.text}
        </span>
      ))}
    </>
  )
}

function Line({ cell }: { cell: Cell }) {
  return (
    <div className={cn("grid grid-cols-[2.5rem_1fr] gap-2 px-2 py-0.5 font-mono text-xs whitespace-pre", cellClass(cell.kind))}>
      <span className="text-right text-muted-foreground">{cell.no ?? ""}</span>
      <span>
        <Words cell={cell} />
      </span>
    </div>
  )
}

function DiffViewer({ oldText = OLD_TEXT, newText = NEW_TEXT, className }: DiffViewerProps) {
  const reduced = usePrefersReducedMotion()
  const [mode, setMode] = React.useState<"split" | "unified">("split")
  const [rows, setRows] = React.useState<Row[] | null>(null)
  const [error, setError] = React.useState("")
  const [open, setOpen] = React.useState<Record<number, boolean>>({})

  React.useEffect(() => {
    let cancelled = false
    void import("diff")
      .then((mod) => {
        if (cancelled) return
        setRows(
          buildRows(
            oldText,
            newText,
            (before, after) => mod.diffLines(before, after),
            (before, after) => mod.diffWordsWithSpace(before, after),
          ),
        )
      })
      .catch(() => {
        if (!cancelled) setError("差异模块没有载入。")
      })
    return () => {
      cancelled = true
    }
  }, [newText, oldText])

  const hunks = rows ? groupHunks(rows) : []

  return (
    <div data-slot="diff-viewer" className={cn("w-full overflow-hidden rounded-xl border", className)}>
      <div className="flex items-center gap-2 border-b px-3 py-2">
        <button
          type="button"
          aria-pressed={mode === "split"}
          className={cn("rounded-md px-2 py-1 text-sm", mode === "split" && "bg-muted")}
          onClick={() => setMode("split")}
        >
          并排
        </button>
        <button
          type="button"
          aria-pressed={mode === "unified"}
          className={cn("rounded-md px-2 py-1 text-sm", mode === "unified" && "bg-muted")}
          onClick={() => setMode("unified")}
        >
          合并
        </button>
      </div>
      <div className={cn("max-h-96 overflow-auto", reduced && "scroll-auto")}>
        {error ? <p className="p-4 text-sm text-muted-foreground">{error}</p> : null}
        {rows === null && !error ? <p className="p-4 text-sm text-muted-foreground">正在计算差异…</p> : null}
        {hunks.map((hunk) => {
          const collapsed = hunk.collapsible && !open[hunk.id]
          const omitted = Math.max(0, hunk.rows.length - 4)
          const head = collapsed ? hunk.rows.slice(0, 2) : hunk.rows
          const tail = collapsed ? hunk.rows.slice(-2) : []
          const renderRows = (list: readonly Row[]) =>
            list.map((row, index) =>
              mode === "split" ? (
                <div key={`${hunk.id}-${index}-${row.left.no}-${row.right.no}`} className="grid grid-cols-2">
                  <Line cell={row.left} />
                  <Line cell={row.right} />
                </div>
              ) : (
                <div key={`${hunk.id}-u-${index}`}>
                  {row.left.kind !== "empty" && row.left.kind !== "add" ? <Line cell={row.left} /> : null}
                  {row.right.kind === "add" || (row.left.kind === "empty" && row.right.kind !== "empty") ? (
                    <Line cell={row.right} />
                  ) : null}
                </div>
              ),
            )
          return (
            <div key={hunk.id}>
              {renderRows(head)}
              {collapsed ? (
                <button
                  type="button"
                  className="block w-full bg-muted/60 px-3 py-1 text-left text-xs text-muted-foreground hover:bg-muted"
                  onClick={() => setOpen((current) => ({ ...current, [hunk.id]: true }))}
                >
                  展开 {omitted} 行未改动
                </button>
              ) : null}
              {hunk.collapsible && open[hunk.id] ? (
                <button
                  type="button"
                  className="block w-full bg-muted/60 px-3 py-1 text-left text-xs text-muted-foreground hover:bg-muted"
                  onClick={() => setOpen((current) => ({ ...current, [hunk.id]: false }))}
                >
                  收起未改动
                </button>
              ) : null}
              {renderRows(tail)}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export { DiffViewer }
