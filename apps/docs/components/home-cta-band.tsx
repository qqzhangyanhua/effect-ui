import Link from "next/link"
import { ArrowRight, Github } from "lucide-react"

import { HomeAtmosphere } from "@/components/home-atmosphere"

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"

const ctaVeil =
  "radial-gradient(ellipse 72% 78% at 50% 46%, var(--background) 0%, color-mix(in oklab, var(--background) 94%, transparent) 52%, color-mix(in oklab, var(--background) 42%, transparent) 100%)"

export function HomeCtaBand() {
  return (
    <section data-home-zone="cta" className="relative overflow-hidden border-t border-border/50">
      <HomeAtmosphere intensity={0.4} speed={0.22} size={84} veil={ctaVeil}>
        <div className="mx-auto max-w-3xl px-4 py-20 text-center sm:px-6 sm:py-28">
          <h2 className="text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            准备好打造令人惊艳的现代化界面了吗？
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-muted-foreground">
            立即挑选你心仪的特效组件，复制进项目，开启非凡视觉体验。
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/docs"
              className={`inline-flex h-11 w-fit shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-lg bg-primary px-6 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 ${focusRing}`}
            >
              浏览全部组件
              <ArrowRight className="size-4 shrink-0" />
            </Link>
            <a
              href="https://github.com/qqzhangyanhua/effect-ui"
              target="_blank"
              rel="noreferrer"
              className={`inline-flex h-11 shrink-0 items-center gap-2 whitespace-nowrap rounded-lg border border-border bg-background px-6 text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-muted ${focusRing}`}
            >
              <Github className="size-4 shrink-0" />
              GitHub Star
            </a>
          </div>
        </div>
      </HomeAtmosphere>
    </section>
  )
}
