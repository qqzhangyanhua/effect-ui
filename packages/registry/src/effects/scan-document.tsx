"use client"

// Ported from uselayouts (MIT, (c) 2025 Urvish Mali) — https://github.com/iurvish/uselayouts/blob/main/registry/default/example/scan-document.tsx

import { useEffect, useId, useRef, useState } from "react"
import { AnimatePresence, motion } from "motion/react"

import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

type Status = "idle" | "scanning" | "done"

export interface ScanDocumentProps {
  color?: string
  duration?: number
  size?: number
  intensity?: number
  idleLabel?: string
  scanningLabel?: string
  doneLabel?: string
  className?: string
  onScan?: () => void
}

function ScannerIcon({ size, color }: { size: number; color: string }) {
  const clipId = useId().replace(/:/g, "")
  return (
    <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <g clipPath={`url(#${clipId})`}>
        <path d="M2.77 10C2.34 10 2 9.66 2 9.23V6.92C2 4.21 4.21 2 6.92 2H9.23C9.66 2 10 2.34 10 2.77C10 3.2 9.66 3.54 9.23 3.54H6.92C5.05 3.54 3.54 5.06 3.54 6.92V9.23C3.54 9.66 3.19 10 2.77 10Z" />
        <path d="M21.23 10C20.81 10 20.46 9.66 20.46 9.23V6.92C20.46 5.05 18.94 3.54 17.08 3.54H14.77C14.34 3.54 14 3.19 14 2.77C14 2.35 14.34 2 14.77 2H17.08C19.79 2 22 4.21 22 6.92V9.23C22 9.66 21.66 10 21.23 10Z" />
        <path d="M17.08 22H15.69c-.42 0-.77-.34-.77-.77s.34-.77.77-.77h1.39c1.87 0 3.38-1.52 3.38-3.38v-1.38c0-.42.34-.77.77-.77s.77.35.77.77v1.38C22 19.79 19.79 22 17.08 22Z" />
        <path d="M9.23 22H6.92C4.21 22 2 19.79 2 17.08v-2.31c0-.43.34-.77.77-.77s.77.34.77.77v2.31c0 1.87 1.52 3.38 3.38 3.38h2.31c.42 0 .77.34.77.77s-.34.77-.77.77Z" />
        <path d="M18.46 11.23H5.54c-.43 0-.77.35-.77.77s.34.77.77.77h12.92c.43 0 .77-.34.77-.77s-.34-.77-.77-.77Z" />
        <path d="M6.9 13.94v.33c0 1.66 1.34 3 3 3h4.2c1.66 0 3-1.34 3-3v-.33c0-.12-.09-.21-.21-.21H7.11c-.12 0-.21.09-.21.21Z" />
        <path d="M6.9 10.06v-.33c0-1.66 1.34-3 3-3h4.2c1.66 0 3 1.34 3 3v.33c0 .12-.09.21-.21.21H7.11c-.12 0-.21-.09-.21-.21Z" />
      </g>
      <defs>
        <clipPath id={clipId}>
          <rect width="24" height="24" fill="white" />
        </clipPath>
      </defs>
    </svg>
  )
}

export function ScanDocument({
  color = "var(--primary)",
  duration = 5000,
  size = 16,
  intensity = 1,
  idleLabel = "Scan",
  scanningLabel = "Scanning",
  doneLabel = "Done",
  className,
  onScan,
}: ScanDocumentProps) {
  const rootRef = useRef<HTMLElement>(null)
  const live = useAnimationActive(rootRef)
  const reduced = usePrefersReducedMotion()
  const [status, setStatus] = useState<Status>("idle")
  const remainRef = useRef(0)
  const labels: Record<Status, string> = { idle: idleLabel, scanning: scanningLabel, done: doneLabel }
  const travel = 132 * intensity
  const scanMs = reduced ? Math.min(900, duration) : duration
  const still = reduced || !live

  useEffect(() => {
    if (status !== "scanning") return
    if (!live && !reduced) return
    const wait = remainRef.current > 0 ? remainRef.current : scanMs
    const started = performance.now()
    const id = window.setTimeout(() => {
      remainRef.current = 0
      setStatus("done")
    }, wait)
    return () => {
      window.clearTimeout(id)
      remainRef.current = Math.max(0, wait - (performance.now() - started))
    }
  }, [live, reduced, scanMs, status])

  useEffect(() => {
    if (status !== "done") return
    if (!live && !reduced) return
    const id = window.setTimeout(() => setStatus("idle"), reduced ? 80 : 1100)
    return () => window.clearTimeout(id)
  }, [live, reduced, status])

  const start = () => {
    if (status !== "idle") return
    remainRef.current = 0
    setStatus("scanning")
    onScan?.()
  }

  return (
    <section
      ref={rootRef}
      aria-label="Document scanner"
      data-status={status}
      data-motion={live ? "on" : "off"}
      data-reduced={reduced ? "true" : "false"}
      className={cn("relative flex h-80 flex-col items-center justify-center gap-8", className)}
    >
      <div className="flex h-[170px] items-end">
        <AnimatePresence>
          {status === "scanning" ? (
            <motion.div
              key="sheet"
              initial={still ? { opacity: 1, y: 0 } : { opacity: 0, y: 24, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.9 }}
              transition={still ? { duration: 0 } : { duration: 0.35 }}
              className="relative h-[150px] w-[110px]"
              style={{ perspective: 900 }}
            >
              <motion.div
                className="relative h-full w-full"
                animate={{ rotateY: still ? 0 : [0, 0, 180, 180, 360, 360] }}
                transition={still ? { duration: 0 } : { duration: Math.max(0.2, duration / 1000 - 0.4), ease: "easeInOut" }}
                style={{ transformStyle: "preserve-3d" }}
              >
                <div className="absolute inset-0 overflow-hidden rounded-md bg-[var(--card)] shadow-md [backface-visibility:hidden]">
                  <div className="mt-4 ml-4 size-2.5 rounded-full bg-[var(--muted)]" />
                  <div className="mt-4 ml-4 h-[3px] w-12 rounded bg-[var(--muted)]" />
                  <div className="mt-2 ml-4 h-[3px] w-16 rounded bg-[var(--border)]" />
                  <div className="mt-1.5 ml-4 h-[3px] w-14 rounded bg-[var(--border)]" />
                </div>
                <div className="absolute inset-0 rounded-md bg-[var(--muted)] shadow-md [transform:rotateY(180deg)] [backface-visibility:hidden]" />
                <motion.div
                  aria-hidden="true"
                  className="absolute top-0 left-1/2 h-[7px] w-[124px] -translate-x-1/2 rounded-full"
                  style={{ backgroundColor: color, boxShadow: `0 0 16px 3px color-mix(in srgb, ${color} 45%, transparent)` }}
                  animate={{ y: still ? 0 : [0, 0, travel, travel, 0, 0] }}
                  transition={still ? { duration: 0 } : { duration: Math.max(0.2, duration / 1000 - 0.4), ease: "easeInOut" }}
                />
              </motion.div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
      <button
        type="button"
        aria-label={labels[status]}
        disabled={status !== "idle"}
        onClick={start}
        className="flex cursor-pointer items-center gap-2 rounded-md border border-b-4 border-[var(--ring)] bg-[var(--primary)] px-5 py-1.5 text-sm font-medium text-[var(--primary-foreground)] transition-transform duration-200 active:scale-[0.97] focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70 motion-reduce:transform-none motion-reduce:transition-none"
      >
        <ScannerIcon size={size} color="currentColor" />
        {labels[status]}
      </button>
    </section>
  )
}

export default ScanDocument
