"use client"

import * as React from "react"
import {
  motion,
  useAnimationFrame,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
  type MotionValue,
} from "motion/react"

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

function wrap(min: number, max: number, value: number) {
  const range = max - min
  return ((((value - min) % range) + range) % range) + min
}

const VelocityContext = React.createContext<MotionValue<number> | null>(null)

function ScrollVelocity({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  const reduce = usePrefersReducedMotion()
  if (reduce) {
    return <div className={cn("relative w-full", className)}>{children}</div>
  }
  return <ScrollVelocityLive className={className}>{children}</ScrollVelocityLive>
}

function ScrollVelocityLive({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  const { scrollY } = useScroll()
  const velocity = useVelocity(scrollY)
  const smooth = useSpring(velocity, { damping: 50, stiffness: 400 })
  const factor = useTransform(smooth, (value) => {
    const sign = value < 0 ? -1 : 1
    return sign * Math.min(5, (Math.abs(value) / 1000) * 5)
  })

  return (
    <VelocityContext.Provider value={factor}>
      <div className={cn("relative w-full", className)}>{children}</div>
    </VelocityContext.Provider>
  )
}

function ScrollVelocityRow({
  children,
  className,
  baseVelocity = 5,
  direction = 1,
}: {
  children: React.ReactNode
  className?: string
  baseVelocity?: number
  direction?: 1 | -1
}) {
  const reduce = usePrefersReducedMotion()
  if (reduce) {
    return (
      <div className={cn("w-full overflow-hidden whitespace-nowrap", className)}>
        <div className="inline-flex items-center">{children}</div>
      </div>
    )
  }
  return (
    <ScrollVelocityRowLive className={className} baseVelocity={baseVelocity} direction={direction}>
      {children}
    </ScrollVelocityRowLive>
  )
}

function ScrollVelocityRowLive({
  children,
  className,
  baseVelocity = 5,
  direction = 1,
}: {
  children: React.ReactNode
  className?: string
  baseVelocity?: number
  direction?: 1 | -1
}) {
  const shared = React.useContext(VelocityContext)
  const { scrollY } = useScroll()
  const localVelocity = useVelocity(scrollY)
  const localSmooth = useSpring(localVelocity, { damping: 50, stiffness: 400 })
  const localFactor = useTransform(localSmooth, (value) => {
    const sign = value < 0 ? -1 : 1
    return sign * Math.min(5, (Math.abs(value) / 1000) * 5)
  })
  const velocityFactor = shared ?? localFactor

  const containerRef = React.useRef<HTMLDivElement>(null)
  const blockRef = React.useRef<HTMLDivElement>(null)
  const [copies, setCopies] = React.useState(3)
  const baseX = useMotionValue(0)
  const unitWidth = useMotionValue(0)
  const currentDirection = React.useRef(direction)

  React.useEffect(() => {
    const container = containerRef.current
    const block = blockRef.current
    if (!container || !block) return
    const update = () => {
      const width = block.scrollWidth || 0
      unitWidth.set(width)
      const next = width > 0 ? Math.max(3, Math.ceil(container.offsetWidth / width) + 2) : 3
      setCopies((prev) => (prev === next ? prev : next))
    }
    update()
    const observer = new ResizeObserver(update)
    observer.observe(container)
    observer.observe(block)
    return () => observer.disconnect()
  }, [unitWidth])

  const x = useTransform([baseX, unitWidth], ([offset, width]) => {
    const size = Number(width) || 1
    return `${-wrap(0, size, Number(offset) || 0)}px`
  })

  useAnimationFrame((_, delta) => {
    const vf = velocityFactor.get()
    if (Math.abs(vf) > 0.1) {
      currentDirection.current = (direction * (vf >= 0 ? 1 : -1)) as 1 | -1
    }
    const width = unitWidth.get()
    if (width <= 0) return
    const move = currentDirection.current * ((width * baseVelocity) / 100) * (1 + Math.abs(vf)) * (delta / 1000)
    baseX.set(baseX.get() + move)
  })

  return (
    <div ref={containerRef} className={cn("w-full overflow-hidden whitespace-nowrap", className)}>
      <motion.div className="inline-flex will-change-transform" style={{ x }}>
        {Array.from({ length: copies }, (_, index) => (
          <div
            key={index}
            ref={index === 0 ? blockRef : undefined}
            aria-hidden={index !== 0}
            className="inline-flex shrink-0 items-center"
          >
            {children}
          </div>
        ))}
      </motion.div>
    </div>
  )
}

export { ScrollVelocity, ScrollVelocityRow }
