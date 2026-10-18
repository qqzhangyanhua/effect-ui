import * as React from "react"

import { cn } from "@/lib/utils"

export interface ShineBorderProps extends React.HTMLAttributes<HTMLDivElement> {
  shineColor?: string
  duration?: number
}

function ShineBorder({
  className,
  children,
  shineColor = "var(--primary)",
  duration = 10,
  ...props
}: ShineBorderProps) {
  return (
    <div
      data-slot="shine-border"
      className={cn(
        "relative overflow-hidden rounded-xl border bg-card p-6 text-card-foreground",
        className,
      )}
      {...props}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-[inherit]"
        style={{
          padding: 1,
          background: `conic-gradient(from var(--shine-angle), transparent 0%, ${shineColor} 12%, transparent 28%)`,
          animation: `shine-spin ${duration}s linear infinite`,
          mask: "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
          maskComposite: "exclude",
        }}
      />
      <div className="relative z-10">{children}</div>
    </div>
  )
}

export { ShineBorder }
