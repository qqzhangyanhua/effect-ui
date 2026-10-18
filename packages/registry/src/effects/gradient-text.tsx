import * as React from "react"

import { cn } from "@/lib/utils"

export interface GradientTextProps extends React.HTMLAttributes<HTMLSpanElement> {
  colors?: string
}

function GradientText({
  className,
  colors = "from-violet-500 via-fuchsia-500 to-cyan-400",
  children,
  ...props
}: GradientTextProps) {
  return (
    <span
      data-slot="gradient-text"
      className={cn(
        "inline-block bg-linear-to-r bg-size-[200%_auto] bg-clip-text text-transparent animate-[gradient-shift_6s_ease_infinite]",
        colors,
        className,
      )}
      {...props}
    >
      {children}
    </span>
  )
}

export { GradientText }
