"use client"

// Ported from Fancy Components (MIT, (c) 2024 Daniel Petho) — https://github.com/danielpetho/fancy/blob/main/src/hooks/use-dimensions.ts

import { useEffect, useState, type RefObject } from "react"

export interface Dimensions {
  width: number
  height: number
}

export function useDimensions(ref: RefObject<HTMLElement | SVGElement | null>): Dimensions {
  const [dimensions, setDimensions] = useState<Dimensions>({ width: 0, height: 0 })

  useEffect(() => {
    const updateDimensions = () => {
      const node = ref.current
      if (!node) return
      const { width, height } = node.getBoundingClientRect()
      setDimensions({ width, height })
    }

    queueMicrotask(updateDimensions)
    window.addEventListener("resize", updateDimensions)
    return () => window.removeEventListener("resize", updateDimensions)
  }, [ref])

  return dimensions
}
