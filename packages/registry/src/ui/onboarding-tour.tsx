"use client"

import { useState } from "react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export interface TourStep {
  selector: string
  title: string
  description: string
}

export interface OnboardingTourProps {
  steps: TourStep[]
  open?: boolean
  onOpenChange?: (open: boolean) => void
  className?: string
}

function readBox(selector: string) {
  if (typeof document === "undefined") return null
  return document.querySelector(selector)?.getBoundingClientRect() ?? null
}

function OnboardingTour({ steps, open = false, onOpenChange, className }: OnboardingTourProps) {
  const [index, setIndex] = useState(0)
  const step = steps[index]

  if (!open || !step) return null

  const box = readBox(step.selector)
  const next = () => {
    if (index >= steps.length - 1) {
      onOpenChange?.(false)
      setIndex(0)
      return
    }
    setIndex((value) => value + 1)
  }

  return (
    <div className={cn("fixed inset-0 z-50", className)}>
      <div className="absolute inset-0 bg-black/50" onClick={() => onOpenChange?.(false)} />
      {box ? (
        <div
          className="pointer-events-none absolute rounded-lg ring-2 ring-primary"
          style={{ top: box.top - 6, left: box.left - 6, width: box.width + 12, height: box.height + 12 }}
        />
      ) : null}
      <div
        className="absolute w-72 rounded-xl border bg-background p-4 shadow-xl"
        style={{
          top: Math.min((box?.bottom ?? 80) + 12, (typeof window === "undefined" ? 800 : window.innerHeight) - 180),
          left: Math.min(box?.left ?? 24, (typeof window === "undefined" ? 800 : window.innerWidth) - 308),
        }}
      >
        <p className="text-xs text-muted-foreground">
          {index + 1} / {steps.length}
        </p>
        <h3 className="mt-1 font-medium">{step.title}</h3>
        <p className="mt-1 text-sm text-muted-foreground">{step.description}</p>
        <div className="mt-3 flex justify-end gap-2">
          <Button type="button" variant="ghost" size="sm" onClick={() => onOpenChange?.(false)}>
            跳过
          </Button>
          <Button type="button" size="sm" onClick={next}>
            {index === steps.length - 1 ? "完成" : "下一步"}
          </Button>
        </div>
      </div>
    </div>
  )
}

export { OnboardingTour }
