"use client"

// Ported from Kibo UI (MIT, (c) shadcnblocks) — https://github.com/shadcnblocks/kibo/blob/main/packages/stories/index.tsx

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

import { useEffect, useRef, type ComponentProps, type HTMLAttributes, type VideoHTMLAttributes } from "react"

export function Stories({ className, opts, ...props }: ComponentProps<typeof Carousel>) {
  return (
    <Carousel
      className={cn("w-full", className)}
      data-slot="stories"
      opts={{ align: "start", loop: false, dragFree: true, ...opts }}
      {...props}
    />
  )
}

export function StoriesContent({ className, ...props }: ComponentProps<typeof CarouselContent>) {
  return <CarouselContent className={cn("-ml-2 gap-2", className)} {...props} />
}

export function Story({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  const prefersReducedMotion = usePrefersReducedMotion()
  return (
    <CarouselItem className="basis-auto pl-2">
      <div
        className={cn(
          "group relative h-44 w-28 overflow-hidden rounded-xl bg-muted/40",
          prefersReducedMotion ? "transition-none" : "cursor-pointer transition-all duration-200 hover:scale-[1.02] hover:shadow-lg",
          className,
        )}
        data-reduced={prefersReducedMotion ? "true" : "false"}
        data-slot="story"
        role="button"
        tabIndex={0}
        {...props}
      />
    </CarouselItem>
  )
}

const timePattern = /t=(\d+(?:\.\d+)?)/

export function StoryVideo({ className, ...props }: VideoHTMLAttributes<HTMLVideoElement>) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const initialTime = useRef(0)
  const prefersReducedMotion = usePrefersReducedMotion()

  useEffect(() => {
    const src = typeof props.src === "string" ? props.src : ""
    const hash = src.slice(src.indexOf("#") + 1)
    const match = hash.match(timePattern)
    initialTime.current = match?.[1] ? Number.parseFloat(match[1]) : 0
  }, [props.src])

  function play() {
    if (prefersReducedMotion) return
    void videoRef.current?.play()
  }

  function reset() {
    const video = videoRef.current
    if (!video) return
    video.pause()
    video.currentTime = initialTime.current
  }

  return (
    <video
      className={cn("absolute inset-0 size-full object-cover", className)}
      loop
      muted
      {...props}
      onBlur={reset}
      onFocus={play}
      onMouseOut={reset}
      onMouseOver={play}
      playsInline
      preload="metadata"
      ref={videoRef}
    />
  )
}

export function StoryImage({ className, alt, ...props }: ComponentProps<"img"> & { alt: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element -- registry 组件不能依赖 next/image
    <img alt={alt} className={cn("absolute inset-0 size-full object-cover", className)} {...props} />
  )
}

export function StoryAuthor({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("absolute inset-x-0 bottom-0 z-10 p-2 text-white", className)} {...props}>
      <div className="flex items-center gap-2">{children}</div>
    </div>
  )
}

export interface StoryAuthorImageProps extends ComponentProps<typeof Avatar> {
  src?: string
  name?: string
  fallback?: string
}

export function StoryAuthorImage({ src, fallback, name, className, ...props }: StoryAuthorImageProps) {
  return (
    <Avatar className={cn("size-6 border border-white/30", className)} {...props}>
      {src ? <AvatarImage alt={name ?? ""} src={src} /> : null}
      <AvatarFallback className="text-[10px]">{fallback || name?.charAt(0)?.toUpperCase()}</AvatarFallback>
    </Avatar>
  )
}

export function StoryAuthorName({ className, ...props }: HTMLAttributes<HTMLSpanElement>) {
  return <span className={cn("truncate text-xs font-medium", className)} {...props} />
}

export function StoryTitle({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("absolute inset-x-0 top-0 z-10 p-2 text-xs text-white", className)} {...props} />
}

export interface StoryOverlayProps extends HTMLAttributes<HTMLDivElement> {
  side?: "top" | "bottom"
}

export function StoryOverlay({ className, side = "bottom", ...props }: StoryOverlayProps) {
  return (
    <div
      className={cn(
        "absolute inset-x-0 h-10 from-black/40 to-transparent",
        side === "top" ? "top-0 bg-gradient-to-b" : "bottom-0 bg-gradient-to-t",
        className,
      )}
      {...props}
    />
  )
}
