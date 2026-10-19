"use client"

import { EmojiPicker as FrimoussePicker } from "frimousse"

import { cn } from "@/lib/utils"

export interface EmojiPickerProps {
  onEmojiSelect?: (emoji: string) => void
  className?: string
}

function EmojiPicker({ onEmojiSelect, className }: EmojiPickerProps) {
  return (
    <div className={cn("overflow-hidden rounded-xl border bg-popover", className)}>
      <FrimoussePicker.Root
        className="flex h-72 w-80 flex-col"
        onEmojiSelect={({ emoji }) => onEmojiSelect?.(emoji)}
      >
        <FrimoussePicker.Search className="m-2 rounded-md border bg-background px-2 py-1.5 text-sm outline-none" />
        <FrimoussePicker.Viewport className="flex-1 px-2">
          <FrimoussePicker.Loading className="p-4 text-sm text-muted-foreground">加载表情…</FrimoussePicker.Loading>
          <FrimoussePicker.Empty className="p-4 text-sm text-muted-foreground">没有匹配的表情</FrimoussePicker.Empty>
          <FrimoussePicker.List
            className="pb-2"
            components={{
              CategoryHeader: ({ category, ...props }) => (
                <div className="sticky top-0 bg-popover py-1 text-xs text-muted-foreground" {...props}>
                  {category.label}
                </div>
              ),
              Row: ({ children, ...props }) => (
                <div className="scroll-my-1.5" {...props}>
                  {children}
                </div>
              ),
              Emoji: ({ emoji, ...props }) => (
                <button
                  type="button"
                  className="grid size-8 place-items-center rounded-md text-lg hover:bg-accent"
                  {...props}
                >
                  {emoji.emoji}
                </button>
              ),
            }}
          />
        </FrimoussePicker.Viewport>
      </FrimoussePicker.Root>
    </div>
  )
}

export { EmojiPicker }
