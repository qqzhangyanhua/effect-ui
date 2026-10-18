"use client"

import * as React from "react"
import { XIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

export interface TagInputProps {
  value?: string[]
  onValueChange?: (value: string[]) => void
  placeholder?: string
  className?: string
}

function TagInput({
  value: controlled,
  onValueChange,
  placeholder = "输入后回车添加标签",
  className,
}: TagInputProps) {
  const [uncontrolled, setUncontrolled] = React.useState<string[]>([])
  const [draft, setDraft] = React.useState("")
  const tags = controlled ?? uncontrolled

  const setTags = (next: string[]) => {
    if (controlled === undefined) setUncontrolled(next)
    onValueChange?.(next)
  }

  const add = (raw: string) => {
    const next = raw.trim()
    if (!next || tags.includes(next)) return
    setTags([...tags, next])
    setDraft("")
  }

  return (
    <div
      className={cn(
        "flex min-h-9 flex-wrap items-center gap-1 rounded-md border bg-background px-2 py-1",
        className,
      )}
    >
      {tags.map((tag) => (
        <Badge key={tag} variant="secondary" className="gap-1">
          {tag}
          <button
            type="button"
            aria-label={`移除 ${tag}`}
            onClick={() => setTags(tags.filter((item) => item !== tag))}
          >
            <XIcon className="size-3" />
          </button>
        </Badge>
      ))}
      <input
        value={draft}
        placeholder={tags.length === 0 ? placeholder : ""}
        className="min-w-24 flex-1 bg-transparent py-1 text-sm outline-none"
        onChange={(event) => setDraft(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === ",") {
            event.preventDefault()
            add(draft)
          }
          if (event.key === "Backspace" && draft === "" && tags.length > 0) {
            setTags(tags.slice(0, -1))
          }
        }}
        onBlur={() => add(draft)}
      />
    </div>
  )
}

export { TagInput }
