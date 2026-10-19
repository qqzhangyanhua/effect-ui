import * as React from "react"

import { cn } from "@/lib/utils"

export type AuroraTextProps = React.HTMLAttributes<HTMLSpanElement>

function AuroraText({ className, children, ...props }: AuroraTextProps) {
  return (
    <span
      data-slot="aurora-text"
      className={cn(
        "relative inline-flex animate-[aurora-flow_7s_ease-in-out_infinite] overflow-hidden bg-linear-to-r from-indigo-400 via-fuchsia-400 to-emerald-300 bg-size-[200%_auto] bg-clip-text font-semibold text-transparent motion-reduce:animate-none",
        className,
      )}
      {...props}
    >
      {children}
    </span>
  )
}

export { AuroraText }
