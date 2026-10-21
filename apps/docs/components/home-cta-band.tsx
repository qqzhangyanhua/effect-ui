"use client"

import Link from "next/link"
import { ArrowRight, Github } from "lucide-react"

import { Meteors } from "@effect-ui/registry/effects/meteors"
import { ShimmerButton } from "@effect-ui/registry/effects/shimmer-button"

export function HomeCtaBand() {
  return (
    <section className="relative overflow-hidden border-t border-border/50 bg-muted/20 py-16 sm:py-24">
      <Meteors number={8} className="opacity-60" />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_100%,color-mix(in_oklab,var(--primary)_10%,transparent),transparent)]"
      />
      <div className="relative mx-auto max-w-4xl px-4 text-center">
        <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          准备好打造令人惊艳的现代化界面了吗？
        </h2>
        <p className="mt-3 text-base text-muted-foreground">
          立即挑选你心仪的特效组件，复制进项目，开启非凡视觉体验。
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <ShimmerButton
            asChild
            className="inline-flex h-11 w-fit shrink-0 items-center justify-center whitespace-nowrap rounded-lg px-6 text-sm font-medium shadow-xs"
          >
            <Link href="/docs" className="inline-flex items-center gap-2 whitespace-nowrap">
              浏览全部组件
              <ArrowRight className="size-4 shrink-0" />
            </Link>
          </ShimmerButton>
          <a
            href="https://github.com/qqzhangyanhua/effect-ui"
            target="_blank"
            rel="noreferrer"
            className="inline-flex shrink-0 items-center gap-2 whitespace-nowrap rounded-lg border border-border bg-background px-6 py-3 text-sm font-medium text-foreground transition-colors hover:bg-muted/70"
          >
            <Github className="size-4 shrink-0" />
            GitHub Star
          </a>
        </div>
      </div>
    </section>
  )
}
