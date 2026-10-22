"use client"

// Ported from Fancy Components (MIT, (c) 2024 Daniel Petho) — https://github.com/danielpetho/fancy/blob/main/src/fancy/components/blocks/css-box.tsx

import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

import { motion, useMotionValue, useSpring, useTransform } from "motion/react"
import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  type CSSProperties,
  type MouseEvent as ReactMouseEvent,
  type ReactNode,
  type TouchEvent as ReactTouchEvent,
} from "react"

interface FaceProps {
  transform: string
  showBackface?: boolean
  children?: ReactNode
  style?: CSSProperties
}

function CubeFace({ transform, showBackface, children, style }: FaceProps) {
  return (
    <div
      className={cn("absolute", showBackface ? "[backface-visibility:visible]" : "[backface-visibility:hidden]")}
      style={{ transform, ...style }}
    >
      {children}
    </div>
  )
}

export interface CubeFaces {
  front?: ReactNode
  back?: ReactNode
  right?: ReactNode
  left?: ReactNode
  top?: ReactNode
  bottom?: ReactNode
}

export interface CSSBoxRef {
  showFront: () => void
  showBack: () => void
  showLeft: () => void
  showRight: () => void
  showTop: () => void
  showBottom: () => void
  rotateTo: (x: number, y: number) => void
  getCurrentRotation: () => { x: number; y: number }
}

export interface CSSBoxProps {
  width: number
  height: number
  depth: number
  className?: string
  perspective?: number
  stiffness?: number
  damping?: number
  showBackface?: boolean
  faces?: CubeFaces
  draggable?: boolean
}

function pointerPoint(event: MouseEvent | TouchEvent | ReactMouseEvent | ReactTouchEvent) {
  if ("touches" in event) {
    const touch = event.touches[0]
    if (!touch) return null
    return { x: touch.clientX, y: touch.clientY }
  }
  return { x: event.clientX, y: event.clientY }
}

export const CSSBox = forwardRef<CSSBoxRef, CSSBoxProps>(function CSSBox(
  {
    width,
    height,
    depth,
    className,
    perspective = 600,
    stiffness = 100,
    damping = 30,
    showBackface = false,
    faces = {},
    draggable = true,
  },
  ref,
) {
  const boxRef = useRef<HTMLDivElement>(null)
  const prefersReducedMotion = usePrefersReducedMotion()
  const motionOn = useAnimationActive(boxRef)
  const snap = prefersReducedMotion || !motionOn
  const isDragging = useRef(false)
  const startPosition = useRef({ x: 0, y: 0 })
  const startRotation = useRef({ x: 0, y: 0 })
  const currentRotation = useRef({ x: 0, y: 0 })
  const baseRotateX = useMotionValue(0)
  const baseRotateY = useMotionValue(0)
  const springRotateX = useSpring(baseRotateX, { stiffness, damping })
  const springRotateY = useSpring(baseRotateY, { stiffness, damping })
  const rotateX = snap ? baseRotateX : springRotateX
  const rotateY = snap ? baseRotateY : springRotateY
  const transform = useTransform([rotateX, rotateY], ([x, y]) => {
    const nextX = typeof x === "number" ? x : 0
    const nextY = typeof y === "number" ? y : 0
    return `translateZ(-${depth / 2}px) rotateX(${nextX}deg) rotateY(${nextY}deg)`
  })

  useImperativeHandle(
    ref,
    () => ({
      showFront: () => {
        baseRotateX.set(0)
        baseRotateY.set(0)
      },
      showBack: () => {
        baseRotateX.set(0)
        baseRotateY.set(180)
      },
      showLeft: () => {
        baseRotateX.set(0)
        baseRotateY.set(90)
      },
      showRight: () => {
        baseRotateX.set(0)
        baseRotateY.set(-90)
      },
      showTop: () => {
        baseRotateX.set(-90)
        baseRotateY.set(0)
      },
      showBottom: () => {
        baseRotateX.set(90)
        baseRotateY.set(0)
      },
      rotateTo: (x: number, y: number) => {
        baseRotateX.set(x)
        baseRotateY.set(y)
      },
      getCurrentRotation: () => currentRotation.current,
    }),
    [baseRotateX, baseRotateY],
  )

  const handleStart = useCallback(
    (event: ReactMouseEvent | ReactTouchEvent) => {
      if (!draggable) return
      const point = pointerPoint(event)
      if (!point) return
      isDragging.current = true
      startPosition.current = point
      startRotation.current = { x: baseRotateX.get(), y: baseRotateY.get() }
    },
    [baseRotateX, baseRotateY, draggable],
  )

  const handleMove = useCallback(
    (event: MouseEvent | TouchEvent) => {
      if (!isDragging.current) return
      const point = pointerPoint(event)
      if (!point) return
      const deltaX = point.x - startPosition.current.x
      const deltaY = point.y - startPosition.current.y
      baseRotateX.set(startRotation.current.x - deltaY / 2)
      baseRotateY.set(startRotation.current.y + deltaX / 2)
    },
    [baseRotateX, baseRotateY],
  )

  const handleEnd = useCallback(() => {
    isDragging.current = false
  }, [])

  useEffect(() => {
    if (!draggable) return
    window.addEventListener("mousemove", handleMove)
    window.addEventListener("mouseup", handleEnd)
    window.addEventListener("touchmove", handleMove)
    window.addEventListener("touchend", handleEnd)
    return () => {
      window.removeEventListener("mousemove", handleMove)
      window.removeEventListener("mouseup", handleEnd)
      window.removeEventListener("touchmove", handleMove)
      window.removeEventListener("touchend", handleEnd)
    }
  }, [draggable, handleEnd, handleMove])

  useEffect(() => {
    const unsubscribeX = baseRotateX.on("change", (value) => {
      currentRotation.current.x = value
    })
    const unsubscribeY = baseRotateY.on("change", (value) => {
      currentRotation.current.y = value
    })
    return () => {
      unsubscribeX()
      unsubscribeY()
    }
  }, [baseRotateX, baseRotateY])

  return (
    <div
      className={cn(draggable && "cursor-move", className)}
      data-reduced={prefersReducedMotion ? "true" : "false"}
      data-slot="css-box"
      onMouseDown={handleStart}
      onTouchStart={handleStart}
      ref={boxRef}
      style={{ width, height, perspective: `${perspective}px` }}
    >
      <motion.div className="relative h-full w-full [transform-style:preserve-3d]" style={{ transform }}>
        <CubeFace showBackface={showBackface} style={{ width, height }} transform={`rotateY(0deg) translateZ(${depth / 2}px)`}>
          {faces.front}
        </CubeFace>
        <CubeFace showBackface={showBackface} style={{ width, height }} transform={`rotateY(180deg) translateZ(${depth / 2}px)`}>
          {faces.back}
        </CubeFace>
        <CubeFace
          showBackface={showBackface}
          style={{ width: depth, height, left: (width - depth) / 2 }}
          transform={`rotateY(90deg) translateZ(${width / 2}px)`}
        >
          {faces.right}
        </CubeFace>
        <CubeFace
          showBackface={showBackface}
          style={{ width: depth, height, left: (width - depth) / 2 }}
          transform={`rotateY(-90deg) translateZ(${width / 2}px)`}
        >
          {faces.left}
        </CubeFace>
        <CubeFace
          showBackface={showBackface}
          style={{ width, height: depth, top: (height - depth) / 2 }}
          transform={`rotateX(90deg) translateZ(${height / 2}px)`}
        >
          {faces.top}
        </CubeFace>
        <CubeFace
          showBackface={showBackface}
          style={{ width, height: depth, top: (height - depth) / 2 }}
          transform={`rotateX(-90deg) translateZ(${height / 2}px)`}
        >
          {faces.bottom}
        </CubeFace>
      </motion.div>
    </div>
  )
})
