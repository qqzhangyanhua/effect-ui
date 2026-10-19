"use client"

import { useAnimationFrame, useMotionValue, useTransform } from "motion/react"
import { motion } from "motion/react"
import * as React from "react"

import { cn } from "@/lib/utils"

export interface MarqueeAlongSvgPathProps {
  path?: string
  className?: string
  viewBox?: string
  showPath?: boolean
  baseVelocity?: number
  repeat?: number
  children?: React.ReactNode
}

const DEFAULT_PATH = "M 20 90 C 80 10, 200 10, 280 90 S 420 170, 520 90"

function wrap(min: number, max: number, value: number) {
  const range = max - min
  return ((((value - min) % range) + range) % range) + min
}

function MarqueeItem({
  child,
  itemIndex,
  total,
  baseOffset,
  path,
  hidden,
}: {
  child: React.ReactNode
  itemIndex: number
  total: number
  baseOffset: ReturnType<typeof useMotionValue<number>>
  path: string
  hidden: boolean
}) {
  const offset = useTransform(baseOffset, (value) => {
    const position = (itemIndex * 100) / Math.max(total, 1)
    return `${wrap(0, 100, value + position)}%`
  })

  return (
    <motion.div
      aria-hidden={hidden}
      className="absolute top-0 left-0"
      style={{ offsetPath: `path('${path}')`, offsetDistance: offset }}
    >
      {child}
    </motion.div>
  )
}

function MarqueeAlongSvgPath({
  path = DEFAULT_PATH,
  className,
  viewBox = "0 0 540 180",
  showPath = true,
  baseVelocity = 8,
  repeat = 2,
  children,
}: MarqueeAlongSvgPathProps) {
  const baseOffset = useMotionValue(0)
  const items = React.useMemo(() => {
    const childrenArray = React.Children.toArray(children)
    return childrenArray.flatMap((child, childIndex) =>
      Array.from({ length: repeat }, (_, repeatIndex) => ({
        child,
        key: `${childIndex}-${repeatIndex}`,
        itemIndex: repeatIndex * childrenArray.length + childIndex,
        hidden: repeatIndex > 0,
      })),
    )
  }, [children, repeat])

  useAnimationFrame((_, delta) => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
    baseOffset.set(baseOffset.get() + (delta / 1000) * baseVelocity)
  })

  return (
    <div className={cn("relative min-h-40 overflow-hidden", className)}>
      <svg viewBox={viewBox} className="absolute inset-0 size-full">
        {showPath ? <path d={path} fill="none" stroke="currentColor" strokeOpacity="0.2" /> : null}
      </svg>
      {items.map((item) => (
        <MarqueeItem
          key={item.key}
          child={item.child}
          itemIndex={item.itemIndex}
          total={items.length}
          baseOffset={baseOffset}
          path={path}
          hidden={item.hidden}
        />
      ))}
    </div>
  )
}

export { MarqueeAlongSvgPath }
