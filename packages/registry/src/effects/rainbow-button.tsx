import * as React from "react"

import { cn } from "@/lib/utils"

export type RainbowButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement>

function RainbowButton({ className, children, ...props }: RainbowButtonProps) {
  return (
    <button
      data-slot="rainbow-button"
      className={cn(
        "relative inline-flex h-10 items-center justify-center overflow-hidden rounded-md px-5 text-sm font-medium text-primary-foreground",
        className,
      )}
      {...props}
    >
      <span
        aria-hidden
        className="absolute inset-[-2px] animate-[rainbow-spin_3s_linear_infinite] motion-reduce:animate-none bg-[conic-gradient(from_var(--shine-angle),#f43f5e,#f59e0b,#22c55e,#06b6d4,#8b5cf6,#f43f5e)]"
      />
      <span className="absolute inset-[2px] rounded-[6px] bg-zinc-950" />
      <span className="relative z-10">{children}</span>
    </button>
  )
}

export { RainbowButton }
