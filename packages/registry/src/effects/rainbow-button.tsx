import * as React from "react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const rainbowStops = ["#f43f5e", "#f59e0b", "#22c55e", "#06b6d4", "#8b5cf6", "#f43f5e"]

export type RainbowButtonProps = React.ComponentProps<typeof Button> & {
  /** 旋转时长，毫秒。不传或 3000 仍是 3s。 */
  duration?: number
  /** 彩虹色。不传或这 6 个色仍用原来的类名。 */
  colors?: string[]
  /** 描边厚度倍率。不传或 1 仍是 2px。 */
  scale?: number
}

function sameRainbow(colors: string[] | undefined) {
  if (colors === undefined) return true
  return colors.length === rainbowStops.length && colors.every((color, index) => color === rainbowStops[index])
}

function RainbowButton({
  className,
  children,
  duration,
  colors,
  scale,
  variant,
  size,
  asChild = false,
  ...props
}: RainbowButtonProps) {
  const slotted =
    asChild && React.isValidElement<{ children?: React.ReactNode }>(children) ? children : null
  const timed = duration === undefined || duration === 3000
  const ms = timed ? 3000 : duration
  const painted = sameRainbow(colors)
  const ring = scale === undefined || scale === 1 ? undefined : 2 * scale
  const canonical = timed && painted && ring === undefined
  const content = (
    <>
      <span
        aria-hidden
        className={
          canonical
            ? "absolute inset-[-2px] animate-[rainbow-spin_3s_linear_infinite] motion-reduce:animate-none bg-[conic-gradient(from_var(--shine-angle),#f43f5e,#f59e0b,#22c55e,#06b6d4,#8b5cf6,#f43f5e)]"
            : cn(
                "absolute animate-[rainbow-spin_3s_linear_infinite] motion-reduce:animate-none",
                ring === undefined && "inset-[-2px]",
                painted &&
                  "bg-[conic-gradient(from_var(--shine-angle),#f43f5e,#f59e0b,#22c55e,#06b6d4,#8b5cf6,#f43f5e)]",
              )
        }
        style={
          canonical
            ? undefined
            : ({
                ...(ring === undefined ? {} : { inset: `${-ring}px` }),
                ...(timed ? {} : { animationDuration: `${ms}ms` }),
                ...(painted
                  ? {}
                  : { backgroundImage: `conic-gradient(from var(--shine-angle), ${colors?.join(",")})` }),
              } as React.CSSProperties)
        }
      />
      <span
        className={cn("absolute rounded-[6px] bg-zinc-950", ring === undefined && "inset-[2px]")}
        style={ring === undefined ? undefined : { inset: `${ring}px` }}
      />
      <span className="relative z-10">{slotted ? slotted.props.children : children}</span>
    </>
  )

  return (
    <Button
      data-slot="rainbow-button"
      variant={variant}
      size={size}
      asChild={asChild}
      className={cn("relative overflow-hidden", size == null && "h-10 px-5", className)}
      {...props}
    >
      {slotted ? React.cloneElement(slotted, {}, content) : content}
    </Button>
  )
}

export { RainbowButton }
