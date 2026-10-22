"use client"

// Ported from Uiverse galaxy（MIT，(c) 2023 Uiverse.io, author andrew-demchenk0）— https://github.com/uiverse-io/galaxy/blob/main/Notifications/andrew-demchenk0_quiet-liger-31.html

import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

import { useRef, type HTMLAttributes } from "react"

export interface StarRibbonNotificationProps extends HTMLAttributes<HTMLDivElement> {
  title?: string
  message?: string
  stars?: number
}

export function StarRibbonNotification({
  title = "升级了",
  message = "按开始",
  stars = 3,
  className,
  ...props
}: StarRibbonNotificationProps) {
  const ref = useRef<HTMLDivElement>(null)
  const prefersReducedMotion = usePrefersReducedMotion()
  const motionOn = useAnimationActive(ref)
  const animate = !prefersReducedMotion && motionOn
  const count = Math.max(0, Math.round(stars))

  return (
    <div
      {...props}
      ref={ref}
      className={cn("relative inline-block pt-24 font-mono", className)}
      data-reduced={prefersReducedMotion ? "true" : "false"}
      data-slot="star-ribbon-notification"
    >
      <style>{`
        @keyframes effect-ui-star-float {
          0%, 50%, 100% { transform: translateX(var(--tx)) translateY(0) rotate(var(--tilt)); }
          25% { transform: translateX(var(--tx)) translateY(10px) rotate(var(--tilt)); }
          75% { transform: translateX(var(--tx)) translateY(0) rotate(var(--tilt)) scale(1.08); }
        }
        @keyframes effect-ui-ribbon-pulse {
          0%, 50%, 100% { transform: scale(1); }
          75% { transform: scale(1.08); }
        }
      `}</style>
      {Array.from({ length: count }, (_, index) => {
        const tx = count === 1 ? "-50%" : index === 0 ? "0%" : index === count - 1 ? "-100%" : "-50%"
        const left = count === 1 ? "50%" : `${Math.round((index / (count - 1)) * 1000) / 10}%`
        return (
          <span
            key={index}
            aria-hidden
            className="absolute text-primary"
            style={{
              left,
              top: index % 2 === 0 ? "0.5rem" : "0",
              ["--tx" as string]: tx,
              ["--tilt" as string]: index % 2 === 0 ? "-15deg" : "15deg",
              animation: animate ? "effect-ui-star-float 5s ease-in-out infinite" : "none",
            }}
          >
            <svg className="size-16" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="m12 2 2.2 6.6H21l-5.4 4 2 6.6L12 15.8 6.4 19.2l2-6.6L3 8.6h6.8z"
                opacity="0.55"
                transform="translate(0 1)"
              />
              <path fill="currentColor" d="m12 1.2 2.2 6.6H21l-5.4 4 2 6.6L12 15 6.4 18.4l2-6.6L3 7.8h6.8z" />
            </svg>
          </span>
        )
      })}
      <div className="relative w-[300px] bg-primary text-center text-primary-foreground">
        <span aria-hidden className="absolute top-5 -left-8 -z-10 border-[25px] border-solid border-primary border-l-transparent" />
        <span aria-hidden className="absolute top-5 -right-8 -z-10 border-[25px] border-solid border-primary border-r-transparent" />
        <div className="relative text-2xl leading-[50px] font-black tracking-widest uppercase">{title}</div>
        <div
          className="pb-2 text-sm tracking-[0.2em] uppercase"
          style={{ animation: animate ? "effect-ui-ribbon-pulse 5s ease-in-out infinite" : "none" }}
        >
          {message}
        </div>
      </div>
    </div>
  )
}
