"use client"

// Ported from Uiverse galaxy（MIT，(c) 2023 Uiverse.io, author andrew-demchenk0）— https://github.com/uiverse-io/galaxy/blob/main/Buttons/andrew-demchenk0_chatty-ape-15.html. Modified for effect-ui.

import { useRef, type ButtonHTMLAttributes, type CSSProperties } from "react"

import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export interface SendArrowButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** 前三项是按钮渐变，后三项是光晕。不传时使用主题色。 */
  colors?: string[]
}

export function SendArrowButton({ colors, className, style, type = "button", children, ...props }: SendArrowButtonProps) {
  const ref = useRef<HTMLButtonElement>(null)
  const reduced = usePrefersReducedMotion()
  const motionOn = useAnimationActive(ref)
  const from = colors?.[0] ?? "var(--primary)"
  const via = colors?.[1] ?? "var(--primary)"
  const to = colors?.[2] ?? "var(--primary)"
  const haloA = colors?.[3] ?? "var(--ring)"
  const haloB = colors?.[4] ?? "var(--accent)"
  const haloC = colors?.[5] ?? "var(--destructive)"
  const painted = {
    backgroundImage: `linear-gradient(to right, ${from}, ${via}, ${to})`,
    ...style,
  } as CSSProperties
  const moving = motionOn && !reduced

  return (
    <button
      {...props}
      ref={ref}
      className={cn(
        "group relative z-1 inline-flex cursor-pointer items-center rounded-lg px-4 py-2 font-medium text-white",
        reduced ? "transition-none" : "transition-all duration-200 active:scale-95 active:shadow-inner",
        className,
      )}
      data-motion={moving ? "on" : "off"}
      data-reduced={reduced ? "true" : "false"}
      data-slot="send-arrow-button"
      style={painted}
      type={type}
    >
      <span
        aria-hidden="true"
        className={cn("absolute -inset-0.5 -z-10 rounded-xl blur-xl", moving && "animate-pulse")}
        style={{ backgroundImage: `linear-gradient(to right, ${haloA}, ${haloB}, ${haloC})` }}
      />
      <span className={cn("inline-flex", reduced ? "transition-none" : "transition-all duration-300 group-hover:translate-x-5 group-hover:rotate-45")}>
        <svg aria-hidden="true" viewBox="0 0 24 24" width="24" height="24">
          <path fill="currentColor" d="M1.946 9.315c-.522-.174-.527-.455.01-.634l19.087-6.362c.529-.176.832.12.684.638l-5.454 19.086c-.15.529-.455.547-.679.045L12 14l6-8-8 6-8.054-2.685z" />
        </svg>
      </span>
      <span className={cn("ml-1", reduced ? "transition-none" : "transition-all duration-300 group-hover:text-transparent")}>{children}</span>
    </button>
  )
}
