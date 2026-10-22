"use client"

// Ported from Kibo UI (MIT, (c) shadcnblocks) — https://github.com/shadcnblocks/kibo/blob/main/packages/announcement/index.tsx

import { Badge } from "@/components/ui/badge"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

import type { HTMLAttributes, ReactNode } from "react"

export interface AnnouncementProps {
  themed?: boolean
  variant?: "default" | "secondary" | "destructive" | "outline"
  className?: string
  children?: ReactNode
}

export function Announcement({ variant = "outline", themed = false, className, children }: AnnouncementProps) {
  const reduced = usePrefersReducedMotion()
  return (
    <Badge
      className={cn(
        "group max-w-full gap-2 rounded-full bg-background px-3 py-0.5 font-medium shadow-sm transition-all motion-reduce:transition-none",
        reduced && "transition-none",
        "hover:shadow-md",
        themed && "announcement-themed border-foreground/5",
        className,
      )}
      data-reduced={reduced ? "true" : undefined}
      data-slot="announcement"
      variant={variant}
    >
      {children}
    </Badge>
  )
}

export function AnnouncementTag({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "-ml-2.5 shrink-0 truncate rounded-full bg-foreground/5 px-2.5 py-1 text-xs",
        "group-[.announcement-themed]:bg-background/60",
        className,
      )}
      {...props}
    />
  )
}

export function AnnouncementTitle({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex items-center gap-1 truncate py-1", className)} {...props} />
}
