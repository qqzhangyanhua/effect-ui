"use client"

// Ported from prompt-kit (MIT, (c) 2025 Julien Thibeaut) — https://github.com/ibelick/prompt-kit/blob/main/components/prompt-kit/feedback-bar.tsx. Modified for effect-ui.

import { ThumbsDown, ThumbsUp, X } from "lucide-react"
import type { ReactNode } from "react"

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export interface FeedbackBarProps {
  className?: string
  title?: string
  icon?: ReactNode
  onHelpful?: () => void
  onNotHelpful?: () => void
  onClose?: () => void
}

export function FeedbackBar({ className, title, icon, onHelpful, onNotHelpful, onClose }: FeedbackBarProps) {
  const reduced = usePrefersReducedMotion()
  return (
    <div className={cn("inline-flex rounded-xl border border-border bg-background text-sm", className)} data-reduced={reduced ? "true" : "false"} data-slot="feedback-bar">
      <div className="flex w-full items-center justify-between">
        <div className="flex flex-1 items-center justify-start gap-4 py-3 pl-4">
          {icon}
          <span className="font-medium text-foreground">{title}</span>
        </div>
        <div className="flex items-center gap-0.5 px-3">
          <button aria-label="有帮助" className={cn("flex size-8 items-center justify-center rounded-md text-muted-foreground hover:text-foreground", reduced && "transition-none")} type="button" onClick={onHelpful}>
            <ThumbsUp aria-hidden className="size-4" />
          </button>
          <button aria-label="没帮助" className={cn("flex size-8 items-center justify-center rounded-md text-muted-foreground hover:text-foreground", reduced && "transition-none")} type="button" onClick={onNotHelpful}>
            <ThumbsDown aria-hidden className="size-4" />
          </button>
        </div>
        <div className="flex items-center border-l border-border">
          <button aria-label="关闭" className={cn("flex items-center justify-center rounded-md p-3 text-muted-foreground hover:text-foreground", reduced && "transition-none")} type="button" onClick={onClose}>
            <X aria-hidden className="size-5" />
          </button>
        </div>
      </div>
    </div>
  )
}
