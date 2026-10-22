"use client"

// Ported from Uiverse galaxy（MIT，(c) 2023 Uiverse.io, author Javierrocadev）— https://github.com/uiverse-io/galaxy/blob/main/Cards/Javierrocadev_angry-puma-14.html. Modified for effect-ui.

import type { HTMLAttributes } from "react"

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export interface BlurUnveilCardProps extends HTMLAttributes<HTMLDivElement> {
  /** 大号数字。示例数字放在 demo。 */
  value?: string
  /** 数字下方的说明。 */
  caption?: string
  /** 色块颜色。不传时使用危险色。 */
  blobColor?: string
}

export function BlurUnveilCard({ value, caption, blobColor = "var(--destructive)", className, children, ...props }: BlurUnveilCardProps) {
  const reduced = usePrefersReducedMotion()

  return (
    <div
      {...props}
      className={cn(
        "group relative flex h-44 w-44 flex-col items-center justify-center overflow-hidden rounded-xl bg-card text-card-foreground shadow-md",
        reduced ? "transition-none" : "transition duration-500 hover:-translate-y-2",
        className,
      )}
      data-reduced={reduced ? "true" : "false"}
      data-slot="blur-unveil-card"
    >
      <svg
        aria-hidden="true"
        className={cn("absolute z-10", reduced ? "scale-105 blur-none" : "blur-md transition duration-500 group-hover:scale-105 group-hover:blur-none")}
        style={{ fill: blobColor }}
        viewBox="0 0 200 200"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M39.5,-49.6C54.8,-43.2,73.2,-36.5,78.2,-24.6C83.2,-12.7,74.8,4.4,69,22.5C63.3,40.6,60.2,59.6,49.1,64.8C38.1,70,19,61.5,0.6,60.7C-17.9,59.9,-35.9,67,-47.2,61.9C-58.6,56.7,-63.4,39.5,-70,22.1C-76.6,4.7,-84.9,-12.8,-81.9,-28.1C-79,-43.3,-64.6,-56.3,-49.1,-62.5C-33.6,-68.8,-16.8,-68.3,-2.3,-65.1C12.1,-61.9,24.2,-55.9,39.5,-49.6Z"
          transform="translate(100 100)"
        />
      </svg>
      <div className="relative z-20 flex flex-col items-center justify-center">
        {children ?? (
          <>
            {value ? <span className="ml-2 text-6xl font-bold">{value}</span> : null}
            {caption ? <p className="font-bold">{caption}</p> : null}
          </>
        )}
      </div>
    </div>
  )
}
