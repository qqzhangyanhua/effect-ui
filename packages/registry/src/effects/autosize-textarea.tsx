"use client"

// Ported from shadcn-ui-expansions (MIT, (c) 2024 shadcnui-expansions) — https://github.com/hsuanyi-chou/shadcn-ui-expansions/blob/main/components/ui/autosize-textarea.tsx

import { cn } from "@/lib/utils"

import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react"

interface UseAutosizeTextAreaProps {
  textAreaRef: React.RefObject<HTMLTextAreaElement | null>
  minHeight?: number
  maxHeight?: number
  triggerAutoSize: string
}

export function useAutosizeTextArea({
  textAreaRef,
  triggerAutoSize,
  maxHeight = Number.MAX_SAFE_INTEGER,
  minHeight = 0,
}: UseAutosizeTextAreaProps) {
  const [init, setInit] = useState(true)

  useEffect(() => {
    const offsetBorder = 6
    const textAreaElement = textAreaRef.current
    if (!textAreaElement) return
    if (init) {
      textAreaElement.style.minHeight = `${minHeight + offsetBorder}px`
      if (maxHeight > minHeight) textAreaElement.style.maxHeight = `${maxHeight}px`
      queueMicrotask(() => setInit(false))
    }
    textAreaElement.style.height = `${minHeight + offsetBorder}px`
    const scrollHeight = textAreaElement.scrollHeight
    textAreaElement.style.height = `${scrollHeight > maxHeight ? maxHeight : scrollHeight + offsetBorder}px`
  }, [init, maxHeight, minHeight, textAreaRef, triggerAutoSize])
}

export interface AutosizeTextAreaRef {
  textArea: HTMLTextAreaElement
  maxHeight: number
  minHeight: number
  focus: () => void
}

export interface AutosizeTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  maxHeight?: number
  minHeight?: number
}

export const AutosizeTextarea = forwardRef<AutosizeTextAreaRef, AutosizeTextareaProps>(function AutosizeTextarea(
  { maxHeight = Number.MAX_SAFE_INTEGER, minHeight = 52, className, onChange, value, defaultValue, ...props },
  ref,
) {
  const textAreaRef = useRef<HTMLTextAreaElement | null>(null)
  const [triggerAutoSize, setTriggerAutoSize] = useState("")

  useAutosizeTextArea({
    textAreaRef,
    triggerAutoSize,
    maxHeight,
    minHeight,
  })

  useImperativeHandle(ref, () => ({
    textArea: textAreaRef.current as HTMLTextAreaElement,
    focus: () => textAreaRef.current?.focus(),
    maxHeight,
    minHeight,
  }))

  useEffect(() => {
    const next = value == null ? (defaultValue == null ? "" : String(defaultValue)) : String(value)
    queueMicrotask(() => setTriggerAutoSize(next))
  }, [defaultValue, value])

  return (
    <textarea
      {...props}
      className={cn(
        "border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      data-slot="autosize-textarea"
      onChange={(event) => {
        setTriggerAutoSize(event.target.value)
        onChange?.(event)
      }}
      ref={textAreaRef}
      {...(value == null ? { defaultValue } : { value })}
    />
  )
})
