"use client"

// Ported from UI Layouts (MIT, (c) 2024 UI LAYOUT) — https://github.com/ui-layouts/uilayouts/blob/main/apps/ui-layout/components/ui/image-tabs.tsx. Modified for effect-ui.

import { useMediaQuery } from "@/hooks/use-media-query"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

import type { HTMLAttributes } from "react"

export interface ImageTab {
  id: string
  title: string
  description: string
  imageUrl: string
  imageAlt: string
}

export interface ImageTabsProps extends HTMLAttributes<HTMLDivElement> {
  tabs: readonly ImageTab[]
  value: string
  onValueChange: (value: string) => void
}

export function ImageTabs({ tabs, value, onValueChange, className, ...props }: ImageTabsProps) {
  const reduced = usePrefersReducedMotion()
  const desktop = useMediaQuery("(min-width: 768px)")
  const active = tabs.find((tab) => tab.id === value) ?? tabs[0]
  return (
    <div
      {...props}
      className={cn("grid w-full gap-4 md:grid-cols-[minmax(0,16rem)_1fr]", className)}
      data-reduced={reduced ? "true" : "false"}
      data-slot="image-tabs"
    >
      <div className="flex flex-col gap-2" role="tablist">
        {tabs.map((tab) => {
          const selected = tab.id === active?.id
          return (
            <button
              aria-selected={selected}
              className={cn(
                "rounded-lg border px-4 py-3 text-left",
                selected ? "border-primary bg-muted" : "border-transparent bg-background",
                reduced ? "transition-none" : "transition-colors",
              )}
              key={tab.id}
              onClick={() => onValueChange(tab.id)}
              role="tab"
              type="button"
            >
              <span className="block font-semibold">{tab.title}</span>
              {selected ? <span className="mt-2 block text-sm text-muted-foreground">{tab.description}</span> : null}
              {selected && !desktop ? (
                // eslint-disable-next-line @next/next/no-img-element -- registry 组件用 img，不引入 next/image
                <img alt={tab.imageAlt} className="mt-3 h-36 w-full rounded-md object-cover" src={tab.imageUrl} />
              ) : null}
            </button>
          )
        })}
      </div>
      {desktop && active ? (
        // eslint-disable-next-line @next/next/no-img-element -- registry 组件用 img，不引入 next/image
        <img alt={active.imageAlt} className="h-72 w-full rounded-xl object-cover" src={active.imageUrl} />
      ) : null}
    </div>
  )
}
