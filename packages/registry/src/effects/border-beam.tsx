import * as React from "react"

import { cn } from "@/lib/utils"

export interface BorderBeamProps extends React.HTMLAttributes<HTMLDivElement> {
  duration?: number
  colorFrom?: string
  colorTo?: string
}

function BorderBeam({
  className,
  children,
  duration = 8,
  colorFrom = "var(--primary)",
  colorTo = "var(--chart-2)",
  ...props
}: BorderBeamProps) {
  return (
    <div
      data-slot="border-beam"
      className={cn("relative overflow-hidden rounded-xl border bg-card p-6", className)}
      {...props}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-[inherit]"
        style={{
          padding: 1,
          background: `linear-gradient(var(--beam-angle), transparent 30%, ${colorFrom}, ${colorTo}, transparent 70%)`,
          animation: `shine-spin ${duration}s linear infinite`,
          mask: "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
          maskComposite: "exclude",
        }}
      />
      <div className="relative z-10">{children}</div>
    </div>
  )
}

export { BorderBeam }
