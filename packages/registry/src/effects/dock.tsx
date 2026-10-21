"use client"

import * as React from "react"
import { motion, useMotionValue, useSpring, useTransform } from "motion/react"

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export interface DockProps {
  className?: string
  children: React.ReactNode
  magnification?: number
  size?: number
  gap?: number
}

function Dock({ className, children, magnification = 52, size, gap }: DockProps) {
  const mouseX = useMotionValue(Infinity)
  const rest = size === undefined || size === 40 ? 40 : size
  const keepGap = gap === undefined || gap === 8

  return (
    <div
      data-slot="dock"
      onMouseMove={(event) => mouseX.set(event.pageX)}
      onMouseLeave={() => mouseX.set(Infinity)}
      className={cn(
        keepGap
          ? "mx-auto flex h-16 items-end gap-2 rounded-2xl border bg-card/80 px-3 pb-2 shadow-sm backdrop-blur"
          : "mx-auto flex h-16 items-end rounded-2xl border bg-card/80 px-3 pb-2 shadow-sm backdrop-blur",
        className,
      )}
      style={keepGap ? undefined : { gap }}
    >
      {React.Children.map(children, (child) =>
        React.isValidElement(child) ? (
          <DockIcon mouseX={mouseX} magnification={magnification} rest={rest}>
            {child}
          </DockIcon>
        ) : (
          child
        ),
      )}
    </div>
  )
}

function DockIcon({
  children,
  mouseX,
  magnification,
  rest,
}: {
  children: React.ReactNode
  mouseX: ReturnType<typeof useMotionValue<number>>
  magnification: number
  rest: number
}) {
  const reduceMotion = usePrefersReducedMotion()
  const ref = React.useRef<HTMLDivElement>(null)
  const distance = useTransform(mouseX, (value) => {
    const bounds = ref.current?.getBoundingClientRect()
    if (!bounds) return 0
    return value - bounds.x - bounds.width / 2
  })
  const widthSync = useTransform(distance, [-140, 0, 140], [rest, magnification, rest])
  const width = useSpring(widthSync, { mass: 0.15, stiffness: 180, damping: 14 })

  return (
    <motion.div
      ref={ref}
      style={{ width: reduceMotion ? rest : width }}
      className="flex aspect-square items-center justify-center rounded-xl bg-muted"
    >
      {children}
    </motion.div>
  )
}

export { Dock }
