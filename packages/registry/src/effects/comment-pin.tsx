"use client"

// Ported from GodUI (MIT, (c) 2026 Lucas Bassetti) — https://github.com/LucasBassetti/godui/blob/1f632a7/packages/lab/src/comment-pin/comment-pin.tsx

import { Send } from "lucide-react"
import { AnimatePresence, motion } from "motion/react"
import { useRef, useState, type HTMLAttributes, type ReactNode } from "react"
import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"

const presenceColors = ["var(--destructive)", "var(--chart-4)", "var(--chart-2)", "var(--chart-3)", "var(--chart-1)", "var(--chart-5)", "var(--primary)", "var(--accent)"] as const

function presenceColor(key: string) {
  let hash = 0
  for (let index = 0; index < key.length; index += 1) {
    hash = (hash << 5) - hash + key.charCodeAt(index)
    hash |= 0
  }
  return presenceColors[Math.abs(hash) % presenceColors.length] ?? "var(--primary)"
}

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  const first = parts[0]
  if (!first) return "?"
  if (parts.length === 1) return first.slice(0, 2).toUpperCase()
  const last = parts[parts.length - 1]
  return `${first[0] ?? ""}${last?.[0] ?? ""}`.toUpperCase()
}

export type CommentPinComment = {
  id: string
  author: string
  avatar?: string
  body: string
  time?: string
}

export type CommentPinProps = Omit<HTMLAttributes<HTMLDivElement>, "onSubmit" | "color"> & {
  x: number
  y: number
  comments?: CommentPinComment[]
  label?: ReactNode
  color?: string
  resolved?: boolean
  defaultOpen?: boolean
  open?: boolean
  onOpenChange?: (open: boolean) => void
  onReply?: (text: string) => void
}

export function CommentPin({
  x,
  y,
  comments = [],
  label,
  color,
  resolved = false,
  defaultOpen = false,
  open: controlledOpen,
  onOpenChange,
  onReply,
  className,
  style,
  ...props
}: CommentPinProps) {
  const ref = useRef<HTMLDivElement>(null)
  const reduced = usePrefersReducedMotion()
  const live = useAnimationActive(ref)
  const controlled = controlledOpen !== undefined
  const [internalOpen, setInternalOpen] = useState(defaultOpen)
  const open = controlled ? controlledOpen : internalOpen
  const [reply, setReply] = useState("")
  const author = comments[0]?.author
  const pinColor = color ?? presenceColor(author ?? `${x},${y}`)
  const face = label ?? (author ? initials(author) : null)
  const spring = reduced || !live ? { duration: 0 } : { type: "spring" as const, stiffness: 320, damping: 32, mass: 0.9 }

  const setOpen = (next: boolean) => {
    if (!controlled) setInternalOpen(next)
    onOpenChange?.(next)
  }

  return (
    <div ref={ref} data-slot="comment-pin" data-open={open ? "" : undefined} data-motion={live && !reduced ? "on" : "off"} className={`absolute z-20 motion-reduce:transition-none ${className ?? ""}`} style={{ left: `${x}%`, top: `${y}%`, ...style }} {...props}>
      <motion.button
        type="button"
        initial={{ scale: reduced ? 1 : 0 }}
        animate={{ scale: resolved ? 0.85 : 1 }}
        transition={reduced ? { duration: 0 } : { type: "spring", stiffness: 520, damping: 32 }}
        onClick={() => setOpen(!open)}
        aria-label={resolved ? "Resolved comment" : "Open comment thread"}
        aria-expanded={open}
        className={`flex size-7 items-center justify-center rounded-full rounded-bl-sm text-xs font-semibold text-primary-foreground shadow-md ring-2 ring-background active:scale-95 ${resolved ? "opacity-60 grayscale" : ""}`}
        style={{ backgroundColor: pinColor }}
      >
        {face ?? <span className="size-1.5 rounded-full bg-primary-foreground" />}
      </motion.button>
      <AnimatePresence>
        {open ? (
          <motion.div initial={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.85, y: 4 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.85, y: 4 }} transition={spring} className="absolute top-9 left-0 z-30 w-72 origin-top-left overflow-hidden rounded-xl border border-border bg-popover text-popover-foreground shadow-xl">
            <div className="flex max-h-64 flex-col gap-3 overflow-y-auto p-3">
              {comments.length === 0 ? (
                <p className="text-sm text-muted-foreground">还没有评论。</p>
              ) : (
                comments.map((comment) => (
                  <div key={comment.id} className="flex gap-2.5">
                    <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center overflow-hidden rounded-full text-[10px] font-semibold text-primary-foreground" style={{ backgroundColor: presenceColor(comment.author) }}>
                      {comment.avatar ? <img src={comment.avatar} alt={comment.author} className="size-full object-cover" /> : initials(comment.author)}
                    </span>
                    <div className="min-w-0">
                      <div className="flex items-baseline gap-2">
                        <span className="truncate text-xs font-medium">{comment.author}</span>
                        {comment.time ? <span className="shrink-0 text-[10px] text-muted-foreground">{comment.time}</span> : null}
                      </div>
                      <p className="text-sm leading-snug wrap-anywhere">{comment.body}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
            {onReply ? (
              <form
                className="flex items-center gap-2 border-t border-border p-2"
                onSubmit={(event) => {
                  event.preventDefault()
                  const text = reply.trim()
                  if (!text) return
                  onReply(text)
                  setReply("")
                }}
              >
                <input value={reply} onChange={(event) => setReply(event.target.value)} placeholder="回复…" aria-label="Reply" className="min-w-0 flex-1 rounded-lg bg-muted px-2.5 py-1.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
                <button type="submit" disabled={!reply.trim()} aria-label="Send reply" className="inline-flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground active:opacity-80 disabled:opacity-40">
                  <Send className="size-4" aria-hidden="true" />
                </button>
              </form>
            ) : null}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  )
}
