"use client"

// Ported from GodUI (MIT, (c) 2026 Lucas Bassetti) — https://github.com/LucasBassetti/godui/blob/1f632a7/packages/lab/src/store-badge/store-badge.tsx
// The QR popover and uqr encoder are omitted. The badge is the store lockup only.

import { useRef, type AnchorHTMLAttributes, type HTMLAttributes } from "react"
import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"

export type StoreBadgeProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "children"> & {
  store: "app-store" | "google-play"
  theme?: "dark" | "light"
  height?: number
}

const copy = {
  "app-store": { top: "Download on the", name: "App Store" },
  "google-play": { top: "Get it on", name: "Google Play" },
}

function AppleLogo({ size }: { size: number }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" width={size} height={size} className="shrink-0">
      <path d="M17.05 12.53c-.02-2.2 1.8-3.26 1.88-3.31-1.03-1.5-2.62-1.71-3.19-1.73-1.36-.14-2.65.8-3.34.8-.69 0-1.75-.78-2.87-.76-1.48.02-2.84.86-3.6 2.18-1.53 2.66-.39 6.6 1.1 8.76.73 1.06 1.6 2.25 2.74 2.2 1.1-.04 1.51-.71 2.84-.71 1.32 0 1.7.71 2.86.69 1.18-.02 1.93-1.08 2.65-2.14.84-1.23 1.18-2.42 1.2-2.48-.03-.01-2.29-.88-2.32-3.49zM14.86 5.6c.6-.74 1.01-1.75.9-2.77-.87.04-1.94.59-2.57 1.32-.56.64-1.05 1.68-.92 2.67.97.08 1.97-.5 2.59-1.22z" />
    </svg>
  )
}

function GooglePlayLogo({ size }: { size: number }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" width={size} height={size} className="shrink-0">
      <path d="M3.6 2.3c-.24.25-.38.64-.38 1.15v17.1c0 .5.14.9.38 1.15l.06.06L13.2 12.1v-.2L3.66 2.24l-.06.06z" fill="var(--chart-3)" />
      <path d="M16.4 15.3l-3.2-3.2v-.2l3.2-3.2.07.04 3.79 2.15c1.08.61 1.08 1.62 0 2.24l-3.79 2.15-.07.04z" fill="var(--chart-4)" />
      <path d="M16.47 15.26L13.2 12 3.6 21.7c.36.38.94.42 1.6.05l11.27-6.49z" fill="var(--destructive)" />
      <path d="M16.47 8.74L5.2 2.25c-.66-.38-1.24-.33-1.6.05L13.2 12l3.27-3.26z" fill="var(--chart-2)" />
    </svg>
  )
}

export function StoreBadge({ store, theme = "dark", height = 52, className, style, ...props }: StoreBadgeProps) {
  const ref = useRef<HTMLAnchorElement>(null)
  const reduced = usePrefersReducedMotion()
  const live = useAnimationActive(ref)
  const text = copy[store]
  const icon = Math.round(height * 0.52)
  const dark = theme === "dark"
  return (
    <a
      ref={ref}
      data-slot="store-badge"
      data-store={store}
      data-motion={live && !reduced ? "on" : "off"}
      className={`group/badge relative isolate inline-flex items-center overflow-hidden transition-transform motion-reduce:transition-none active:scale-[0.98] ${dark ? "bg-foreground text-background ring-1 ring-background/20" : "bg-background text-foreground ring-1 ring-foreground/15"} ${className ?? ""}`}
      style={{
        height,
        gap: Math.round(height * 0.17),
        paddingInline: Math.round(height * 0.3),
        borderRadius: Math.round(height * 0.18),
        ...style,
      }}
      {...props}
    >
      {store === "app-store" ? <AppleLogo size={icon} /> : <GooglePlayLogo size={icon} />}
      <span className="flex flex-col items-start leading-none">
        <span className="font-medium tracking-wide opacity-90" style={{ fontSize: Math.max(9, Math.round(height * 0.17)) }}>
          {text.top}
        </span>
        <span className="font-semibold leading-tight" style={{ fontSize: Math.max(13, Math.round(height * 0.3)), marginTop: height * 0.02 }}>
          {text.name}
        </span>
      </span>
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -translate-x-[130%] skew-x-[-12deg] bg-gradient-to-r from-transparent via-background/30 to-transparent transition-transform duration-700 motion-reduce:hidden group-hover/badge:translate-x-[130%] group-active/badge:translate-x-[130%] group-focus-visible/badge:translate-x-[130%]"
        style={{ animationPlayState: live && !reduced ? "running" : "paused" }}
      />
    </a>
  )
}

export function StoreBadgeGroup({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div data-slot="store-badge-group" className={`flex flex-wrap items-center gap-3 ${className ?? ""}`} {...props} />
}
