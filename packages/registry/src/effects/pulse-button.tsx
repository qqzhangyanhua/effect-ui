import * as React from "react"

import { cn } from "@/lib/utils"

export type PulseButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement>

function PulseButton({ className, children, ...props }: PulseButtonProps) {
  return (
    <button
      data-slot="pulse-button"
      className={cn(
        "relative inline-flex h-10 items-center justify-center rounded-full bg-primary px-6 text-sm font-medium text-primary-foreground",
        className,
      )}
      {...props}
    >
      <span
        aria-hidden
        className="absolute inset-0 -z-10 animate-[pulse-ring_2s_ease-out_infinite] motion-reduce:animate-none rounded-full bg-primary/40"
      />
      {children}
    </button>
  )
}

export { PulseButton }
