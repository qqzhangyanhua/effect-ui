"use client"

// Ported from Fancy Components (MIT, (c) 2024 Daniel Petho) — https://github.com/danielpetho/fancy/blob/main/src/hooks/use-debounced-dimensions.ts

import { useEffect, useState, type RefObject } from "react"

export interface Dimensions {
  width: number
  height: number
}

export function useDebouncedDimensions(
  ref: RefObject<HTMLElement | SVGElement | null>,
  delay = 250,
): Dimensions {
  const [dimensions, setDimensions] = useState<Dimensions>({ width: 0, height: 0 })

  useEffect(() => {
    let timeoutId = 0

    const updateDimensions = () => {
      const node = ref.current
      if (!node) return
      const { width, height } = node.getBoundingClientRect()
      setDimensions({ width, height })
    }

    const debouncedUpdateDimensions = () => {
      window.clearTimeout(timeoutId)
      timeoutId = window.setTimeout(updateDimensions, delay)
    }

    queueMicrotask(updateDimensions)
    window.addEventListener("resize", debouncedUpdateDimensions)
    return () => {
      window.removeEventListener("resize", debouncedUpdateDimensions)
      window.clearTimeout(timeoutId)
    }
  }, [delay, ref])

  return dimensions
}
