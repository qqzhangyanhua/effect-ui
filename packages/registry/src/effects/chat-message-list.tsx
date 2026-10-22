"use client"

// Ported from shadcn-chat (MIT, (c) 2024 Jakob Hoeg Mørk) — https://github.com/jakobhoeg/shadcn-chat/blob/main/packages/ui/src/components/ui/chat/chat-message-list.tsx and https://github.com/jakobhoeg/shadcn-chat/blob/main/packages/ui/src/components/ui/chat/hooks/useAutoScroll.tsx. Modified for effect-ui.

import { ArrowDown } from "lucide-react"
import { useCallback, useEffect, useRef, useState, type HTMLAttributes, type ReactNode } from "react"

import { Button } from "@/components/ui/button"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

interface AutoScrollOptions {
  offset?: number
  smooth?: boolean
  content?: ReactNode
}

function useAutoScroll({ offset = 20, smooth = false, content }: AutoScrollOptions = {}) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const lastHeight = useRef(0)
  const [atBottom, setAtBottom] = useState(true)
  const [enabled, setEnabled] = useState(true)

  const isAtBottom = useCallback(
    (element: HTMLElement) => Math.abs(element.scrollHeight - element.scrollTop - element.clientHeight) <= offset,
    [offset],
  )

  const scrollToBottom = useCallback(
    (instant?: boolean) => {
      const node = scrollRef.current
      if (!node) return
      node.scrollTo({ top: node.scrollHeight, behavior: instant || !smooth ? "auto" : "smooth" })
      setAtBottom(true)
      setEnabled(true)
    },
    [smooth],
  )

  useEffect(() => {
    const node = scrollRef.current
    if (!node) return
    const onScroll = () => {
      const bottom = isAtBottom(node)
      setAtBottom(bottom)
      if (bottom) setEnabled(true)
    }
    node.addEventListener("scroll", onScroll, { passive: true })
    return () => node.removeEventListener("scroll", onScroll)
  }, [isAtBottom])

  useEffect(() => {
    const node = scrollRef.current
    if (!node) return
    const height = node.scrollHeight
    if (height !== lastHeight.current && enabled) {
      const instant = lastHeight.current === 0
      lastHeight.current = height
      const frame = requestAnimationFrame(() => scrollToBottom(instant))
      return () => cancelAnimationFrame(frame)
    }
    lastHeight.current = height
    return
  }, [content, enabled, scrollToBottom])

  const disableAutoScroll = useCallback(() => {
    const node = scrollRef.current
    if (node && !isAtBottom(node)) setEnabled(false)
  }, [isAtBottom])

  return { scrollRef, atBottom, scrollToBottom: () => scrollToBottom(false), disableAutoScroll }
}

export interface ChatMessageListProps extends HTMLAttributes<HTMLDivElement> {
  smooth?: boolean
}

export function ChatMessageList({ smooth = false, className, children, ...props }: ChatMessageListProps) {
  const reduced = usePrefersReducedMotion()
  const { scrollRef, atBottom, scrollToBottom, disableAutoScroll } = useAutoScroll({
    smooth: reduced ? false : smooth,
    content: children,
  })
  return (
    <div className="relative h-full w-full" data-reduced={reduced ? "true" : "false"} data-slot="chat-message-list">
      <div
        {...props}
        className={cn("flex h-full w-full flex-col overflow-y-auto p-4", className)}
        onTouchMove={disableAutoScroll}
        onWheel={disableAutoScroll}
        ref={scrollRef}
      >
        <div className="flex flex-col gap-4">{children}</div>
      </div>
      {atBottom ? null : (
        <Button
          aria-label="回到底部"
          className="absolute bottom-2 left-1/2 -translate-x-1/2 rounded-full shadow-md"
          onClick={scrollToBottom}
          size="icon"
          type="button"
          variant="outline"
        >
          <ArrowDown className="size-4" />
        </Button>
      )}
    </div>
  )
}
