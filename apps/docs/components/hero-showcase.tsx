"use client"

import { useState } from "react"
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
} from "lucide-react"

export function HeroShowcase() {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText("npx shadcn add @effect-ui/shimmer-button")
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="relative mx-auto flex w-full max-w-[560px] items-center justify-center lg:justify-end select-none py-4 sm:py-6">
      {/* Background ambient lighting */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-4 top-1/2 -translate-y-1/2 size-72 sm:size-96 rounded-full bg-blue-500/10 dark:bg-blue-600/15 blur-3xl"
      />

      {/* Perspective geometric background lines */}
      <svg
        aria-hidden
        className="pointer-events-none absolute -inset-10 h-[125%] w-[125%] opacity-35 dark:opacity-20"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
      >
        <line
          x1="5%"
          y1="68%"
          x2="48%"
          y2="46%"
          stroke="currentColor"
          strokeWidth="1.2"
          strokeDasharray="4 4"
          className="text-blue-500/40"
        />
        <line
          x1="48%"
          y1="46%"
          x2="95%"
          y2="32%"
          stroke="currentColor"
          strokeWidth="1.2"
          strokeDasharray="4 4"
          className="text-blue-500/40"
        />
        <line
          x1="48%"
          y1="46%"
          x2="48%"
          y2="92%"
          stroke="currentColor"
          strokeWidth="1.2"
          strokeDasharray="4 4"
          className="text-blue-500/40"
        />
        <polygon
          points="80,180 280,90 520,180 280,270"
          stroke="currentColor"
          strokeWidth="1"
          strokeDasharray="5 5"
          className="text-blue-500/20"
        />
      </svg>

      {/* Main Perspective Container */}
      <div className="relative w-full [perspective:1200px]">
        {/* Main Floating Desktop Window */}
        <div className="relative mx-auto w-full max-w-[480px] sm:max-w-[500px] rounded-2xl border border-border/80 bg-card/85 dark:bg-card/75 backdrop-blur-xl p-3.5 sm:p-4 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.08),0_1px_3px_rgba(0,0,0,0.05)] dark:shadow-[0_30px_70px_-15px_rgba(0,0,0,0.6)] transition-transform duration-500 hover:rotate-x-1">
          {/* macOS window titlebar */}
          <div className="flex items-center gap-1.5 pb-3">
            <span className="size-2.5 rounded-full bg-[#ff5f56]" />
            <span className="size-2.5 rounded-full bg-[#ffbd2e]" />
            <span className="size-2.5 rounded-full bg-[#27c93f]" />
          </div>

          {/* Window inner contents */}
          <div className="flex gap-3 sm:gap-4">
            {/* Left mini sidebar */}
            <div className="w-24 sm:w-28 shrink-0 flex flex-col justify-between py-1">
              <div>
                <div className="flex items-center gap-1.5 pb-2 mb-2 border-b border-border/40">
                  <span className="flex size-4 shrink-0 items-center justify-center rounded bg-foreground text-background">
                    <span className="size-1 rounded-full border border-background" />
                  </span>
                  <span className="text-[11px] font-semibold tracking-tight text-foreground">
                    effect-ui
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 rounded-md bg-blue-500/10 px-2 py-1 text-[11px] font-medium text-blue-600 dark:text-blue-400">
                    <LayoutGrid className="size-3" />
                    <span>Components</span>
                  </div>
                  <div className="flex items-center gap-1.5 rounded-md px-2 py-1 text-[11px] text-muted-foreground hover:text-foreground">
                    <Sparkles className="size-3" />
                    <span>Effects</span>
                  </div>
                  <div className="flex items-center gap-1.5 rounded-md px-2 py-1 text-[11px] text-muted-foreground hover:text-foreground">
                    <FileText className="size-3" />
                    <span>Docs</span>
                  </div>
                  <div className="flex items-center gap-1.5 rounded-md px-2 py-1 text-[11px] text-muted-foreground hover:text-foreground">
                    <Layers className="size-3" />
                    <span>Examples</span>
                  </div>
                  <div className="flex items-center gap-1.5 rounded-md px-2 py-1 text-[11px] text-muted-foreground hover:text-foreground">
                    <Code2 className="size-3" />
                    <span>GitHub</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right dark silky showcase card */}
            <div className="relative flex-1 overflow-hidden rounded-xl bg-[#090b10] p-4 text-white min-h-[200px] sm:min-h-[220px] flex flex-col justify-between border border-white/10 shadow-inner">
              {/* Silky waves background graphic */}
              <div className="pointer-events-none absolute inset-0 opacity-80 overflow-hidden">
                <svg
                  className="absolute -right-6 -bottom-6 w-56 h-48 sm:w-64 sm:h-56"
                  viewBox="0 0 240 200"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <defs>
                    <linearGradient id="silk-grad-1" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#ffffff" stopOpacity="0.45" />
                      <stop offset="50%" stopColor="#818cf8" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.05" />
                    </linearGradient>
                    <linearGradient id="silk-grad-2" x1="100%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#c084fc" stopOpacity="0.35" />
                      <stop offset="100%" stopColor="#ffffff" stopOpacity="0.08" />
                    </linearGradient>
                  </defs>
                  {/* Curving silky waves */}
                  <path
                    d="M10,180 C80,160 90,80 180,40 C220,20 240,60 250,90"
                    stroke="url(#silk-grad-1)"
                    strokeWidth="1.5"
                    fill="none"
                  />
                  <path
                    d="M30,195 C90,170 110,90 200,50 C230,35 250,70 260,110"
                    stroke="url(#silk-grad-1)"
                    strokeWidth="1.2"
                    fill="none"
                  />
                  <path
                    d="M-10,160 C60,140 100,50 170,20 C210,5 240,40 250,70"
                    stroke="url(#silk-grad-2)"
                    strokeWidth="1"
                    fill="none"
                  />
                  <path
                    d="M50,200 C100,180 130,110 210,70 C240,55 260,90 270,130"
                    stroke="white"
                    strokeOpacity="0.15"
                    strokeWidth="0.8"
                    fill="none"
                  />
                  {/* Silky ribbon fill */}
                  <path
                    d="M20,190 C85,165 95,85 185,45 C215,30 235,55 245,85 C175,85 105,155 20,190 Z"
                    fill="url(#silk-grad-1)"
                    opacity="0.3"
                  />
                </svg>
              </div>

              {/* Card Headline */}
              <div className="relative z-10 pt-2">
                <h3 className="text-base sm:text-lg font-semibold tracking-tight text-white leading-snug">
                  Build beautiful
                  <br />
                  interfaces
                </h3>
              </div>

              {/* Card pagination indicators */}
              <div className="relative z-10 flex items-center gap-1.5 pb-1">
                <span className="h-1 w-4 rounded-full bg-white shadow-xs" />
                <span className="size-1 rounded-full bg-white/40" />
                <span className="size-1 rounded-full bg-white/20" />
              </div>
            </div>
          </div>
        </div>

        {/* Floating Card 1: Top Right - npx shadcn add */}
        <div
          style={{ animation: "hero-float-1 5s ease-in-out infinite" }}
          className="absolute -top-3 sm:-top-5 -right-2 sm:-right-4 z-20"
        >
          <div className="flex items-center gap-2.5 rounded-xl border border-border/80 bg-card/95 backdrop-blur-md px-3.5 py-2 shadow-lg shadow-black/5 dark:shadow-black/20 text-xs font-mono text-foreground">
            <span className="select-all">npx shadcn add</span>
            <button
              type="button"
              onClick={handleCopy}
              className="text-muted-foreground hover:text-foreground transition-colors p-0.5 rounded"
              title="复制命令"
              aria-label="复制命令"
            >
              {copied ? (
                <Check className="size-3.5 text-emerald-500" />
              ) : (
                <Copy className="size-3.5" />
              )}
            </button>
          </div>
        </div>

        {/* Floating Card 2: Right Middle - Magic UI */}
        <Link
          href="/docs/aurora-text"
          style={{ animation: "hero-float-2 6s ease-in-out infinite" }}
          className="group absolute top-[34%] -right-4 sm:-right-8 z-20 block"
        >
          <div className="flex items-center gap-3 rounded-xl border border-border/80 bg-card/95 backdrop-blur-md px-3.5 py-2.5 shadow-xl shadow-black/5 dark:shadow-black/20 transition-all hover:border-primary/40 hover:shadow-2xl w-52 sm:w-56">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-foreground">
              <FileText className="size-4" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-semibold text-foreground">Magic UI</div>
              <div className="text-[10px] text-muted-foreground truncate">
                Beautiful animations and effects
              </div>
            </div>
            <ArrowRight className="size-3.5 text-muted-foreground transition-transform group-hover:text-primary group-hover:translate-x-0.5" />
          </div>
        </Link>

        {/* Floating Card 3: Bottom Right - Pill with 3 action icons */}
        <div
          style={{ animation: "hero-float-3 5.5s ease-in-out infinite" }}
          className="absolute -bottom-3 sm:-bottom-4 right-4 sm:right-8 z-20"
        >
          <div className="flex items-center gap-1.5 rounded-2xl border border-border/80 bg-card/95 backdrop-blur-md p-1.5 shadow-xl shadow-black/5 dark:shadow-black/20">
            <Link
              href="/docs/button"
              className="flex size-7 items-center justify-center rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
              title="组件"
            >
              <Layers className="size-3.5" />
            </Link>
            <Link
              href="/docs"
              className="flex size-7 items-center justify-center rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
              title="工具箱"
            >
              <Box className="size-3.5" />
            </Link>
            <Link
              href="/docs/aurora-text"
              className="flex size-7 items-center justify-center rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
              title="特效"
            >
              <Zap className="size-3.5" />
            </Link>
          </div>
        </div>

        {/* Floating Card 4: Bottom Left - Beautiful components preview */}
        <div
          style={{ animation: "hero-float-1 5.5s ease-in-out infinite reverse" }}
          className="absolute -bottom-4 sm:-bottom-6 -left-3 sm:-left-6 z-20"
        >
          <div className="flex items-center gap-3 rounded-xl border border-border/80 bg-card/95 backdrop-blur-md p-2.5 shadow-xl shadow-black/5 dark:shadow-black/20 max-w-[210px]">
            {/* Vector landscape thumbnail */}
            <div className="relative size-11 shrink-0 overflow-hidden rounded-lg bg-gradient-to-tr from-slate-900 via-indigo-950 to-slate-800 flex items-end justify-center">
              <svg className="w-full h-8" viewBox="0 0 100 60" fill="none">
                <path d="M0 60 L30 25 L55 60 Z" fill="#475569" opacity="0.6" />
                <path d="M25 60 L60 15 L95 60 Z" fill="#64748b" opacity="0.8" />
                <path d="M50 60 L75 30 L100 60 Z" fill="#334155" opacity="0.9" />
                <polygon points="60,15 50,30 60,35 70,30" fill="#f8fafc" opacity="0.9" />
                <polygon points="30,25 22,38 30,42 38,38" fill="#e2e8f0" opacity="0.8" />
              </svg>
            </div>
            {/* Text & skeleton bars */}
            <div className="min-w-0">
              <div className="text-xs font-medium text-foreground truncate">
                Beautiful components
              </div>
              <div className="mt-1.5 h-1.5 w-16 rounded-full bg-muted" />
              <div className="mt-1 h-1.5 w-10 rounded-full bg-muted/60" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
