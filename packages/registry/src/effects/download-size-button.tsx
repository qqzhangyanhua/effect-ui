"use client"

// Ported from Uiverse galaxy（MIT，(c) 2023 Uiverse.io, author satyamchaudharydev）— https://github.com/uiverse-io/galaxy/blob/main/Buttons/satyamchaudharydev_afraid-yak-30.html

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

import { type MouseEvent, type ReactNode } from "react"

export interface DownloadSizeButtonProps {
  size?: number
  label?: string
  href?: string
  onClick?: (event: MouseEvent<HTMLButtonElement | HTMLAnchorElement>) => void
  className?: string
  children?: ReactNode
}

export function DownloadSizeButton({
  size = 20,
  label = "下载",
  href,
  onClick,
  className,
  children,
}: DownloadSizeButtonProps) {
  const prefersReducedMotion = usePrefersReducedMotion()
  const tooltip = `大小: ${size} MB`
  const classes = cn(
    "group/download relative inline-flex h-9 min-w-28 items-center justify-center overflow-hidden rounded-md bg-primary px-3 text-sm text-primary-foreground",
    className,
  )
  const body = (
    <>
      <span
        aria-hidden
        className={cn(
          "pointer-events-none absolute bottom-[calc(100%+0.6rem)] left-1/2 -translate-x-1/2 rounded bg-popover px-2 py-1 text-xs whitespace-nowrap text-popover-foreground opacity-0 shadow group-hover/download:opacity-100",
          prefersReducedMotion ? "transition-none" : "transition-opacity",
        )}
      >
        {tooltip}
        <span className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-popover" />
      </span>
      <span
        className={cn(
          "absolute inset-0 flex items-center justify-center",
          prefersReducedMotion ? "group-hover/download:-translate-y-full" : "transition-transform duration-300 group-hover/download:-translate-y-full",
        )}
      >
        {children ?? label}
      </span>
      <span
        aria-hidden
        className={cn(
          "absolute inset-0 flex translate-y-full items-center justify-center",
          prefersReducedMotion ? "transition-none group-hover/download:translate-y-0" : "transition-transform duration-300 group-hover/download:translate-y-0",
        )}
      >
        <svg className="size-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path d="M12 15V3m0 12-4-4m4 4 4-4M2 17l.621 2.485A2 2 0 0 0 4.561 21h14.878a2 2 0 0 0 1.94-1.515L22 17" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
    </>
  )
  const shared = {
    className: classes,
    "data-reduced": prefersReducedMotion ? "true" : "false",
    "data-slot": "download-size-button",
  }

  if (href) {
    return (
      <a {...shared} href={href} onClick={onClick}>
        {body}
      </a>
    )
  }
  return (
    <button {...shared} onClick={onClick} type="button">
      {body}
    </button>
  )
}
