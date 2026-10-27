"use client"

import * as React from "react"

import { cn } from "@/lib/cn"

export type GooeyButtonProps = React.ComponentProps<"button"> & {
  /** 模糊倍率。不传或 1 仍是 stdDeviation 6。 */
  scale?: number
  /** 粘连强度倍率。不传或 1 仍是矩阵 18 与 -7。 */
  intensity?: number
}

function GooeyButton({
  className,
  children,
  scale,
  intensity,
  style,
  ...props
}: GooeyButtonProps) {
  const id = React.useId().replace(/:/g, "")
  const label = children
  const blur = scale === undefined || scale === 1 ? undefined : 6 * scale
  const gain = intensity === undefined || intensity === 1 ? undefined : intensity
  const body = (
    <>
      <span className="relative z-10">
        <svg width="0" height="0" className="absolute size-0">
          <filter id={id} x="-80%" y="-120%" width="260%" height="340%">
            <feGaussianBlur in="SourceGraphic" stdDeviation={blur === undefined ? "6" : String(blur)} result="blur" />
            <feColorMatrix
              in="blur"
              mode="matrix"
              values={
                gain === undefined
                  ? "1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7"
                  : `1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 ${18 * gain} ${-7 * gain}`
              }
              result="goo"
            />
            <feBlend in="SourceGraphic" in2="goo" />
          </filter>
        </svg>
        {label}
      </span>
      <span className="absolute top-1/2 right-0 size-8 translate-x-[70%] -translate-y-1/2 rounded-full bg-primary" />
      <span className="absolute top-1/2 left-0 size-7 -translate-x-[70%] -translate-y-1/2 rounded-full bg-primary" />
    </>
  )

  return (
    <button
      type="button"
      data-slot="gooey-button"
      className={cn("relative h-11 overflow-visible rounded-full px-6 hover:bg-primary", className)}
      style={{ filter: `url(#${id})`, ...style }}
      {...props}
    >
      {body}
    </button>
  )
}

export { GooeyButton }
