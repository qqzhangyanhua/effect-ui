"use client"

// Ported from shadcn-chat (MIT, (c) 2024 Jakob Hoeg Mørk) — https://github.com/jakobhoeg/shadcn-chat/blob/main/packages/ui/src/components/ui/chat/expandable-chat.tsx. Modified for effect-ui.

import { MessageCircle, X } from "lucide-react"
import { useState, type HTMLAttributes, type ReactNode } from "react"

import { Button } from "@/components/ui/button"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export type ChatPosition = "bottom-right" | "bottom-left"
export type ChatSize = "sm" | "md" | "lg" | "xl" | "full"

const dimensions: Record<ChatSize, string> = {
  sm: "sm:max-w-sm sm:max-h-[500px]",
  md: "sm:max-w-md sm:max-h-[600px]",
  lg: "sm:max-w-lg sm:max-h-[700px]",
  xl: "sm:max-w-xl sm:max-h-[800px]",
  full: "sm:w-full sm:h-full",
}

const positions: Record<ChatPosition, string> = {
  "bottom-right": "bottom-5 right-5",
  "bottom-left": "bottom-5 left-5",
}

const panelPositions: Record<ChatPosition, string> = {
  "bottom-right": "sm:right-0",
  "bottom-left": "sm:left-0",
}

export interface ExpandableChatProps extends HTMLAttributes<HTMLDivElement> {
  position?: ChatPosition
  size?: ChatSize
  icon?: ReactNode
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
}

export function ExpandableChat({
  position = "bottom-right",
  size = "md",
  icon,
  open,
  defaultOpen = false,
  onOpenChange,
  className,
  children,
  ...props
}: ExpandableChatProps) {
  const reduced = usePrefersReducedMotion()
  const [internal, setInternal] = useState(defaultOpen)
  const isOpen = open ?? internal
  const setOpen = (next: boolean) => {
    if (open === undefined) setInternal(next)
    onOpenChange?.(next)
  }
  return (
    <div
      {...props}
      className={cn("absolute z-40", positions[position], className)}
      data-reduced={reduced ? "true" : "false"}
      data-slot="expandable-chat"
      data-state={isOpen ? "open" : "closed"}
    >
      <div
        className={cn(
          "absolute bottom-[calc(100%+10px)] flex w-[min(90vw,24rem)] flex-col overflow-hidden border bg-background shadow-md sm:h-[70vh]",
          panelPositions[position],
          dimensions[size],
          reduced ? "transition-none" : "transition-all duration-200",
          isOpen ? "pointer-events-auto visible scale-100 opacity-100" : "pointer-events-none invisible translate-y-2 opacity-0",
        )}
      >
        {children}
      </div>
      <Button
        aria-label={isOpen ? "关闭对话" : "打开对话"}
        className={cn("size-14 rounded-full shadow-md", reduced ? "transition-none" : undefined)}
        onClick={() => setOpen(!isOpen)}
        size="icon"
        type="button"
      >
        {isOpen ? <X className="size-6" /> : icon ?? <MessageCircle className="size-6" />}
      </Button>
    </div>
  )
}

export function ExpandableChatHeader({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div {...props} className={cn("flex items-center justify-between border-b p-4", className)} data-slot="expandable-chat-header" />
}

export function ExpandableChatBody({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div {...props} className={cn("min-h-0 flex-1 overflow-y-auto", className)} data-slot="expandable-chat-body" />
}

export function ExpandableChatFooter({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div {...props} className={cn("border-t p-4", className)} data-slot="expandable-chat-footer" />
}
