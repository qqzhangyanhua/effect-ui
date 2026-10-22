"use client"

// Ported from Fancy Components (MIT, (c) 2024 Daniel Petho) — https://github.com/danielpetho/fancy/blob/main/src/fancy/components/background/pixel-trail.tsx

import { useAnimationActive } from "@/hooks/use-animation-active"
import { useDimensions } from "@/hooks/use-dimensions"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

import { motion, useAnimationControls } from "motion/react"
import { memo, useCallback, useId, useLayoutEffect, useMemo, useRef } from "react"

export interface PixelTrailProps {
  pixelSize?: number
  fadeDuration?: number
  delay?: number
  className?: string
  pixelClassName?: string
}

type PixelNode = HTMLDivElement & { __animatePixel?: () => void }

export function PixelTrail({
  pixelSize = 20,
  fadeDuration = 500,
  delay = 0,
  className,
  pixelClassName,
}: PixelTrailProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const dimensions = useDimensions(containerRef)
  const prefersReducedMotion = usePrefersReducedMotion()
  const motionOn = useAnimationActive(containerRef)
  const trailId = useId()
  const safeSize = Math.max(pixelSize, 1)
  const interactive = !prefersReducedMotion && motionOn

  const handleMouseMove = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
    if (!interactive || !containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const x = Math.floor((event.clientX - rect.left) / safeSize)
    const y = Math.floor((event.clientY - rect.top) / safeSize)
    const pixel = document.getElementById(`${trailId}-pixel-${x}-${y}`)
    if (!pixel) return
    const animatePixel = (pixel as PixelNode).__animatePixel
    animatePixel?.()
    },
    [interactive, safeSize, trailId],
  )

  const columns = useMemo(() => Math.ceil(dimensions.width / safeSize), [dimensions.width, safeSize])
  const rows = useMemo(() => Math.ceil(dimensions.height / safeSize), [dimensions.height, safeSize])

  return (
    <div
      className={cn("pointer-events-auto absolute inset-0 h-full w-full", className)}
      data-reduced={prefersReducedMotion ? "true" : "false"}
      data-slot="pixel-trail"
      onMouseMove={handleMouseMove}
      ref={containerRef}
    >
      {Array.from({ length: rows }, (_, rowIndex) => (
        <div className="flex" key={rowIndex}>
          {Array.from({ length: columns }, (_, colIndex) => (
            <PixelDot
              className={pixelClassName}
              delay={delay}
              fadeDuration={fadeDuration}
              id={`${trailId}-pixel-${colIndex}-${rowIndex}`}
              interactive={interactive}
              key={`${colIndex}-${rowIndex}`}
              size={safeSize}
            />
          ))}
        </div>
      ))}
    </div>
  )
}

interface PixelDotProps {
  id: string
  size: number
  fadeDuration: number
  delay: number
  className?: string
  interactive: boolean
}

const PixelDot = memo(function PixelDot({ id, size, fadeDuration, delay, className, interactive }: PixelDotProps) {
  const controls = useAnimationControls()
  const nodeRef = useRef<PixelNode | null>(null)
  const animateRef = useRef<() => void>(() => {})

  // Motion 只在节点挂载时调用一次 ref。交互开关晚于首帧打开，动画函数必须每次提交都换成最新的。
  useLayoutEffect(() => {
    animateRef.current = () => {
      if (!interactive) return
      void controls.start({ opacity: 1, transition: { duration: 0.05 } }).then(() => {
        if (!interactive) return
        return controls.start({
          opacity: 0,
          transition: { duration: fadeDuration / 1000, delay: delay / 1000 },
        })
      })
    }
    if (nodeRef.current) nodeRef.current.__animatePixel = () => animateRef.current()
  }, [controls, delay, fadeDuration, interactive])

  const setNode = useCallback((node: HTMLDivElement | null) => {
    nodeRef.current = node
    if (!node) return
    ;(node as PixelNode).__animatePixel = () => animateRef.current()
  }, [])

  return (
    <motion.div
      animate={controls}
      className={cn("cursor-crosshair", className)}
      exit={{ opacity: 0 }}
      id={id}
      initial={{ opacity: 0 }}
      ref={setNode}
      style={{ width: size, height: size }}
    />
  )
})
