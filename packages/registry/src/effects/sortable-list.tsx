"use client"

import { Reorder, useDragControls } from "motion/react"
import * as React from "react"

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/cn"

export interface SortableItem {
  id: string
  title: string
  detail: string
}

export interface SortableListProps {
  items?: readonly SortableItem[]
  className?: string
  onReorder?: (items: SortableItem[]) => void
  gap?: number
}

const ITEMS: readonly SortableItem[] = [
  { id: "draft", title: "起草说明", detail: "先写清交互，再动视觉。" },
  { id: "review", title: "对照规范", detail: "键盘路径和减弱动效一起看。" },
  { id: "ship", title: "放进注册表", detail: "文档页、预览和示例一起登记。" },
  { id: "note", title: "记下顺序", detail: "拖动手柄，或聚焦后按上下键。" },
]

function moveItem(items: readonly SortableItem[], id: string, direction: -1 | 1) {
  const index = items.findIndex((item) => item.id === id)
  const nextIndex = index + direction
  if (index < 0 || nextIndex < 0 || nextIndex >= items.length) return items
  const next = items.slice()
  const [item] = next.splice(index, 1)
  if (!item) return items
  next.splice(nextIndex, 0, item)
  return next
}

function SortableRow({
  item,
  reduced,
  onMove,
}: {
  item: SortableItem
  reduced: boolean
  onMove: (id: string, direction: -1 | 1) => void
}) {
  const controls = useDragControls()
  return (
    <Reorder.Item
      value={item}
      dragListener={false}
      dragControls={controls}
      transition={reduced ? { duration: 0 } : { type: "spring", stiffness: 420, damping: 34 }}
      className="flex items-center gap-3 rounded-lg border bg-background px-2 py-2"
    >
      <button
        type="button"
        id={`sortable-handle-${item.id}`}
        aria-label={`移动 ${item.title}。上下方向键调整顺序。`}
        className="grid h-9 w-9 shrink-0 cursor-grab place-items-center rounded-md border text-muted-foreground active:cursor-grabbing"
        style={{ touchAction: "none" }}
        onPointerDown={(event) => controls.start(event)}
        onKeyDown={(event) => {
          if (event.key !== "ArrowUp" && event.key !== "ArrowDown") return
          event.preventDefault()
          onMove(item.id, event.key === "ArrowUp" ? -1 : 1)
        }}
      >
        <svg viewBox="0 0 12 16" className="h-4 w-3" aria-hidden>
          <path
            fill="currentColor"
            d="M1 2h2v2H1zm4 0h2v2H5zm4 0h2v2H9zM1 7h2v2H1zm4 0h2v2H5zm4 0h2v2H9zM1 12h2v2H1zm4 0h2v2H5zm4 0h2v2H9z"
          />
        </svg>
      </button>
      <div>
        <p className="text-sm font-medium">{item.title}</p>
        <p className="text-xs text-muted-foreground">{item.detail}</p>
      </div>
    </Reorder.Item>
  )
}

function SortableList({ items: itemsProp = ITEMS, className, onReorder, gap }: SortableListProps) {
  const reduced = usePrefersReducedMotion()
  const [items, setItems] = React.useState<readonly SortableItem[]>(itemsProp)

  const commit = (next: readonly SortableItem[]) => {
    setItems(next)
    onReorder?.([...next])
  }

  const onMove = (id: string, direction: -1 | 1) => {
    commit(moveItem(items, id, direction))
    window.requestAnimationFrame(() => {
      document.getElementById(`sortable-handle-${id}`)?.focus()
    })
  }

  return (
    <div data-slot="sortable-list" className={cn("w-full", className)}>
      <Reorder.Group
        axis="y"
        values={[...items]}
        onReorder={commit}
        className={gap === undefined || gap === 8 ? "flex list-none flex-col gap-2 p-0" : "flex list-none flex-col p-0"}
        style={gap === undefined || gap === 8 ? undefined : { gap }}
      >
        {items.map((item) => (
          <SortableRow key={item.id} item={item} reduced={reduced} onMove={onMove} />
        ))}
      </Reorder.Group>
    </div>
  )
}

export { SortableList }
