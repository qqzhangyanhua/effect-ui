"use client"

// Ported from ReUI (MIT, (c) 2025 Keenthemes Inc.) — https://github.com/keenthemes/reui/blob/main/registry/bases/radix/ui/attachment.tsx

import { Button } from "@/components/ui/button"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

import { Slot } from "@radix-ui/react-slot"
import { cva } from "class-variance-authority"
import { type ComponentProps, type HTMLAttributes } from "react"

const attachmentVariants = cva(
  "group/attachment relative flex max-w-full min-w-0 shrink-0 flex-wrap rounded-xl border bg-card text-card-foreground focus-within:ring-1 focus-within:ring-ring/50 data-[state=error]:border-destructive/30 data-[state=idle]:border-dashed",
  {
    variants: {
      size: {
        default: "gap-2 p-2 text-sm has-data-[slot=attachment-content]:px-2.5 has-data-[slot=attachment-content]:py-2",
        sm: "gap-2 p-1.5 text-xs has-data-[slot=attachment-content]:px-2 has-data-[slot=attachment-content]:py-1.5",
        xs: "gap-1.5 rounded-lg p-1 text-xs has-data-[slot=attachment-content]:px-1.5 has-data-[slot=attachment-content]:py-1",
      },
      orientation: {
        horizontal: "min-w-40 items-center",
        vertical: "w-24 flex-col has-data-[slot=attachment-content]:w-32",
      },
    },
    defaultVariants: { size: "default", orientation: "horizontal" },
  },
)

export type AttachmentState = "idle" | "uploading" | "processing" | "error" | "done"

export interface AttachmentProps extends HTMLAttributes<HTMLDivElement> {
  state?: AttachmentState
  size?: "default" | "sm" | "xs"
  orientation?: "horizontal" | "vertical"
}

export function Attachment({
  className,
  state = "done",
  size = "default",
  orientation = "horizontal",
  ...props
}: AttachmentProps) {
  const prefersReducedMotion = usePrefersReducedMotion()
  return (
    <div
      className={cn(attachmentVariants({ size, orientation }), className)}
      data-orientation={orientation}
      data-reduced={prefersReducedMotion ? "true" : "false"}
      data-size={size}
      data-slot="attachment"
      data-state={state}
      {...props}
    />
  )
}

export function AttachmentMedia({
  className,
  variant = "icon",
  ...props
}: HTMLAttributes<HTMLDivElement> & { variant?: "icon" | "image" }) {
  return (
    <div
      className={cn(
        "relative flex aspect-square w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-muted text-foreground group-data-[orientation=vertical]/attachment:w-full group-data-[size=sm]/attachment:w-8 group-data-[size=xs]/attachment:w-7 [&_svg:not([class*='size-'])]:size-4",
        variant === "image" && "opacity-60 group-data-[state=done]/attachment:opacity-100 group-data-[state=idle]/attachment:opacity-100 *:data-[slot=img]:size-full *:data-[slot=img]:object-cover",
        "group-data-[state=error]/attachment:bg-destructive/10 group-data-[state=error]/attachment:text-destructive",
        className,
      )}
      data-slot="attachment-media"
      data-variant={variant}
      {...props}
    />
  )
}

export function AttachmentContent({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("min-w-0 flex-1 leading-tight", className)} data-slot="attachment-content" {...props} />
}

export function AttachmentTitle({ className, ...props }: HTMLAttributes<HTMLSpanElement>) {
  const prefersReducedMotion = usePrefersReducedMotion()
  return (
    <span
      className={cn(
        "block max-w-full truncate font-medium",
        !prefersReducedMotion && "group-data-[state=processing]/attachment:animate-pulse group-data-[state=uploading]/attachment:animate-pulse",
        className,
      )}
      data-slot="attachment-title"
      {...props}
    />
  )
}

export function AttachmentDescription({ className, ...props }: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "mt-0.5 block max-w-full truncate text-xs text-muted-foreground group-data-[state=error]/attachment:text-destructive/80",
        className,
      )}
      data-slot="attachment-description"
      {...props}
    />
  )
}

export function AttachmentActions({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "relative z-20 flex shrink-0 items-center group-data-[orientation=vertical]/attachment:absolute group-data-[orientation=vertical]/attachment:top-2 group-data-[orientation=vertical]/attachment:right-2",
        className,
      )}
      data-slot="attachment-actions"
      {...props}
    />
  )
}

export function AttachmentAction({ className, ...props }: ComponentProps<typeof Button>) {
  return <Button className={cn("size-7", className)} data-slot="attachment-action" size="icon" type="button" variant="ghost" {...props} />
}

export function AttachmentTrigger({
  asChild = false,
  className,
  type,
  ...props
}: HTMLAttributes<HTMLElement> & { asChild?: boolean; type?: "button" | "submit" | "reset" }) {
  const Comp = asChild ? Slot : "button"
  return (
    <Comp
      className={cn("absolute inset-0 z-10 outline-none", className)}
      data-slot="attachment-trigger"
      type={asChild ? undefined : (type ?? "button")}
      {...props}
    />
  )
}

export function AttachmentGroup({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("flex min-w-0 gap-3 overflow-x-auto py-1", className)}
      data-slot="attachment-group"
      {...props}
    />
  )
}

export function AttachmentImage({ alt, className, ...props }: ComponentProps<"img"> & { alt: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element -- registry 组件不能依赖 next/image
    <img alt={alt} className={cn("size-full object-cover", className)} data-slot="img" {...props} />
  )
}
