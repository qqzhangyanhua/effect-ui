"use client"

import * as React from "react"
import { useVirtualizer } from "@tanstack/react-virtual"

import { cn } from "@/lib/utils"

export interface VirtualListProps<T> {
  items: T[]
  height?: number
  estimateSize?: number
  renderItem: (item: T, index: number) => React.ReactNode
  className?: string
}

function VirtualList<T>({
  items,
  height = 320,
  estimateSize = 40,
  renderItem,
  className,
}: VirtualListProps<T>) {
  const parentRef = React.useRef<HTMLDivElement>(null)
  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => estimateSize,
    overscan: 8,
  })

  return (
    <div ref={parentRef} className={cn("overflow-auto rounded-xl border", className)} style={{ height }}>
      <div className="relative w-full" style={{ height: virtualizer.getTotalSize() }}>
        {virtualizer.getVirtualItems().map((row) => (
          <div
            key={row.key}
            className="absolute top-0 left-0 w-full"
            style={{ height: row.size, transform: `translateY(${row.start}px)` }}
          >
            {items[row.index] !== undefined ? renderItem(items[row.index] as T, row.index) : null}
          </div>
        ))}
      </div>
    </div>
  )
}

export { VirtualList }
