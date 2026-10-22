"use client"

// Ported from prompt-kit (MIT, (c) 2025 Julien Thibeaut) — https://github.com/ibelick/prompt-kit/blob/main/components/prompt-kit/loader.tsx. Keyframes from https://github.com/ibelick/prompt-kit/blob/main/app/globals.css. Modified for effect-ui.

import { useRef } from "react"

import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export type AiLoaderVariant =
  | "circular"
  | "classic"
  | "pulse"
  | "pulse-dot"
  | "dots"
  | "typing"
  | "wave"
  | "bars"
  | "terminal"
  | "text-blink"
  | "text-shimmer"
  | "loading-dots"

export interface AiLoaderProps {
  variant?: AiLoaderVariant
  size?: "sm" | "md" | "lg"
  text?: string
  className?: string
}

const BOX = { sm: "size-4", md: "size-5", lg: "size-6" } as const
const TEXT = { sm: "text-xs", md: "text-sm", lg: "text-base" } as const

function play(active: boolean, animation: string) {
  return active ? animation : "none"
}

export function AiLoader({ variant = "circular", size = "md", text = "思考中", className }: AiLoaderProps) {
  const ref = useRef<HTMLDivElement>(null)
  const reduced = usePrefersReducedMotion()
  const motionOn = useAnimationActive(ref)
  const active = !reduced && motionOn
  const label = text || "加载中"

  return (
    <div
      ref={ref}
      aria-label={label}
      className={cn("inline-flex items-center text-primary", className)}
      data-reduced={reduced ? "true" : "false"}
      data-slot="ai-loader"
      data-variant={variant}
      role="status"
    >
      <style>{`
        @keyframes ai-loader-spinner-fade { from { opacity: 0.15; } to { opacity: 1; } }
        @keyframes ai-loader-thin-pulse { 0%, 100% { transform: scale(0.95); opacity: 0.8; } 50% { transform: scale(1.05); opacity: 0.4; } }
        @keyframes ai-loader-pulse-dot { 0%, 100% { transform: scale(1); opacity: 0.8; } 50% { transform: scale(1.5); opacity: 1; } }
        @keyframes ai-loader-bounce-dots { 0%, 100% { transform: scale(0.8); opacity: 0.5; } 50% { transform: scale(1.2); opacity: 1; } }
        @keyframes ai-loader-typing { 0%, 100% { transform: translateY(0); opacity: 0.5; } 50% { transform: translateY(-2px); opacity: 1; } }
        @keyframes ai-loader-wave { 0%, 100% { transform: scaleY(1); } 50% { transform: scaleY(0.6); } }
        @keyframes ai-loader-wave-bars { 0%, 100% { transform: scaleY(1); opacity: 0.5; } 50% { transform: scaleY(0.6); opacity: 1; } }
        @keyframes ai-loader-blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
        @keyframes ai-loader-text-blink { 0%, 100% { color: var(--primary); } 50% { color: var(--muted-foreground); } }
        @keyframes ai-loader-shimmer { from { background-position: 200% 50%; } to { background-position: -200% 50%; } }
        @keyframes ai-loader-loading-dots { 0%, 100% { opacity: 0; } 50% { opacity: 1; } }
      `}</style>
      {variant === "circular" ? <Circular active={active} size={size} /> : null}
      {variant === "classic" ? <Classic active={active} size={size} /> : null}
      {variant === "pulse" ? <Pulse active={active} size={size} /> : null}
      {variant === "pulse-dot" ? <PulseDot active={active} size={size} /> : null}
      {variant === "dots" ? <Dots active={active} size={size} /> : null}
      {variant === "typing" ? <Typing active={active} size={size} /> : null}
      {variant === "wave" ? <Wave active={active} size={size} /> : null}
      {variant === "bars" ? <Bars active={active} size={size} /> : null}
      {variant === "terminal" ? <Terminal active={active} size={size} /> : null}
      {variant === "text-blink" ? <TextBlink active={active} size={size} text={text} /> : null}
      {variant === "text-shimmer" ? <TextShimmer active={active} size={size} text={text} /> : null}
      {variant === "loading-dots" ? <LoadingDots active={active} size={size} text={text} /> : null}
    </div>
  )
}

function Circular({ size, active }: { size: "sm" | "md" | "lg"; active: boolean }) {
  return <span aria-hidden className={cn("animate-spin rounded-full border-2 border-current border-t-transparent", BOX[size])} style={{ animation: play(active, "spin 0.8s linear infinite") }} />
}

function Classic({ size, active }: { size: "sm" | "md" | "lg"; active: boolean }) {
  const bar = { sm: { h: "6px", w: "1.5px", origin: "0.75px 10px", margin: "-0.75px" }, md: { h: "8px", w: "2px", origin: "1px 12px", margin: "-1px" }, lg: { h: "10px", w: "2.5px", origin: "1.25px 14px", margin: "-1.25px" } }[size]
  return (
    <span aria-hidden className={cn("relative", BOX[size])}>
      {Array.from({ length: 12 }, (_, index) => (
        <span
          key={index}
          className="absolute rounded-full bg-current"
          style={{
            top: 0,
            left: "50%",
            marginLeft: bar.margin,
            height: bar.h,
            width: bar.w,
            transformOrigin: bar.origin,
            transform: `rotate(${index * 30}deg)`,
            opacity: active ? undefined : 0.35 + (index % 4) * 0.15,
            animation: play(active, `ai-loader-spinner-fade 1.2s linear ${index * 0.1}s infinite`),
          }}
        />
      ))}
    </span>
  )
}

function Pulse({ size, active }: { size: "sm" | "md" | "lg"; active: boolean }) {
  return (
    <span aria-hidden className={cn("relative", BOX[size])}>
      <span className="absolute inset-0 rounded-full border-2 border-current" style={{ animation: play(active, "ai-loader-thin-pulse 1.5s ease-in-out infinite") }} />
    </span>
  )
}

function PulseDot({ size, active }: { size: "sm" | "md" | "lg"; active: boolean }) {
  const dot = { sm: "size-1", md: "size-2", lg: "size-3" }[size]
  return <span aria-hidden className={cn("rounded-full bg-current", dot)} style={{ animation: play(active, "ai-loader-pulse-dot 1.2s ease-in-out infinite") }} />
}

function Dots({ size, active }: { size: "sm" | "md" | "lg"; active: boolean }) {
  const dot = { sm: "size-1.5", md: "size-2", lg: "size-2.5" }[size]
  return (
    <span aria-hidden className={cn("flex items-center gap-1", BOX[size])}>
      {Array.from({ length: 3 }, (_, index) => (
        <span key={index} className={cn("rounded-full bg-current", dot)} style={{ animation: play(active, `ai-loader-bounce-dots 1.4s ease-in-out ${index * 160}ms infinite`) }} />
      ))}
    </span>
  )
}

function Typing({ size, active }: { size: "sm" | "md" | "lg"; active: boolean }) {
  const dot = { sm: "size-1", md: "size-1.5", lg: "size-2" }[size]
  return (
    <span aria-hidden className={cn("flex items-center gap-1", BOX[size])}>
      {Array.from({ length: 3 }, (_, index) => (
        <span key={index} className={cn("rounded-full bg-current", dot)} style={{ animation: play(active, `ai-loader-typing 1s ease-in-out ${index * 250}ms infinite`) }} />
      ))}
    </span>
  )
}

function Wave({ size, active }: { size: "sm" | "md" | "lg"; active: boolean }) {
  const heights = { sm: [6, 9, 12, 9, 6], md: [8, 12, 16, 12, 8], lg: [10, 15, 20, 15, 10] }[size]
  return (
    <span aria-hidden className={cn("flex items-center gap-0.5", BOX[size])}>
      {heights.map((height, index) => (
        <span key={index} className={cn("rounded-full bg-current", size === "lg" ? "w-1" : "w-0.5")} style={{ height, transformOrigin: "center", animation: play(active, `ai-loader-wave 1s ease-in-out ${index * 100}ms infinite`) }} />
      ))}
    </span>
  )
}

function Bars({ size, active }: { size: "sm" | "md" | "lg"; active: boolean }) {
  const width = { sm: "w-1", md: "w-1.5", lg: "w-2" }[size]
  const gap = { sm: "h-4 gap-1", md: "h-5 gap-1.5", lg: "h-6 gap-2" }[size]
  return (
    <span aria-hidden className={cn("flex", gap)}>
      {Array.from({ length: 3 }, (_, index) => (
        <span key={index} className={cn("h-full bg-current", width)} style={{ transformOrigin: "center", animation: play(active, `ai-loader-wave-bars 1.2s ease-in-out ${index * 0.2}s infinite`) }} />
      ))}
    </span>
  )
}

function Terminal({ size, active }: { size: "sm" | "md" | "lg"; active: boolean }) {
  const cursor = { sm: "h-3 w-1.5", md: "h-4 w-2", lg: "h-5 w-2.5" }[size]
  return (
    <span aria-hidden className={cn("flex items-center gap-1", BOX[size], TEXT[size])}>
      <span className="font-mono">{">"}</span>
      <span className={cn("bg-current", cursor)} style={{ animation: play(active, "ai-loader-blink 1s step-end infinite") }} />
    </span>
  )
}

function TextBlink({ text, size, active }: { text: string; size: "sm" | "md" | "lg"; active: boolean }) {
  return <span className={cn("font-medium", TEXT[size])} style={{ animation: play(active, "ai-loader-text-blink 2s ease-in-out infinite") }}>{text}</span>
}

function TextShimmer({ text, size, active }: { text: string; size: "sm" | "md" | "lg"; active: boolean }) {
  return (
    <span
      className={cn("font-medium", TEXT[size], active ? "bg-clip-text text-transparent" : "text-foreground")}
      style={
        active
          ? {
              backgroundImage: "linear-gradient(to right, var(--muted-foreground) 40%, var(--foreground) 60%, var(--muted-foreground) 80%)",
              backgroundSize: "200% auto",
              animation: "ai-loader-shimmer 4s linear infinite",
            }
          : undefined
      }
    >
      {text}
    </span>
  )
}

function LoadingDots({ text, size, active }: { text: string; size: "sm" | "md" | "lg"; active: boolean }) {
  return (
    <span className={cn("inline-flex items-center font-medium", TEXT[size])}>
      <span>{text}</span>
      <span aria-hidden>
        {[0.2, 0.4, 0.6].map((delay) => (
          <span key={delay} style={{ animation: play(active, `ai-loader-loading-dots 1.4s ${delay}s infinite`) }}>.</span>
        ))}
      </span>
    </span>
  )
}
