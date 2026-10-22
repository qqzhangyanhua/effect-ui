// Ported from Kibo UI (MIT, (c) shadcnblocks) — https://github.com/shadcnblocks/kibo/blob/main/packages/cursor/index.tsx

import { cn } from "@/lib/utils"

import { Children, type HTMLAttributes, type SVGProps } from "react"

export function Cursor({ className, children, ...props }: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span className={cn("pointer-events-none relative inline-flex select-none", className)} data-slot="cursor" {...props}>
      {children}
    </span>
  )
}

export function CursorPointer({ className, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      aria-hidden="true"
      className={cn("size-4 text-current", className)}
      fill="none"
      viewBox="0 0 20 20"
      {...props}
    >
      <path
        d="M19.438 6.716 1.115.05A.832.832 0 0 0 .05 1.116L6.712 19.45a.834.834 0 0 0 1.557.025l3.198-8 7.995-3.2a.833.833 0 0 0 0-1.559h-.024Z"
        fill="currentColor"
      />
    </svg>
  )
}

export function CursorBody({ children, className, ...props }: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "bg-secondary text-foreground relative ml-3 flex flex-col rounded-xl px-2.5 py-1 text-xs whitespace-nowrap",
        Children.count(children) > 1 && "rounded-tl [&>:first-child]:opacity-70",
        className,
      )}
      {...props}
    >
      {children}
    </span>
  )
}

export function CursorName(props: HTMLAttributes<HTMLSpanElement>) {
  return <span {...props} />
}

export function CursorMessage(props: HTMLAttributes<HTMLSpanElement>) {
  return <span {...props} />
}
