import * as React from "react"

import { cn } from "@/lib/utils"

export type AuroraBackgroundProps = React.HTMLAttributes<HTMLDivElement>

function AuroraBackground({
  className,
  children,
  ...props
}: AuroraBackgroundProps) {
  return (
    <div
      data-slot="aurora-background"
      className={cn(
        "relative isolate overflow-hidden rounded-xl bg-background",
        className,
      )}
      {...props}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-16 opacity-70 blur-3xl motion-reduce:animate-none!"
        style={{
          background:
            "radial-gradient(40% 50% at 20% 20%, color-mix(in oklab, var(--primary) 45%, transparent), transparent 70%), radial-gradient(40% 50% at 80% 10%, color-mix(in oklab, var(--chart-2) 40%, transparent), transparent 70%), radial-gradient(50% 40% at 50% 90%, color-mix(in oklab, var(--chart-4) 35%, transparent), transparent 70%)",
          animation: "aurora-flow 10s ease-in-out infinite",
        }}
      />
      <div className="relative z-10">{children}</div>
    </div>
  )
}

export { AuroraBackground }
