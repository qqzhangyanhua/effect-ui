import * as React from "react"

import { cn } from "@/lib/utils"

export type WaveBackgroundProps = React.HTMLAttributes<HTMLDivElement>

function WaveBackground({ className, children, ...props }: WaveBackgroundProps) {
  return (
    <div
      data-slot="wave-background"
      className={cn("relative overflow-hidden rounded-xl bg-background", className)}
      {...props}
    >
      <svg
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-28 w-full text-primary/25"
        viewBox="0 0 1440 120"
        preserveAspectRatio="none"
      >
        <path
          fill="currentColor"
          className="animate-[wave-shift_8s_ease-in-out_infinite]"
          d="M0,64 C240,120 480,0 720,48 C960,96 1200,16 1440,64 L1440,120 L0,120 Z"
        />
      </svg>
      <div className="relative z-10">{children}</div>
    </div>
  )
}

export { WaveBackground }
