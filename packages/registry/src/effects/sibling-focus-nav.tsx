"use client"

// Ported from Animata (MIT) — https://github.com/codse/animata/blob/main/animata/container/sibling-focus-nav.tsx

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export interface SiblingFocusNavProps {
  items: { href: string; label: string }[]
  className?: string
}

const SIBLING_CSS = `
[data-slot="sibling-focus-nav"]:is(:hover, :focus-within) a {
  opacity: 0.38;
  filter: blur(2.5px);
  transition: opacity 0.2s ease, filter 0.2s ease;
}
[data-slot="sibling-focus-nav"] a:is(:hover, :focus-visible) {
  opacity: 1;
  filter: none;
}
[data-slot="sibling-focus-nav"][data-reduced="true"]:is(:hover, :focus-within) a {
  filter: none;
}
`

function SiblingFocusNav({ items, className }: SiblingFocusNavProps) {
  const reduced = usePrefersReducedMotion()

  return (
    <nav
      data-slot="sibling-focus-nav"
      data-reduced={reduced ? "true" : undefined}
      className={cn("flex w-full flex-wrap items-center justify-center gap-2", className)}
    >
      <style>{SIBLING_CSS}</style>
      {items.map((item) => (
        <a
          key={`${item.href}-${item.label}`}
          href={item.href}
          className="rounded-full px-4 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {item.label}
        </a>
      ))}
    </nav>
  )
}

export { SiblingFocusNav }
