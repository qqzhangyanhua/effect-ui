"use client"

// Copyright 2025 Tremor
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Tremor's LICENSE also notes that TabNavigation uses parts of shadcn (MIT), radix-ui/themes (MIT), and Medusa (MIT).
// Modified by effect-ui: replaced cx with cn and the blue/gray palette with theme tokens.
// Ported from Tremor Raw (Apache-2.0) — https://github.com/tremorlabs/tremor/blob/main/src/components/TabNavigation/TabNavigation.tsx

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

import * as NavigationMenuPrimitive from "@radix-ui/react-navigation-menu"
import { type ComponentProps, type ReactNode } from "react"

export function TabNavigation({ className, children, ...props }: ComponentProps<typeof NavigationMenuPrimitive.Root>) {
  return (
    <NavigationMenuPrimitive.Root data-slot="tab-navigation" {...props}>
      <NavigationMenuPrimitive.List
        className={cn("flex items-center justify-start border-b border-border whitespace-nowrap", className)}
      >
        {children}
      </NavigationMenuPrimitive.List>
    </NavigationMenuPrimitive.Root>
  )
}

export interface TabNavigationLinkProps {
  href: string
  active?: boolean
  disabled?: boolean
  children?: ReactNode
  className?: string
}

export function TabNavigationLink({ href, active = false, disabled = false, children, className }: TabNavigationLinkProps) {
  const reduced = usePrefersReducedMotion()
  return (
    <NavigationMenuPrimitive.Item className="flex">
      <NavigationMenuPrimitive.Link active={active} asChild>
        <a
          aria-current={active ? "page" : undefined}
          aria-disabled={disabled || undefined}
          className={cn(
            "-mb-px flex items-center border-b-2 border-transparent px-3 pb-2 text-sm font-medium text-muted-foreground transition-colors motion-reduce:transition-none hover:border-border hover:text-foreground",
            reduced && "transition-none",
            active && "border-primary text-primary",
            disabled && "pointer-events-none text-muted-foreground/40",
            className,
          )}
          data-reduced={reduced ? "true" : undefined}
          data-slot="tab-navigation-link"
          href={href}
          onClick={disabled ? (event) => event.preventDefault() : undefined}
        >
          {children}
        </a>
      </NavigationMenuPrimitive.Link>
    </NavigationMenuPrimitive.Item>
  )
}
