"use client"

// Ported from Uiverse.io (MIT), author John-CFO — https://github.com/uiverse-io/galaxy/blob/main/Buttons/John-CFO_green-rabbit-93.html. Modified for effect-ui.

import { useRef, type ButtonHTMLAttributes, type CSSProperties } from "react"

import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export interface FlickerReflectButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** 底部彩色光晕。悬停时按钮本身变成黑底直角，而不是另加一层方块。 */
  glowColor?: string
  /** 为 false 时关掉霓虹闪烁，倒影仍保留。 */
  flicker?: boolean
}

export function FlickerReflectButton({
  glowColor = "#1f4c65",
  flicker = true,
  className,
  style,
  type = "button",
  children,
  ...props
}: FlickerReflectButtonProps) {
  const ref = useRef<HTMLButtonElement>(null)
  const reduced = usePrefersReducedMotion()
  const motionOn = useAnimationActive(ref)
  const moving = motionOn && !reduced && flicker
  const painted = {
    boxShadow: `0 0 60px ${glowColor}`,
    WebkitBoxReflect: "below 10px linear-gradient(to bottom, rgba(0,0,0,0), rgba(0,0,0,0.4))",
    ...style,
  } as CSSProperties

  return (
    <button
      {...props}
      ref={ref}
      className={cn(
        "h-14 w-[13.2rem] cursor-pointer border-[5px] border-white bg-[rgb(83,82,82)] text-[1.8rem] font-bold text-[rgb(234,234,234)] uppercase",
        reduced ? "rounded-[5px] transition-none" : "rounded-[5px] transition duration-500 hover:rounded-none hover:bg-black",
        moving && "animate-[flicker-reflect_2s_linear_infinite_both]",
        className,
      )}
      data-flicker={moving ? "true" : "false"}
      data-motion={motionOn && !reduced ? "on" : "off"}
      data-reduced={reduced ? "true" : "false"}
      data-slot="flicker-reflect-button"
      style={{ ...painted, filter: "drop-shadow(0 0 10px white)" }}
      type={type}
    >
      <style>
        {`@keyframes flicker-reflect{0%,41.99%,43.01%,47.99%,49.01%,100%{opacity:1}42%,43%,48%,49%{opacity:0}}`}
      </style>
      <span className="font-[Arial,Helvetica,sans-serif]">{children}</span>
    </button>
  )
}
