"use client"

import * as React from "react"
import { motion, useMotionValue, useSpring, useTransform } from "motion/react"

import { cn } from "@/lib/utils"

interface ImageComparisonContextValue {
  position: ReturnType<typeof useSpring>
  color?: string
  size?: number
}

const ImageComparisonContext = React.createContext<ImageComparisonContextValue | null>(null)

function useImageComparison() {
  const context = React.useContext(ImageComparisonContext)
  if (!context) {
    throw new Error("ImageComparison parts must be used within ImageComparison")
  }
  return context
}

function ImageComparison({
  children,
  className,
  enableHover = false,
  color,
  size,
}: {
  children: React.ReactNode
  className?: string
  enableHover?: boolean
  /** 滑块颜色。不传或 #ffffff 仍是白。 */
  color?: string
  /** 滑块厚度，像素。不传或 2 仍是 2px。 */
  size?: number
}) {
  const [dragging, setDragging] = React.useState(false)
  const raw = useMotionValue(50)
  const position = useSpring(raw, { bounce: 0, duration: 0 })

  const move = (event: React.MouseEvent | React.TouchEvent) => {
    if (!dragging && !enableHover) return
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect()
    const clientX = "touches" in event ? event.touches[0]?.clientX ?? 0 : event.clientX
    const percent = Math.min(Math.max(((clientX - rect.left) / rect.width) * 100, 0), 100)
    raw.set(percent)
  }

  return (
    <ImageComparisonContext.Provider value={{ position, color, size }}>
      <div
        className={cn("relative select-none overflow-hidden", enableHover && "cursor-ew-resize", className)}
        onMouseMove={move}
        onMouseDown={() => {
          if (!enableHover) setDragging(true)
        }}
        onMouseUp={() => setDragging(false)}
        onMouseLeave={() => setDragging(false)}
        onTouchStart={() => {
          if (!enableHover) setDragging(true)
        }}
        onTouchMove={move}
        onTouchEnd={() => setDragging(false)}
      >
        {children}
      </div>
    </ImageComparisonContext.Provider>
  )
}

function ImageComparisonImage({
  src,
  alt,
  position,
  className,
}: {
  src: string
  alt: string
  position: "left" | "right"
  className?: string
}) {
  const { position: slider } = useImageComparison()
  const clip = useTransform(slider, (value) =>
    position === "left" ? `inset(0 ${100 - value}% 0 0)` : `inset(0 0 0 ${value}%)`,
  )
  return (
    <motion.img
      src={src}
      alt={alt}
      className={cn("absolute inset-0 size-full object-cover", className)}
      style={{ clipPath: clip }}
    />
  )
}

function ImageComparisonSlider({
  className,
  children,
}: {
  className?: string
  children?: React.ReactNode
}) {
  const { position, color, size } = useImageComparison()
  const left = useTransform(position, (value) => `${value}%`)
  const painted = color === undefined || color.toLowerCase() === "#ffffff"
  const thin = size === undefined || size === 2
  return (
    <motion.div
      className={cn(
        "absolute inset-y-0 -translate-x-1/2 cursor-ew-resize shadow",
        painted && "bg-white",
        thin && "w-0.5",
        className,
      )}
      style={{
        left,
        ...(painted ? {} : { backgroundColor: color }),
        ...(thin ? {} : { width: size }),
      }}
    >
      {children}
    </motion.div>
  )
}

export { ImageComparison, ImageComparisonImage, ImageComparisonSlider }
