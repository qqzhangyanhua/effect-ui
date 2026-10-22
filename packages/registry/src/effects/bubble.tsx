// Ported from ReUI (MIT, (c) 2025 Keenthemes Inc.) — https://github.com/keenthemes/reui/blob/main/registry/bases/radix/ui/bubble.tsx

import { cn } from "@/lib/utils"

import { Slot } from "@radix-ui/react-slot"
import { cva } from "class-variance-authority"
import { type HTMLAttributes } from "react"

const bubbleVariants = cva("group/bubble relative flex w-fit min-w-0 max-w-[80%] flex-col gap-1", {
  variants: {
    variant: {
      default: "**:data-[slot=bubble-content]:bg-primary **:data-[slot=bubble-content]:text-primary-foreground",
      secondary: "**:data-[slot=bubble-content]:bg-secondary **:data-[slot=bubble-content]:text-secondary-foreground",
      muted: "**:data-[slot=bubble-content]:bg-muted",
      tinted: "**:data-[slot=bubble-content]:bg-primary/15",
      outline: "**:data-[slot=bubble-content]:border-border **:data-[slot=bubble-content]:bg-background",
      ghost: "max-w-full **:data-[slot=bubble-content]:bg-transparent **:data-[slot=bubble-content]:p-0",
      destructive: "**:data-[slot=bubble-content]:bg-destructive/15 **:data-[slot=bubble-content]:text-destructive",
    },
  },
  defaultVariants: { variant: "default" },
})

export interface BubbleProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "muted" | "tinted" | "outline" | "ghost" | "destructive"
  align?: "start" | "end"
}

export function BubbleGroup({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex min-w-0 flex-col gap-2", className)} data-slot="bubble-group" {...props} />
}

export function Bubble({ variant = "default", align = "start", className, ...props }: BubbleProps) {
  return (
    <div
      className={cn(bubbleVariants({ variant }), align === "end" && "self-end", className)}
      data-align={align}
      data-slot="bubble"
      data-variant={variant}
      {...props}
    />
  )
}

export function BubbleContent({
  asChild = false,
  className,
  ...props
}: HTMLAttributes<HTMLDivElement> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "div"
  return (
    <Comp
      className={cn(
        "w-fit max-w-full overflow-hidden rounded-xl border border-transparent px-3 py-2 text-sm leading-relaxed wrap-break-word group-data-[align=end]/bubble:self-end",
        className,
      )}
      data-slot="bubble-content"
      {...props}
    />
  )
}

export function BubbleReactions({
  side = "bottom",
  align = "end",
  className,
  ...props
}: HTMLAttributes<HTMLDivElement> & { side?: "top" | "bottom"; align?: "start" | "end" }) {
  return (
    <div
      className={cn(
        "absolute z-10 flex w-fit items-center gap-1 rounded-full bg-muted px-1.5 py-0.5 text-sm ring-3 ring-card",
        side === "top" ? "top-0 -translate-y-3/4" : "bottom-0 translate-y-3/4",
        align === "start" ? "left-3" : "right-3",
        className,
      )}
      data-align={align}
      data-side={side}
      data-slot="bubble-reactions"
      {...props}
    />
  )
}
