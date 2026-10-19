"use client"

import * as React from "react"
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from "motion/react"

import { cn } from "@/lib/utils"

function subscribeReducedMotion(onChange: () => void) {
  const media = window.matchMedia("(prefers-reduced-motion: reduce)")
  media.addEventListener("change", onChange)
  return () => media.removeEventListener("change", onChange)
}

function useIsReducedMotion() {
  const prefersReducedMotion = useReducedMotion()
  return React.useSyncExternalStore(
    subscribeReducedMotion,
    () =>
      prefersReducedMotion === true ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    () => false,
  )
}

export interface DockProps {
  className?: string
  children: React.ReactNode
  magnification?: number
}

function Dock({ className, children, magnification = 52 }: DockProps) {
  const mouseX = useMotionValue(Infinity)

  return (
    <div
      data-slot="dock"
      onMouseMove={(event) => mouseX.set(event.pageX)}
      onMouseLeave={() => mouseX.set(Infinity)}
      className={cn(
        "mx-auto flex h-16 items-end gap-2 rounded-2xl border bg-card/80 px-3 pb-2 shadow-sm backdrop-blur",
        className,
      )}
    >
      {React.Children.map(children, (child) =>
        React.isValidElement(child) ? (
          <DockIcon mouseX={mouseX} magnification={magnification}>
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
}: {
  children: React.ReactNode
  mouseX: ReturnType<typeof useMotionValue<number>>
  magnification: number
}) {
  const reduceMotion = useIsReducedMotion()
  const ref = React.useRef<HTMLDivElement>(null)
  const distance = useTransform(mouseX, (value) => {
    const bounds = ref.current?.getBoundingClientRect()
    if (!bounds) return 0
    return value - bounds.x - bounds.width / 2
  })
  const widthSync = useTransform(distance, [-140, 0, 140], [40, magnification, 40])
  const width = useSpring(widthSync, { mass: 0.15, stiffness: 180, damping: 14 })

  return (
    <motion.div
      ref={ref}
      style={{ width: reduceMotion ? 40 : width }}
      className="flex aspect-square items-center justify-center rounded-xl bg-muted"
    >
      {children}
    </motion.div>
  )
}

export { Dock }
