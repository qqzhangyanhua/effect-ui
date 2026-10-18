import * as React from "react"

import { cn } from "@/lib/utils"

export type RetroGridProps = React.HTMLAttributes<HTMLDivElement>

function RetroGrid({ className, ...props }: RetroGridProps) {
  return (
    <div
      data-slot="retro-grid"
      className={cn(
        "pointer-events-none absolute inset-0 overflow-hidden [perspective:220px]",
        className,
      )}
      {...props}
    >
      <div className="absolute inset-0 origin-bottom [transform:rotateX(62deg)]">
        <div className="h-[200%] w-full bg-[linear-gradient(to_right,color-mix(in_oklab,var(--primary)_28%,transparent)_1px,transparent_1px),linear-gradient(to_bottom,color-mix(in_oklab,var(--primary)_28%,transparent)_1px,transparent_1px)] bg-size-[48px_48px] animate-[grid-drift_8s_linear_infinite]" />
      </div>
      <div className="absolute inset-0 bg-linear-to-t from-background via-background/40 to-transparent" />
    </div>
  )
}

export { RetroGrid }
