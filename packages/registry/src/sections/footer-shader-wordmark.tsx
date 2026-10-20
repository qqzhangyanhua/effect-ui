"use client"

import * as React from "react"

import { ShaderBackground } from "@/components/ui/shader-backgrounds"
import { ShaderPack2 } from "@/components/ui/shader-pack-2"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export type FooterShaderFill = "liquid-metal" | "dithering"

export interface FooterShaderWordmarkProps {
  text?: string
  fill?: FooterShaderFill
  note?: string
  className?: string
}

function FooterShaderWordmark({
  text = "effect-ui",
  fill = "liquid-metal",
  note = "液态金属 / 抖动着色器填进字标。减弱动效时回退渐变字。",
  className,
}: FooterShaderWordmarkProps) {
  const reduced = usePrefersReducedMotion()
  const clipId = React.useId().replace(/:/g, "")

  return (
    <footer
      className={cn(
        "overflow-hidden rounded-2xl border bg-zinc-950 px-6 py-12 text-white",
        className,
      )}
    >
      <p className="text-xs tracking-[0.28em] text-white/40 uppercase">Shader wordmark</p>
      {reduced ? (
        <p className="font-display mt-4 bg-[linear-gradient(90deg,#c4b5fd,#22d3ee,#f472b6)] bg-clip-text text-7xl text-transparent">
          {text}
        </p>
      ) : (
        <svg viewBox="0 0 800 170" className="mt-4 h-32 w-full" role="img" aria-label={text}>
          <defs>
            <clipPath id={clipId}>
              <text
                x="50%"
                y="68%"
                textAnchor="middle"
                fontSize="92"
                fontWeight="700"
                fontFamily="var(--font-display), serif"
              >
                {text}
              </text>
            </clipPath>
          </defs>
          <foreignObject width="800" height="170" clipPath={`url(#${clipId})`}>
            <div className="h-full w-full">
              {fill === "dithering" ? (
                <ShaderBackground variant="dithering" className="min-h-full rounded-none" />
              ) : (
                <ShaderPack2 variant="liquid-metal" className="min-h-full rounded-none" />
              )}
            </div>
          </foreignObject>
        </svg>
      )}
      <p className="mt-2 text-sm text-white/50">{note}</p>
    </footer>
  )
}

export { FooterShaderWordmark }
