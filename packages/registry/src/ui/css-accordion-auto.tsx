"use client"

import * as React from "react"

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export interface AccordionItem {
  title: string
  body: string
}

export interface CssAccordionAutoProps {
  items?: AccordionItem[]
  className?: string
}

const defaultItems: AccordionItem[] = [
  { title: "高度可以是 auto", body: "支持时用 interpolate-size，把 details 内容从 0 过渡到 auto。" },
  { title: "不支持时量高", body: "回退到读取 scrollHeight，再写到内联高度。" },
  { title: "仍然是原生控件", body: "摘要保持 summary，键盘和读屏沿用浏览器行为。" },
]

function Item({ item, supported, reduced }: { item: AccordionItem; supported: boolean; reduced: boolean }) {
  const panel = React.useRef<HTMLDivElement>(null)

  return (
    <details
      className="eu11-details rounded-xl border bg-card"
      onToggle={(event) => {
        if (supported || reduced) return
        const element = panel.current
        if (!element) return
        const open = event.currentTarget.open
        if (open) {
          element.style.height = "0px"
          const next = element.scrollHeight
          window.requestAnimationFrame(() => {
            element.style.height = `${next}px`
          })
        } else {
          element.style.height = `${element.scrollHeight}px`
          window.requestAnimationFrame(() => {
            element.style.height = "0px"
          })
        }
      }}
    >
      <summary className="cursor-pointer px-4 py-3 font-medium">{item.title}</summary>
      <div
        ref={panel}
        className={cn("overflow-hidden", !supported && "h-0")}
        style={{ transition: reduced || supported ? undefined : "height 400ms ease" }}
      >
        <p className="px-4 pb-4 text-sm text-muted-foreground">{item.body}</p>
      </div>
    </details>
  )
}

function CssAccordionAuto({ items = defaultItems, className }: CssAccordionAutoProps) {
  const reduced = usePrefersReducedMotion()
  const supported = React.useSyncExternalStore(
    () => () => {},
    () => CSS.supports("interpolate-size", "allow-keywords"),
    () => false,
  )

  return (
    <div className={cn("space-y-2", className)}>
      <style>
        {`@supports (interpolate-size: allow-keywords) {
            .eu11-details { interpolate-size: allow-keywords; }
            .eu11-details::details-content { block-size: 0; overflow: clip; transition: block-size 400ms ease; }
            .eu11-details[open]::details-content { block-size: auto; }
          }
          @media (prefers-reduced-motion: reduce) {
            .eu11-details::details-content { transition: none; }
          }`}
      </style>
      {items.map((item) => (
        <Item key={item.title} item={item} supported={supported} reduced={reduced} />
      ))}
    </div>
  )
}

export { CssAccordionAuto }
