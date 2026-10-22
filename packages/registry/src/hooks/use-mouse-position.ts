"use client"

// Ported from Fancy Components (MIT, (c) 2024 Daniel Petho) — https://github.com/danielpetho/fancy/blob/main/src/hooks/use-mouse-position.ts

import { useEffect, useState, type RefObject } from "react"

export function useMousePosition(containerRef?: RefObject<HTMLElement | SVGElement | null>) {
  const [position, setPosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const updatePosition = (x: number, y: number) => {
      const node = containerRef?.current
      if (node) {
        const rect = node.getBoundingClientRect()
        setPosition({ x: x - rect.left, y: y - rect.top })
        return
      }
      setPosition({ x, y })
    }

    const handleMouseMove = (event: MouseEvent) => {
      updatePosition(event.clientX, event.clientY)
    }

    const handleTouchMove = (event: TouchEvent) => {
      const touch = event.touches[0]
      if (!touch) return
      updatePosition(touch.clientX, touch.clientY)
    }

    window.addEventListener("mousemove", handleMouseMove)
    window.addEventListener("touchmove", handleTouchMove)
    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("touchmove", handleTouchMove)
    }
  }, [containerRef])

  return position
}
