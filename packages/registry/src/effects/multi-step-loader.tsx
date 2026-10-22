"use client"

// Ported from Velora UI (MIT, (c) 2026 Aigars Silkalns) — https://github.com/ColorlibHQ/velora-ui/blob/main/src/components/velora/multi-step-loader.tsx. Modified for effect-ui.

import { useEffect, useId, useLayoutEffect, useRef, useState, type DialogHTMLAttributes } from "react"

import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export interface MultiStepLoaderProps extends Omit<DialogHTMLAttributes<HTMLDialogElement>, "title" | "open" | "onClose"> {
  loading: boolean
  steps: readonly { text: string }[]
  current?: number
  duration?: number
  loop?: boolean
  title?: string
  onComplete?: () => void
  onClose?: () => void
}

export function MultiStepLoader({
  loading,
  steps,
  current,
  duration = 1600,
  loop = false,
  title,
  onComplete,
  onClose,
  className,
  ...props
}: MultiStepLoaderProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const listRef = useRef<HTMLOListElement>(null)
  const closing = useRef(false)
  const titleId = useId()
  const reduced = usePrefersReducedMotion()
  const motionOn = useAnimationActive(dialogRef)
  const moving = motionOn && !reduced
  const [auto, setAuto] = useState(0)
  const [wasLoading, setWasLoading] = useState(loading)
  const [paused, setPaused] = useState(false)
  const completeRef = useRef(onComplete)

  useEffect(() => {
    completeRef.current = onComplete
  })

  if (loading !== wasLoading) {
    setWasLoading(loading)
    if (loading) setAuto(0)
  }

  const total = steps.length
  const index = total === 0 ? 0 : Math.min(Math.max(current ?? auto, 0), total)
  const active = Math.min(index, Math.max(total - 1, 0))
  const status =
    total === 0 ? "" : index >= total ? `全部 ${total} 步已完成` : `第 ${index + 1} 步，共 ${total} 步：${steps[index]?.text ?? ""}`

  useLayoutEffect(() => {
    const dialog = dialogRef.current
    if (!dialog || !loading) return
    const trigger = document.activeElement instanceof HTMLElement ? document.activeElement : null
    const overflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    if (!dialog.open) {
      if (typeof dialog.showModal === "function") {
        try {
          dialog.showModal()
        } catch (error) {
          dialog.setAttribute("data-modal-error", error instanceof Error ? error.message : "showModal failed")
          dialog.setAttribute("open", "")
        }
      }
      if (!dialog.open) dialog.setAttribute("open", "")
    }
    dialog.focus()
    return () => {
      closing.current = true
      if (typeof dialog.close === "function" && dialog.open) {
        const stop = (event: Event) => {
          event.stopImmediatePropagation()
          dialog.removeEventListener("close", stop, true)
        }
        dialog.addEventListener("close", stop, true)
        dialog.close()
      }
      closing.current = false
      document.body.style.overflow = overflow
      trigger?.focus()
    }
  }, [loading])

  useEffect(() => {
    if (!loading || !motionOn || current !== undefined || (loop && paused)) return
    const done = auto >= total
    const timer = window.setTimeout(() => {
      if (done) completeRef.current?.()
      else setAuto((value) => (loop ? (value + 1) % Math.max(total, 1) : value + 1))
    }, duration)
    return () => window.clearTimeout(timer)
  }, [auto, current, duration, loading, loop, motionOn, paused, total])

  useLayoutEffect(() => {
    const list = listRef.current
    const row = list?.children[active]
    if (!list || !(row instanceof HTMLElement) || !loading) return
    list.style.transform = `translateY(${-(row.offsetTop + row.offsetHeight / 2)}px)`
  }, [active, loading, moving])

  return (
    <dialog
      ref={dialogRef}
      tabIndex={-1}
      aria-labelledby={title ? titleId : undefined}
      aria-label={title ? undefined : "进度"}
      {...props}
      data-slot="multi-step-loader"
      data-loading={loading ? "true" : "false"}
      data-reduced={reduced ? "true" : "false"}
      data-motion={moving ? "on" : "off"}
      onCancel={(event) => {
        event.preventDefault()
        onClose?.()
        props.onCancel?.(event)
      }}
      onClose={(event) => {
        if (closing.current || !loading) return
        if (onClose) onClose()
        else if (typeof event.currentTarget.showModal === "function") event.currentTarget.showModal()
      }}
      onMouseEnter={(event) => {
        setPaused(true)
        props.onMouseEnter?.(event)
      }}
      onMouseLeave={(event) => {
        setPaused(false)
        props.onMouseLeave?.(event)
      }}
      onFocus={(event) => {
        if (event.target !== event.currentTarget) setPaused(true)
        props.onFocus?.(event)
      }}
      onBlur={(event) => {
        setPaused(false)
        props.onBlur?.(event)
      }}
      className={cn(
        "fixed inset-0 m-0 h-dvh max-h-none w-full max-w-none place-items-center border-0 bg-background/80 p-6 text-foreground opacity-0 outline-none backdrop-blur-md backdrop:bg-transparent open:grid open:opacity-100 motion-reduce:transition-none",
        className,
      )}
    >
      <style>
        {`@keyframes multi-step-loader-spin { to { transform: rotate(360deg); } }
[data-slot="multi-step-loader"][open] { display: grid; opacity: 1; }
[data-slot="multi-step-loader"][data-motion="on"] [data-part="spin"] { animation: multi-step-loader-spin 1s linear infinite; }`}
      </style>
      {onClose ? (
        <button
          type="button"
          onClick={onClose}
          aria-label="关闭"
          className="absolute top-4 right-4 grid size-11 cursor-pointer place-items-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
        >
          <svg aria-hidden viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="size-5">
            <path d="M6 6l12 12M18 6 6 18" />
          </svg>
        </button>
      ) : null}
      <div className="w-full max-w-sm">
        {title ? (
          <h2 id={titleId} className="mb-2 text-center text-lg font-semibold">
            {title}
          </h2>
        ) : null}
        <div className="relative h-72 overflow-hidden [mask-image:linear-gradient(transparent,black_35%,black_65%,transparent)]">
          <ol ref={listRef} className="absolute inset-x-0 top-1/2">
            {steps.map((step, stepIndex) => {
              const done = stepIndex < index
              const now = stepIndex === index
              return (
                <li
                  key={stepIndex}
                  aria-current={now ? "step" : undefined}
                  className={cn("flex items-center gap-3 py-2.5", now ? "font-medium" : "text-muted-foreground", !done && !now && "opacity-50")}
                >
                  <span
                    className={cn(
                      "grid size-6 shrink-0 place-items-center rounded-full",
                      done ? "bg-primary text-primary-foreground" : now ? "text-primary" : "border-2 border-current",
                    )}
                  >
                    {done || now ? (
                      <svg
                        aria-hidden
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        data-part={now ? "spin" : undefined}
                        className={done ? "size-3.5" : "size-6"}
                      >
                        {done ? (
                          <path d="m5 12.5 4.5 4.5L19 7.5" />
                        ) : (
                          <>
                            <circle cx="12" cy="12" r="9.5" opacity="0.25" />
                            <path d="M21.5 12A9.5 9.5 0 0 0 12 2.5" />
                          </>
                        )}
                      </svg>
                    ) : null}
                  </span>
                  {step.text}
                  {done ? <span className="sr-only">（完成）</span> : null}
                </li>
              )
            })}
          </ol>
        </div>
        <div aria-hidden className="mt-4 h-1 overflow-hidden rounded-full bg-muted">
          <div className="h-full rounded-full bg-primary" style={{ width: `${(index / Math.max(total, 1)) * 100}%` }} />
        </div>
        <p role="status" aria-live="polite" className="sr-only">
          {loading ? status : ""}
        </p>
      </div>
    </dialog>
  )
}
