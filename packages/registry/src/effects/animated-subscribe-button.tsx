"use client"

// Ported from Magic UI (MIT) — https://github.com/magicuidesign/magicui/blob/main/apps/www/registry/magicui/animated-subscribe-button.tsx

import { AnimatePresence, motion } from "motion/react"

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export interface AnimatedSubscribeButtonProps {
  subscribed: boolean
  onChange: (subscribed: boolean) => void
  className?: string
}

function AnimatedSubscribeButton({ subscribed, onChange, className }: AnimatedSubscribeButtonProps) {
  const reduced = usePrefersReducedMotion()
  return (
    <button
      type="button"
      data-slot="animated-subscribe-button"
      aria-pressed={subscribed}
      onClick={() => onChange(!subscribed)}
      className={cn(
        "relative inline-flex h-10 min-w-36 items-center justify-center overflow-hidden rounded-lg px-5 text-sm font-semibold text-white transition-colors duration-300",
        subscribed ? "bg-emerald-600" : "bg-primary",
        className,
      )}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={subscribed ? "on" : "off"}
          initial={reduced ? false : { y: 12, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={reduced ? undefined : { y: -12, opacity: 0 }}
          transition={{ duration: reduced ? 0 : 0.18 }}
        >
          {subscribed ? "Subscribed ✓" : "Subscribe"}
        </motion.span>
      </AnimatePresence>
    </button>
  )
}

export { AnimatedSubscribeButton }
