"use client"

// Ported from prompt-kit (MIT, (c) 2025 Julien Thibeaut) — https://github.com/ibelick/prompt-kit/blob/main/components/prompt-kit/prompt-suggestion.tsx. Modified for effect-ui.

import type { ButtonHTMLAttributes, ReactNode } from "react"

import { Button } from "@/components/ui/button"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export interface PromptSuggestionProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  size?: "default" | "sm" | "lg" | "icon"
  highlight?: string
}

function highlighted(content: string, highlight: string) {
  const needle = highlight.trim().toLowerCase()
  const haystack = content.toLowerCase()
  const index = needle ? haystack.indexOf(needle) : -1
  if (index < 0) return <span className="whitespace-pre-wrap text-muted-foreground">{content}</span>
  const before = content.slice(0, index)
  const match = content.slice(index, index + needle.length)
  const after = content.slice(index + needle.length)
  return (
    <>
      {before ? <span className="whitespace-pre-wrap text-muted-foreground">{before}</span> : null}
      <span className="font-medium whitespace-pre-wrap text-primary">{match}</span>
      {after ? <span className="whitespace-pre-wrap text-muted-foreground">{after}</span> : null}
    </>
  )
}

export function PromptSuggestion({ children, variant, size, className, highlight, ...props }: PromptSuggestionProps) {
  const reduced = usePrefersReducedMotion()
  const highlighting = highlight !== undefined && highlight.trim() !== ""
  const content = typeof children === "string" ? children : ""
  let body: ReactNode = children
  let look: "outline" | "ghost" = "outline"
  let controlSize: NonNullable<PromptSuggestionProps["size"]> = "lg"
  let shape = "rounded-full"
  if (highlighting) {
    look = "ghost"
    controlSize = "sm"
    shape = cn("w-full cursor-pointer justify-start rounded-xl py-2 hover:bg-accent", content && "gap-0")
    body = content ? highlighted(content, highlight) : children
  }

  return (
    <Button {...props} className={cn(shape, reduced && "transition-none", className)} data-reduced={reduced ? "true" : "false"} data-slot="prompt-suggestion" size={size || controlSize} type="button" variant={variant || look}>
      {body}
    </Button>
  )
}
