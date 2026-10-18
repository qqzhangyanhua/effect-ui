import * as React from "react"

import { cn } from "@/lib/utils"

export type GlassCardProps = React.HTMLAttributes<HTMLDivElement>

function GlassCard({ className, children, ...props }: GlassCardProps) {
  return (
    <div
      data-slot="glass-card"
      className={cn(
        "relative overflow-hidden rounded-2xl border border-white/15 bg-white/8 p-6 text-foreground shadow-[inset_0_1px_0_0_rgba(255,255,255,0.18)] backdrop-blur-xl dark:bg-white/6",
        className,
      )}
      {...props}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-white/50 to-transparent"
      />
      {children}
    </div>
  )
}

export { GlassCard }
