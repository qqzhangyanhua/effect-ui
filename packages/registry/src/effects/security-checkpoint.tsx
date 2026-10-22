"use client"

// Ported from Cult UI (MIT, (c) 2023 Jordan-Gilliam) — https://github.com/nolly-studio/cult-ui/blob/main/apps/www/registry/default/ui/security-checkpoint.tsx. Modified for effect-ui.

import { useCallback, useEffect, useRef, useState, type HTMLAttributes, type ReactNode } from "react"

import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export interface SecurityCheckpointLine {
  id: string
  color: "blue" | "red"
}

const defaultLines: readonly SecurityCheckpointLine[] = [
  { id: "line-1", color: "blue" },
  { id: "line-2", color: "red" },
  { id: "line-3", color: "blue" },
  { id: "line-4", color: "red" },
  { id: "line-5", color: "blue" },
  { id: "line-6", color: "red" },
]

export interface SecurityCheckpointProps extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  title?: ReactNode
  subtitle?: string
  message?: string
  lines?: readonly SecurityCheckpointLine[]
}

export function SecurityCheckpoint({
  title = "检查点",
  subtitle = "安全核对",
  message = "为了让浏览更顺畅，我们正在确认这个浏览器。",
  lines = defaultLines,
  className,
  ...props
}: SecurityCheckpointProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const cardRef = useRef<HTMLDivElement>(null)
  const reduced = usePrefersReducedMotion()
  const motionOn = useAnimationActive(containerRef)
  const moving = motionOn && !reduced
  const [mounted, setMounted] = useState(false)
  const [cardLeft, setCardLeft] = useState(0)
  const reveal = reduced || mounted

  const measure = useCallback(() => {
    const container = containerRef.current
    const card = cardRef.current
    if (!container || !card) return
    setCardLeft(card.getBoundingClientRect().left - container.getBoundingClientRect().left)
  }, [])

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      measure()
      setMounted(true)
    })
    const node = containerRef.current
    if (!node || typeof ResizeObserver === "undefined") {
      return () => cancelAnimationFrame(frame)
    }
    const observer = new ResizeObserver(() => measure())
    observer.observe(node)
    return () => {
      cancelAnimationFrame(frame)
      observer.disconnect()
    }
  }, [measure])

  return (
    <div
      {...props}
      ref={containerRef}
      className={cn("relative grid h-[200px] w-full max-w-[444px] place-items-center overflow-hidden rounded-xl bg-[#f8f8f8] dark:bg-zinc-950", className)}
      data-motion={moving ? "on" : "off"}
      data-reduced={reduced ? "true" : "false"}
      data-slot="security-checkpoint"
    >
      <div className="absolute inset-0 flex flex-col items-stretch justify-center" style={{ gap: 18 }}>
        {lines.map((line, index) =>
          line.color === "blue" ? (
            <span className="block h-0.5" key={line.id}>
              <span
                className="block h-0.5 rounded-sm"
                data-part="line"
                style={{
                  width: reveal ? "100%" : "0%",
                  transition: moving ? `width 1s cubic-bezier(0.16, 1, 0.3, 1) ${index * 0.08 + 0.15}s` : "none",
                  background:
                    "linear-gradient(90deg, transparent 0%, rgba(147,197,253,0.2) 10%, rgba(96,165,250,0.5) 40%, rgba(59,130,246,0.8) 100%)",
                }}
              />
            </span>
          ) : (
            <span className="relative block h-0.5" key={line.id}>
              <span
                className="block h-0.5 rounded-sm"
                data-part="line"
                style={{
                  width: reveal && cardLeft > 0 ? cardLeft : reveal ? "38%" : 0,
                  transition: moving ? `width 0.8s cubic-bezier(0.16, 1, 0.3, 1) ${index * 0.08 + 0.2}s` : "none",
                  background:
                    "linear-gradient(90deg, transparent 0%, rgba(252,165,165,0.2) 10%, rgba(248,113,113,0.5) 40%, rgba(239,68,68,0.85) 100%)",
                }}
              />
              <span
                className="absolute top-1/2 size-6 -translate-y-1/2 rounded-full"
                style={{
                  left: cardLeft > 0 ? cardLeft - 12 : "38%",
                  opacity: reveal ? 1 : 0,
                  background: "radial-gradient(circle, rgba(252,165,165,0.4) 0%, rgba(252,165,165,0.15) 50%, transparent 70%)",
                }}
              />
              <span
                className="absolute top-1/2 size-[7px] -translate-y-1/2 rounded-full bg-[#ef4444]"
                style={{ left: cardLeft > 0 ? cardLeft - 7 : "38%", opacity: reveal ? 1 : 0 }}
              />
            </span>
          ),
        )}
      </div>
      <div
        ref={cardRef}
        className="relative flex w-[300px] max-w-[calc(100%-2rem)] flex-col gap-3 rounded-[14px] border border-black/8 bg-white px-5 py-4 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_6px_16px_rgba(0,0,0,0.04)] dark:border-white/10 dark:bg-zinc-900"
        data-slot="security-checkpoint-card"
        style={{
          opacity: reveal ? 1 : 0,
          transform: reveal ? "scale(1)" : "scale(0.97)",
          transition: moving ? "opacity 0.4s ease 0.1s, transform 0.4s cubic-bezier(0.16, 1, 0.3, 1) 0.1s" : "none",
        }}
      >
        <div className="flex items-center gap-2">
          <span className="h-5 w-[3px] rounded-sm bg-[#2563eb]" />
          <span className="flex-1 text-sm text-zinc-900 dark:text-zinc-100">
            <strong className="font-semibold">{title}</strong> <span className="font-normal">{subtitle}</span>
          </span>
          <span className="flex items-center gap-[3px]" aria-hidden>
            <span className="size-[5px] rounded-full bg-zinc-900 dark:bg-zinc-100" />
            <span className="size-[5px] rounded-full bg-zinc-400" />
            <span className="size-[5px] rounded-full bg-zinc-300 dark:bg-zinc-600" />
          </span>
        </div>
        <p className="border-l border-black/10 pl-3.5 text-[13px] leading-[19px] text-zinc-500 dark:border-white/10 dark:text-zinc-400">{message}</p>
      </div>
    </div>
  )
}
