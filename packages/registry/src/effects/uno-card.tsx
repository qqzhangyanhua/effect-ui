"use client"

// Ported from Uiverse galaxy（MIT，(c) 2023 Uiverse.io, author nanda248）— https://github.com/uiverse-io/galaxy/blob/main/Cards/nanda248_average-goat-70.html. Modified for effect-ui.

import { useRef, type CSSProperties, type HTMLAttributes, type ReactNode } from "react"

import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

const fallback = ["#FF2400", "#1F51FF", "#FFEA00", "#50C878"]

export interface UnoCardProps extends HTMLAttributes<HTMLDivElement> {
  colors?: string[]
  size?: number
  children?: ReactNode
}

function Quadrants({ colors, className }: { colors: string[]; className?: string }) {
  return (
    <div className={cn("grid grid-cols-2 border-white", className)} style={{ borderRadius: "50%", transform: "skew(-25deg)" }}>
      {colors.map((color, index) => (
        <span
          key={`${color}-${index}`}
          style={{
            backgroundColor: color,
            borderTopLeftRadius: index === 0 ? "100%" : undefined,
            borderTopRightRadius: index === 1 ? "100%" : undefined,
            borderBottomLeftRadius: index === 2 ? "100%" : undefined,
            borderBottomRightRadius: index === 3 ? "100%" : undefined,
          }}
        />
      ))}
    </div>
  )
}

export function UnoCard({ colors, size = 176, children, className, style, ...props }: UnoCardProps) {
  const ref = useRef<HTMLDivElement>(null)
  const reduced = usePrefersReducedMotion()
  const motionOn = useAnimationActive(ref)
  const moving = motionOn && !reduced
  const palette = [0, 1, 2, 3].map((index) => colors?.[index] ?? fallback[index] ?? "#FF2400")
  const painted = { fontSize: size / 11, ...style } as CSSProperties

  return (
    <div
      {...props}
      ref={ref}
      className={cn(
        "relative flex items-center justify-center overflow-hidden border-[6px] border-[#F5F5DC] bg-[#28282B] text-white transition-transform duration-500 hover:-translate-y-[5px]",
        className,
      )}
      data-motion={moving ? "on" : "off"}
      data-reduced={reduced ? "true" : "false"}
      data-slot="uno-card"
      style={{ width: "11em", height: "14.8em", borderRadius: 5, ...painted }}
    >
      <style>
        {`[data-slot="uno-card"][data-motion="on"]::before,[data-slot="uno-card"][data-motion="on"]::after{content:"";position:absolute;background:aliceblue;animation:uno-card-glider 1.8s infinite linear}
[data-slot="uno-card"][data-motion="on"]::before{height:130%;width:1em;opacity:.14;animation-delay:.05s}
[data-slot="uno-card"][data-motion="on"]::after{height:120%;width:.8em;opacity:.1}
[data-slot="uno-card"]:hover::before,[data-slot="uno-card"]:hover::after{visibility:hidden}
@keyframes uno-card-glider{0%{transform:rotate(45deg) translate(-12em,1.2em)}100%{transform:rotate(45deg) translate(18em,-2.8em)}}`}
      </style>
      <Quadrants className="absolute top-[0.3em] left-[0.6em] h-[3em] w-[1.5em] border" colors={palette} />
      <Quadrants className="h-[14em] w-[8em] border-4" colors={palette} />
      <Quadrants className="absolute right-[0.6em] bottom-[0.3em] h-[3em] w-[1.5em] border" colors={palette} />
      {children ? <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center text-center text-[0.8em] font-semibold">{children}</div> : null}
    </div>
  )
}
