import { DotPattern } from "@effect-ui/registry/effects/dot-pattern"
import { GridPattern } from "@effect-ui/registry/effects/grid-pattern"
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
        <>
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_55%_at_10%_0%,color-mix(in_oklab,var(--chart-2)_7%,transparent),transparent)]" />
          <GridPattern
            width={44}
            height={44}
            strokeDasharray="4 6"
            className="opacity-35 mask-[linear-gradient(to_bottom,#000_0%,#000_72%,transparent_100%)] motion-reduce:opacity-20"
          />
        </>
      ) : null}

      {variant === "showcase" ? (
        <>
          <div className="absolute inset-0 bg-muted/25 dark:bg-muted/15" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,color-mix(in_oklab,var(--primary)_9%,transparent),transparent)]" />
          <DotPattern
            width={22}
            height={22}
            cr={0.75}
            className="opacity-[0.2] mask-[radial-gradient(ellipse_85%_70%_at_50%_30%,#000_35%,transparent_100%)] motion-reduce:opacity-10"
          />
        </>
      ) : null}

      {variant === "terminal" ? (
        <>
          <div className="absolute inset-0 bg-linear-to-b from-muted/35 via-background to-background" />
          <GridPattern
            width={36}
            height={36}
            className="stroke-foreground/10 opacity-50 mask-[radial-gradient(ellipse_90%_80%_at_50%_40%,#000_25%,transparent_100%)] motion-reduce:opacity-25"
          />
          <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-border/80 to-transparent" />
        </>
      ) : null}

      {variant === "principles" ? (
        <>
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_65%_50%_at_100%_100%,color-mix(in_oklab,var(--chart-4)_8%,transparent),transparent)]" />
          <DotPattern
            width={18}
            height={18}
            cr={0.65}
            className="opacity-[0.18] mask-[linear-gradient(to_top,#000_0%,#000_65%,transparent_100%)] motion-reduce:opacity-10"
          />
        </>
      ) : null}

      {variant === "footer" ? (
        <>
          <div className="absolute inset-0 bg-muted/15" />
          <GridPattern
            width={52}
            height={52}
            strokeDasharray="2 8"
            className="opacity-25 mask-[linear-gradient(to_top,transparent_0%,#000_40%,transparent_100%)] motion-reduce:opacity-15"
          />
        </>
      ) : null}
    </div>
  )
}
