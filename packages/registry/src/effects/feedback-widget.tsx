"use client"

import { useEffect, useState } from "react"
import { motion } from "motion/react"

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"
import { MorphingPopover, MorphingPopoverContent, MorphingPopoverTrigger } from "@/components/ui/morphing-popover"

const RATINGS = [
  { value: 1, emoji: "😞", label: "很差" },
  { value: 2, emoji: "😐", label: "一般" },
  { value: 3, emoji: "🙂", label: "不错" },
  { value: 4, emoji: "🤩", label: "很好" },
] as const

export interface FeedbackWidgetProps {
  onSubmit?: (value: { rating: number; message: string }) => void
  placeholder?: string
  className?: string
}

function FeedbackWidget({ onSubmit, placeholder = "What should we change?", className }: FeedbackWidgetProps) {
  const reduced = usePrefersReducedMotion()
  const [open, setOpen] = useState(false)
  const [rating, setRating] = useState<number | null>(null)
  const [message, setMessage] = useState("")
  const [screenshot, setScreenshot] = useState(false)
  const [thanks, setThanks] = useState(false)

  useEffect(() => {
    if (!thanks) return
    const timer = window.setTimeout(() => {
      setOpen(false)
      setThanks(false)
      setRating(null)
      setMessage("")
      setScreenshot(false)
    }, 1200)
    return () => window.clearTimeout(timer)
  }, [thanks])

  return (
    <div data-slot="feedback-widget" data-reduced={reduced ? "true" : "false"} className={cn("fixed right-6 bottom-6 z-40", className)}>
      <MorphingPopover open={open} onOpenChange={setOpen}>
        <MorphingPopoverTrigger>Feedback</MorphingPopoverTrigger>
        <MorphingPopoverContent className="right-0 bottom-full left-auto top-auto w-80">
          {thanks ? (
            <p className="py-6 text-center text-sm font-medium">Thanks ✓</p>
          ) : (
            <form
              className="space-y-3"
              onSubmit={(event) => {
                event.preventDefault()
                if (rating === null) return
                onSubmit?.({ rating, message })
                setThanks(true)
              }}
            >
              <div className="flex justify-between gap-2">
                {RATINGS.map((item) => {
                  const selected = rating === item.value
                  return (
                    <motion.button
                      key={item.value}
                      type="button"
                      aria-label={item.label}
                      aria-pressed={selected}
                      className={cn("grid size-12 place-items-center rounded-lg text-2xl", selected && "bg-muted")}
                      animate={selected && !reduced ? { y: [0, -8, 0] } : { y: 0 }}
                      transition={{ duration: 0.35 }}
                      onClick={() => setRating(item.value)}
                    >
                      {item.emoji}
                    </motion.button>
                  )
                })}
              </div>
              <textarea
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                placeholder={placeholder}
                className="h-24 w-full resize-none rounded-md border bg-background px-2 py-1.5 text-sm"
              />
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={screenshot} onChange={(event) => setScreenshot(event.target.checked)} />
                Include screenshot
              </label>
              <button type="submit" className="h-9 w-full rounded-md bg-primary text-sm text-primary-foreground disabled:opacity-40" disabled={rating === null}>
                Send
              </button>
            </form>
          )}
        </MorphingPopoverContent>
      </MorphingPopover>
    </div>
  )
}

export { FeedbackWidget }
