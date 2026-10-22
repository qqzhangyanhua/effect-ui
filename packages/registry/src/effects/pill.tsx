"use client"

// Ported from Kibo UI (MIT, (c) shadcnblocks) — https://github.com/shadcnblocks/kibo/blob/main/packages/pill/index.tsx

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

import { ChevronDownIcon, ChevronUpIcon, MinusIcon } from "lucide-react"
import type { ComponentProps, ReactNode } from "react"

export interface PillProps {
  themed?: boolean
  variant?: "default" | "secondary" | "destructive" | "outline"
  className?: string
  children?: ReactNode
}

export function Pill({ variant = "secondary", themed = false, className, children }: PillProps) {
  return (
    <Badge
      className={cn("gap-2 rounded-full px-3 py-1.5 font-normal", themed && "border-foreground/10", className)}
      data-slot="pill"
      variant={variant}
    >
      {children}
    </Badge>
  )
}

export function PillAvatar({ fallback, className, ...props }: ComponentProps<typeof AvatarImage> & { fallback?: string }) {
  return (
    <Avatar className={cn("-ml-1 h-4 w-4", className)}>
      <AvatarImage {...props} />
      <AvatarFallback>{fallback}</AvatarFallback>
    </Avatar>
  )
}

export function PillButton({ className, ...props }: ComponentProps<typeof Button>) {
  return (
    <Button
      className={cn("-my-2 -mr-2 size-6 rounded-full p-0.5 hover:bg-foreground/5", className)}
      size="icon"
      variant="ghost"
      {...props}
    />
  )
}

export function PillStatus({ children, className }: { children?: ReactNode; className?: string }) {
  return <div className={cn("flex items-center gap-2 border-r pr-2 font-medium", className)}>{children}</div>
}

export function PillIndicator({
  variant = "success",
  pulse = false,
}: {
  variant?: "success" | "error" | "warning" | "info"
  pulse?: boolean
}) {
  const prefersReducedMotion = usePrefersReducedMotion()
  const ping = pulse && !prefersReducedMotion
  const tone =
    variant === "error"
      ? "bg-rose-400"
      : variant === "warning"
        ? "bg-amber-400"
        : variant === "info"
          ? "bg-sky-400"
          : "bg-emerald-400"
  const solid =
    variant === "error"
      ? "bg-rose-500"
      : variant === "warning"
        ? "bg-amber-500"
        : variant === "info"
          ? "bg-sky-500"
          : "bg-emerald-500"

  return (
    <span className="relative flex size-2" data-reduced={prefersReducedMotion ? "true" : "false"}>
      {ping ? <span className={cn("absolute inline-flex h-full w-full animate-ping rounded-full opacity-75", tone)} /> : null}
      <span className={cn("relative inline-flex size-2 rounded-full", solid)} />
    </span>
  )
}

export function PillDelta({ className, delta }: { className?: string; delta: number }) {
  if (!delta) return <MinusIcon className={cn("size-3 text-muted-foreground", className)} />
  if (delta > 0) return <ChevronUpIcon className={cn("size-3 text-emerald-500", className)} />
  return <ChevronDownIcon className={cn("size-3 text-rose-500", className)} />
}

export function PillIcon({
  icon: Icon,
  className,
}: {
  icon: typeof ChevronUpIcon
  className?: string
}) {
  return <Icon className={cn("size-3 text-muted-foreground", className)} size={12} />
}

export function PillAvatarGroup({ children, className }: { children?: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "flex items-center -space-x-1",
        "[&>*:not(:first-of-type)]:[mask-image:radial-gradient(circle_9px_at_-4px_50%,transparent_99%,white_100%)]",
        className,
      )}
    >
      {children}
    </div>
  )
}
