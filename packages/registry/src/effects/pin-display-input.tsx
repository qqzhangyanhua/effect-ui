"use client"

// Ported from Uiverse galaxy（MIT，(c) 2023 Uiverse.io, author barisdogansutcu）— https://github.com/uiverse-io/galaxy/blob/main/Inputs/barisdogansutcu_gentle-pig-32.html

import { useControllableState } from "@/hooks/use-controllable-state"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

import { useRef, type ClipboardEvent, type HTMLAttributes, type KeyboardEvent } from "react"

export interface PinDisplayInputProps extends HTMLAttributes<HTMLDivElement> {
  length?: number
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  mask?: boolean
}

export function PinDisplayInput({
  length = 6,
  value,
  defaultValue = "",
  onValueChange,
  mask = false,
  className,
  ...props
}: PinDisplayInputProps) {
  const prefersReducedMotion = usePrefersReducedMotion()
  const count = Math.max(1, Math.round(length))
  const [current, setCurrent] = useControllableState({
    value,
    defaultValue,
    onChange: onValueChange,
  })
  const refs = useRef<Array<HTMLInputElement | null>>([])
  const digits = current.replace(/\D/g, "").slice(0, count)

  function focusAt(index: number) {
    const field = refs.current[index]
    field?.focus()
    field?.select()
  }

  function writeDigit(index: number, digit: string) {
    const chars = digits.split("")
    if (index > chars.length) chars.push(digit)
    else chars[index] = digit
    setCurrent(chars.join("").replace(/\D/g, "").slice(0, count))
    focusAt(Math.min(index + 1, count - 1))
  }

  function pasteAt(index: number, text: string) {
    const incoming = text.replace(/\D/g, "")
    if (!incoming) return
    const chars = digits.split("")
    let cursor = index
    for (const digit of incoming) {
      if (cursor >= count) break
      chars[cursor] = digit
      cursor += 1
    }
    setCurrent(chars.join("").replace(/\D/g, "").slice(0, count))
    focusAt(Math.min(cursor, count - 1))
  }

  function backspace(index: number) {
    const chars = digits.split("")
    if (chars[index]) {
      chars.splice(index, 1)
      setCurrent(chars.join(""))
      return
    }
    if (index === 0) return
    chars.splice(index - 1, 1)
    setCurrent(chars.join(""))
    focusAt(index - 1)
  }

  function onKeyDown(index: number, event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Backspace") {
      event.preventDefault()
      backspace(index)
      return
    }
    if (event.key === "ArrowLeft" && index > 0) {
      event.preventDefault()
      focusAt(index - 1)
    }
    if (event.key === "ArrowRight" && index < count - 1) {
      event.preventDefault()
      focusAt(index + 1)
    }
  }

  function onPaste(index: number, event: ClipboardEvent<HTMLInputElement>) {
    event.preventDefault()
    pasteAt(index, event.clipboardData.getData("text"))
  }

  return (
    <div
      {...props}
      aria-label={props["aria-label"] ?? "验证码"}
      className={cn("inline-flex items-center gap-2.5", className)}
      data-mask={mask ? "true" : "false"}
      data-reduced={prefersReducedMotion ? "true" : "false"}
      data-slot="pin-display-input"
      role="group"
    >
      {mask ? (
        <style>{`[data-slot="pin-display-input"][data-mask="true"] input { -webkit-text-security: disc; }`}</style>
      ) : null}
      {Array.from({ length: count }, (_, index) => (
        <input
          key={index}
          ref={(node) => {
            refs.current[index] = node
          }}
          aria-label={`第 ${index + 1} 位`}
          autoComplete={index === 0 ? "one-time-code" : "off"}
          className="h-10 w-[30px] border-0 border-b-2 border-primary bg-transparent text-center text-xl text-foreground outline-none focus-visible:border-foreground"
          inputMode="numeric"
          maxLength={1}
          type="text"
          value={digits.charAt(index)}
          onChange={(event) => {
            const digit = event.target.value.replace(/\D/g, "").slice(-1)
            if (!digit) {
              if (event.target.value === "") backspace(index)
              return
            }
            writeDigit(index, digit)
          }}
          onFocus={(event) => event.currentTarget.select()}
          onKeyDown={(event) => onKeyDown(index, event)}
          onPaste={(event) => onPaste(index, event)}
        />
      ))}
    </div>
  )
}
