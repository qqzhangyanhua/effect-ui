"use client"

// Ported from Kibo UI (MIT, (c) shadcnblocks) — https://github.com/shadcnblocks/kibo/blob/main/packages/status/index.tsx

import { Badge } from "@/components/ui/badge"
import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

import { useRef, type ComponentProps, type HTMLAttributes, type ReactNode } from "react"

export type StatusState = "online" | "offline" | "maintenance" | "degraded"

export interface StatusProps extends ComponentProps<typeof Badge> {
  status: StatusState
}

const tone =
  "group-data-[status=online]:bg-emerald-500 group-data-[status=offline]:bg-red-500 group-data-[status=maintenance]:bg-blue-500 group-data-[status=degraded]:bg-amber-500"

export function Status({ className, status, ...props }: StatusProps) {
  return (
    <Badge
      className={cn("group flex items-center gap-2", className)}
      data-slot="status"
      data-status={status}
      variant="secondary"
      {...props}
    />
  )
}

export function StatusIndicator({ className, ...props }: HTMLAttributes<HTMLSpanElement>) {
  const ref = useRef<HTMLSpanElement>(null)
  const prefersReducedMotion = usePrefersReducedMotion()
  const motionOn = useAnimationActive(ref)
  const ping = !prefersReducedMotion && motionOn

  return (
    <span className={cn("relative flex size-2", className)} data-reduced={prefersReducedMotion ? "true" : "false"} ref={ref} {...props}>
      {ping ? <span className={cn("absolute inline-flex size-full animate-ping rounded-full opacity-75", tone)} /> : null}
      <span className={cn("relative inline-flex size-2 rounded-full", tone)} />
    </span>
  )
}

export function StatusLabel({ className, children, ...props }: HTMLAttributes<HTMLSpanElement> & { children?: ReactNode }) {
  return (
    <span className={cn("text-muted-foreground", className)} {...props}>
      {children ?? (
        <>
          <span className="hidden group-data-[status=online]:inline">在线</span>
          <span className="hidden group-data-[status=offline]:inline">离线</span>
          <span className="hidden group-data-[status=maintenance]:inline">维护</span>
          <span className="hidden group-data-[status=degraded]:inline">降级</span>
        </>
      )}
    </span>
  )
}
