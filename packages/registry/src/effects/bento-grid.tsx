import * as React from "react"

import { cn } from "@/lib/utils"

function BentoGrid({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="bento-grid"
      className={cn(
        "grid w-full auto-rows-[10rem] grid-cols-3 gap-3",
        className,
      )}
      {...props}
    />
  )
}

function BentoCard({
  className,
  colSpan = 1,
  rowSpan = 1,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  colSpan?: 1 | 2 | 3
  rowSpan?: 1 | 2
}) {
  return (
    <div
      data-slot="bento-card"
      className={cn(
        "overflow-hidden rounded-xl border bg-card p-4 text-card-foreground shadow-sm",
        colSpan === 2 && "col-span-2",
        colSpan === 3 && "col-span-3",
        rowSpan === 2 && "row-span-2",
        className,
      )}
      {...props}
    />
  )
}

export { BentoGrid, BentoCard }
