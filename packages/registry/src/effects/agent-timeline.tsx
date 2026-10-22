"use client"

// Ported from GodUI (MIT, (c) 2026 Lucas Bassetti) — https://github.com/LucasBassetti/godui/blob/1f632a7/packages/lab/src/agent-timeline/agent-timeline.tsx

import { Check, ChevronRight, X } from "lucide-react"
import { AnimatePresence, motion } from "motion/react"
import { useRef, useState, type HTMLAttributes, type ReactNode } from "react"
import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"

type StepStatus = "pending" | "running" | "success" | "error"

export type AgentTimelineProps = HTMLAttributes<HTMLOListElement>

const rings: Record<StepStatus, string> = {
  pending: "border-border bg-background text-muted-foreground",
  running: "border-primary bg-primary/10 text-primary",
  success: "border-primary bg-primary text-primary-foreground",
  error: "border-destructive bg-destructive text-white",
}

const fills: Record<StepStatus, string> = {
  pending: "bg-border",
  running: "bg-gradient-to-b from-primary to-border",
  success: "bg-primary",
  error: "bg-destructive",
}

export function AgentTimeline({ className, children, ...props }: AgentTimelineProps) {
  return (
    <ol data-slot="agent-timeline" className={`flex flex-col ${className ?? ""}`} {...props}>
      {children}
    </ol>
  )
}

export function AgentStep({
  status = "pending",
  title,
  meta,
  children,
  defaultOpen = false,
  last = false,
  className,
  ...props
}: Omit<HTMLAttributes<HTMLLIElement>, "title"> & {
  status?: StepStatus
  title: ReactNode
  meta?: ReactNode
  children?: ReactNode
  defaultOpen?: boolean
  last?: boolean
}) {
  const ref = useRef<HTMLLIElement>(null)
  const reduced = usePrefersReducedMotion()
  const live = useAnimationActive(ref)
  const [open, setOpen] = useState(defaultOpen)
  const hasBody = Boolean(children)
  const spring = reduced || !live ? { duration: 0 } : { type: "spring" as const, stiffness: 320, damping: 32, mass: 0.9 }
  return (
    <li ref={ref} data-slot="agent-step" data-status={status} data-motion={live && !reduced ? "on" : "off"} className={`relative flex gap-3 pb-2 motion-reduce:transition-none ${className ?? ""}`} {...props}>
      <div className="relative flex flex-col items-center">
        <span className={`relative z-10 flex size-6 shrink-0 items-center justify-center rounded-full border ${rings[status]}`}>
          {status === "running" ? (
            <span className="size-2.5 animate-spin rounded-full border-2 border-current border-t-transparent motion-reduce:animate-none" style={{ animationPlayState: live && !reduced ? "running" : "paused" }} />
          ) : status === "success" ? (
            <Check className="size-3.5" aria-hidden="true" />
          ) : status === "error" ? (
            <X className="size-3.5" aria-hidden="true" />
          ) : (
            <span className="size-1.5 rounded-full bg-current" />
          )}
        </span>
        {last ? null : (
          <span className="relative my-1 w-px flex-1 overflow-hidden rounded bg-border">
            <motion.span
              initial={false}
              animate={{ scaleY: status === "success" || status === "error" ? 1 : status === "running" ? 0.5 : 0 }}
              transition={spring}
              className={`absolute inset-0 origin-top ${fills[status]}`}
            />
          </span>
        )}
      </div>
      <div className="min-w-0 flex-1 pb-2">
        <button
          type="button"
          disabled={!hasBody}
          aria-expanded={hasBody ? open : undefined}
          onClick={() => {
            if (hasBody) setOpen((value) => !value)
          }}
          className={`flex w-full items-center gap-2 rounded-md py-0.5 text-left ${hasBody ? "cursor-pointer active:opacity-80" : "cursor-default"}`}
        >
          <span className={`truncate text-sm font-medium ${status === "error" ? "text-destructive" : "text-foreground"}`}>{title}</span>
          {meta ? <span className="shrink-0 text-xs tabular-nums text-muted-foreground">{meta}</span> : null}
          {hasBody ? <ChevronRight className={`ml-auto size-4 shrink-0 text-muted-foreground motion-reduce:transition-none ${open ? "rotate-90" : ""}`} aria-hidden="true" /> : null}
        </button>
        <AnimatePresence initial={false}>
          {hasBody && open ? (
            <motion.div key="body" initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={spring} className="overflow-hidden">
              <div className="mt-1.5 rounded-lg border border-border bg-muted/40 p-3 text-xs leading-5 text-muted-foreground">{children}</div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </li>
  )
}
