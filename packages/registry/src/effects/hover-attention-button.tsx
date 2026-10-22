"use client"

// Ported from SyntaxUI (MIT, (c) 2024 SyntaxUI) — https://github.com/SyntaxUI/syntaxui/blob/main/src/showcase/animations/hover/HoverJiggleButton.tsx

import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

import { useRef, useState, type ButtonHTMLAttributes, type ReactNode } from "react"

const KEYFRAMES = `
@keyframes effect-ui-hover-shake {
  0% { transform: rotate(-4deg); }
  50% { transform: rotate(4deg); }
  100% { transform: rotate(-4deg); }
}
@keyframes effect-ui-hover-pop {
  0% { transform: scale(1); }
  50% { transform: scale(1.07); }
  100% { transform: scale(1); }
}
@keyframes effect-ui-hover-pulse {
  0% { box-shadow: 0 0 0 0 rgba(255, 0, 0, 0.7); }
  100% { box-shadow: 0 0 0 2em rgba(255, 0, 0, 0); }
}
@keyframes effect-ui-hover-tada {
  0% { transform: scale(1); }
  10%, 20% { transform: scale(0.9) rotate(-3deg); }
  30% { transform: scale(1.1) rotate(3deg); }
  40% { transform: scale(1.1) rotate(-3deg); }
  50% { transform: scale(1.1) rotate(3deg); }
  60% { transform: scale(1.1) rotate(-3deg); }
  70% { transform: scale(1.1) rotate(3deg); }
  80% { transform: scale(1.1) rotate(-3deg); }
  90% { transform: scale(1.1) rotate(3deg); }
  100% { transform: scale(1) rotate(0deg); }
}
@keyframes effect-ui-hover-vibrate {
  0%, 20%, 40%, 60%, 80%, 100% { transform: translateY(0); }
  10%, 50%, 90% { transform: translateY(-3px); }
  30%, 70% { transform: translateY(3px); }
}
`

const animationName = {
  shake: "effect-ui-hover-shake",
  pop: "effect-ui-hover-pop",
  pulse: "effect-ui-hover-pulse",
  tada: "effect-ui-hover-tada",
  vibrate: "effect-ui-hover-vibrate",
} as const

const animationTiming = {
  shake: "0.3s ease-in-out",
  pop: "0.5s ease-out",
  pulse: "1s",
  tada: "1s ease-in-out",
  vibrate: "0.4s ease-in-out",
} as const

export type HoverAttentionEffect = keyof typeof animationName

export interface HoverAttentionButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> {
  effect?: HoverAttentionEffect
  children?: ReactNode
}

export function HoverAttentionButton({
  effect = "tada",
  children = "看这里",
  className,
  ...props
}: HoverAttentionButtonProps) {
  const ref = useRef<HTMLButtonElement>(null)
  const prefersReducedMotion = usePrefersReducedMotion()
  const motionOn = useAnimationActive(ref)
  const [hot, setHot] = useState(false)
  const play = hot && !prefersReducedMotion && motionOn

  return (
    <>
      <style>{KEYFRAMES}</style>
      <button
        {...props}
        className={cn("rounded-lg bg-primary px-6 py-2 text-sm font-semibold text-primary-foreground", className)}
        data-effect={effect}
        data-reduced={prefersReducedMotion ? "true" : "false"}
        data-slot="hover-attention-button"
        onMouseEnter={(event) => {
          setHot(true)
          props.onMouseEnter?.(event)
        }}
        onMouseLeave={(event) => {
          setHot(false)
          props.onMouseLeave?.(event)
        }}
        ref={ref}
        style={{
          animationName: play ? animationName[effect] : "none",
          animationDuration: animationTiming[effect].split(" ")[0],
          animationTimingFunction: animationTiming[effect].includes(" ")
            ? animationTiming[effect].slice(animationTiming[effect].indexOf(" ") + 1)
            : "ease",
        }}
        type="button"
      >
        {children}
      </button>
    </>
  )
}
