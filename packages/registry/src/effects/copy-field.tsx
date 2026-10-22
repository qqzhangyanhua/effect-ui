"use client"

// Ported from Uiverse galaxy（MIT，(c) 2023 Uiverse.io, author omriluz）— https://github.com/uiverse-io/galaxy/blob/main/Inputs/omriluz_good-parrot-26.html

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

import { useEffect, useRef, useState, type HTMLAttributes } from "react"

export interface CopyFieldProps extends Omit<HTMLAttributes<HTMLDivElement>, "onCopy"> {
  value?: string
  onCopy?: (value: string) => void
  timeout?: number
}

export function CopyField({ value = "复制这段文字", onCopy, timeout = 1500, className, ...props }: CopyFieldProps) {
  const prefersReducedMotion = usePrefersReducedMotion()
  const [copied, setCopied] = useState(false)
  const timer = useRef<number | null>(null)

  useEffect(() => {
    return () => {
      if (timer.current !== null) window.clearTimeout(timer.current)
    }
  }, [])

  function copy() {
    const clipboard = navigator.clipboard
    if (clipboard) void clipboard.writeText(value).catch(() => undefined)
    onCopy?.(value)
    setCopied(true)
    if (timer.current !== null) window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => setCopied(false), timeout)
  }

  return (
    <div {...props} className={cn("inline-flex shadow-sm", className)} data-reduced={prefersReducedMotion ? "true" : "false"} data-slot="copy-field">
      <input aria-label="待复制内容" className="w-40 rounded-s-lg border border-border bg-background px-2 py-1 text-sm text-foreground outline-none" readOnly type="text" value={value} />
      <button
        aria-label={copied ? "已复制" : "复制"}
        className={cn(
          "flex h-10 w-10 items-center justify-center rounded-e-lg bg-primary text-primary-foreground",
          prefersReducedMotion ? "transition-none" : "transition-colors",
        )}
        type="button"
        onClick={copy}
      >
        {copied ? (
          <span aria-hidden className="text-xs">
            好
          </span>
        ) : (
          <svg aria-hidden className="size-5" fill="none" viewBox="0 0 24 24">
            <rect height="12" rx="1" stroke="currentColor" width="12" x="4" y="8" />
            <path d="M8 6V5a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1h-1" stroke="currentColor" strokeDasharray="2 2" />
          </svg>
        )}
      </button>
    </div>
  )
}
