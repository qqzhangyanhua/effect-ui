"use client"

// Ported from UI Layouts (MIT, (c) 2024 UI LAYOUT) — https://github.com/ui-layouts/uilayouts/blob/main/apps/ui-layout/components/ui/blur-vignette.tsx. Modified for effect-ui.

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

import { createContext, useContext, type HTMLAttributes, type ReactNode } from "react"

interface VignetteContextValue {
  radius: string
  inset: string
  transitionLength: string
  blur: string
}

const VignetteContext = createContext<VignetteContextValue>({
  radius: "24px",
  inset: "20px",
  transitionLength: "44px",
  blur: "6px",
})

export interface BlurVignetteProps extends HTMLAttributes<HTMLDivElement> {
  radius?: string
  inset?: string
  transitionLength?: string
  blur?: string
  children?: ReactNode
}

export function BlurVignette({
  radius = "24px",
  inset = "20px",
  transitionLength = "44px",
  blur = "6px",
  className,
  children,
  ...props
}: BlurVignetteProps) {
  const reduced = usePrefersReducedMotion()
  const blurValue = reduced ? "0px" : blur
  return (
    <VignetteContext.Provider value={{ radius, inset, transitionLength, blur: blurValue }}>
      <div
        {...props}
        className={cn("relative aspect-square overflow-hidden", className)}
        data-reduced={reduced ? "true" : "false"}
        data-slot="blur-vignette"
        style={{ borderRadius: radius }}
      >
        {children}
      </div>
    </VignetteContext.Provider>
  )
}

export function BlurVignetteArticle({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  const { radius, inset, transitionLength, blur } = useContext(VignetteContext)
  return (
    <div
      {...props}
      className={cn("absolute inset-0 z-10", className)}
      data-slot="blur-vignette-article"
      style={{
        borderRadius: radius,
        backdropFilter: `blur(${blur})`,
        WebkitBackdropFilter: `blur(${blur})`,
        ["--blur-vignette-radius" as string]: radius,
        ["--blur-vignette-inset" as string]: inset,
        ["--blur-vignette-transition" as string]: transitionLength,
      }}
    >
      <style>{`
        [data-slot="blur-vignette-article"] {
          --r: max(var(--blur-vignette-transition), calc(var(--blur-vignette-radius) - var(--blur-vignette-inset)));
          --corner-size: calc(var(--r) + var(--blur-vignette-inset)) calc(var(--r) + var(--blur-vignette-inset));
          --corner-gradient: transparent 0px, transparent calc(var(--r) - var(--blur-vignette-transition)), black var(--r);
          --fill-gradient: black, black var(--blur-vignette-inset), transparent calc(var(--blur-vignette-inset) + var(--blur-vignette-transition)), transparent calc(100% - var(--blur-vignette-transition) - var(--blur-vignette-inset)), black calc(100% - var(--blur-vignette-inset));
          --fill-narrow-size: calc(100% - (var(--blur-vignette-inset) + var(--r)) * 2);
          --fill-farther-position: calc(var(--blur-vignette-inset) + var(--r));
          -webkit-mask-image:
            linear-gradient(to right, var(--fill-gradient)),
            linear-gradient(to bottom, var(--fill-gradient)),
            radial-gradient(at bottom right, var(--corner-gradient)),
            radial-gradient(at bottom left, var(--corner-gradient)),
            radial-gradient(at top left, var(--corner-gradient)),
            radial-gradient(at top right, var(--corner-gradient));
          mask-image:
            linear-gradient(to right, var(--fill-gradient)),
            linear-gradient(to bottom, var(--fill-gradient)),
            radial-gradient(at bottom right, var(--corner-gradient)),
            radial-gradient(at bottom left, var(--corner-gradient)),
            radial-gradient(at top left, var(--corner-gradient)),
            radial-gradient(at top right, var(--corner-gradient));
          -webkit-mask-size: 100% var(--fill-narrow-size), var(--fill-narrow-size) 100%, var(--corner-size), var(--corner-size), var(--corner-size), var(--corner-size);
          mask-size: 100% var(--fill-narrow-size), var(--fill-narrow-size) 100%, var(--corner-size), var(--corner-size), var(--corner-size), var(--corner-size);
          -webkit-mask-position: 0 var(--fill-farther-position), var(--fill-farther-position) 0, 0 0, 100% 0, 100% 100%, 0 100%;
          mask-position: 0 var(--fill-farther-position), var(--fill-farther-position) 0, 0 0, 100% 0, 100% 100%, 0 100%;
          -webkit-mask-repeat: no-repeat;
          mask-repeat: no-repeat;
        }
      `}</style>
      {children}
    </div>
  )
}
