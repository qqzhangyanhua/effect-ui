import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

export interface GlowingEdgeProps {
  children: ReactNode
  className?: string
}

function GlowingEdge({ children, className }: GlowingEdgeProps) {
  return (
    <div className={cn("relative overflow-hidden rounded-2xl p-px", className)}>
      <div
        aria-hidden
        className="absolute inset-[-40%] animate-[glow-orbit_6s_linear_infinite] bg-[conic-gradient(from_var(--shine-angle),transparent_0deg,#7c3aed_70deg,transparent_140deg)]"
      />
      <div className="relative rounded-[calc(var(--radius)+2px)] bg-card p-5">{children}</div>
    </div>
  )
}

export { GlowingEdge }
