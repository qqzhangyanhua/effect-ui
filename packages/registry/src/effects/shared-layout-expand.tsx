"use client"

import { useEffect, useId, useRef, useState, type CSSProperties } from "react"
import { LayoutGroup, motion } from "motion/react"

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export interface SharedLayoutCard {
  id: string
  title: string
  summary: string
  detail: string
}

export interface SharedLayoutExpandProps {
  items?: readonly SharedLayoutCard[]
  duration?: number
  backdrop?: number
  radius?: number
  onOpenChange?: (id: string | null) => void
  className?: string
}

const defaultItems: readonly SharedLayoutCard[] = [
  {
    id: "dawn",
    title: "晨雾",
    summary: "第一屏只留一层光",
    detail: "点开之后，这句话让开位置，背后的说明才走出来。",
  },
  {
    id: "route",
    title: "航线",
    summary: "三层跟着滚动分开",
    detail: "背景慢，前景快。滚动仍然能读完，不需要悬停。",
  },
  {
    id: "echo",
    title: "回声",
    summary: "按键也能打开",
    detail: "回车或空格打开，Esc 或关闭按钮收回。焦点留在对话框里。",
  },
]

function clamp01(value: number) {
  if (!Number.isFinite(value)) return 0
  return Math.min(1, Math.max(0, value))
}

function milliseconds(duration: number) {
  if (!Number.isFinite(duration) || duration < 0) return 480
  return duration
}

export function SharedLayoutExpand({
  items = defaultItems,
  duration = 480,
  backdrop = 0.55,
  radius = 28,
  onOpenChange,
  className,
}: SharedLayoutExpandProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const overlayRef = useRef<HTMLDivElement>(null)
  const onOpenChangeRef = useRef(onOpenChange)
  const reduced = usePrefersReducedMotion()
  const groupId = useId()
  const titleId = useId()
  const [activeId, setActiveId] = useState<string | null>(null)
  const active = items.find((item) => item.id === activeId) ?? null
  const scrim = clamp01(backdrop)
  const ms = milliseconds(duration)
  const transition = reduced ? { duration: 0 } : { duration: ms / 1000, ease: "easeOut" as const }
  const shell = (id: string) => (reduced ? undefined : `shared-expand-${groupId}-${id}`)
  const heading = (id: string) => (reduced ? undefined : `shared-expand-title-${groupId}-${id}`)

  function select(id: string | null) {
    setActiveId(id)
    onOpenChange?.(id)
  }

  useEffect(() => {
    onOpenChangeRef.current = onOpenChange
  }, [onOpenChange])

  useEffect(() => {
    if (!activeId) return
    const overlay = overlayRef.current
    const root = rootRef.current
    const id = activeId
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    overlay?.querySelector<HTMLElement>("[data-close]")?.focus()
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault()
        setActiveId(null)
        onOpenChangeRef.current?.(null)
        return
      }
      if (event.key !== "Tab" || !overlay) return
      const focusable = [...overlay.querySelectorAll<HTMLElement>("button:not([tabindex='-1']), a[href]")]
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (!first || !last) return
      event.preventDefault()
      const current = focusable.indexOf(document.activeElement as HTMLElement)
      const nextIndex = event.shiftKey
        ? (current <= 0 ? focusable.length : current) - 1
        : current === -1 || current === focusable.length - 1
          ? 0
          : current + 1
      focusable[nextIndex]?.focus()
    }
    document.addEventListener("keydown", onKey)
    return () => {
      document.removeEventListener("keydown", onKey)
      document.body.style.overflow = previousOverflow
      root?.querySelector<HTMLElement>(`[data-card="${id}"]`)?.focus()
    }
  }, [activeId])

  return (
    <LayoutGroup id={groupId}>
      <div
        ref={rootRef}
        data-slot="shared-layout-expand"
        data-motion={reduced ? "off" : "on"}
        data-duration={duration}
        data-backdrop={backdrop}
        data-radius={radius}
        className={cn("grid gap-4 sm:grid-cols-3 motion-reduce:transition-none", className)}
      >
        {items.map((item) => {
          const open = item.id === active?.id
          const shape = { borderRadius: radius } as CSSProperties
          return open ? (
            <div key={item.id} aria-hidden className="min-h-36 border border-dashed border-border" style={shape} />
          ) : (
            <motion.button
              key={item.id}
              type="button"
              data-card={item.id}
              layoutId={shell(item.id)}
              aria-haspopup="dialog"
              aria-expanded={false}
              onClick={() => select(item.id)}
              transition={transition}
              style={shape}
              className="min-h-36 cursor-pointer bg-card p-5 text-left text-card-foreground shadow-sm motion-reduce:transition-none"
            >
              <motion.span layoutId={heading(item.id)} className="block font-display text-2xl tracking-tight">
                {item.title}
              </motion.span>
              <span className="mt-2 block text-sm text-muted-foreground">{item.summary}</span>
            </motion.button>
          )
        })}
      </div>
      {active ? (
          <div ref={overlayRef} className="fixed inset-0 z-50 grid place-items-center p-4">
            <motion.button
              type="button"
              tabIndex={-1}
              aria-label="关闭预览"
              className="absolute inset-0 bg-foreground motion-reduce:transition-none"
              initial={false}
              animate={{ opacity: scrim }}
              transition={transition}
              onClick={() => select(null)}
            />
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby={titleId}
              data-motion={reduced ? "off" : "on"}
              layoutId={shell(active.id)}
              transition={transition}
              style={{ borderRadius: radius }}
              className="relative z-[1] w-full max-w-lg bg-card p-6 text-card-foreground shadow-xl motion-reduce:transition-none"
            >
              <motion.h2 id={titleId} layoutId={heading(active.id)} className="font-display text-4xl tracking-tight">
                {active.title}
              </motion.h2>
              <p className="mt-4 text-sm leading-6 text-muted-foreground">{active.detail}</p>
              <div className="mt-6 flex gap-3">
                <button type="button" data-close className="rounded-full bg-primary px-4 py-2 text-sm text-primary-foreground" onClick={() => select(null)}>
                  关闭
                </button>
                <button type="button" className="rounded-full border border-border px-4 py-2 text-sm">
                  了解细节
                </button>
              </div>
            </motion.div>
          </div>
        ) : null}
    </LayoutGroup>
  )
}
