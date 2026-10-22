"use client"

// Ported from Uiverse.io (MIT), author siraj-ha — https://github.com/uiverse-io/galaxy/blob/main/Inputs/siraj-ha_serious-moose-70.html. Modified for effect-ui.

import { useRef, type CSSProperties, type InputHTMLAttributes } from "react"

import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

const SEARCH =
  "M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"
const FUNNEL =
  "M3 4.6C3 4.03995 3 3.75992 3.10899 3.54601C3.20487 3.35785 3.35785 3.20487 3.54601 3.10899C3.75992 3 4.03995 3 4.6 3H19.4C19.9601 3 20.2401 3 20.454 3.10899C20.6422 3.20487 20.7951 3.35785 20.891 3.54601C21 3.75992 21 4.03995 21 4.6V6.33726C21 6.58185 21 6.70414 20.9724 6.81923C20.9479 6.92127 20.9075 7.01881 20.8526 7.10828C20.7908 7.2092 20.7043 7.29568 20.5314 7.46863L14.4686 13.5314C14.2957 13.7043 14.2092 13.7908 14.1474 13.8917C14.0925 13.9812 14.0521 14.0787 14.0276 14.1808C14 14.2959 14 14.4182 14 14.6627V17L10 21V14.6627C10 14.4182 10 14.2959 9.97237 14.1808C9.94787 14.0787 9.90747 13.9812 9.85264 13.8917C9.7908 13.7908 9.70432 13.7043 9.53137 13.5314L3.46863 7.46863C3.29568 7.29568 3.2092 7.2092 3.14736 7.10828C3.09253 7.01881 3.05213 6.92127 3.02763 6.81923C3 6.70414 3 6.58185 3 6.33726V4.6Z"

export interface GlowSearchInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "color" | "type"> {
  /** 左右两团光晕。静止时固定，只有悬停才对调旋转。 */
  colors?: string[]
  onFilterClick?: () => void
}

export function GlowSearchInput({
  colors,
  onFilterClick,
  className,
  style,
  ...props
}: GlowSearchInputProps) {
  const ref = useRef<HTMLDivElement>(null)
  const reduced = usePrefersReducedMotion()
  const motionOn = useAnimationActive(ref)
  const moving = motionOn && !reduced
  const glowA = colors?.[0] ?? "var(--chart-1)"
  const glowB = colors?.[1] ?? "var(--chart-2)"
  const painted = {
    "--glow-a": glowA,
    "--glow-b": glowB,
    ...style,
  } as CSSProperties

  return (
    <div
      ref={ref}
      className={cn("glow-search flex w-fit items-center rounded-[15px] bg-black text-white", className)}
      data-motion={moving ? "on" : "off"}
      data-reduced={reduced ? "true" : "false"}
      data-slot="glow-search-input"
      style={painted}
    >
      <style>
        {`[data-slot="glow-search-input"]{box-shadow:5px 5px 10px var(--glow-a),-5px -5px 10px var(--glow-b)}
[data-slot="glow-search-input"]:hover{box-shadow:10px 10px 20px var(--glow-a),-10px -10px 20px var(--glow-b)}
[data-slot="glow-search-input"][data-motion="on"]:hover{animation:glow-search-rotate 1.5s infinite alternate}
@keyframes glow-search-rotate{0%,100%{box-shadow:10px 10px 20px var(--glow-a),-10px -10px 20px var(--glow-b)}50%{box-shadow:-10px -10px 20px var(--glow-b),10px 10px 20px var(--glow-a)}}`}
      </style>
      <span aria-hidden="true" className="pr-0 pl-5 text-white">
        <svg height="24" viewBox="0 0 24 24" width="24">
          <path d={SEARCH} fill="currentColor" />
        </svg>
      </span>
      <input
        {...props}
        className="m-2.5 flex-1 border-0 bg-black px-5 py-2.5 text-base text-white outline-none placeholder:text-[#888]"
        type="search"
      />
      <button
        aria-label="筛选"
        className="mr-2.5 flex size-10 items-center justify-center rounded-[10px] border-2 border-white bg-black p-1 text-white shadow-[inset_0_0_10px_rgba(158,202,237,0.5)]"
        onClick={onFilterClick}
        type="button"
      >
        <svg aria-hidden="true" height="24" viewBox="0 0 24 24" width="24">
          <path d={FUNNEL} fill="#000" stroke="#fff" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
        </svg>
      </button>
    </div>
  )
}
