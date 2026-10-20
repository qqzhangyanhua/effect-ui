"use client"

/* eslint-disable @next/next/no-img-element -- registry 组件不能依赖 next/image */

import { motion } from "motion/react"
import * as React from "react"

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export interface LinkPreviewProps {
  href: string
  title: string
  description?: string
  /** 卡片里的页面图。缺省为内置色块，不调用截图服务。 */
  image?: string
  children: React.ReactNode
  className?: string
}

function PreviewArt() {
  return (
    <div className="relative h-28 w-full overflow-hidden bg-zinc-950">
      <div className="absolute inset-0 bg-[linear-gradient(140deg,#312e81,#0e7490_55%,#b45309)]" />
      <div className="absolute top-4 left-4 h-10 w-16 rounded-md bg-white/25" />
      <div className="absolute right-4 bottom-4 left-4 h-2 rounded-full bg-white/50" />
      <div className="absolute right-4 bottom-8 left-10 h-2 rounded-full bg-white/30" />
    </div>
  )
}

function LinkPreview({ href, title, description, image, children, className }: LinkPreviewProps) {
  const reduced = usePrefersReducedMotion()
  const [open, setOpen] = React.useState(false)

  return (
    <a
      data-slot="link-preview"
      href={href}
      className={cn(
        "relative inline-flex rounded-md text-primary underline-offset-4 outline-none hover:underline focus-visible:ring-2 focus-visible:ring-primary",
        className,
      )}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
      onKeyDown={(event) => {
        if (event.key === "Escape") setOpen(false)
      }}
    >
      {children}
      {open ? (
        <motion.div
          className="absolute top-full left-1/2 z-20 mt-2 w-64 overflow-hidden rounded-xl border bg-popover text-popover-foreground no-underline shadow-xl"
          style={{ x: "-50%" }}
          initial={reduced ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 10, scale: 0.92 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={reduced ? { duration: 0 } : { type: "spring", stiffness: 460, damping: 28 }}
        >
          {image ? (
            <img src={image} alt="" className="h-28 w-full object-cover" />
          ) : (
            <PreviewArt />
          )}
          <span className="block space-y-1 px-3 py-2.5 text-left no-underline">
            <span className="block text-sm font-medium text-foreground">{title}</span>
            {description ? (
              <span className="block text-xs text-muted-foreground">{description}</span>
            ) : null}
          </span>
        </motion.div>
      ) : null}
    </a>
  )
}

export { LinkPreview }
