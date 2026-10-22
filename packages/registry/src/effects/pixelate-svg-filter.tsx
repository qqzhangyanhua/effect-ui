"use client"

// Ported from Fancy Components (MIT, (c) 2024 Daniel Petho) — https://github.com/danielpetho/fancy/blob/main/src/fancy/components/filter/pixelate-svg-filter.tsx

import { useId } from "react"

export interface PixelateSvgFilterProps {
  id?: string
  size?: number
  crossLayers?: boolean
}

export function PixelateSvgFilter({ id, size = 16, crossLayers = false }: PixelateSvgFilterProps) {
  const reactId = useId().replace(/:/g, "")
  const filterId = id ?? `pixelate-${reactId}`
  const safeSize = Math.max(size, 1)

  return (
    <svg aria-hidden="true" className="pointer-events-none absolute inset-0" data-slot="pixelate-svg-filter">
      <defs>
        <filter height="1" id={filterId} width="1" x="0" y="0">
          <feConvolveMatrix kernelMatrix="1 1 1 1 1 1 1 1 1" result="AVG" />
          <feFlood height="1" width="1" x="1" y="1" />
          <feComposite height={safeSize} k1="0" k2="1" k3="0" k4="0" operator="arithmetic" width={safeSize} />
          <feTile result="TILE" />
          <feComposite in="AVG" in2="TILE" k1="0" k2="1" k3="0" k4="0" operator="in" />
          <feMorphology operator="dilate" radius={safeSize / 2} result="NORMAL" />
          {crossLayers ? (
            <>
              <feConvolveMatrix kernelMatrix="1 1 1 1 1 1 1 1 1" result="AVG" />
              <feFlood height="1" width="1" x="1" y="1" />
              <feComposite
                height={safeSize}
                in2="SourceGraphic"
                k1="0"
                k2="1"
                k3="0"
                k4="0"
                operator="arithmetic"
                width={safeSize / 2}
              />
              <feTile result="TILE" />
              <feComposite in="AVG" in2="TILE" k1="0" k2="1" k3="0" k4="0" operator="in" />
              <feMorphology operator="dilate" radius={safeSize / 2} result="FALLBACKX" />
              <feConvolveMatrix kernelMatrix="1 1 1 1 1 1 1 1 1" result="AVG" />
              <feFlood height="1" width="1" x="1" y="1" />
              <feComposite
                height={safeSize / 2}
                in2="SourceGraphic"
                k1="0"
                k2="1"
                k3="0"
                k4="0"
                operator="arithmetic"
                width={safeSize}
              />
              <feTile result="TILE" />
              <feComposite in="AVG" in2="TILE" k1="0" k2="1" k3="0" k4="0" operator="in" />
              <feMorphology operator="dilate" radius={safeSize / 2} result="FALLBACKY" />
              <feMerge>
                <feMergeNode in="FALLBACKX" />
                <feMergeNode in="FALLBACKY" />
                <feMergeNode in="NORMAL" />
              </feMerge>
            </>
          ) : (
            <feMergeNode in="NORMAL" />
          )}
        </filter>
      </defs>
    </svg>
  )
}
