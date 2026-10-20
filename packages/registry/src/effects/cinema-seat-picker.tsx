"use client"

import * as React from "react"

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export interface CinemaSeatPickerProps {
  className?: string
}

const ROWS = ["A", "B", "C", "D", "E"]
const COLS = 8
const PRICE = 48

function seatId(row: string, col: number) {
  return `${row}${col}`
}

function isTaken(rowIndex: number, col: number) {
  return (rowIndex * 3 + col) % 7 === 0
}

function CinemaSeatPicker({ className }: CinemaSeatPickerProps) {
  usePrefersReducedMotion()
  const [selected, setSelected] = React.useState<string[]>([])
  const [cursor, setCursor] = React.useState({ row: 0, col: 1 })
  const total = selected.length * PRICE

  const move = (dRow: number, dCol: number) => {
    setCursor((current) => ({
      row: Math.min(ROWS.length - 1, Math.max(0, current.row + dRow)),
      col: Math.min(COLS, Math.max(1, current.col + dCol)),
    }))
  }

  const toggle = (id: string, taken: boolean) => {
    if (taken) return
    setSelected((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]))
  }

  return (
    <div data-slot="cinema-seat-picker" className={cn("grid w-full gap-4 md:grid-cols-[1fr_14rem]", className)}>
      <div
        role="grid"
        aria-label="选座。方向键移动，回车切换座位。"
        tabIndex={0}
        className="rounded-xl border p-4 outline-none focus-visible:ring-2 focus-visible:ring-primary"
        onKeyDown={(event) => {
          const keyMap: Record<string, [number, number]> = {
            ArrowUp: [-1, 0],
            ArrowDown: [1, 0],
            ArrowLeft: [0, -1],
            ArrowRight: [0, 1],
          }
          const step = keyMap[event.key]
          if (step) {
            event.preventDefault()
            move(step[0], step[1])
            return
          }
          if (event.key !== "Enter" && event.key !== " ") return
          event.preventDefault()
          const row = ROWS[cursor.row] ?? "A"
          const id = seatId(row, cursor.col || 1)
          toggle(id, isTaken(cursor.row, cursor.col || 1))
        }}
      >
        <div className="mb-4 rounded-md bg-muted py-2 text-center text-xs tracking-[0.3em]">银幕</div>
        <div className="space-y-2">
          {ROWS.map((row, rowIndex) => (
            <div key={row} role="row" className="flex items-center gap-2">
              <span className="w-4 text-xs text-muted-foreground">{row}</span>
              {Array.from({ length: COLS }, (_, index) => {
                const col = index + 1
                const id = seatId(row, col)
                const taken = isTaken(rowIndex, col)
                const on = selected.includes(id)
                const focused = cursor.row === rowIndex && (cursor.col || 1) === col
                return (
                  <button
                    key={id}
                    type="button"
                    role="gridcell"
                    aria-label={`${id}${taken ? " 已售" : on ? " 已选" : " 可选"}`}
                    aria-selected={on}
                    aria-disabled={taken}
                    disabled={taken}
                    className={cn(
                      "h-7 flex-1 rounded-md border text-[10px] outline-none",
                      taken && "cursor-not-allowed bg-muted text-muted-foreground",
                      on && "bg-primary text-primary-foreground",
                      focused && "ring-2 ring-primary",
                    )}
                    onClick={() => {
                      setCursor({ row: rowIndex, col })
                      toggle(id, taken)
                    }}
                  >
                    {col}
                  </button>
                )
              })}
            </div>
          ))}
        </div>
      </div>
      <aside className="space-y-3 rounded-xl border p-4">
        <h2 className="text-sm font-medium">场次预览</h2>
        <div className="flex h-16 items-end justify-center gap-1 rounded-md bg-zinc-950 p-2">
          {selected.length === 0 ? <span className="mb-3 text-[10px] text-zinc-400">尚未选座</span> : null}
          {selected.map((id) => (
            <span key={id} className="mb-2 h-3 w-3 rounded-sm bg-primary" title={id} />
          ))}
        </div>
        <p className="text-sm">
          {selected.length} 座 · ¥{total}
        </p>
        <p className="text-xs text-muted-foreground">{selected.join("、") || "用方向键或点击选择空座。"}</p>
      </aside>
    </div>
  )
}

export { CinemaSeatPicker }
