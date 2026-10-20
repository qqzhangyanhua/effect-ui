"use client"

import * as React from "react"
import { ArrowUp, Paperclip, Sparkles } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export interface HeroAiPromptProps {
  title?: string
  subtitle?: string
  placeholder?: string
  suggestions?: string[]
  onSubmit?: (value: string) => void
  backdrop?: boolean
  className?: string
}

const defaultSuggestions = ["生成定价页", "重绘这个 Hero", "加一列 logo wall"]

function HeroAiPrompt({
  title = "描述你想要的界面",
  subtitle = "灵感来自 v0 / Lovable，原创实现。居中大提示框，不是聊天输入的缩小版。",
  placeholder = "做一个带着色器背景、地球仪和定价表的落地页…",
  suggestions = defaultSuggestions,
  onSubmit,
  backdrop = true,
  className,
}: HeroAiPromptProps) {
  const reduced = usePrefersReducedMotion()
  const [value, setValue] = React.useState("")

  const submit = () => {
    const next = value.trim()
    if (!next) return
    onSubmit?.(next)
  }

  return (
    <section
      className={cn(
        "relative isolate overflow-hidden rounded-2xl border px-6 py-20",
        className,
      )}
    >
      {backdrop ? (
        <div
          aria-hidden
          className={cn(
            "absolute inset-0 bg-[radial-gradient(60%_50%_at_50%_0%,color-mix(in_oklab,var(--primary)_22%,transparent),transparent_70%),linear-gradient(180deg,#09090b,#111827)]",
            !reduced && "after:absolute after:inset-0 after:bg-[radial-gradient(circle_at_20%_80%,color-mix(in_oklab,var(--chart-2)_16%,transparent),transparent_42%)]",
          )}
        />
      ) : null}
      <div className="relative z-10 mx-auto flex max-w-2xl flex-col items-center text-center text-white">
        <span className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs text-white/70">
          <Sparkles className="size-3.5" />
          effect-ui prompt
        </span>
        <h2 className="font-display text-4xl tracking-tight text-balance sm:text-5xl">{title}</h2>
        <p className="mt-3 max-w-md text-sm text-white/60">{subtitle}</p>
        <form
          className="mt-8 w-full rounded-3xl border border-white/12 bg-zinc-950/70 p-3 text-left shadow-[0_20px_80px_-32px_rgba(124,58,237,0.7)] backdrop-blur"
          onSubmit={(event) => {
            event.preventDefault()
            submit()
          }}
        >
          <Textarea
            value={value}
            onChange={(event) => setValue(event.target.value)}
            placeholder={placeholder}
            className="min-h-28 resize-none border-0 bg-transparent text-base text-white shadow-none placeholder:text-white/35 focus-visible:ring-0 dark:bg-transparent"
            onKeyDown={(event) => {
              if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
                event.preventDefault()
                submit()
              }
            }}
          />
          <div className="mt-2 flex items-center justify-between px-1">
            <Button
              type="button"
              size="icon"
              variant="ghost"
              className="text-white/60 hover:bg-white/10 hover:text-white"
              aria-label="附加文件"
            >
              <Paperclip className="size-4" />
            </Button>
            <Button type="submit" size="sm" className="rounded-full px-4">
              生成
              <ArrowUp className="size-3.5" />
            </Button>
          </div>
        </form>
        <div className="mt-5 flex flex-wrap justify-center gap-2">
          {suggestions.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setValue(item)}
              className="rounded-full border border-white/12 bg-white/5 px-3 py-1 text-xs text-white/70 transition hover:bg-white/10"
            >
              {item}
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}

export { HeroAiPrompt }
