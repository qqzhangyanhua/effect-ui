"use client"

// Ported from Fancy Components (MIT, (c) 2024 Daniel Petho) — https://github.com/danielpetho/fancy/blob/main/src/fancy/components/image/parallax-floating.tsx

import { useAnimationActive } from "@/hooks/use-animation-active"
import { useMousePositionRef } from "@/hooks/use-mouse-position-ref"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

import { useAnimationFrame } from "motion/react"
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  type ReactNode,
} from "react"

interface FloatingItem {
  element: HTMLDivElement
  depth: number
  currentPosition: { x: number; y: number }
}

interface FloatingContextType {
  registerElement: (id: string, element: HTMLDivElement, depth: number) => void
  unregisterElement: (id: string) => void
}

const FloatingContext = createContext<FloatingContextType | null>(null)

export interface FloatingProps {
  children?: ReactNode
  className?: string
  sensitivity?: number
  easingFactor?: number
}

export function Floating({ children, className, sensitivity = 1, easingFactor = 0.05 }: FloatingProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const elementsMap = useRef(new Map<string, FloatingItem>())
  const mousePositionRef = useMousePositionRef(containerRef)
  const prefersReducedMotion = usePrefersReducedMotion()
  const motionOn = useAnimationActive(containerRef)
  const paused = prefersReducedMotion || !motionOn

  const registerElement = useCallback((id: string, element: HTMLDivElement, depth: number) => {
    elementsMap.current.set(id, { element, depth, currentPosition: { x: 0, y: 0 } })
  }, [])

  const unregisterElement = useCallback((id: string) => {
    elementsMap.current.delete(id)
  }, [])

  const contextValue = useMemo(
    () => ({ registerElement, unregisterElement }),
    [registerElement, unregisterElement],
  )

  useAnimationFrame(() => {
    elementsMap.current.forEach((data) => {
      if (paused) {
        data.currentPosition.x = 0
        data.currentPosition.y = 0
        data.element.style.transform = "translate3d(0, 0, 0)"
        return
      }
      const strength = (data.depth * sensitivity) / 20
      const targetX = mousePositionRef.current.x * strength
      const targetY = mousePositionRef.current.y * strength
      data.currentPosition.x += (targetX - data.currentPosition.x) * easingFactor
      data.currentPosition.y += (targetY - data.currentPosition.y) * easingFactor
      data.element.style.transform = `translate3d(${data.currentPosition.x}px, ${data.currentPosition.y}px, 0)`
    })
  })

  return (
    <FloatingContext.Provider value={contextValue}>
      <div
        className={cn("absolute top-0 left-0 h-full w-full", className)}
        data-reduced={prefersReducedMotion ? "true" : "false"}
        data-slot="parallax-floating"
        ref={containerRef}
      >
        {children}
      </div>
    </FloatingContext.Provider>
  )
}

export interface FloatingElementProps {
  children?: ReactNode
  className?: string
  depth?: number
}

export function FloatingElement({ children, className, depth = 1 }: FloatingElementProps) {
  const elementRef = useRef<HTMLDivElement>(null)
  const reactId = useId()
  const context = useContext(FloatingContext)

  useEffect(() => {
    const node = elementRef.current
    if (!node || !context) return
    context.registerElement(reactId, node, depth || 0.01)
    return () => context.unregisterElement(reactId)
  }, [context, depth, reactId])

  return (
    <div className={cn("absolute will-change-transform", className)} ref={elementRef}>
      {children}
    </div>
  )
}
