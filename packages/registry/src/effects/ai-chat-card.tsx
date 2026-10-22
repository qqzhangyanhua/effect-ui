"use client"

// Ported from Spectrum UI (Apache-2.0, (c) Spectrum UI / arihantcodes) — https://github.com/arihantcodes/spectrum-ui/blob/main/app/registry/ai-chat-card/ai-chat-card.tsx. Modified for effect-ui.

import { ArrowUp, MessageCircleDashed, Plus, RefreshCw } from "lucide-react"
import { motion } from "motion/react"
import { useRef, useState, type ReactNode } from "react"

import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { useTypewriter } from "@/hooks/use-typewriter"
import { cn } from "@/lib/utils"

export interface AIChatCardProps {
  title?: string
  subtitle?: string
  greeting?: string
  prompt?: string
  prompts?: readonly string[]
  autoType?: boolean
  placeholder?: string
  icon?: ReactNode
  onSend?: (message: string) => void
  onReset?: () => void
  onAttach?: () => void
  className?: string
}

const CSS = `
[data-slot="ai-chat-card"] .caret{display:inline-block;width:1px;height:0.875rem;margin-left:1px;background:var(--foreground);animation:ai-chat-caret 1s steps(2) infinite}
[data-slot="ai-chat-card"][data-motion="off"] .caret,[data-slot="ai-chat-card"][data-reduced="true"] .icon{animation:none}
@keyframes ai-chat-caret{0%,50%{opacity:1}50.01%,100%{opacity:0}}
@keyframes ai-chat-float{0%,100%{transform:translateY(0)}50%{transform:translateY(-3px)}}
`

export function AIChatCard({
  title = "新对话",
  subtitle = "今天需要什么帮助？",
  greeting = "",
  prompt = "",
  prompts = [],
  autoType = true,
  placeholder = "问点什么",
  icon,
  onSend,
  onReset,
  onAttach,
  className,
}: AIChatCardProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const reduced = usePrefersReducedMotion()
  const active = useAnimationActive(rootRef)
  const [userActive, setUserActive] = useState(false)
  const [userMessage, setUserMessage] = useState("")
  const [spins, setSpins] = useState(0)
  const { text: typedMessage, phase } = useTypewriter(prompts, { typeMs: 48, deleteMs: 14, holdMs: 3400, gapMs: 900, enabled: autoType && active && !userActive })
  const message = userActive || !autoType ? userMessage : typedMessage
  const motionOn = !reduced && active

  const takeOver = () => {
    if (userActive || !autoType) return
    setUserMessage(typedMessage)
    setUserActive(true)
    window.requestAnimationFrame(() => textareaRef.current?.focus())
  }

  return (
    <div ref={rootRef} className={cn("flex w-full flex-col rounded-3xl border bg-card text-card-foreground shadow-sm", className)} data-motion={motionOn ? "on" : "off"} data-reduced={reduced ? "true" : "false"} data-slot="ai-chat-card">
      <style>{CSS}</style>
      <div className="flex items-start justify-between gap-4 border-b px-5 py-4">
        <div>
          <h3 className="text-base font-medium">{title}</h3>
          <p className="mt-0.5 text-sm text-muted-foreground">{subtitle}</p>
        </div>
        <button
          aria-label="重置对话"
          className="flex size-[30px] items-center justify-center rounded-2xl border text-muted-foreground"
          type="button"
          onClick={() => {
            setSpins((count) => count + 1)
            setUserActive(false)
            setUserMessage("")
            onReset?.()
          }}
        >
          <motion.span animate={{ rotate: spins * 360 }} className="flex" transition={{ duration: reduced ? 0 : 0.7 }}>
            <RefreshCw className="size-4" />
          </motion.span>
        </button>
      </div>
      <div className="flex flex-1 flex-col items-center px-8 py-10 text-center">
        <div className="icon flex size-10 items-center justify-center rounded-2xl bg-muted" style={motionOn ? { animation: "ai-chat-float 3s ease-in-out infinite" } : undefined}>
          {icon ?? <MessageCircleDashed className="size-5" />}
        </div>
        {greeting ? <p className="mt-4 text-lg font-medium">{greeting}</p> : null}
        {prompt ? <p className="mt-1.5 max-w-[16rem] text-sm text-muted-foreground">{prompt}</p> : null}
      </div>
      <div className="px-5 pb-5">
        <div className="rounded-2xl bg-muted p-3">
          {userActive || !autoType ? (
            <textarea ref={textareaRef} className="w-full resize-none bg-transparent text-sm outline-hidden" placeholder={placeholder} rows={2} value={userMessage} onChange={(event) => setUserMessage(event.target.value)} />
          ) : (
            <div className="min-h-10 w-full cursor-text text-left text-sm" onClick={takeOver}>
              {message}
              <span aria-hidden className="caret" />
              {message ? null : <span className="text-muted-foreground">{placeholder}</span>}
            </div>
          )}
          <div className="mt-2 flex items-center justify-between">
            <button aria-label="添加附件" className="flex size-[30px] items-center justify-center rounded-2xl border bg-card" type="button" onClick={onAttach}>
              <Plus className="size-4" />
            </button>
            <button
              aria-label="发送"
              className="flex size-[30px] items-center justify-center rounded-2xl bg-primary text-primary-foreground"
              type="button"
              onClick={() => onSend?.(message)}
              style={phase === "holding" && !userActive && motionOn ? { animation: "ai-chat-float .5s ease-in-out" } : undefined}
            >
              <ArrowUp className="size-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
