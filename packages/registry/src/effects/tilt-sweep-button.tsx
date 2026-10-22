"use client"

// Ported from Uiverse galaxy（MIT，(c) 2023 Uiverse.io, author EddyBel）— https://github.com/uiverse-io/galaxy/blob/main/Buttons/EddyBel_brave-horse-21.html. Modified for effect-ui.

import { useRef, type ButtonHTMLAttributes, type CSSProperties, type ReactNode } from "react"

import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export interface TiltSweepButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  from?: string
  to?: string
  children?: ReactNode
}

const rest = "scale(1.1) perspective(500px) rotateX(15deg) rotateY(-10deg)"

export function TiltSweepButton({
  from = "#99fff8",
  to = "hsla(13, 63%, 73%, 1)",
  className,
  style,
  children,
  ...props
}: TiltSweepButtonProps) {
  const ref = useRef<HTMLButtonElement>(null)
  const reduced = usePrefersReducedMotion()
  const motionOn = useAnimationActive(ref)
  const moving = motionOn && !reduced
  const painted = {
    "--tilt-from": from,
    "--tilt-to": to,
    transform: rest,
    ...style,
  } as CSSProperties

  return (
    <button
      {...props}
      ref={ref}
      className={cn(
        "relative cursor-pointer overflow-hidden rounded-[20px] border-0 bg-transparent px-[1.7em] py-[0.7em] text-base text-[rgba(0,0,0,0.75)] uppercase transition-shadow duration-[400ms] focus-visible:shadow-[0_0_0_2px_#000] focus-visible:outline-none",
        className,
      )}
      data-motion={moving ? "on" : "off"}
      data-reduced={reduced ? "true" : "false"}
      data-slot="tilt-sweep-button"
      style={painted}
      type="button"
    >
      <style>
        {`[data-slot="tilt-sweep-button"]::before{content:"";position:absolute;inset:0;z-index:-1;background:rgba(255,255,255,.295)}
[data-slot="tilt-sweep-button"] [data-part="sweep"]{position:absolute;left:0;top:0;z-index:-2;width:200%;height:200%;background-color:var(--tilt-from);background-image:radial-gradient(at 89% 76%, var(--tilt-to) 0px, transparent 50%),radial-gradient(at 69% 38%, hsla(217,85%,71%,1) 0px, transparent 50%),radial-gradient(at 12% 8%, hsla(214,70%,64%,1) 0px, transparent 50%),radial-gradient(at 53% 10%, hsla(339,64%,65%,1) 0px, transparent 50%),radial-gradient(at 5% 67%, hsla(212,74%,70%,1) 0px, transparent 50%)}
[data-slot="tilt-sweep-button"][data-motion="on"] [data-part="sweep"]{animation:tilt-sweep-button-pan 10s infinite}
[data-slot="tilt-sweep-button"][data-motion="on"]:hover{animation:tilt-sweep-button-rock 5.5s infinite both}
@keyframes tilt-sweep-button-rock{0%,100%{transform:scale(1.1) perspective(500px) rotateX(15deg) rotateY(-10deg)}50%{transform:scale(.9) perspective(500px) rotateX(-15deg) rotateY(15deg)}}
@keyframes tilt-sweep-button-pan{0%,100%{transform:translateX(0)}25%{transform:translateX(-50%)}50%{transform:translateX(-50%) translateY(-50%)}75%{transform:translateX(0) translateY(-50%)}}`}
      </style>
      <span aria-hidden="true" data-part="sweep" />
      {children}
    </button>
  )
}
