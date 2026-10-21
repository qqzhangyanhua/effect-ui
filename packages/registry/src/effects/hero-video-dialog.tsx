"use client"

/* eslint-disable @next/next/no-img-element -- registry 组件不能依赖 next/image */

// Ported from Magic UI (MIT) — https://github.com/magicuidesign/magicui/blob/main/apps/www/registry/magicui/hero-video-dialog.tsx

import * as React from "react"
import { Play } from "lucide-react"
import { motion } from "motion/react"

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

export type HeroVideoAnimation = "from-center" | "from-bottom" | "from-top" | "from-left" | "from-right"

export interface HeroVideoDialogProps {
  animationStyle?: HeroVideoAnimation
  videoSrc: string
  thumbnailSrc: string
  thumbnailAlt?: string
  className?: string
}

const ENTER = {
  "from-center": { scale: 0.6, opacity: 0 },
  "from-bottom": { y: 80, opacity: 0 },
  "from-top": { y: -80, opacity: 0 },
  "from-left": { x: -80, opacity: 0 },
  "from-right": { x: 80, opacity: 0 },
} as const

function HeroVideoDialog({
  animationStyle = "from-center",
  videoSrc,
  thumbnailSrc,
  thumbnailAlt = "视频封面",
  className,
}: HeroVideoDialogProps) {
  const [open, setOpen] = React.useState(false)
  const contentRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    if (!open) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return
      event.preventDefault()
      setOpen(false)
    }
    window.addEventListener("keydown", onKey)
    const focusDialog = () => contentRef.current?.focus()
    const timer = window.setTimeout(focusDialog, 0)
    return () => {
      window.removeEventListener("keydown", onKey)
      window.clearTimeout(timer)
    }
  }, [open])

  return (
    <div data-slot="hero-video-dialog" className={cn("w-full", className)}>
      <button
        type="button"
        className="group relative block w-full cursor-pointer border-0 bg-transparent p-0"
        aria-label="播放视频"
        onClick={() => setOpen(true)}
      >
        <img
          src={thumbnailSrc}
          alt={thumbnailAlt}
          className="aspect-video w-full rounded-xl border object-cover shadow-lg transition duration-200 group-hover:brightness-75"
        />
        <span className="absolute inset-0 grid place-items-center">
          <span className="grid size-20 place-items-center rounded-full bg-primary/80 text-primary-foreground shadow-md transition duration-200 group-hover:scale-125">
            <Play className="size-8 fill-current" />
          </span>
        </span>
      </button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          ref={contentRef}
          tabIndex={-1}
          onOpenAutoFocus={(event) => {
            event.preventDefault()
            contentRef.current?.focus()
          }}
          className="top-0 left-0 flex h-svh w-screen max-w-none translate-x-0 translate-y-0 items-center justify-center rounded-none border-0 bg-black/80 p-6 outline-none sm:max-w-none"
        >
          <DialogTitle className="sr-only">视频</DialogTitle>
          <motion.div
            className="aspect-video w-full max-w-4xl overflow-hidden rounded-xl bg-black"
            initial={ENTER[animationStyle]}
            animate={{ x: 0, y: 0, scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 280, damping: 28 }}
          >
            {open ? (
              <iframe
                src={videoSrc}
                title="视频播放器"
                className="size-full"
                allow="autoplay; fullscreen; picture-in-picture"
                allowFullScreen
                tabIndex={-1}
                onLoad={() => contentRef.current?.focus()}
              />
            ) : null}
          </motion.div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export { HeroVideoDialog }
