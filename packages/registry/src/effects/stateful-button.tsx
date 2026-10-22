"use client"

// Ported from Velora UI (MIT, (c) 2026 Aigars Silkalns) — https://github.com/ColorlibHQ/velora-ui/blob/main/src/components/velora/stateful-button.tsx. Modified for effect-ui.

import { useEffect, useRef, useState, type ButtonHTMLAttributes, type MouseEvent } from "react"

import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

type ButtonState = "idle" | "loading" | "success" | "error"

export interface StatefulButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "onClick"> {
  onClick?: (event: MouseEvent<HTMLButtonElement>) => unknown
  resetAfter?: number
  successText?: string
  errorText?: string
}

const layer = "relative col-start-1 row-start-1 flex items-center justify-center gap-2 transition-[opacity,scale,visibility] duration-200"
const hidden = "invisible scale-75 opacity-0"

export function StatefulButton({
  onClick,
  resetAfter = 2000,
  successText = "Done",
  errorText = "Failed",
  className,
  children,
  type = "button",
  ...props
}: StatefulButtonProps) {
  const ref = useRef<HTMLButtonElement>(null)
  const reduced = usePrefersReducedMotion()
  const motionOn = useAnimationActive(ref)
  const moving = motionOn && !reduced
  const [state, setState] = useState<ButtonState>("idle")
  const [height, setHeight] = useState(0)
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const pending = useRef(false)
  const busy = state === "loading"

  useEffect(() => () => clearTimeout(timer.current), [])

  const handleClick = async (event: MouseEvent<HTMLButtonElement>) => {
    if (pending.current) {
      event.preventDefault()
      return
    }
    const result = onClick?.(event)
    if (!(result instanceof Promise)) return
    pending.current = true
    clearTimeout(timer.current)
    setHeight(event.currentTarget.offsetHeight)
    setState("loading")
    let next: ButtonState = "success"
    try {
      await result
    } catch {
      next = "error"
    }
    pending.current = false
    setState(next)
    timer.current = setTimeout(() => setState("idle"), resetAfter)
  }

  return (
    <>
      <button
        {...props}
        ref={ref}
        type={type}
        data-slot="stateful-button"
        data-state={state}
        data-reduced={reduced ? "true" : "false"}
        data-motion={moving ? "on" : "off"}
        aria-busy={busy || undefined}
        aria-disabled={busy ? true : props["aria-disabled"]}
        onClick={handleClick}
        className={cn(
          "group/stateful-button relative inline-grid min-h-11 cursor-pointer rounded-full px-5 text-sm font-medium text-primary-foreground outline-none select-none [--surface:var(--color-primary)] disabled:cursor-not-allowed disabled:opacity-50 aria-busy:cursor-progress data-[state=error]:text-white data-[state=error]:[--surface:var(--color-destructive)]",
          className,
        )}
      >
        <style>
          {`@keyframes stateful-button-spin { to { transform: rotate(360deg); } }
[data-slot="stateful-button"][data-motion="on"] [data-part="spin"] { animation: stateful-button-spin 1s linear infinite; }`}
        </style>
        <span
          aria-hidden
          className="absolute inset-0 mx-auto rounded-[inherit] bg-(--surface) transition-[width,background-color] duration-300 ease-out group-hover/stateful-button:opacity-90 group-focus-visible/stateful-button:ring-2 group-focus-visible/stateful-button:ring-ring group-focus-visible/stateful-button:ring-offset-2 group-focus-visible/stateful-button:ring-offset-background"
          style={{ width: busy && height && moving ? height : "100%" }}
        />
        <span className={cn(layer, state !== "idle" && "scale-75 opacity-0", !moving && "transition-none")}>{children}</span>
        <span aria-hidden className={cn(layer, !busy && hidden, !moving && "transition-none")}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" data-part="spin" className="size-4">
            <circle cx="12" cy="12" r="9" opacity="0.3" />
            <path d="M21 12a9 9 0 0 0-9-9" />
          </svg>
        </span>
        <span aria-hidden className={cn(layer, state !== "success" && hidden, !moving && "transition-none")}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="size-4">
            <path
              d="m5 12.5 4.5 4.5L19 7.5"
              pathLength={1}
              strokeDasharray={1}
              strokeDashoffset={state === "success" ? 0 : 1}
              className={cn("transition-[stroke-dashoffset] delay-100 duration-300", !moving && "transition-none")}
            />
          </svg>
          {successText}
        </span>
        <span aria-hidden className={cn(layer, state !== "error" && hidden, !moving && "transition-none")}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="size-4">
            <path d="M7 7l10 10M17 7 7 17" />
          </svg>
          {errorText}
        </span>
      </button>
      <span role="status" className="sr-only">
        {state === "success" ? successText : state === "error" ? errorText : ""}
      </span>
    </>
  )
}
