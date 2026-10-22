"use client"

// Ported from Fancy Components (MIT, (c) 2024 Daniel Petho) — https://github.com/danielpetho/fancy/blob/main/src/hooks/use-elastic-line-events.ts

import { useEffect, useState, type RefObject } from "react"

import { useDimensions } from "@/hooks/use-dimensions"
import { useMousePosition } from "@/hooks/use-mouse-position"

export interface ElasticLineEvents {
  isGrabbed: boolean
  controlPoint: { x: number; y: number }
}

export function useElasticLineEvents(
  containerRef: RefObject<SVGSVGElement | null>,
  isVertical: boolean,
  grabThreshold: number,
  releaseThreshold: number,
): ElasticLineEvents {
  const mousePosition = useMousePosition(containerRef)
  const dimensions = useDimensions(containerRef)
  const [isGrabbed, setIsGrabbed] = useState(false)
  const [controlPoint, setControlPoint] = useState({ x: 0, y: 0 })

  useEffect(() => {
    queueMicrotask(() => {
      if (!containerRef.current) return
      const { width, height } = dimensions
      if (width <= 0 || height <= 0) return
      const { x, y } = mousePosition
      const isOutsideBounds = x < 0 || x > width || y < 0 || y > height

      if (isOutsideBounds) {
        setIsGrabbed(false)
        return
      }

      let distance: number
      let next: { x: number; y: number }
      if (isVertical) {
        const midX = width / 2
        distance = Math.abs(x - midX)
        next = { x: midX + 2.2 * (x - midX), y }
      } else {
        const midY = height / 2
        distance = Math.abs(y - midY)
        next = { x, y: midY + 2.2 * (y - midY) }
      }

      setControlPoint(next)
      if (!isGrabbed && distance < grabThreshold) setIsGrabbed(true)
      else if (isGrabbed && distance > releaseThreshold) setIsGrabbed(false)
    })
  }, [containerRef, dimensions, grabThreshold, isGrabbed, isVertical, mousePosition, releaseThreshold])

  return { isGrabbed, controlPoint }
}
