import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

function Safari({
  children,
  url = "https://effect-ui.dev",
  className,
}: {
  children?: ReactNode
  url?: string
  className?: string
}) {
  return (
    <div className={cn("overflow-hidden rounded-xl border bg-background shadow-sm", className)}>
      <div className="flex items-center gap-2 border-b bg-muted/50 px-3 py-2">
        <span className="size-2.5 rounded-full bg-red-400" />
        <span className="size-2.5 rounded-full bg-amber-400" />
        <span className="size-2.5 rounded-full bg-emerald-400" />
        <div className="mx-auto w-2/3 truncate rounded-full bg-background px-3 py-1 text-center text-[11px] text-muted-foreground">
          {url}
        </div>
      </div>
      <div className="min-h-40">{children}</div>
    </div>
  )
}

function IPhone({ children, className }: { children?: ReactNode; className?: string }) {
  return (
    <div className={cn("mx-auto w-48 rounded-[2rem] border-8 border-foreground/90 bg-background shadow-xl", className)}>
      <div className="mx-auto mt-2 h-3 w-16 rounded-full bg-foreground/80" />
      <div className="min-h-72 overflow-hidden">{children}</div>
      <div className="mx-auto mb-2 h-1 w-16 rounded-full bg-foreground/40" />
    </div>
  )
}

function Macbook({ children, className }: { children?: ReactNode; className?: string }) {
  return (
    <div className={cn("w-full", className)}>
      <div className="overflow-hidden rounded-t-xl border bg-background shadow-sm">
        <div className="flex items-center gap-1.5 border-b px-3 py-1.5">
          <span className="size-2 rounded-full bg-red-400" />
          <span className="size-2 rounded-full bg-amber-400" />
          <span className="size-2 rounded-full bg-emerald-400" />
        </div>
        <div className="min-h-40">{children}</div>
      </div>
      <div className="mx-auto h-3 w-[70%] rounded-b-lg bg-muted" />
    </div>
  )
}

export { Safari, IPhone, Macbook }
