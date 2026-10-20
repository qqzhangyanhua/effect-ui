"use client"

import { motion } from "motion/react"
import * as React from "react"

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export interface ClipRevealItem {
  id: string
  label: string
  detail: string
}

export interface ClipRevealMenuProps {
  items?: readonly ClipRevealItem[]
  className?: string
}

const ITEMS: readonly ClipRevealItem[] = [
  { id: "work", label: "作品", detail: "从按钮中心撑开" },
  { id: "notes", label: "笔记", detail: "条目依次升起" },
  { id: "lab", label: "实验", detail: "Esc 或按钮关闭" },
  { id: "index", label: "索引", detail: "焦点留在菜单里" },
]

function ClipRevealMenu({ items = ITEMS, className }: ClipRevealMenuProps) {
  const reduced = usePrefersReducedMotion()
  const panelId = React.useId()
  const buttonRef = React.useRef<HTMLButtonElement>(null)
  const firstRef = React.useRef<HTMLButtonElement>(null)
  const [open, setOpen] = React.useState(false)
  const [origin, setOrigin] = React.useState({ x: 0, y: 0 })

  const toggle = () => {
    const rect = buttonRef.current?.getBoundingClientRect()
    if (rect) setOrigin({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 })
    setOpen((current) => !current)
  }

  React.useEffect(() => {
    if (!open) return
    const frame = window.requestAnimationFrame(() => firstRef.current?.focus())
    return () => window.cancelAnimationFrame(frame)
  }, [open])

  const clip = `circle(150% at ${origin.x}px ${origin.y}px)`

  return (
    <div data-slot="clip-reveal-menu" className={cn("flex min-h-40 w-full items-center justify-center", className)}>
      <button
        ref={buttonRef}
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        className="rounded-full bg-primary px-4 py-2 text-sm text-primary-foreground"
        onClick={toggle}
      >
        {open ? "关闭菜单" : "打开菜单"}
      </button>
      {open ? (
        <motion.div
          id={panelId}
          role="dialog"
          aria-modal="true"
          aria-label="全屏菜单"
          className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950 text-zinc-50"
          initial={reduced ? { clipPath: clip } : { clipPath: `circle(0% at ${origin.x}px ${origin.y}px)` }}
          animate={{ clipPath: clip }}
          transition={{ duration: reduced ? 0 : 0.55, ease: [0.22, 1, 0.36, 1] }}
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              event.preventDefault()
              setOpen(false)
              buttonRef.current?.focus()
            }
          }}
        >
          <button
            type="button"
            className="absolute top-6 right-6 rounded-md border border-white/20 px-3 py-1.5 text-sm"
            onClick={() => {
              setOpen(false)
              buttonRef.current?.focus()
            }}
          >
            关闭
          </button>
          <ul className="space-y-4">
            {items.map((item, index) => (
              <li key={item.id}>
                <motion.button
                  ref={index === 0 ? firstRef : undefined}
                  type="button"
                  className="block text-left"
                  initial={reduced ? false : { y: 28, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: reduced ? 0 : 0.35, delay: reduced ? 0 : 0.12 + index * 0.06 }}
                  onClick={() => {
                    setOpen(false)
                    buttonRef.current?.focus()
                  }}
                >
                  <span className="block font-display text-5xl tracking-tight">{item.label}</span>
                  <span className="text-sm text-zinc-400">{item.detail}</span>
                </motion.button>
              </li>
            ))}
          </ul>
        </motion.div>
      ) : null}
    </div>
  )
}

export { ClipRevealMenu }
