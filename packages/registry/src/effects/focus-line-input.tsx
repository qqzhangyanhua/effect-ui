"use client"

// Ported from Uiverse galaxy（MIT，(c) 2023 Uiverse.io, author TechByElijah）— https://github.com/uiverse-io/galaxy/blob/main/Inputs/TechByElijah_fluffy-dolphin-33.html. Modified for effect-ui.

import { useRef, type CSSProperties, type InputHTMLAttributes } from "react"

import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export interface FocusLineInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "size"> {
  lineColor?: string
}

export function FocusLineInput({ lineColor = "var(--primary)", className, style, ...props }: FocusLineInputProps) {
  const ref = useRef<HTMLDivElement>(null)
  const reduced = usePrefersReducedMotion()
  const motionOn = useAnimationActive(ref)
  const moving = motionOn && !reduced
  const painted = { "--focus-line": lineColor, ...style } as CSSProperties

  return (
    <div
      ref={ref}
      className="relative w-fit max-w-full"
      data-motion={moving ? "on" : "off"}
      data-reduced={reduced ? "true" : "false"}
      data-slot="focus-line-input"
      style={painted}
    >
      <style>
        {`[data-slot="focus-line-input"] input{transition:background-color .3s ease,box-shadow .3s ease}
[data-slot="focus-line-input"] input:hover{background:var(--muted)}
[data-slot="focus-line-input"] input:focus{outline:none;background:var(--background);box-shadow:0 4px 6px rgba(0,0,0,.1)}
[data-slot="focus-line-input"] input:focus+[data-part="line"]{width:100%}
[data-slot="focus-line-input"][data-reduced="true"] [data-part="line"]{transition:none}
[data-slot="focus-line-input"][data-motion="on"] input:focus{animation:focus-line-input-pop .3s ease forwards}
@keyframes focus-line-input-pop{from{transform:scale(1);box-shadow:0 0 0 rgba(0,0,0,.1)}to{transform:scale(1.02);box-shadow:0 4px 8px rgba(0,0,0,.1)}}`}
      </style>
      <input
        {...props}
        className={cn(
          "block w-full max-w-[200px] rounded-md border-0 bg-muted px-4 py-[0.6em] text-base text-foreground shadow-[0_2px_4px_rgba(0,0,0,0.1)] placeholder:text-muted-foreground",
          className,
        )}
      />
      <div
        aria-hidden="true"
        className="absolute bottom-0 left-0 h-0.5 w-0 bg-[var(--focus-line)] transition-[width] duration-300 ease-out"
        data-part="line"
      />
    </div>
  )
}
