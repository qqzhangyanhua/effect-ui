"use client"

// Ported from uselayouts (MIT, (c) 2025 Urvish Mali) — https://github.com/iurvish/uselayouts/blob/main/registry/default/example/paper-shred-button.tsx

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react"
import { motion, type Transition, type Variants } from "motion/react"

import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

type ShredState = "idle" | "preview" | "shredding" | "shredded"

const shredPaths = [
  "M22.74,0v59.49c0,3.37-.21,7.86-.53,12.79-1.34,20.7-4.18,32.27-8.35,52.58l-6.96,24.13",
  "M33.65,0v59.49c0,3.37-.17,7.86-.42,12.79-1.07,20.7-3.34,32.27-6.68,52.58l-5.57,24.13",
  "M44.56,0v59.49c0,3.37-.13,7.86-.32,12.79-.8,20.7-2.51,32.27-5.01,52.58l-4.18,24.13",
  "M55.47,0v59.49c0,3.37-.08,7.86-.21,12.79-.54,20.7-1.67,32.27-3.34,52.58l-2.78,24.13",
  "M66.37,0v59.49c0,3.37-.04,7.86-.11,12.79-.27,20.7-.84,32.27-1.67,52.58l-1.39,24.13",
  "M77.28,0v59.49c0,3.37,0,7.86,0,12.79,0,20.7,0,32.27,0,52.58v24.13",
  "M88.19,0v59.49c0,3.37.04,7.86.11,12.79.27,20.7.84,32.27,1.67,52.58l1.39,24.13",
  "M99.1,0v59.49c0,3.37.08,7.86.21,12.79.54,20.7,1.67,32.27,3.34,52.58l2.78,24.13",
  "M110.01,0v59.49c0,3.37.13,7.86.32,12.79.8,20.7,2.51,32.27,5.01,52.58l4.18,24.13",
  "M120.92,0v59.49c0,3.37.17,7.86.42,12.79,1.07,20.7,3.34,32.27,6.68,52.58l5.57,24.13",
  "M131.83,0v59.49c0,3.37.21,7.86.53,12.79,1.34,20.7,4.18,32.27,8.35,52.58l6.96,24.13",
]

const buttonVariants: Variants = {
  idle: { x: "-50%", scale: 1, y: 0 },
  preview: { x: "-50%", scale: 1.03, y: -2 },
  shredding: { x: "-50%", scale: 1, y: 0 },
  shredded: { x: "-50%", scale: 1, y: 0 },
}

const iconVariants: Variants = {
  idle: { rotate: 0, scale: 1 },
  preview: { rotate: -8, scale: 1.35 },
  shredding: { rotate: -8, scale: 1.15 },
  shredded: { rotate: 0, scale: 1 },
}

const documentVariants: Variants = {
  idle: { opacity: 0, x: "-50%", y: 14, scale: 0.94, clipPath: "inset(0% 0% 0% 0%)" },
  preview: { opacity: 1, x: "-50%", y: 0, scale: 1, clipPath: "inset(0% 0% 0% 0%)" },
  shredding: { opacity: 0, x: "-50%", y: 0, scale: 1, clipPath: "inset(100% 0% 0% 0%)" },
  shredded: { opacity: 0, x: "-50%", y: 155, scale: 1, clipPath: "inset(100% 0% 0% 0%)" },
}

const stripVariants: Variants = {
  idle: { opacity: 0, x: "-50%" },
  preview: { opacity: 0, x: "-50%" },
  shredding: { opacity: 1, x: "-50%" },
  shredded: { opacity: 1, x: "-50%" },
}

export interface PaperShredButtonProps {
  children?: ReactNode
  color?: string
  duration?: number
  size?: number
  intensity?: number
  label?: string
  className?: string
  onShred?: () => void
}

export function PaperShredButton({
  children = "Delete",
  color = "var(--destructive)",
  duration = 1150,
  size = 56,
  intensity = 1,
  label = "Shred document",
  className,
  onShred,
}: PaperShredButtonProps) {
  const rootRef = useRef<HTMLElement>(null)
  const live = useAnimationActive(rootRef)
  const reduced = usePrefersReducedMotion()
  const [state, setState] = useState<ShredState>("idle")
  const remainRef = useRef(0)
  const fineHover = useRef(false)
  const focused = useRef(false)

  const still = reduced || !live
  const seconds = Math.max(0.01, duration / 1000)
  const settle = reduced ? 80 : 1500
  const reset = reduced ? 80 : 900

  const clearPreview = useCallback(() => {
    if (fineHover.current || focused.current) return
    setState((current) => (current === "preview" ? "idle" : current))
  }, [])

  useEffect(() => {
    if (state !== "shredding") return
    if (!live && !reduced) return
    const wait = remainRef.current > 0 ? remainRef.current : reduced ? 80 : settle
    const started = performance.now()
    const id = window.setTimeout(() => {
      remainRef.current = 0
      setState("shredded")
    }, wait)
    return () => {
      window.clearTimeout(id)
      remainRef.current = Math.max(0, wait - (performance.now() - started))
    }
  }, [live, reduced, settle, state])

  useEffect(() => {
    if (state !== "shredded") return
    if (!live && !reduced) return
    const id = window.setTimeout(() => setState("idle"), reset)
    return () => window.clearTimeout(id)
  }, [live, reduced, reset, state])

  const shred = () => {
    if (state === "shredding" || state === "shredded") return
    remainRef.current = 0
    setState("shredding")
    onShred?.()
  }

  const motionOf = (full: Transition): Transition => (still ? { duration: 0 } : full)
  const pathVariants: Variants = {
    idle: { pathLength: 0, opacity: 0, y: -4 },
    preview: { pathLength: 0, opacity: 0, y: -4 },
    shredding: (index: number) => ({
      pathLength: 1,
      opacity: 1,
      y: 0,
      transition: still
        ? { duration: 0 }
        : {
            pathLength: { delay: 0.18 + index * 0.03 * intensity, duration: seconds * 0.48 },
            opacity: { delay: 0.12 + index * 0.02, duration: 0.16 },
            y: { delay: 0.12 + index * 0.02, duration: seconds * 0.42 },
          },
    }),
    shredded: { pathLength: 1, opacity: 1, y: 0 },
  }

  return (
    <section
      ref={rootRef}
      aria-label={label}
      data-state={state}
      data-motion={live ? "on" : "off"}
      data-reduced={reduced ? "true" : "false"}
      className={cn("relative h-92 w-60 motion-reduce:transition-none", className)}
    >
      <motion.button
        type="button"
        aria-label={label}
        data-state={state}
        disabled={state === "shredding" || state === "shredded"}
        initial={false}
        animate={state}
        variants={buttonVariants}
        transition={motionOf({ duration: 0.18, ease: [0.215, 0.61, 0.355, 1] })}
        onFocus={() => {
          focused.current = true
          setState((current) => (current === "idle" ? "preview" : current))
        }}
        onBlur={() => {
          focused.current = false
          clearPreview()
        }}
        onPointerEnter={(event) => {
          if (event.pointerType !== "mouse") return
          fineHover.current = true
          setState((current) => (current === "idle" ? "preview" : current))
        }}
        onPointerLeave={(event) => {
          if (event.pointerType !== "mouse") return
          fineHover.current = false
          clearPreview()
        }}
        onClick={shred}
        className="absolute top-44 left-1/2 z-20 inline-flex origin-bottom cursor-pointer items-center justify-center gap-3 rounded-xl border-x-2 border-t-2 border-b-4 px-8 font-medium whitespace-nowrap text-[var(--background)] focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed motion-reduce:transform-none"
        style={{
          backgroundColor: color,
          borderColor: `color-mix(in srgb, ${color} 72%, black)`,
          height: size,
          fontSize: Math.max(14, Math.round(size * 0.32)),
        }}
      >
        <motion.svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          className="size-5 fill-current"
          initial={false}
          animate={state}
          variants={iconVariants}
          transition={motionOf({ duration: 0.3 })}
          style={{ scale: intensity }}
        >
          <path
            fillRule="evenodd"
            d="M16.5 4.48v.22a48.8 48.8 0 0 1 3.88.52.75.75 0 1 1-.26 1.48l-.2-.04-1.01 13.07a3 3 0 0 1-2.99 2.77H8.08a3 3 0 0 1-2.99-2.77L4.09 6.66l-.21.04a.75.75 0 0 1-.26-1.48 48.6 48.6 0 0 1 3.88-.51v-.23c0-1.56 1.21-2.9 2.82-2.95a52.7 52.7 0 0 1 3.37 0c1.6.05 2.81 1.39 2.81 2.95Zm-6.14-1.45a51.2 51.2 0 0 1 3.27 0c.75.02 1.36.66 1.36 1.45v.11a49.5 49.5 0 0 0-6 0v-.11c0-.79.61-1.43 1.37-1.45Zm-.35 5.94a.75.75 0 1 0-1.5.06l.35 9a.75.75 0 1 0 1.5-.06l-.35-9Zm5.48.06a.75.75 0 1 0-1.5-.06l-.35 9a.75.75 0 0 0 1.5.06l.35-9Z"
          />
        </motion.svg>
        {children}
      </motion.button>

      <motion.div
        aria-hidden="true"
        initial={false}
        animate={state}
        variants={documentVariants}
        transition={motionOf(
          state === "shredding" ? { duration: seconds, ease: [0.65, 0, 0.35, 1] } : { duration: 0.3 },
        )}
        className="pointer-events-none absolute top-[18px] left-1/2 z-10 h-40 w-[120px] border border-[var(--border)] bg-[var(--card)]"
      >
        <div className="mx-4 mt-5 h-2 w-16 rounded bg-[var(--muted)]" />
        <div className="mx-4 mt-3 h-1.5 w-20 rounded bg-[var(--muted)]" />
        <div className="mx-4 mt-2 h-1.5 w-14 rounded bg-[var(--muted)]" />
        <div className="mx-4 mt-2 h-1.5 w-18 rounded bg-[var(--muted)]" />
      </motion.div>

      <motion.svg
        aria-hidden="true"
        viewBox="0 48 154.57 103.52"
        initial={false}
        animate={state}
        variants={stripVariants}
        transition={motionOf({ duration: 0.12 })}
        className="pointer-events-none absolute top-[218px] left-1/2 z-10 h-[150px] w-[120px] fill-none"
        style={{ stroke: "var(--card)" }}
      >
        {shredPaths.map((path, index) => (
          <motion.path
            key={path}
            d={path}
            custom={index}
            variants={pathVariants}
            initial={false}
            animate={state}
            strokeLinecap="round"
            strokeWidth={9 * intensity}
          />
        ))}
      </motion.svg>
    </section>
  )
}

export default PaperShredButton
