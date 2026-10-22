"use client"

// Ported from shadcn-chat (MIT, (c) 2024 Jakob Hoeg Mørk) — https://github.com/jakobhoeg/shadcn-chat/blob/main/packages/ui/src/components/ui/chat/message-loading.tsx. Modified for effect-ui.

import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

import { useRef, type HTMLAttributes } from "react"

export interface MessageLoadingProps extends HTMLAttributes<HTMLDivElement> {
  color?: string
}

export function MessageLoading({ color = "var(--foreground)", className, ...props }: MessageLoadingProps) {
  const ref = useRef<HTMLDivElement>(null)
  const reduced = usePrefersReducedMotion()
  const motionOn = useAnimationActive(ref)
  const animate = !reduced && motionOn
  return (
    <div
      {...props}
      ref={ref}
      aria-label="正在输入"
      className={cn("inline-flex h-6 items-center gap-1", className)}
      data-reduced={reduced ? "true" : "false"}
      data-slot="message-loading"
      role="status"
    >
      <style>{`@keyframes message-loading-bob { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }`}</style>
      {[0, 1, 2].map((index) => (
        <span
          key={index}
          className="size-1.5 rounded-full"
          style={{
            background: color,
            animation: animate ? "message-loading-bob 0.6s ease-in-out infinite" : "none",
            animationDelay: `${index * 0.1}s`,
          }}
        />
      ))}
    </div>
  )
}
