"use client"

// Ported from Uiverse galaxy（MIT，(c) 2023 Uiverse.io, author vinodjangid07）— https://github.com/uiverse-io/galaxy/blob/main/Inputs/vinodjangid07_good-grasshopper-52.html

import { useControllableState } from "@/hooks/use-controllable-state"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

import { type HTMLAttributes } from "react"

export interface MicSearchInputProps extends Omit<HTMLAttributes<HTMLDivElement>, "onChange"> {
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  placeholder?: string
  onMicClick?: () => void
}

export function MicSearchInput({
  value,
  defaultValue = "",
  onValueChange,
  placeholder = "搜索",
  onMicClick,
  className,
  ...props
}: MicSearchInputProps) {
  const prefersReducedMotion = usePrefersReducedMotion()
  const [text, setText] = useControllableState({
    value,
    defaultValue,
    onChange: onValueChange,
  })

  return (
    <div
      {...props}
      className={cn("inline-flex h-10 items-center rounded-[10px] bg-card pl-3 text-foreground shadow-sm", className)}
      data-reduced={prefersReducedMotion ? "true" : "false"}
      data-slot="mic-search-input"
    >
      <input
        aria-label="搜索"
        className="h-full w-40 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
        placeholder={placeholder}
        type="text"
        value={text}
        onChange={(event) => setText(event.target.value)}
      />
      <span aria-hidden className="px-3 text-muted-foreground">
        <svg className="size-3.5 fill-current" viewBox="0 0 512 512">
          <path d="M416 208a208 208 0 1 1-416 0 208 208 0 1 1 416 0zM208 352a144 144 0 1 0 0-288 144 144 0 1 0 0 288z" />
        </svg>
      </span>
      <span aria-hidden className="h-4 w-px bg-border" />
      <button
        aria-label="语音输入"
        className={cn(
          "h-10 bg-transparent px-3 text-primary",
          prefersReducedMotion ? "transition-none" : "transition-colors duration-300 hover:bg-accent",
        )}
        type="button"
        onClick={() => onMicClick?.()}
      >
        <svg aria-hidden className="size-3.5 fill-current" viewBox="0 0 384 512">
          <path d="M192 0C139 0 96 43 96 96v160c0 53 43 96 96 96s96-43 96-96V96c0-53-43-96-96-96zM64 216c0-13.3-10.7-24-24-24S16 202.7 16 216v40c0 89.1 66.2 162.7 152 174.4V464h-48c-13.3 0-24 10.7-24 24s10.7 24 24 24h72 72c13.3 0 24-10.7 24-24s-10.7-24-24-24h-48v-33.6c85.8-11.7 152-85.3 152-174.4v-40c0-13.3-10.7-24-24-24s-24 10.7-24 24v40c0 70.7-57.3 128-128 128S64 326.7 64 256v-40z" />
        </svg>
      </button>
    </div>
  )
}
