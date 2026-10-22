"use client"

// Ported from Watermelon UI (MIT, (c) 2025-present Watermelon Contributors) — https://github.com/WatermelonCorp/watermellon-registry/blob/86052b8/src/components/watermelon-ui/feature-tour-base.tsx

import { useCallback, useEffect, useId, useRef, useState, type ReactNode } from "react"
import { AnimatePresence, motion } from "motion/react"
import { X } from "lucide-react"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"

export interface TourStep {
  id: string
  title: string
  description: string
  icon: ReactNode
}

export interface FeatureTourProps {
  steps: TourStep[]
  onClose: () => void
  onLearnMore?: (step: TourStep) => void
  loop?: boolean
  closeOnBackdrop?: boolean
  className?: string
}

export function FeatureTour({ steps, onClose, onLearnMore, loop = false, closeOnBackdrop = true, className }: FeatureTourProps) {
  const reduced = usePrefersReducedMotion()
  const containerRef = useRef<HTMLDivElement>(null)
  const iconBg = useId()
  const [currentIndex, setCurrentIndex] = useState(0)
  const index = steps.length === 0 ? 0 : Math.min(currentIndex, steps.length - 1)
  const step = steps[index]
  const spring = reduced ? { duration: 0 } : { type: "spring" as const, stiffness: 340, damping: 30 }

  const goNext = useCallback(() => {
    setCurrentIndex((prev) => (prev >= steps.length - 1 ? (loop ? 0 : prev) : prev + 1))
  }, [loop, steps.length])

  const goPrev = useCallback(() => {
    setCurrentIndex((prev) => (prev <= 0 ? (loop ? steps.length - 1 : prev) : prev - 1))
  }, [loop, steps.length])

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "ArrowRight") goNext()
      if (event.key === "ArrowLeft") goPrev()
      if (event.key === "Escape") onClose()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [goNext, goPrev, onClose])

  useEffect(() => {
    containerRef.current?.querySelector("button")?.focus()
  }, [])

  if (!step) return null

  return (
    <div data-slot="feature-tour" className="flex items-center justify-center motion-reduce:transition-none" onClick={closeOnBackdrop ? onClose : undefined} role="presentation">
      <motion.div
        ref={containerRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={`${iconBg}-title`}
        onClick={(event) => event.stopPropagation()}
        initial={reduced ? false : { opacity: 0, y: 16, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: reduced ? 0 : 0.18 }}
        className={`relative flex w-full max-w-sm flex-col items-center overflow-hidden rounded-3xl border border-border bg-card p-6 shadow-sm ${className ?? ""}`}
      >
        <button type="button" aria-label="Close tour" onClick={onClose} className="absolute top-4 right-4 rounded-full bg-muted p-2 text-muted-foreground active:bg-background">
          <X size={18} aria-hidden="true" />
        </button>
        <AnimatePresence mode="wait">
          <motion.div key={step.id} initial={reduced ? false : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="relative mt-6 flex size-28 items-center justify-center">
            <motion.span layoutId={iconBg} className="absolute size-24 rounded-3xl bg-muted" transition={spring} />
            <span className="relative text-foreground">{step.icon}</span>
          </motion.div>
        </AnimatePresence>
        <div className="mt-6 space-y-2 px-2 text-center">
          <h2 id={`${iconBg}-title`} className="text-2xl font-bold text-foreground">{step.title}</h2>
          <p className="text-lg font-medium text-muted-foreground">{step.description}</p>
          {onLearnMore ? (
            <button type="button" onClick={() => onLearnMore(step)} className="mt-4 rounded-full bg-primary px-8 py-3 font-semibold text-primary-foreground active:scale-95">
              Learn More
            </button>
          ) : null}
        </div>
        <div className="mt-6 flex items-center gap-3" role="tablist">
          {steps.map((item, itemIndex) => (
            <button key={item.id} type="button" role="tab" aria-selected={itemIndex === index} aria-label={`Go to ${item.title}`} onClick={() => setCurrentIndex(itemIndex)} className="size-3 rounded-full active:scale-90" style={{ background: itemIndex === index ? "var(--primary)" : "color-mix(in srgb, var(--foreground) 40%, transparent)" }} />
          ))}
        </div>
      </motion.div>
    </div>
  )
}
