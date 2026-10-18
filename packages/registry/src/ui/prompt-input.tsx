"use client"

import * as React from "react"
import { Paperclip, Send, Square } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

export interface PromptInputProps {
  value?: string
  onValueChange?: (value: string) => void
  onSubmit?: (value: string) => void
  onStop?: () => void
  loading?: boolean
  placeholder?: string
  className?: string
}

function PromptInput({
  value: controlled,
  onValueChange,
  onSubmit,
  onStop,
  loading = false,
  placeholder = "问点什么…",
  className,
}: PromptInputProps) {
  const [uncontrolled, setUncontrolled] = React.useState("")
  const value = controlled ?? uncontrolled
  const setValue = (next: string) => {
    if (controlled === undefined) setUncontrolled(next)
    onValueChange?.(next)
  }

  return (
    <div className={cn("rounded-2xl border bg-background p-2 shadow-sm", className)}>
      <Textarea
        value={value}
        placeholder={placeholder}
        className="min-h-16 resize-none border-0 shadow-none focus-visible:ring-0"
        onChange={(event) => setValue(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault()
            if (value.trim()) onSubmit?.(value)
          }
        }}
      />
      <div className="flex items-center justify-between px-1 pb-1">
        <Button type="button" size="icon" variant="ghost" aria-label="附件">
          <Paperclip />
        </Button>
        {loading ? (
          <Button type="button" size="icon" variant="secondary" onClick={onStop} aria-label="停止">
            <Square className="size-3.5 fill-current" />
          </Button>
        ) : (
          <Button
            type="button"
            size="icon"
            disabled={!value.trim()}
            onClick={() => onSubmit?.(value)}
            aria-label="发送"
          >
            <Send />
          </Button>
        )}
      </div>
    </div>
  )
}

export { PromptInput }
