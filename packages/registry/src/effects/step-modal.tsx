"use client"

// Ported from Meraki UI (MIT, (c) 2021 Khatab Wedaa) — https://github.com/merakiuilabs/merakiui/blob/main/components/modals/Steps.html. Modified for effect-ui.

import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react"
import { AnimatePresence, motion } from "motion/react"

import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export interface ModalStep {
  title: string
  body: string
  imageUrl?: string
  imageAlt?: string
}

export interface StepModalProps {
  steps: ModalStep[]
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  onComplete?: () => void
  submitLabel?: string
  className?: string
}

export function StepModal({
  steps,
  open,
  defaultOpen = false,
  onOpenChange,
  onComplete,
  submitLabel = "完成",
  className,
}: StepModalProps) {
  const ref = useRef<HTMLDivElement>(null)
  const dialogRef = useRef<HTMLDivElement>(null)
  const reduced = usePrefersReducedMotion()
  const motionOn = useAnimationActive(ref)
  const [uncontrolled, setUncontrolled] = useState(defaultOpen)
  const [index, setIndex] = useState(0)
  const shown = open ?? uncontrolled
  const titleId = useId()
  const step = steps[index] ?? steps[0]
  const last = index >= steps.length - 1
  const moving = motionOn && !reduced

  useEffect(() => {
    if (!shown) return
    const node = dialogRef.current?.querySelector<HTMLElement>("button, [href], input")
    node?.focus()
  }, [shown, index])

  function close() {
    if (open === undefined) setUncontrolled(false)
    onOpenChange?.(false)
  }

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "Escape") {
      event.preventDefault()
      close()
      return
    }
    if (event.key !== "Tab") return
    const root = dialogRef.current
    if (!root) return
    const nodes = [...root.querySelectorAll<HTMLElement>("button, a[href], input, [tabindex]:not([tabindex='-1'])")].filter(
      (node) => !node.hasAttribute("disabled"),
    )
    const first = nodes[0]
    const end = nodes[nodes.length - 1]
    if (!first || !end) return
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault()
      end.focus()
    } else if (!event.shiftKey && document.activeElement === end) {
      event.preventDefault()
      first.focus()
    }
  }

  return (
    <div className={className} data-motion={moving ? "on" : "off"} data-reduced={reduced ? "true" : "false"} data-slot="step-modal" ref={ref}>
      <AnimatePresence>
        {shown && step ? (
          <motion.div
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            exit={{ opacity: 0 }}
            initial={{ opacity: reduced ? 1 : 0 }}
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) close()
            }}
            transition={{ duration: reduced ? 0 : 0.18 }}
          >
            <div
              aria-labelledby={titleId}
              aria-modal="true"
              className="w-full max-w-lg overflow-hidden rounded-2xl bg-card text-foreground shadow-xl"
              onKeyDown={onKeyDown}
              ref={dialogRef}
              role="dialog"
            >
              {step.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element -- registry 组件用 img，不引入 next/image
                <img alt={step.imageAlt ?? ""} className="h-44 w-full object-cover" src={step.imageUrl} />
              ) : null}
              <div className="p-6">
                <h2 className="text-xl font-semibold" id={titleId} tabIndex={-1}>
                  {step.title}
                </h2>
                <p className="mt-3 text-sm text-muted-foreground">{step.body}</p>
                <div className="mt-5 flex gap-2">
                  {steps.map((item, dot) => (
                    <span className={cn("size-2 rounded-full", dot === index ? "bg-primary" : "bg-muted")} key={item.title} />
                  ))}
                </div>
                <div className="mt-6 flex items-center justify-between gap-3">
                  <button className="text-sm text-muted-foreground" onClick={close} type="button">
                    跳过
                  </button>
                  <div className="flex gap-2">
                    <button className="rounded-lg border border-border px-4 py-2 text-sm" disabled={index === 0} onClick={() => setIndex((value) => Math.max(0, value - 1))} type="button">
                      上一步
                    </button>
                    {last ? (
                      <button
                        className="rounded-lg bg-primary px-4 py-2 text-sm text-primary-foreground"
                        onClick={() => {
                          onComplete?.()
                          close()
                        }}
                        type="button"
                      >
                        {submitLabel}
                      </button>
                    ) : (
                      <button className="rounded-lg bg-primary px-4 py-2 text-sm text-primary-foreground" onClick={() => setIndex((value) => Math.min(steps.length - 1, value + 1))} type="button">
                        下一步
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  )
}
