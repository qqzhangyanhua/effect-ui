import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

export interface FooterLinkColumn {
  title: string
  links: string[]
}

export interface FooterCurtainRevealProps {
  brand?: string
  blurb?: string
  columns?: FooterLinkColumn[]
  children?: ReactNode
  className?: string
}

const defaultColumns: FooterLinkColumn[] = [
  { title: "产品", links: ["组件", "Registry", "文档"] },
  { title: "资源", links: ["GitHub", "许可", "Credits"] },
  { title: "公司", links: ["关于", "联系"] },
]

function FooterCurtainReveal({
  brand = "effect-ui",
  blurb = "页面内容滑过时揭开页脚，像拉开幕布。移植 Fancy Components（MIT）的 curtain footer 结构。",
  columns = defaultColumns,
  children,
  className,
}: FooterCurtainRevealProps) {
  return (
    <div className={cn("relative", className)}>
      <div className="relative z-10 bg-background">
        {children ?? (
          <div className="space-y-3 rounded-2xl border px-6 py-16">
            <p className="text-xs tracking-[0.28em] text-muted-foreground uppercase">Keep scrolling</p>
            <p className="font-display text-3xl">内容层盖住页脚，滚到底才掀开。</p>
            <p className="max-w-md text-sm text-muted-foreground">{blurb}</p>
          </div>
        )}
      </div>
      <footer className="sticky bottom-0 z-0 border-t bg-zinc-950 text-white">
        <div className="mx-auto grid max-w-5xl gap-8 px-6 py-14 md:grid-cols-[1.4fr_repeat(3,1fr)]">
          <div>
            <p className="font-display text-2xl">{brand}</p>
            <p className="mt-2 max-w-xs text-sm text-white/55">{blurb}</p>
          </div>
          {columns.map((column) => (
            <div key={column.title}>
              <p className="text-xs tracking-[0.2em] text-white/40 uppercase">{column.title}</p>
              <ul className="mt-3 space-y-1.5 text-sm text-white/75">
                {column.links.map((link) => (
                  <li key={link}>{link}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </footer>
    </div>
  )
}

export { FooterCurtainReveal }
