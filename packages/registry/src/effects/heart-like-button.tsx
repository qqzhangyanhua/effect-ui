"use client"

// Ported from Uiverse galaxy（MIT，(c) 2023 Uiverse.io, author LilaRest）— https://github.com/uiverse-io/galaxy/blob/main/Buttons/LilaRest_loud-walrus-26.html

import { useAnimationActive } from "@/hooks/use-animation-active"
import { useControllableState } from "@/hooks/use-controllable-state"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

import { useRef, type ButtonHTMLAttributes, type ReactNode } from "react"

export interface HeartLikeButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> {
  liked?: boolean
  onLikedChange?: (liked: boolean) => void
  count?: number
  children?: ReactNode
}

export function HeartLikeButton({
  liked,
  onLikedChange,
  count = 0,
  children = "喜欢",
  className,
  ...props
}: HeartLikeButtonProps) {
  const ref = useRef<HTMLButtonElement>(null)
  const prefersReducedMotion = usePrefersReducedMotion()
  const motionOn = useAnimationActive(ref)
  const animate = !prefersReducedMotion && motionOn
  const [on, setOn] = useControllableState({
    value: liked,
    defaultValue: false,
    onChange: onLikedChange,
  })

  return (
    <button
      {...props}
      ref={ref}
      aria-pressed={on}
      className={cn(
        "group/heart inline-flex items-center gap-2 rounded-full border-4 border-muted bg-muted px-4 py-2 font-mono text-lg font-black text-muted-foreground shadow-inner",
        className,
      )}
      data-animate={animate ? "true" : "false"}
      data-liked={on ? "true" : "false"}
      data-reduced={prefersReducedMotion ? "true" : "false"}
      data-slot="heart-like-button"
      onClick={(event) => {
        props.onClick?.(event)
        if (!event.defaultPrevented) setOn(!on)
      }}
      type="button"
    >
      <style>{`
        @keyframes effect-ui-heart-beat {
          0%, 30%, 60%, 100% { transform: scale(1); }
          15%, 45% { transform: scale(1.15); }
        }
        [data-slot="heart-like-button"][data-liked="true"] .empty,
        [data-slot="heart-like-button"]:hover .empty { opacity: 0; }
        [data-slot="heart-like-button"][data-liked="true"] .filled,
        [data-slot="heart-like-button"]:hover .filled { opacity: 1; }
        [data-slot="heart-like-button"][data-animate="true"]:hover .filled {
          animation: effect-ui-heart-beat 1.2s infinite;
        }
      `}</style>
      <span className="relative inline-flex size-8 text-destructive">
        <svg aria-hidden className="empty size-8 fill-current" viewBox="0 0 24 24">
          <path d="M16.5 3C19.538 3 22 5.5 22 9c0 7-7.5 11-10 12.5C9.5 20 2 16 2 9c0-3.5 2.5-6 5.5-6C9.36 3 11 4 12 5c1-1 2.64-2 4.5-2zm-3.566 15.604c.881-.556 1.676-1.109 2.42-1.701C18.335 14.533 20 11.943 20 9c0-2.36-1.537-4-3.5-4-1.076 0-2.24.57-3.086 1.414L12 7.828l-1.414-1.414C9.74 5.57 8.576 5 7.5 5 5.56 5 4 6.656 4 9c0 2.944 1.666 5.533 4.645 7.903.745.592 1.54 1.145 2.421 1.7.299.189.595.37.934.572.339-.202.635-.383.934-.571z" />
        </svg>
        <svg aria-hidden className="filled absolute inset-0 size-8 fill-current opacity-0" viewBox="0 0 24 24">
          <path d="M16.5 3C19.538 3 22 5.5 22 9c0 7-7.5 11-10 12.5C9.5 20 2 16 2 9c0-3.5 2.5-6 5.5-6C9.36 3 11 4 12 5c1-1 2.64-2 4.5-2z" />
        </svg>
      </span>
      <span>{children}</span>
      <span>{count}</span>
    </button>
  )
}
