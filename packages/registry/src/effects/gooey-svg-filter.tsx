"use client"

// Ported from Fancy Components (MIT, (c) 2024 Daniel Petho) — https://github.com/danielpetho/fancy/blob/main/src/fancy/components/filter/gooey-svg-filter.tsx

import { useId } from "react"

export interface GooeySvgFilterProps {
  id?: string
  strength?: number
}

export function GooeySvgFilter({ id, strength = 10 }: GooeySvgFilterProps) {
  const reactId = useId().replace(/:/g, "")
  const filterId = id ?? `gooey-${reactId}`

  return (
    <svg aria-hidden="true" className="pointer-events-none absolute hidden" data-slot="gooey-svg-filter">
      <defs>
        <filter id={filterId}>
          <feGaussianBlur in="SourceGraphic" result="blur-sm" stdDeviation={strength} />
          <feColorMatrix in="blur-sm" result="goo" type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 19 -9" />
          <feComposite in="SourceGraphic" in2="goo" operator="atop" />
        </filter>
      </defs>
    </svg>
  )
}
