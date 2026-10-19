"use client"

import * as React from "react"
import { AnimatePresence, motion } from "motion/react"
import { Menu, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export interface NavMorphingProps {
  brand?: string
  links?: string[]
  className?: string
}

function NavMorphing({
  brand = "effect-ui",
  links = ["组件", "区块", "文档", "GitHub"],
  className,
}: NavMorphingProps) {
  const reduced = usePrefersReducedMotion()
  const rootRef = React.useRef<HTMLElement>(null)
  const [compact, setCompact] = React.useState(false)
  const [open, setOpen] = React.useState(false)

  React.useEffect(() => {
    const root = rootRef.current
    if (!root) return
    const findScroller = () => {
      let current: HTMLElement | null = root.parentElement
      while (current) {
        const overflow = getComputedStyle(current).overflowY
        if (overflow === "auto" || overflow === "scroll") return current
        current = current.parentElement
      }
      return window
    }
    const scroller = findScroller()
    const read = () => {
      const top = scroller === window ? window.scrollY : (scroller as HTMLElement).scrollTop
      setCompact(top > 24)
    }
    read()
    scroller.addEventListener("scroll", read, { passive: true })
    return () => scroller.removeEventListener("scroll", read)
  }, [])

  return (
    <section ref={rootRef} className={cn("relative min-h-72 overflow-hidden rounded-2xl border", className)}>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,color-mix(in_oklab,var(--primary)_12%,transparent),transparent_50%)]" />
      <div className="relative z-20 flex justify-center px-4 pt-4">
        <motion.header
          layout
          className={cn(
            "flex items-center gap-3 border bg-background/80 shadow-sm backdrop-blur",
            compact ? "rounded-full px-3 py-1.5" : "w-full max-w-3xl rounded-2xl px-5 py-3",
          )}
          transition={reduced ? { duration: 0 } : { type: "spring", stiffness: 260, damping: 28 }}
        >
          <motion.span layout className="font-display text-sm tracking-tight">
            {brand}
          </motion.span>
          <AnimatePresence initial={false}>
            {!compact && !open ? (
              <motion.nav
                key="inline"
                initial={reduced ? false : { opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={reduced ? { opacity: 1 } : { opacity: 0, width: 0 }}
                className="hidden items-center gap-4 overflow-hidden text-sm text-muted-foreground sm:flex"
              >
                {links.map((link) => (
                  <span key={link}>{link}</span>
                ))}
              </motion.nav>
            ) : null}
          </AnimatePresence>
          <div className="ml-auto flex items-center gap-1">
            {!compact ? (
              <Button size="sm" className="hidden sm:inline-flex">
                开始
              </Button>
            ) : null}
            <Button
              size="icon"
              variant="ghost"
              aria-expanded={open}
              aria-label={open ? "关闭菜单" : "打开菜单"}
              onClick={() => setOpen((value) => !value)}
            >
              <motion.span
                key={open ? "x" : "menu"}
                initial={reduced ? false : { rotate: -80, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                className="grid place-items-center"
              >
                {open ? <X className="size-4" /> : <Menu className="size-4" />}
              </motion.span>
            </Button>
          </div>
        </motion.header>
      </div>
      <AnimatePresence>
        {open ? (
          <motion.div
            initial={reduced ? false : { opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduced ? { opacity: 1 } : { opacity: 0, y: -8 }}
            className="relative z-10 mx-auto mt-3 w-[min(100%-2rem,36rem)] rounded-2xl border bg-background/95 p-4 shadow-lg"
          >
            <div className="flex flex-col gap-2 text-sm">
              {links.map((link) => (
                <button
                  key={link}
                  type="button"
                  className="rounded-lg px-3 py-2 text-left hover:bg-accent"
                  onClick={() => setOpen(false)}
                >
                  {link}
                </button>
              ))}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
      <div className="relative z-0 px-6 py-16 text-center">
        <p className="text-xs tracking-[0.28em] text-muted-foreground uppercase">Nav Morphing</p>
        <p className="font-display mt-2 text-3xl">滚动收缩成胶囊，菜单形变展开。</p>
        <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
          仅参考 Kokonut UI 免费 MIT 导航，未使用 Pro 源码。
        </p>
      </div>
    </section>
  )
}

export { NavMorphing }
