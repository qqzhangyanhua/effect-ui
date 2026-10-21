import * as React from "react"

import { cn } from "@/lib/utils"

function BentoGrid({
  className,
  gap,
  count,
  size,
  style,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  /** 间距，像素。不传或 12 仍是 gap-3。 */
  gap?: number
  /** 列数。不传或 3 仍是三列。 */
  count?: number
  /** 行高，像素。不传或 160 仍是 10rem。 */
  size?: number
}) {
  const spaced = gap === undefined || gap === 12
  const columns = count === undefined || count === 3
  const rows = size === undefined || size === 160
  return (
    <div
      data-slot="bento-grid"
      className={cn(
        "grid w-full",
        rows && "auto-rows-[10rem]",
        columns && "grid-cols-3",
        spaced && "gap-3",
        className,
      )}
      style={
        spaced && columns && rows
          ? style
          : {
              ...style,
              ...(spaced ? {} : { gap }),
              ...(columns ? {} : { gridTemplateColumns: `repeat(${count}, minmax(0, 1fr))` }),
              ...(rows ? {} : { gridAutoRows: `${size}px` }),
            }
      }
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
