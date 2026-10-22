"use client"

// Ported from prompt-kit (MIT, (c) 2025 Julien Thibeaut) — https://github.com/ibelick/prompt-kit/blob/main/components/prompt-kit/reasoning.tsx. Modified for effect-ui.

import { ChevronDown } from "lucide-react"
import { createContext, useContext, useEffect, useRef, useState, type HTMLAttributes, type ReactNode } from "react"

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

type ReasoningContextValue = {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
}

const ReasoningContext = createContext<ReasoningContextValue | undefined>(undefined)

function useReasoningContext() {
  const context = useContext(ReasoningContext)
  if (!context) throw new Error("Reasoning 的子组件必须放在 Reasoning 里面。")
  return context
}

export interface ReasoningProps {
  children?: ReactNode
  className?: string
  open?: boolean
  onOpenChange?: (open: boolean) => void
  isStreaming?: boolean
}

export function Reasoning({ children, className, open, onOpenChange, isStreaming = false }: ReasoningProps) {
  const reduced = usePrefersReducedMotion()
  const [internalOpen, setInternalOpen] = useState(false)
  const [wasAutoOpened, setWasAutoOpened] = useState(false)
  const isControlled = open !== undefined
  const isOpen = isControlled ? open : internalOpen
  const onOpenChangeRef = useRef(onOpenChange)
  const autoOpenedRef = useRef(false)

  if (isStreaming && !wasAutoOpened) {
    setWasAutoOpened(true)
    if (!isControlled) setInternalOpen(true)
  }
  if (!isStreaming && wasAutoOpened) {
    setWasAutoOpened(false)
    if (!isControlled) setInternalOpen(false)
  }

  useEffect(() => {
    onOpenChangeRef.current = onOpenChange
  }, [onOpenChange])

  useEffect(() => {
    if (!isControlled) return
    if (isStreaming && !autoOpenedRef.current) {
      autoOpenedRef.current = true
      const timer = window.setTimeout(() => onOpenChangeRef.current?.(true), 0)
      return () => window.clearTimeout(timer)
    }
    if (!isStreaming && autoOpenedRef.current) {
      autoOpenedRef.current = false
      const timer = window.setTimeout(() => onOpenChangeRef.current?.(false), 0)
      return () => window.clearTimeout(timer)
    }
    return
  }, [isControlled, isStreaming])

  const onOpenChangeState = (next: boolean) => {
    if (!isControlled) setInternalOpen(next)
    onOpenChange?.(next)
  }

  return (
    <ReasoningContext.Provider value={{ isOpen, onOpenChange: onOpenChangeState }}>
      <div className={className} data-reduced={reduced ? "true" : "false"} data-slot="reasoning" data-state={isOpen ? "open" : "closed"}>
        {children}
      </div>
    </ReasoningContext.Provider>
  )
}

export interface ReasoningTriggerProps extends HTMLAttributes<HTMLButtonElement> {
  children?: ReactNode
}

export function ReasoningTrigger({ children, className, ...props }: ReasoningTriggerProps) {
  const reduced = usePrefersReducedMotion()
  const { isOpen, onOpenChange } = useReasoningContext()
  return (
    <button className={cn("flex cursor-pointer items-center gap-2", className)} type="button" onClick={() => onOpenChange(!isOpen)} {...props}>
      <span className="text-primary">{children}</span>
      <ChevronDown aria-hidden className={cn("size-4", isOpen && "rotate-180", reduced ? "transition-none" : "transition-transform")} />
    </button>
  )
}

export interface ReasoningContentProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode
  contentClassName?: string
}

export function ReasoningContent({ children, className, contentClassName, ...props }: ReasoningContentProps) {
  const reduced = usePrefersReducedMotion()
  const { isOpen } = useReasoningContext()
  return (
    <div className={cn("grid", reduced ? "transition-none" : "transition-[grid-template-rows] duration-150 ease-out", isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]", className)} data-slot="reasoning-content" data-state={isOpen ? "open" : "closed"} {...props}>
      <div className={cn("overflow-hidden text-muted-foreground", contentClassName)}>{children}</div>
    </div>
  )
}
