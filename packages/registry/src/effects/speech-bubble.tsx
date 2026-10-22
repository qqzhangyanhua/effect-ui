"use client"

// Ported from Cult UI (MIT, (c) 2023 Jordan-Gilliam) — https://github.com/nolly-studio/cult-ui/blob/main/apps/www/registry/default/ui/speech-bubble.tsx. Modified for effect-ui.

import { useRef, type ReactNode } from "react"

import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export interface SpeechBubbleProps {
  children?: ReactNode
  className?: string
  showCursor?: boolean
}

export function SpeechBubble({ children, className, showCursor = true }: SpeechBubbleProps) {
  const ref = useRef<HTMLDivElement>(null)
  const reduced = usePrefersReducedMotion()
  const motionOn = useAnimationActive(ref)
  const moving = motionOn && !reduced
  return (
    <div ref={ref} className={cn("mr-12", className)} data-motion={moving ? "on" : "off"} data-reduced={reduced ? "true" : "false"} data-slot="speech-bubble">
      <style>
        {`@keyframes speech-bubble-pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.35; } }
[data-slot="speech-bubble"][data-motion="on"] [data-slot="speech-bubble-cursor"] { animation: speech-bubble-pulse 1.4s ease-in-out infinite; }`}
      </style>
      <div className="relative flex w-fit items-center rounded-full bg-foreground px-6 py-6 text-background lg:px-10 lg:py-5" data-slot="speech-bubble-body">
        <svg
          aria-hidden="true"
          className="absolute right-[-17px] bottom-0 h-6 -rotate-5 fill-foreground md:right-[-7px] md:h-auto lg:right-[-9px]"
          data-slot="speech-bubble-tail"
          fill="none"
          focusable="false"
          height="45"
          viewBox="0 0 53 45"
          width="53"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path className="fill-foreground" d="M44 0H0V0C0 24.8528 20.1472 45 45 45H53V45C47.1396 36.535 44 26.4842 44 16.1886V0Z" />
        </svg>
        <p className="relative text-balance text-base font-semibold leading-[0.9] tracking-[-0.06em] text-background md:text-2xl lg:text-[2rem]" data-slot="speech-bubble-text">
          {children}
        </p>
        {showCursor ? <span aria-hidden className="relative ml-2 hidden h-6 w-4 bg-muted-foreground md:block" data-slot="speech-bubble-cursor" /> : null}
      </div>
    </div>
  )
}
