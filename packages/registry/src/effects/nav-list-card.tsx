"use client"

// Copyright Spectrum UI (Made by Arihant)
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Modified by effect-ui: framer-motion 改为 motion/react，示例数据移到 demo，颜色改为主题变量，减弱动效时行不再位移。
// Ported from Spectrum UI（Apache-2.0，Made by Arihant）— https://github.com/arihantcodes/spectrum-ui/blob/main/components/spectrumui/nav-list-card.tsx

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

import { motion } from "motion/react"
import type { ReactNode } from "react"

export interface NavListItem {
  icon?: ReactNode
  label: string
  href?: string
}

export interface NavListCardProps {
  title?: string
  items: NavListItem[]
  className?: string
}

export function NavListCard({ title = "", items, className }: NavListCardProps) {
  const prefersReducedMotion = usePrefersReducedMotion()

  return (
    <div data-reduced={prefersReducedMotion ? "true" : "false"} data-slot="nav-list-card" className={cn("w-full rounded-2xl border border-border bg-card pb-2 pt-4 shadow-sm", className)}>
      {title ? <p className="px-5 text-xs font-medium text-muted-foreground">{title}</p> : null}
      <ul className="mt-2 space-y-1 px-2">
        {items.map((item) => {
          const inner = (
            <motion.span whileHover={prefersReducedMotion ? undefined : { x: 2 }} whileTap={prefersReducedMotion ? undefined : { scale: 0.98 }} transition={prefersReducedMotion ? { duration: 0 } : { type: "spring", bounce: 0.4, duration: 0.3 }} className="flex h-8 items-center gap-2 rounded-full px-2.5 hover:bg-muted">
              {item.icon ? <span className="flex shrink-0 text-foreground [&_svg]:h-4 [&_svg]:w-4">{item.icon}</span> : null}
              <span className="truncate text-sm text-foreground">{item.label}</span>
            </motion.span>
          )
          return (
            <li key={item.label}>
              {item.href ? (
                <a href={item.href} className="block">
                  {inner}
                </a>
              ) : (
                <button type="button" className="block w-full text-left">
                  {inner}
                </button>
              )}
            </li>
          )
        })}
      </ul>
    </div>
  )
}
