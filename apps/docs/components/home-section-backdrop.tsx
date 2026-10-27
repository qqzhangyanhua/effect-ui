import { cn } from "@/lib/utils"

export type HomeSectionBackdropVariant =
  | "features"
  | "showcase"
  | "terminal"
  | "principles"
  | "footer"

type HomeSectionBackdropProps = {
  variant: HomeSectionBackdropVariant
  className?: string
}

export function HomeSectionBackdrop({ variant, className }: HomeSectionBackdropProps) {
  return (
    <div
      aria-hidden
      className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}
    >
      {variant === "features" ? (
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_55%_at_10%_0%,color-mix(in_oklab,var(--chart-2)_7%,transparent),transparent)]" />
      ) : null}

      {variant === "showcase" ? (
        <>
          <div className="absolute inset-0 bg-muted/25 dark:bg-muted/15" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,color-mix(in_oklab,var(--primary)_9%,transparent),transparent)]" />
        </>
      ) : null}

      {variant === "terminal" ? (
        <>
          <div className="absolute inset-0 bg-linear-to-b from-muted/35 via-background to-background" />
          <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-border/80 to-transparent" />
        </>
      ) : null}

      {variant === "principles" ? (
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_65%_50%_at_100%_100%,color-mix(in_oklab,var(--chart-4)_8%,transparent),transparent)]" />
      ) : null}

      {variant === "footer" ? <div className="absolute inset-0 bg-muted/15" /> : null}
    </div>
  )
}
