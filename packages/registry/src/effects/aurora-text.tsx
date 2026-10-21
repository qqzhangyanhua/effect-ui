import * as React from "react"

import { textStyle } from "@/lib/text-style"
import { cn } from "@/lib/utils"

export interface AuroraTextProps extends React.HTMLAttributes<HTMLSpanElement> {
  fontSize?: number
  fontWeight?: number
  letterSpacing?: number
  align?: "left" | "center" | "right"
  /** 流动速度倍率。不传则保持原来的 7 秒一轮。 */
  speed?: number
}

function AuroraText({
  className,
  children,
  style,
  fontSize,
  fontWeight,
  letterSpacing,
  align,
  speed,
  ...props
}: AuroraTextProps) {
  const nextStyle = textStyle(style, fontSize, fontWeight, letterSpacing, align) ?? {}
  if (speed !== undefined && Number.isFinite(speed) && speed > 0) {
    nextStyle.animationDuration = `${7 / speed}s`
  }
  const hasStyle = Object.keys(nextStyle).length > 0

  return (
    <span
      data-slot="aurora-text"
      className={cn(
        "relative inline-flex animate-[aurora-flow_7s_ease-in-out_infinite] overflow-hidden bg-linear-to-r from-indigo-400 via-fuchsia-400 to-emerald-300 bg-size-[200%_auto] bg-clip-text font-semibold text-transparent motion-reduce:animate-none",
        className,
      )}
      style={hasStyle ? nextStyle : undefined}
      {...props}
    >
      {children}
    </span>
  )
}

export { AuroraText }
