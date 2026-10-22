"use client"

// Ported from Fancy Components (MIT, (c) 2024 Daniel Petho) — https://github.com/danielpetho/fancy/blob/main/src/fancy/components/blocks/media-between-text.tsx

import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

import { motion, useInView, type UseInViewOptions, type Variants } from "motion/react"
import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState, type ElementType, type RefObject } from "react"

export interface MediaBetweenTextProps {
  firstText: string
  secondText: string
  mediaUrl: string
  mediaType: "image" | "video"
  mediaContainerClassName?: string
  fallbackUrl?: string
  as?: ElementType
  autoPlay?: boolean
  loop?: boolean
  muted?: boolean
  playsInline?: boolean
  alt?: string
  triggerType?: "hover" | "ref" | "inView"
  containerRef?: RefObject<HTMLDivElement | null>
  useInViewOptionsProp?: UseInViewOptions
  animationVariants?: {
    initial: Variants["initial"]
    animate: Variants["animate"]
  }
  className?: string
  leftTextClassName?: string
  rightTextClassName?: string
}

export interface MediaBetweenTextRef {
  animate: () => void
  reset: () => void
}

const defaultVariants = {
  initial: { width: 0, opacity: 1 },
  animate: {
    width: "auto",
    opacity: 1,
    transition: { duration: 0.4, type: "spring" as const, bounce: 0 },
  },
}

export const MediaBetweenText = forwardRef<MediaBetweenTextRef, MediaBetweenTextProps>(function MediaBetweenText(
  {
    firstText,
    secondText,
    mediaUrl,
    mediaType,
    mediaContainerClassName,
    fallbackUrl,
    as = "p",
    autoPlay = true,
    loop = true,
    muted = true,
    playsInline = true,
    alt,
    triggerType = "hover",
    containerRef,
    useInViewOptionsProp,
    animationVariants = defaultVariants,
    className,
    leftTextClassName,
    rightTextClassName,
  },
  ref,
) {
  const componentRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isAnimating, setIsAnimating] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const prefersReducedMotion = usePrefersReducedMotion()
  const motionOn = useAnimationActive(componentRef)
  const inViewOptions = useMemo<UseInViewOptions>(
    () => useInViewOptionsProp ?? { once: true, amount: 0.5, root: containerRef },
    [containerRef, useInViewOptionsProp],
  )
  const isInView = useInView(componentRef, inViewOptions)

  useImperativeHandle(ref, () => ({
    animate: () => setIsAnimating(true),
    reset: () => setIsAnimating(false),
  }))

  const triggered =
    triggerType === "hover" ? isHovered : triggerType === "inView" ? isInView : triggerType === "ref" ? isAnimating : false
  const expanded = prefersReducedMotion || triggered
  const TextComponent = useMemo(() => motion.create(as), [as])

  useEffect(() => {
    const video = videoRef.current
    if (!video || mediaType !== "video") return
    if (prefersReducedMotion || !motionOn || !autoPlay) {
      video.pause()
      return
    }
    void video.play().catch(() => undefined)
  }, [autoPlay, mediaType, motionOn, prefersReducedMotion])

  return (
    <div
      className={cn("flex", className)}
      data-reduced={prefersReducedMotion ? "true" : "false"}
      data-slot="media-between-text"
      onMouseEnter={() => {
        if (triggerType === "hover") setIsHovered(true)
      }}
      onMouseLeave={() => {
        if (triggerType === "hover") setIsHovered(false)
      }}
      ref={componentRef}
    >
      <TextComponent className={leftTextClassName} layout>
        {firstText}
      </TextComponent>
      <motion.div
        animate={expanded ? "animate" : "initial"}
        className={mediaContainerClassName}
        initial={prefersReducedMotion ? "animate" : "initial"}
        variants={animationVariants}
      >
        {mediaType === "video" ? (
          <video
            className="h-full w-full object-cover"
            loop={loop}
            muted={muted}
            playsInline={playsInline}
            poster={fallbackUrl}
            ref={videoRef}
          >
            <source src={mediaUrl} type="video/mp4" />
          </video>
        ) : (
          // eslint-disable-next-line @next/next/no-img-element -- 移植保留原生 img，不引入 next/image。
          <img alt={alt || `${firstText} ${secondText}`} className="h-full w-full object-cover" src={mediaUrl} />
        )}
      </motion.div>
      <TextComponent className={rightTextClassName} layout>
        {secondText}
      </TextComponent>
    </div>
  )
})
