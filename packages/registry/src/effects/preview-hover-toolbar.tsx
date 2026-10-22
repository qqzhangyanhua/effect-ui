"use client"

// Ported from MicroKit (MIT, (c) 2026 Henrique Barone) — https://github.com/henriquegpb/microkit/blob/fd993e8/registry/microkit/preview-hover-toolbar.tsx

import { useRef, useState } from "react"
import { Expand, MoreHorizontal, Split } from "lucide-react"

import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export interface PreviewHoverToolbarProps {
  className?: string
}

const actions = [
  { id: "view", label: "View All", icon: Expand },
  { id: "branch", label: "Branch", icon: Split },
  { id: "more", label: "More", icon: MoreHorizontal },
]

export function PreviewHoverToolbar({ className }: PreviewHoverToolbarProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const reduced = usePrefersReducedMotion()
  const live = useAnimationActive(rootRef)
  const [open, setOpen] = useState(false)

  return (
    <div
      ref={rootRef}
      data-slot="preview-hover-toolbar"
      data-motion={live && !reduced ? "on" : "off"}
      className={cn("flex min-h-36 w-full flex-col items-center justify-center gap-3 text-[11px] text-foreground", className)}
    >
      <button
        type="button"
        aria-pressed={open}
        className="rounded-full border border-border bg-card px-3 py-1 text-xs text-foreground hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        onClick={() => setOpen((value) => !value)}
      >
        Show preview actions
      </button>
      <div
        data-open={open ? "true" : "false"}
        className="flex h-9 items-end"
        onPointerEnter={(event) => {
          if (event.pointerType === "mouse") setOpen(true)
        }}
        onPointerLeave={(event) => {
          if (event.pointerType !== "mouse") return
          const root = rootRef.current
          if (root && event.relatedTarget instanceof Node && root.contains(event.relatedTarget)) return
          if (root?.contains(document.activeElement)) return
          setOpen(false)
        }}
        onPointerDown={(event) => {
          if (event.pointerType === "mouse") return
          const target = event.target
          if (target instanceof Element && target.closest("[data-preview-action]")) return
          setOpen((value) => !value)
        }}
      >
        <div
          className={cn(
            "relative flex items-center justify-center rounded-full border border-border bg-card/80 motion-reduce:transition-none",
            open ? "h-9 w-28 border-border bg-card" : "h-4 w-11",
          )}
          style={{ transition: reduced || !live ? "none" : "width 170ms cubic-bezier(.34,.8,.5,1), height 170ms cubic-bezier(.34,.8,.5,1)" }}
        >
          <div role="toolbar" aria-label="Preview actions" className="flex items-center gap-1">
            {actions.map((action) => (
              <button
                key={action.id}
                type="button"
                data-preview-action=""
                aria-label={action.label}
                className={cn(
                  "grid size-7 place-items-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline focus-visible:outline-ring motion-reduce:transition-none",
                  open ? "pointer-events-auto scale-100 opacity-100" : "pointer-events-none scale-50 opacity-0",
                )}
              >
                <action.icon size={15} strokeWidth={1.8} aria-hidden="true" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
