"use client"

import { motion } from "motion/react"
import * as React from "react"

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export interface TocHeading {
  id: string
  title: string
  depth?: 2 | 3
  body: string
}

export interface TocScrollspyProps {
  headings?: readonly TocHeading[]
  className?: string
  duration?: number
  gap?: number
}

const HEADINGS: readonly TocHeading[] = [
  {
    id: "effect-toc-overview",
    title: "概览",
    body: "目录跟着滚动位置走。当前标题用滑动底色标出，左侧细线表示阅读进度。",
  },
  {
    id: "effect-toc-layout",
    title: "版式",
    body: "正文放在独立滚动容器里，避免带动整页。点击目录只滚动这个容器。",
  },
  {
    id: "effect-toc-motion",
    title: "指示器",
    depth: 3,
    body: "高亮块在标题之间滑动。系统要求减弱动效时，指示器直接跳到目标，进度线仍更新。",
  },
  {
    id: "effect-toc-keyboard",
    title: "键盘",
    body: "每一项都是链接。Tab 聚焦后回车即可跳到对应小节，焦点环保持可见。",
  },
  {
    id: "effect-toc-notes",
    title: "备注",
    body: "进度按滚动距离计算。容器滚到底时，细线铺满目录高度。",
  },
]

function TocScrollspy({ headings = HEADINGS, className, duration, gap }: TocScrollspyProps) {
  const reduced = usePrefersReducedMotion()
  const seconds = duration === undefined || duration === 250 ? 0.25 : duration / 1000
  const keepGap = gap === undefined || gap === 4
  const scrollerRef = React.useRef<HTMLDivElement>(null)
  const [active, setActive] = React.useState(headings[0]?.id ?? "")
  const [progress, setProgress] = React.useState(0)

  React.useEffect(() => {
    const root = scrollerRef.current
    if (!root) return
    const nodes = headings
      .map((heading) => root.querySelector<HTMLElement>(`#${CSS.escape(heading.id)}`))
      .filter((node): node is HTMLElement => node !== null)
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]
        if (visible?.target.id) setActive(visible.target.id)
      },
      { root, rootMargin: "-10% 0px -55% 0px", threshold: [0.2, 0.6, 1] },
    )
    for (const node of nodes) observer.observe(node)
    const onScroll = () => {
      const max = root.scrollHeight - root.clientHeight
      setProgress(max <= 0 ? 1 : root.scrollTop / max)
    }
    root.addEventListener("scroll", onScroll, { passive: true })
    return () => {
      observer.disconnect()
      root.removeEventListener("scroll", onScroll)
    }
  }, [headings])

  const jump = (id: string) => {
    const root = scrollerRef.current
    const node = root?.querySelector<HTMLElement>(`#${CSS.escape(id)}`)
    if (!root || !node) return
    root.scrollTo({ top: node.offsetTop - 8, behavior: reduced ? "auto" : "smooth" })
  }

  return (
    <div data-slot="toc-scrollspy" className={cn("grid gap-4 md:grid-cols-[11rem_1fr]", className)}>
      <nav aria-label="页内目录" className="relative pl-3">
        <div className="absolute top-0 bottom-0 left-0 w-px bg-border" aria-hidden>
          <div className="w-px bg-primary" style={{ height: `${Math.round(progress * 100)}%` }} />
        </div>
        <ul className={keepGap ? "space-y-1" : "flex flex-col"} style={keepGap ? undefined : { gap }}>
          {headings.map((heading) => {
            const current = heading.id === active
            return (
              <li key={heading.id} className={heading.depth === 3 ? "pl-3" : undefined}>
                <a
                  href={`#${heading.id}`}
                  aria-current={current ? "location" : undefined}
                  className="relative block rounded-md px-2 py-1.5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  onClick={(event) => {
                    event.preventDefault()
                    jump(heading.id)
                  }}
                >
                  {current ? (
                    <motion.span
                      layoutId="toc-scrollspy-indicator"
                      className="absolute inset-0 rounded-md bg-primary/15"
                      transition={{ duration: reduced ? 0 : seconds }}
                    />
                  ) : null}
                  <span className={cn("relative", current ? "text-foreground" : "text-muted-foreground")}>
                    {heading.title}
                  </span>
                </a>
              </li>
            )
          })}
        </ul>
      </nav>
      <div ref={scrollerRef} className="relative h-80 overflow-auto rounded-xl border bg-background p-4">
        {headings.map((heading) => (
          <section key={heading.id} id={heading.id} className="mb-10 scroll-mt-2">
            <h3 className="mb-2 text-base font-medium">{heading.title}</h3>
            <p className="text-sm leading-6 text-muted-foreground">{heading.body}</p>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              继续向下阅读，目录高亮和进度线会跟着这一节移动。这一段用来把容器撑高，方便观察滚动监听。
            </p>
          </section>
        ))}
      </div>
    </div>
  )
}

export { TocScrollspy }
