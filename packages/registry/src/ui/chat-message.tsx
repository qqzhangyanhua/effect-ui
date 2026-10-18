"use client"

import type { ReactNode } from "react"
import Markdown from "react-markdown"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

export interface ChatMessageProps {
  role: "user" | "assistant"
  content: string
  streaming?: boolean
  name?: string
  actions?: ReactNode
  className?: string
}

function ChatMessage({
  role,
  content,
  streaming = false,
  name,
  actions,
  className,
}: ChatMessageProps) {
  const isUser = role === "user"
  return (
    <div className={cn("flex gap-3", isUser && "flex-row-reverse", className)}>
      <Avatar className="size-8">
        <AvatarFallback>{isUser ? "你" : (name ?? "AI").slice(0, 2)}</AvatarFallback>
      </Avatar>
      <div className={cn("max-w-[80%] space-y-1", isUser && "text-right")}>
        <div
          className={cn(
            "rounded-2xl px-3 py-2 text-sm",
            isUser ? "bg-primary text-primary-foreground" : "bg-muted",
          )}
        >
          {isUser ? (
            content
          ) : (
            <div className="prose prose-sm dark:prose-invert max-w-none text-left [&_pre]:overflow-auto [&_pre]:rounded-md [&_pre]:bg-background/60 [&_pre]:p-2">
              <Markdown>{content}</Markdown>
              {streaming ? <span className="ml-0.5 inline-block h-3 w-1.5 animate-pulse bg-foreground/70" /> : null}
            </div>
          )}
        </div>
        {actions ? <div className="flex gap-1 text-muted-foreground">{actions}</div> : null}
      </div>
    </div>
  )
}

export { ChatMessage }
