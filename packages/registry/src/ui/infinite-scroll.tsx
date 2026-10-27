"use client"

import * as React from "react"

import { cn } from "@/lib/cn"

export interface InfiniteScrollProps {
  children: React.ReactNode
  onLoadMore: () => void
  hasMore?: boolean
  loading?: boolean
  className?: string
}

function InfiniteScroll({
  children,
  onLoadMore,
  hasMore = true,
  loading = false,
  className,
}: InfiniteScrollProps) {
  const sentinel = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const node = sentinel.current
    if (!node || !hasMore) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && !loading) onLoadMore()
      },
      { rootMargin: "120px" },
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [hasMore, loading, onLoadMore])

  return (
    <div className={cn("space-y-2", className)}>
      {children}
      <div ref={sentinel} className="grid h-8 place-items-center text-xs text-muted-foreground">
        {loading ? "加载中…" : hasMore ? "继续滚动" : "没有更多了"}
      </div>
    </div>
  )
}

export { InfiniteScroll }
