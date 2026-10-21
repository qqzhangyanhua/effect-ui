"use client"

// Ported from Cult UI (MIT) — https://github.com/nolly-studio/cult-ui/blob/main/apps/www/registry/default/ui/copy-button.tsx

import { Check, Copy, CircleAlert } from "lucide-react"
import { useEffect, useState } from "react"
import { AnimatePresence, motion } from "motion/react"

import { Button } from "@/components/ui/button"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export interface CopyButtonProps {
  value?: string
  getValue?: () => string
  className?: string
}

type CopyState = "idle" | "copied" | "error"

function legacyCopy(value: string) {
  try {
    const area = document.createElement("textarea")
    area.value = value
    area.setAttribute("readonly", "")
    area.style.position = "fixed"
    area.style.left = "-9999px"
    document.body.appendChild(area)
    area.select()
    const copied = document.execCommand("copy")
    area.remove()
    return copied
  } catch {
    return false
  }
}

async function copyText(value: string) {
  if (!value || typeof window === "undefined") return false
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(value)
      return true
    }
  } catch {
    return legacyCopy(value)
  }
  return legacyCopy(value)
}

function CopyButton({ value, getValue, className }: CopyButtonProps) {
  const reduced = usePrefersReducedMotion()
  const [state, setState] = useState<CopyState>("idle")

  useEffect(() => {
    if (state === "idle") return
    const timer = window.setTimeout(() => setState("idle"), 2000)
    return () => window.clearTimeout(timer)
  }, [state])

  const label = state === "copied" ? "已复制" : state === "error" ? "复制失败" : "复制"
  const icon =
    state === "copied" ? <Check className="size-4" /> : state === "error" ? <CircleAlert className="size-4" /> : <Copy className="size-4" />

  return (
    <Button
      type="button"
      size="icon"
      variant="outline"
      data-slot="copy-button"
      data-state={state}
      data-reduced={reduced ? "true" : undefined}
      aria-label={label}
      className={cn("relative", className)}
      onClick={async () => {
        try {
          const text = getValue ? getValue() : (value ?? "")
          const ok = await copyText(text)
          setState(ok ? "copied" : "error")
        } catch {
          setState("error")
        }
      }}
    >
      <span className="sr-only" aria-live="polite">
        {state === "idle" ? "" : label}
      </span>
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={state}
          className="inline-flex"
          initial={reduced ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={reduced ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.6 }}
          transition={{ duration: reduced ? 0 : 0.18 }}
        >
          {icon}
        </motion.span>
      </AnimatePresence>
    </Button>
  )
}

export { CopyButton }
