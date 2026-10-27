import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

type HomeSectionHeadingProps = {
  kicker: string
  title: ReactNode
  description?: string
  align?: "left" | "center"
  className?: string
}

export function HomeSectionHeading({
  kicker,
  title,
  description,
  align = "center",
  className,
}: HomeSectionHeadingProps) {
  const centered = align === "center"

  return (
    <div className={cn(centered ? "text-center" : "text-left", className)}>
      <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
        {kicker}
      </span>
      <h2
        className={cn(
          "mt-1 text-2xl font-bold tracking-tight text-foreground sm:text-3xl",
          centered && "mx-auto max-w-2xl",
        )}
      >
        {title}
      </h2>
      {description ? (
        <p
          className={cn(
            "mt-2 text-sm text-muted-foreground",
            centered ? "mx-auto max-w-xl" : "max-w-xl",
          )}
        >
          {description}
        </p>
      ) : null}
    </div>
  )
}
