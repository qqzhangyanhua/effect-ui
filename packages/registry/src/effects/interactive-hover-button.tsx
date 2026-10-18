import * as React from "react"
import { ArrowRight } from "lucide-react"

import { cn } from "@/lib/utils"

export type InteractiveHoverButtonProps =
  React.ButtonHTMLAttributes<HTMLButtonElement>

function InteractiveHoverButton({
  className,
  children,
  ...props
}: InteractiveHoverButtonProps) {
  return (
    <button
      data-slot="interactive-hover-button"
      className={cn(
        "group relative inline-flex h-10 items-center overflow-hidden rounded-full border bg-background px-6 text-sm",
        className,
      )}
      {...props}
    >
      <span className="inline-flex items-center gap-2 transition-transform duration-300 group-hover:-translate-x-3">
        {children}
      </span>
      <ArrowRight className="absolute right-4 size-4 translate-x-6 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100" />
    </button>
  )
}

export { InteractiveHoverButton }
