import * as React from "react"

import { cn } from "@/lib/utils"

export interface ShimmerTextProps extends React.HTMLAttributes<HTMLSpanElement> {
  fontSize?: number
  fontWeight?: number
  letterSpacing?: number
  align?: "left" | "center" | "right"
}

function ShimmerText({
  className,
  children,
  fontSize,
  fontWeight,
  letterSpacing,
  align,
  style,
  ...props
}: ShimmerTextProps) {
  const nextStyle: React.CSSProperties = { ...style }
  if (fontSize !== undefined) nextStyle.fontSize = fontSize
  if (fontWeight !== undefined) nextStyle.fontWeight = fontWeight
  if (letterSpacing !== undefined) nextStyle.letterSpacing = `${letterSpacing}em`
  if (align !== undefined) nextStyle.textAlign = align
  const hasStyle = Object.keys(nextStyle).length > 0

  return (
    <span
      data-slot="shimmer-text"
      className={cn(
        "inline-flex animate-[shimmer-sweep_2.4s_linear_infinite] bg-linear-to-r from-muted-foreground/40 via-foreground to-muted-foreground/40 bg-size-[200%_100%] bg-clip-text text-transparent motion-reduce:animate-none",
        className,
      )}
      style={hasStyle ? nextStyle : undefined}
      {...props}
    >
      {children}
    </span>
  )
}

export { ShimmerText }
