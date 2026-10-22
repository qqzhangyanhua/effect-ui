"use client"

// Ported from Framekit UI (MIT, (c) 2026 Framekit UI contributors) — https://github.com/Sid9022/framekit-ui/blob/master/src/components/ui/book-spine-shelf.tsx

import { useRef, useState, type KeyboardEvent } from "react"
import { AnimatePresence, motion } from "motion/react"

import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export interface ShelfBook {
  id: string
  title: string
  author: string
  blurb: string
  height?: number
  width?: number
  hue?: number
  badge?: string
  pattern?: "bands" | "dots" | "stripes" | "plain"
}

export interface BookSpineShelfProps {
  books?: ShelfBook[]
  value?: string
  defaultValue?: string
  onValueChange?: (id: string) => void
  title?: string
  color?: string
  duration?: number
  intensity?: number
  size?: number
  count?: number
  className?: string
}

const DEFAULT_BOOKS: ShelfBook[] = [
  { id: "quiet", title: "The Shape of Quiet", author: "M. Aldous", blurb: "Designing the moments between actions.", height: 0.96, width: 46, hue: 18, pattern: "bands" },
  { id: "grids", title: "Grids & Gravity", author: "R. Okonkwo", blurb: "Layouts that feel inevitable.", height: 0.84, width: 44, hue: 215, pattern: "dots" },
  { id: "slow", title: "Slow Software", author: "H. Lindgren", blurb: "Why the fastest products feel unhurried.", height: 1, width: 52, hue: 150, badge: "Re-reading", pattern: "stripes" },
  { id: "type", title: "Letterforms at Night", author: "S. Whitcombe", blurb: "Type that survives dark mode and tired eyes.", height: 0.9, width: 44, hue: 275, pattern: "plain" },
  { id: "motion", title: "Motion, Explained", author: "D. Takeda", blurb: "Springs and easing as a language.", height: 0.78, width: 44, hue: 340, pattern: "bands" },
  { id: "tools", title: "Small Tools", author: "E. Brandt", blurb: "Utilities that quietly make a team faster.", height: 0.93, width: 44, hue: 45, pattern: "dots" },
  { id: "atlas", title: "Atlas of Interfaces", author: "J. Moreau", blurb: "A history of the controls we touch.", height: 0.86, width: 44, hue: 190, pattern: "stripes" },
]

function walkShelf(event: KeyboardEvent<HTMLElement>) {
  const items = Array.from(event.currentTarget.querySelectorAll<HTMLElement>("[role=radio]:not([disabled])"))
  const index = items.indexOf(document.activeElement as HTMLElement)
  if (index < 0) return
  let next = index
  if (event.key === "ArrowRight" || event.key === "ArrowDown") next = (index + 1) % items.length
  else if (event.key === "ArrowLeft" || event.key === "ArrowUp") next = (index - 1 + items.length) % items.length
  else if (event.key === "Home") next = 0
  else if (event.key === "End") next = items.length - 1
  else return
  event.preventDefault()
  items[next]?.focus()
  items[next]?.click()
}

export function BookSpineShelf({
  books = DEFAULT_BOOKS,
  value,
  defaultValue,
  onValueChange,
  title = "On my shelf",
  color = "var(--primary)",
  duration = 700,
  intensity = 1,
  size = 190,
  count = 7,
  className,
}: BookSpineShelfProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const reduced = usePrefersReducedMotion()
  const live = useAnimationActive(rootRef)
  const moving = live && !reduced
  const shelf = books.slice(0, Math.max(1, Math.round(count)))
  const [inner, setInner] = useState(defaultValue ?? shelf[2]?.id ?? shelf[0]?.id ?? "")
  const [hover, setHover] = useState<string | null>(null)
  const selectedId = value ?? inner
  const book = shelf.find((item) => item.id === selectedId) ?? shelf[0]
  const hoverIndex = hover ? shelf.findIndex((item) => item.id === hover) : -1
  if (!book) return null

  const pick = (id: string) => {
    if (value === undefined) setInner(id)
    onValueChange?.(id)
  }

  return (
    <div ref={rootRef} data-motion={moving ? "on" : "off"} className={cn("w-full max-w-3xl rounded-3xl border border-border bg-card p-5 text-foreground motion-reduce:animate-none sm:p-7", className)}>
      <p className="font-mono text-[11px] tracking-[0.18em] text-muted-foreground uppercase">[ {title} ]</p>
      <div className="mt-5 grid items-end gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,15rem)]">
        <div>
          <div role="radiogroup" aria-label="Books on the shelf" onKeyDown={walkShelf} className="flex items-end gap-[3px] overflow-x-auto px-1 pt-6" style={{ height: size + 24 }}>
            {shelf.map((item, index) => {
              const selected = item.id === book.id
              const lean = hoverIndex < 0 || reduced ? 0 : index === hoverIndex ? 0 : Math.sign(index - hoverIndex) * (Math.abs(index - hoverIndex) === 1 ? 5 * intensity : 0)
              const height = size * (item.height ?? 0.9)
              return (
                <motion.button
                  key={item.id}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  aria-label={`${item.title} by ${item.author}`}
                  tabIndex={selected ? 0 : -1}
                  onClick={() => pick(item.id)}
                  onPointerEnter={(event) => {
                    if (event.pointerType === "touch") return
                    setHover(item.id)
                  }}
                  onPointerLeave={() => setHover(null)}
                  onFocus={() => setHover(item.id)}
                  onBlur={() => setHover(null)}
                  className="relative shrink-0 origin-bottom rounded-[3px] outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  style={{ width: Math.max(44, item.width ?? 44), height }}
                  initial={false}
                  animate={{ y: selected ? -14 : hover === item.id ? -10 : 0, rotate: lean }}
                  transition={moving ? { type: "spring", stiffness: 360, damping: 24 } : { duration: 0 }}
                >
                  <span className="relative flex h-full w-full flex-col items-center justify-between overflow-hidden rounded-[3px] py-3 text-primary-foreground" style={{ background: `linear-gradient(90deg, hsl(${item.hue ?? 220} 45% 32%), hsl(${item.hue ?? 220} 50% 42%) 45%, hsl(${item.hue ?? 220} 45% 28%))` }}>
                    {item.pattern === "bands" ? <span className="absolute inset-x-0 top-5 h-1.5 bg-background/30" /> : null}
                    {item.pattern === "stripes" ? <span className="absolute inset-0 opacity-25" style={{ background: "repeating-linear-gradient(0deg, var(--background) 0 2px, transparent 2px 9px)" }} /> : null}
                    {item.pattern === "dots" ? <span className="absolute inset-0 opacity-30" style={{ background: "radial-gradient(var(--background) 1.2px, transparent 1.4px) 0 0 / 10px 10px" }} /> : null}
                    <span className="relative mx-auto max-h-[74%] overflow-hidden text-[15px] leading-none whitespace-nowrap" style={{ writingMode: "vertical-rl" }}>
                      {item.title}
                    </span>
                  </span>
                  {selected ? <span aria-hidden className="absolute -bottom-2 left-1/2 size-1 -translate-x-1/2 rounded-full" style={{ background: color }} /> : null}
                </motion.button>
              )
            })}
          </div>
          <div aria-hidden className="h-3 rounded-sm bg-muted" />
        </div>
        <div className="relative min-h-60" aria-live="polite" style={{ perspective: 900 }}>
          <AnimatePresence mode="wait" initial={false}>
            <motion.article
              key={book.id}
              className="relative min-h-60 overflow-hidden rounded-r-xl rounded-l-[3px] border border-border p-5 text-primary-foreground"
              style={{ background: `linear-gradient(145deg, hsl(${book.hue ?? 220} 48% 36%), hsl(${((book.hue ?? 220) + 24) % 360} 42% 24%))` }}
              initial={moving ? { rotateY: -70, opacity: 0 } : { opacity: 0 }}
              animate={{ rotateY: 0, opacity: 1 }}
              exit={moving ? { rotateY: 40, opacity: 0 } : { opacity: 0 }}
              transition={{ duration: moving ? duration / 1000 : 0 }}
            >
              <p className="font-mono text-[10px] tracking-[0.2em] uppercase opacity-80">{book.author}</p>
              <h3 className="mt-3 text-3xl leading-none">{book.title}</h3>
              <p className="mt-4 text-sm leading-relaxed">{book.blurb}</p>
              {book.badge ? <span className="mt-4 inline-block rounded-full px-2 py-1 text-[10px] font-bold tracking-widest text-primary-foreground uppercase" style={{ background: color }}>{book.badge}</span> : null}
            </motion.article>
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
