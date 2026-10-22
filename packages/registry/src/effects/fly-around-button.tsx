"use client"

// Ported from Uiverse galaxy（MIT，(c) 2023 Uiverse.io, author Bastiennnn）— https://github.com/uiverse-io/galaxy/blob/main/Buttons/Bastiennnn_strong-lionfish-94.html. Modified for effect-ui.

import { useRef, type ButtonHTMLAttributes, type ReactNode } from "react"

import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export interface FlyAroundButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: ReactNode
}

export function FlyAroundButton({ icon, className, children, ...props }: FlyAroundButtonProps) {
  const ref = useRef<HTMLButtonElement>(null)
  const reduced = usePrefersReducedMotion()
  const motionOn = useAnimationActive(ref)
  const moving = motionOn && !reduced

  return (
    <button
      {...props}
      ref={ref}
      className={cn(
        "relative flex h-[60px] w-[200px] cursor-pointer items-center justify-center rounded-[10px] border-2 border-border bg-background text-base font-bold text-foreground shadow-[0_5px_10px_rgb(122,122,122)]",
        className,
      )}
      data-motion={moving ? "on" : "off"}
      data-reduced={reduced ? "true" : "false"}
      data-slot="fly-around-button"
      type="button"
    >
      <style>
        {`[data-slot="fly-around-button"]{transition:all .7s cubic-bezier(.4,0,.2,1)}
[data-slot="fly-around-button"][data-motion="on"]:hover{box-shadow:0 5px 10px rgb(58,58,58);transform:translateY(-10px)}
[data-slot="fly-around-button"][data-motion="on"]:active{transform:scale(.95);box-shadow:0 2px 5px rgba(0,0,0,.2)}
[data-slot="fly-around-button"][data-motion="on"]:hover [data-part="icon"]{animation:fly-around-button-hop 6s cubic-bezier(.4,0,.2,1) infinite}
@keyframes fly-around-button-hop{0%{transform:translate(0,0) rotate(0deg) scale(1)}50%{transform:translate(20px,-100px) rotate(-300deg) scale(1)}100%{transform:translate(0,0) rotate(0deg) scale(1)}}`}
      </style>
      <span aria-hidden="true" className="mr-2 inline-flex h-[25px] items-center" data-part="icon">
        {icon}
      </span>
      {children}
    </button>
  )
}
