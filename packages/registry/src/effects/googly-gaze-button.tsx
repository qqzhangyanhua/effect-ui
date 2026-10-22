"use client"

// Ported from Framekit UI (MIT, (c) 2026 Framekit UI contributors) — https://github.com/Sid9022/framekit-ui/blob/master/src/components/ui/googly-gaze-button.tsx

import { useEffect, useRef, useState, type ButtonHTMLAttributes, type PointerEvent as ReactPointerEvent, type ReactNode } from "react"

import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export interface GooglyGazeButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "color" | "children"> {
  label?: string
  color?: string
  size?: number
  intensity?: number
  duration?: number
  children?: ReactNode
}

export function GooglyGazeButton({
  label = "Get in touch",
  color = "var(--foreground)",
  size = 28,
  intensity = 1,
  duration = 420,
  className,
  children,
  onClick,
  ...props
}: GooglyGazeButtonProps) {
  const ref = useRef<HTMLButtonElement>(null)
  const reduced = usePrefersReducedMotion()
  const live = useAnimationActive(ref)
  const moving = live && !reduced
  const [gaze, setGaze] = useState({ x: 0, y: 0 })
  const [smirk, setSmirk] = useState(false)
  const gazeRef = useRef(gaze)

  useEffect(() => {
    gazeRef.current = gaze
  }, [gaze])

  useEffect(() => {
    if (!moving) return
    const onMove = (event: PointerEvent) => {
      const node = ref.current
      if (!node) return
      const rect = node.getBoundingClientRect()
      const next = {
        x: Math.max(-1, Math.min(1, (event.clientX - (rect.left + rect.width * 0.78)) / 60)),
        y: Math.max(-1, Math.min(1, (event.clientY - (rect.top + rect.height / 2)) / 40)),
      }
      if (next.x === gazeRef.current.x && next.y === gazeRef.current.y) return
      setGaze(next)
    }
    window.addEventListener("pointermove", onMove)
    return () => window.removeEventListener("pointermove", onMove)
  }, [moving])

  const look = (event: ReactPointerEvent<HTMLButtonElement>) => {
    if (reduced) return
    const rect = event.currentTarget.getBoundingClientRect()
    setGaze({
      x: Math.max(-1, Math.min(1, (event.clientX - (rect.left + rect.width * 0.78)) / 60)),
      y: Math.max(-1, Math.min(1, (event.clientY - (rect.top + rect.height / 2)) / 40)),
    })
  }

  return (
    <button
      ref={ref}
      type="button"
      {...props}
      data-motion={moving ? "on" : "off"}
      onPointerMove={look}
      onPointerDown={look}
      onClick={(event) => {
        setSmirk(true)
        window.setTimeout(() => setSmirk(false), duration)
        onClick?.(event)
      }}
      className={cn(
        "inline-flex items-center gap-3 rounded-full px-5 py-3 text-sm font-medium text-background shadow-lg outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:animate-none",
        className,
      )}
      style={{ background: color }}
    >
      <span>{children ?? label}</span>
      <span className="relative flex items-center gap-1.5" aria-hidden>
        {[0, 1].map((eye) => (
          <span key={eye} className="relative flex items-center justify-center overflow-hidden rounded-full bg-background" style={{ width: size, height: size }}>
            <span
              className="absolute rounded-full bg-foreground motion-reduce:transition-none"
              style={{
                width: size * 0.42,
                height: size * 0.42,
                transform: `translate(${gaze.x * 5 * intensity}px, ${gaze.y * 4 * intensity + (smirk ? 2 : 0)}px) scaleY(${smirk ? 0.55 : 1})`,
                transition: reduced ? undefined : "transform 90ms linear",
              }}
            />
          </span>
        ))}
      </span>
    </button>
  )
}
