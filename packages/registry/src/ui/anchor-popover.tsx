"use client"

import * as React from "react"

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export interface AnchorPopoverProps {
  label?: string
  content?: string
  className?: string
}

function place(anchor: HTMLElement, popover: HTMLElement) {
  const box = anchor.getBoundingClientRect()
  const width = popover.offsetWidth
  const height = popover.offsetHeight
  let top = box.bottom + 8
  let left = box.left
  if (top + height > window.innerHeight - 8) top = Math.max(8, box.top - height - 8)
  if (left + width > window.innerWidth - 8) left = window.innerWidth - width - 8
  popover.style.top = `${top}px`
  popover.style.left = `${Math.max(8, left)}px`
}

function AnchorPopover({
  label = "打开说明",
  content = "优先用 CSS anchor 定位，不够放就翻到另一侧。",
  className,
}: AnchorPopoverProps) {
  const reduced = usePrefersReducedMotion()
  const reactId = React.useId().replace(/:/g, "")
  const anchorName = `--pop${reactId}`
  const popoverId = `pop-${reactId}`
  const buttonRef = React.useRef<HTMLButtonElement>(null)
  const popoverRef = React.useRef<HTMLDivElement>(null)
  const mode = React.useSyncExternalStore(
    () => () => {},
    () =>
      CSS.supports("anchor-name", "--a") && "popover" in HTMLElement.prototype ? "anchor" : "js",
    () => "js" as const,
  )
  const [open, setOpen] = React.useState(false)

  React.useEffect(() => {
    if (mode !== "js" || !open) return
    const anchor = buttonRef.current
    const popover = popoverRef.current
    if (!anchor || !popover) return
    place(anchor, popover)
    const close = (event: PointerEvent) => {
      const target = event.target
      if (!(target instanceof Node)) return
      if (anchor.contains(target) || popover.contains(target)) return
      setOpen(false)
    }
    window.addEventListener("pointerdown", close)
    return () => window.removeEventListener("pointerdown", close)
  }, [mode, open])

  return (
    <div className={cn("rounded-2xl border bg-background p-6", className)}>
      {mode === "anchor" ? (
        <style>
          {`#btn-${reactId}{anchor-name:${anchorName}}
            #${popoverId}{position-anchor:${anchorName};position-area:block-end;position-try-fallbacks:flip-block,flip-inline;margin:8px 0 0;inset:auto;}`}
        </style>
      ) : null}
      <button
        ref={buttonRef}
        id={`btn-${reactId}`}
        type="button"
        className="rounded-full border px-4 py-2 text-sm"
        popoverTarget={mode === "anchor" ? popoverId : undefined}
        onClick={() => {
          if (mode === "js") setOpen((value) => !value)
        }}
      >
        {label}
      </button>
      <div
        ref={popoverRef}
        id={popoverId}
        popover={mode === "anchor" ? "auto" : undefined}
        className={cn(
          "z-20 max-w-xs rounded-xl border bg-popover p-4 text-sm text-popover-foreground shadow-lg",
          mode === "js" && "fixed",
          mode === "js" && !open && "hidden",
        )}
        style={{ transition: reduced ? "none" : undefined }}
      >
        {content}
      </div>
    </div>
  )
}

export { AnchorPopover }
