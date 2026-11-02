"use client"

import { useRef, useState, type MouseEvent } from "react"
import Link from "next/link"
import {
  ArrowRight,
  Box,
  Check,
  Code2,
  Copy,
  FileText,
  Layers,
  LayoutGrid,
  Sparkles,
  Zap,
  type LucideIcon,
} from "lucide-react"
import { AnimatePresence, motion, useSpring, useTransform } from "motion/react"

import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@effect-ui/registry/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"

type NavId = "components" | "effects" | "docs" | "examples" | "github"

type NavItem = {
  id: NavId
  label: string
  icon: LucideIcon
  href: string
  external?: boolean
  lines: [string, string]
  caption: string
}

const navItems: NavItem[] = [
  {
    id: "components",
    label: "Components",
    icon: LayoutGrid,
    href: "/docs/button",
    lines: ["Build beautiful", "interfaces"],
    caption: "基础 UI 组件即用即改",
  },
  {
    id: "effects",
    label: "Effects",
    icon: Sparkles,
    href: "/docs/typing-text",
    lines: ["Motion-first", "micro-interactions"],
    caption: "动效组件可复制进项目",
  },
  {
    id: "docs",
    label: "Docs",
    icon: FileText,
    href: "/docs",
    lines: ["Copy source", "into your repo"],
    caption: "shadcn CLI 同源交付",
  },
  {
    id: "examples",
    label: "Examples",
    icon: Layers,
    href: "/#showcase",
    lines: ["Live playground", "on every page"],
    caption: "文档内可调参数预览",
  },
  {
    id: "github",
    label: "GitHub",
    icon: Code2,
    href: "https://github.com/qqzhangyanhua/effect-ui",
    external: true,
    lines: ["Open source", "MIT licensed"],
    caption: "欢迎 Star 与贡献",
  },
]

export function HeroShowcase() {
  const reduced = usePrefersReducedMotion()
  const frameRef = useRef<HTMLDivElement>(null)
  const live = useAnimationActive(frameRef)
  const floating = live && !reduced
  const [copied, setCopied] = useState(false)
  const [activeNav, setActiveNav] = useState<NavId>("components")
  const tiltRef = useRef<HTMLDivElement>(null)

  const tiltX = useSpring(0, { stiffness: 140, damping: 22 })
  const tiltY = useSpring(0, { stiffness: 140, damping: 22 })
  const rotateX = useTransform(tiltX, (value) => `${value}deg`)
  const rotateY = useTransform(tiltY, (value) => `${value}deg`)

  const slideIndex = Math.max(
    0,
    navItems.findIndex((item) => item.id === activeNav),
  )
  const active: NavItem = navItems[slideIndex] ?? navItems[0]!

  const handleCopy = () => {
    navigator.clipboard.writeText("npx shadcn add @effect-ui/shimmer-button")
    setCopied(true)
    window.setTimeout(() => setCopied(false), 2000)
  }

  const handleTiltMove = (event: MouseEvent<HTMLDivElement>) => {
    if (reduced || window.matchMedia("(pointer: coarse)").matches) return
    const node = tiltRef.current
    if (!node) return
    const rect = node.getBoundingClientRect()
    const px = (event.clientX - rect.left) / rect.width - 0.5
    const py = (event.clientY - rect.top) / rect.height - 0.5
    tiltY.set(px * 10)
    tiltX.set(-py * 8)
  }

  const resetTilt = () => {
    tiltX.set(0)
    tiltY.set(0)
  }

  return (
    <div ref={frameRef} className="relative mx-auto flex w-full max-w-[560px] items-center justify-center py-4 select-none sm:py-6 lg:justify-end">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-4 top-1/2 size-72 -translate-y-1/2 rounded-full bg-blue-500/10 blur-3xl sm:size-96 dark:bg-blue-600/15"
      />

      <svg
        aria-hidden
        className="pointer-events-none absolute -inset-10 h-[125%] w-[125%] opacity-35 dark:opacity-20"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
      >
        <line x1="5%" y1="68%" x2="48%" y2="46%" stroke="currentColor" strokeWidth="1.2" strokeDasharray="4 4" className="text-blue-500/40" />
        <line x1="48%" y1="46%" x2="95%" y2="32%" stroke="currentColor" strokeWidth="1.2" strokeDasharray="4 4" className="text-blue-500/40" />
        <line x1="48%" y1="46%" x2="48%" y2="92%" stroke="currentColor" strokeWidth="1.2" strokeDasharray="4 4" className="text-blue-500/40" />
      </svg>

      <div className="relative w-full [perspective:1200px]">
        <motion.div
          ref={tiltRef}
          onMouseMove={handleTiltMove}
          onMouseLeave={resetTilt}
          style={{
            rotateX: reduced ? 0 : rotateX,
            rotateY: reduced ? 0 : rotateY,
            transformStyle: "preserve-3d",
          }}
          className="relative mx-auto w-full max-w-[480px] sm:max-w-[500px]"
        >
          <div className="relative rounded-2xl border border-border/80 bg-card/85 p-3.5 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.08),0_1px_3px_rgba(0,0,0,0.05)] backdrop-blur-xl transition-shadow duration-500 dark:bg-card/75 dark:shadow-[0_30px_70px_-15px_rgba(0,0,0,0.6)] pointer-fine:hover:shadow-[0_32px_70px_-18px_rgba(59,130,246,0.18)]">
            <div className="flex items-center gap-1.5 pb-3">
              <span className="size-2.5 rounded-full bg-[#ff5f56]" />
              <span className="size-2.5 rounded-full bg-[#ffbd2e]" />
              <span className="size-2.5 rounded-full bg-[#27c93f]" />
            </div>

            <div className="flex gap-3 sm:gap-4">
              <div className="flex w-24 shrink-0 flex-col justify-between py-1 sm:w-28">
                <div>
                  <div className="mb-2 flex items-center gap-1.5 border-b border-border/40 pb-2">
                    <span className="flex size-4 shrink-0 items-center justify-center rounded bg-foreground text-background">
                      <span className="size-1 rounded-full border border-background" />
                    </span>
                    <span className="text-[11px] font-semibold tracking-tight text-foreground">effect-ui</span>
                  </div>

                  <div className="space-y-1" role="tablist" aria-label="预览导航">
                    {navItems.map((item) => {
                      const Icon = item.icon
                      const selected = item.id === activeNav
                      return (
                        <button
                          key={item.id}
                          type="button"
                          role="tab"
                          aria-selected={selected}
                          onClick={() => setActiveNav(item.id)}
                          className={cn(
                            "flex w-full items-center gap-1.5 rounded-md px-2 py-1 text-left text-[11px] transition-colors",
                            focusRing,
                            selected
                              ? "bg-blue-500/10 font-medium text-blue-600 dark:text-blue-400"
                              : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
                          )}
                        >
                          <Icon className="size-3 shrink-0" />
                          <span>{item.label}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>

              <div className="relative flex min-h-[200px] flex-1 flex-col justify-between overflow-hidden rounded-xl border border-white/10 bg-[#090b10] p-4 text-white shadow-inner sm:min-h-[220px]">
                <div className="pointer-events-none absolute inset-0 overflow-hidden opacity-80">
                  <svg className="absolute -bottom-6 -right-6 h-48 w-56 sm:h-56 sm:w-64" viewBox="0 0 240 200" fill="none">
                    <path d="M10,180 C80,160 90,80 180,40 C220,20 240,60 250,90" stroke="white" strokeOpacity="0.25" strokeWidth="1.5" />
                    <path d="M30,195 C90,170 110,90 200,50 C230,35 250,70 260,110" stroke="#818cf8" strokeOpacity="0.35" strokeWidth="1.2" />
                    <path d="M-10,160 C60,140 100,50 170,20 C210,5 240,40 250,70" stroke="#38bdf8" strokeOpacity="0.25" strokeWidth="1" />
                  </svg>
                </div>

                <div className="relative z-10 pt-2">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={active.id}
                      initial={reduced ? false : { opacity: 0, y: 10, filter: "blur(6px)" }}
                      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                      exit={reduced ? undefined : { opacity: 0, y: -8, filter: "blur(4px)" }}
                      transition={{ duration: 0.28, ease: "easeOut" }}
                    >
                      <h3 className="text-base font-semibold leading-snug tracking-tight text-white sm:text-lg">
                        {active.lines[0]}
                        <br />
                        {active.lines[1]}
                      </h3>
                      <p className="mt-2 text-[11px] text-white/55">{active.caption}</p>
                    </motion.div>
                  </AnimatePresence>
                </div>

                <div className="relative z-10 flex items-end justify-between gap-3 pb-1">
                  <div className="flex items-center gap-1.5">
                    {navItems.map((item, index) => (
                      <span
                        key={item.id}
                        className={cn(
                          "rounded-full transition-all duration-300",
                          index === slideIndex ? "h-1 w-4 bg-white shadow-xs" : "size-1 bg-white/30",
                        )}
                      />
                    ))}
                  </div>
                  {active.external ? (
                    <a
                      href={active.href}
                      target="_blank"
                      rel="noreferrer"
                      className={cn(
                        "inline-flex items-center gap-1 rounded-sm text-[11px] text-white/70 transition-colors hover:text-white",
                        focusRing,
                        "focus-visible:ring-offset-zinc-950",
                      )}
                    >
                      打开
                      <ArrowRight className="size-3" />
                    </a>
                  ) : (
                    <Link
                      href={active.href}
                      className={cn(
                        "inline-flex items-center gap-1 rounded-sm text-[11px] text-white/70 transition-colors hover:text-white",
                        focusRing,
                        "focus-visible:ring-offset-zinc-950",
                      )}
                    >
                      查看
                      <ArrowRight className="size-3" />
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        <div
          className={cn(
            "z-20 max-lg:relative max-lg:mt-4 max-lg:ml-auto max-lg:w-fit lg:absolute lg:-top-5 lg:-right-4",
            floating && "lg:animate-[hero-float-1_5s_ease-in-out_infinite]",
            "motion-reduce:animate-none",
          )}
        >
          <div className="flex items-center gap-2.5 rounded-xl border border-border/80 bg-card/95 px-3.5 py-2 font-mono text-xs text-foreground shadow-lg shadow-black/5 backdrop-blur-md dark:shadow-black/20">
            <span className="select-all">npx shadcn add</span>
            <button
              type="button"
              onClick={handleCopy}
              className={cn("rounded p-0.5 text-muted-foreground transition-colors hover:text-foreground", focusRing)}
              title="复制命令"
              aria-label="复制命令"
            >
              {copied ? <Check className="size-3.5 text-emerald-500" /> : <Copy className="size-3.5" />}
            </button>
          </div>
        </div>

        <Link
          href="/docs/typing-text"
          className={cn(
            "group z-20 block rounded-xl max-lg:relative max-lg:mt-3 max-lg:ml-auto max-lg:w-fit lg:absolute lg:top-[34%] lg:-right-8",
            floating && "lg:animate-[hero-float-2_6s_ease-in-out_infinite]",
            "motion-reduce:animate-none",
            focusRing,
          )}
        >
          <div className="flex w-52 items-center gap-3 rounded-xl border border-border/80 bg-card/95 px-3.5 py-2.5 shadow-xl shadow-black/5 backdrop-blur-md transition-all hover:border-primary/40 hover:shadow-2xl sm:w-56 dark:shadow-black/20">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-foreground">
              <Sparkles className="size-4" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-semibold text-foreground">Live effects</div>
              <div className="truncate text-[10px] text-muted-foreground">Try controls in docs</div>
            </div>
            <ArrowRight className="size-3.5 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
          </div>
        </Link>

        <div
          className={cn(
            "z-20 max-lg:relative max-lg:mt-3 max-lg:ml-auto max-lg:w-fit lg:absolute lg:-bottom-4 lg:right-8",
            floating && "lg:animate-[hero-float-3_5.5s_ease-in-out_infinite]",
            "motion-reduce:animate-none",
          )}
        >
          <div className="flex items-center gap-1.5 rounded-2xl border border-border/80 bg-card/95 p-1.5 shadow-xl shadow-black/5 backdrop-blur-md dark:shadow-black/20">
            <Link href="/docs/button" aria-label="组件" title="组件" className={cn("flex size-7 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground", focusRing)}>
              <Layers className="size-3.5" />
            </Link>
            <Link href="/docs" aria-label="工具箱" title="工具箱" className={cn("flex size-7 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground", focusRing)}>
              <Box className="size-3.5" />
            </Link>
            <Link href="/#showcase" aria-label="实时体验" title="实时体验" className={cn("flex size-7 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground", focusRing)}>
              <Zap className="size-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
