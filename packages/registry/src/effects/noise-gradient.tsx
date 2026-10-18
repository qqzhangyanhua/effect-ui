import * as React from "react"

import { cn } from "@/lib/utils"

export type NoiseGradientProps = React.HTMLAttributes<HTMLDivElement>

function NoiseGradient({ className, children, ...props }: NoiseGradientProps) {
  return (
    <div
      data-slot="noise-gradient"
      className={cn("relative overflow-hidden rounded-xl", className)}
      {...props}
    >
      <div className="absolute inset-0 bg-linear-to-br from-violet-600 via-fuchsia-500 to-cyan-400" />
      <div
        aria-hidden
        className="absolute inset-0 opacity-25 mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />
      <div className="relative z-10">{children}</div>
    </div>
  )
}

export { NoiseGradient }
