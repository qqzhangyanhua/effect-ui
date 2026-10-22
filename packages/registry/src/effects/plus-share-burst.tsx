"use client"

// Ported from Uiverse galaxy（MIT，(c) 2023 Uiverse.io, author neerajbaniwal）— https://github.com/uiverse-io/galaxy/blob/main/Tooltips/neerajbaniwal_sweet-sloth-99.html. Modified for effect-ui.

import { useState, type ReactNode } from "react"

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export interface PlusShareBurstItem {
  label: string
  icon: ReactNode
  onSelect?: () => void
}

export interface PlusShareBurstProps {
  items: readonly PlusShareBurstItem[]
  label?: string
  className?: string
}

const CSS = `
[data-slot="plus-share-burst"]{position:relative;width:90px;height:90px;display:inline-flex;align-items:center;justify-content:center}
[data-slot="plus-share-burst"] .plus{width:90px;height:90px;border:0;border-radius:999px;background:var(--burst-bg,var(--primary));color:var(--burst-fg,var(--primary-foreground));position:relative;z-index:3;cursor:pointer;box-shadow:0 10px 30px color-mix(in oklab,var(--foreground) 8%,transparent)}
[data-slot="plus-share-burst"] .plus::before,[data-slot="plus-share-burst"] .plus::after{content:"";position:absolute;left:50%;top:50%;border-radius:4px;background:currentColor;transform:translate(-50%,-50%)}
[data-slot="plus-share-burst"] .plus::before{width:4px;height:28px}
[data-slot="plus-share-burst"] .plus::after{width:28px;height:4px}
[data-slot="plus-share-burst"][data-open="true"][data-reduced="false"] .plus{animation:plus-share-burst-turn .5s ease-out forwards}
[data-slot="plus-share-burst"][data-open="true"] .plus{transform:rotate(45deg) scale(.95)}
[data-slot="plus-share-burst"] .menu{position:absolute;z-index:2;top:0;display:flex;width:90px;height:70px;align-items:center;justify-content:space-around;gap:8px;padding:0 12px;border-radius:70px;background:var(--card);opacity:0;pointer-events:none;box-shadow:0 10px 30px color-mix(in oklab,var(--foreground) 8%,transparent);transition:opacity .15s ease,top .15s ease,width .15s ease}
[data-slot="plus-share-burst"][data-open="true"] .menu{pointer-events:auto}
[data-slot="plus-share-burst"][data-open="true"] .menu{top:-90px;width:max(190px,100%);opacity:1}
[data-slot="plus-share-burst"][data-open="true"][data-reduced="false"] .menu{animation:plus-share-burst-stretch 1s ease-out forwards .15s}
[data-slot="plus-share-burst"] .menu::after{content:"";position:absolute;left:50%;bottom:-8px;width:20px;height:20px;margin-left:-10px;border-radius:3px;background:var(--card);transform:rotate(45deg)}
[data-slot="plus-share-burst"] .menu button{position:relative;z-index:1;display:flex;width:28px;height:28px;align-items:center;justify-content:center;border:0;background:transparent;color:var(--foreground);cursor:pointer}
[data-slot="plus-share-burst"] .burst{position:absolute;z-index:1;width:300px;height:300px;transform:scale(0);pointer-events:none}
[data-slot="plus-share-burst"][data-open="true"][data-reduced="false"] .burst{animation:plus-share-burst-pang 1.2s ease-out forwards}
[data-slot="plus-share-burst"][data-reduced="true"] .plus,[data-slot="plus-share-burst"][data-reduced="true"] .menu,[data-slot="plus-share-burst"][data-reduced="true"] .burst{animation:none;transition:none}
@keyframes plus-share-burst-turn{0%{transform:rotate(0) scale(1)}20%{transform:rotate(60deg) scale(.93)}55%{transform:rotate(35deg) scale(.97)}80%{transform:rotate(48deg) scale(.94)}100%{transform:rotate(45deg) scale(.95)}}
@keyframes plus-share-burst-stretch{0%{transform:scale(1,1)}10%{transform:scale(1.1,.9)}30%{transform:scale(.9,1.1)}50%{transform:scale(1.05,.95)}100%{transform:scale(1,1)}}
@keyframes plus-share-burst-pang{0%{transform:scale(0);opacity:0}40%{transform:scale(1);opacity:1}100%{transform:scale(1.1);opacity:0}}
`

const SHAPES = [
  "M150 132l-8 14 18 6z",
  "M142 146h16M148 140v18",
  "M150 136a13 13 0 1 0 .1 0z",
  "M146 145h8v8h-8z",
  "M141 140h18v18h-18z",
]

export function PlusShareBurst({ items, label = "分享", className }: PlusShareBurstProps) {
  const reduced = usePrefersReducedMotion()
  const [open, setOpen] = useState(false)

  return (
    <div className={cn(className)} data-open={open ? "true" : "false"} data-reduced={reduced ? "true" : "false"} data-slot="plus-share-burst">
      <style>{CSS}</style>
      <svg aria-hidden className="burst" viewBox="0 0 300 300">
        {SHAPES.map((d) => (
          <path key={d} d={d} fill="none" stroke="var(--primary)" strokeWidth="3" />
        ))}
      </svg>
      <div className="menu" role="group" aria-hidden={open ? undefined : true}>
        {items.map((item) => (
          <button
            key={item.label}
            aria-label={item.label}
            type="button"
            onClick={() => {
              item.onSelect?.()
              setOpen(false)
            }}
          >
            {item.icon}
          </button>
        ))}
      </div>
      <button aria-expanded={open} aria-label={label} className="plus" type="button" onClick={() => setOpen((value) => !value)} />
    </div>
  )
}
