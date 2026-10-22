"use client"

// Ported from HextaUI (MIT, (c) 2026 Preet Suthar) — https://github.com/preetsuthar17/HextaUI/blob/main/hooks/use-invalid-shake.ts

import { useId, useRef, useState, type FormEvent } from "react"

import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export interface InvalidShakeProps {
  color?: string
  duration?: number
  intensity?: number
  label?: string
  placeholder?: string
  submitLabel?: string
  errorLabel?: string
  successLabel?: string
  className?: string
}

function cssName(id: string) {
  return `shake-${id.replace(/[^a-zA-Z0-9_-]/g, "")}`
}

function playShake(node: HTMLElement, animation: string, duration: number) {
  node.style.animation = "none"
  void node.offsetWidth
  node.style.animation = `${animation} ${Math.max(0, duration)}ms ease-in-out`
}

export function InvalidShake({
  color = "var(--destructive)",
  duration = 420,
  intensity = 8,
  label = "Email",
  placeholder = "name@example.com",
  submitLabel = "Submit",
  errorLabel = "Enter a valid email.",
  successLabel = "Address saved.",
  className,
}: InvalidShakeProps) {
  const rootRef = useRef<HTMLFormElement>(null)
  const fieldRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const live = useAnimationActive(rootRef)
  const reduced = usePrefersReducedMotion()
  const animation = cssName(useId())
  const [invalid, setInvalid] = useState(false)
  const [done, setDone] = useState(false)
  const distance = `${intensity}px`

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const value = inputRef.current?.value.trim() ?? ""
    const ok = value.includes("@") && value.includes(".")
    setDone(ok)
    setInvalid(!ok)
    const field = fieldRef.current
    if (!field) return
    if (!ok && live && !reduced) playShake(field, animation, duration)
    else field.style.animation = "none"
  }

  return (
    <form ref={rootRef} noValidate onSubmit={onSubmit} className={cn("flex w-full max-w-sm flex-col gap-3", className)}>
      <style>
        {`@keyframes ${animation} {
          20% { transform: translateX(calc(var(--shake) * -1)); }
          40% { transform: translateX(var(--shake)); }
          60% { transform: translateX(calc(var(--shake) * -0.6)); }
          80% { transform: translateX(calc(var(--shake) * 0.4)); }
          100% { transform: none; }
        }`}
      </style>
      <label className="text-sm font-medium text-foreground" htmlFor={`${animation}-email`}>
        {label}
      </label>
      <div
        ref={fieldRef}
        className="motion-reduce:[animation:none]"
        style={{ ["--shake" as string]: distance }}
      >
        <input
          ref={inputRef}
          id={`${animation}-email`}
          type="email"
          placeholder={placeholder}
          aria-invalid={invalid || undefined}
          className="w-full rounded-md border bg-background px-3 py-2 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
          style={{ borderColor: invalid ? color : "var(--border)" }}
        />
      </div>
      <button type="submit" className="h-9 rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground">
        {submitLabel}
      </button>
      <p role="status" className="min-h-5 text-sm" style={{ color: invalid ? color : "var(--muted-foreground)" }}>
        {invalid ? errorLabel : done ? successLabel : ""}
      </p>
    </form>
  )
}
