"use client"

import * as React from "react"
import { AnimatePresence, motion } from "motion/react"

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export interface AppleStoryCard {
  title: string
  eyebrow: string
  body: string
  tint: string
}

export interface AppleCardsCarouselProps {
  cards?: AppleStoryCard[]
  className?: string
}

const defaultCards: AppleStoryCard[] = [
  { title: "Silk", eyebrow: "背景", body: "丝绸噪声铺满首屏，减弱动效时换成静态渐变。", tint: "#7c3aed" },
  { title: "Globe", eyebrow: "覆盖", body: "城市标记和航线画在一颗可以懒加载的球上。", tint: "#0ea5e9" },
  { title: "Pricing", eyebrow: "转化", body: "月付和年付切换时，数字在卡片里翻滚。", tint: "#f472b6" },
]

function AppleCardsCarousel({ cards = defaultCards, className }: AppleCardsCarouselProps) {
  const reduced = usePrefersReducedMotion()
  const [active, setActive] = React.useState<number | null>(null)
  const story = active === null ? undefined : cards[active]

  return (
    <div className={cn("relative", className)}>
      <div className="flex gap-3 overflow-x-auto pb-2">
        {cards.map((card, index) => (
          <motion.button
            key={card.title}
            type="button"
            layoutId={reduced ? undefined : `story-${card.title}`}
            onClick={() => setActive(index)}
            className="h-64 w-52 shrink-0 rounded-3xl p-4 text-left text-white"
            style={{ background: `linear-gradient(180deg, ${card.tint}, #09090b)` }}
          >
            <span className="text-xs tracking-[0.2em] uppercase opacity-70">{card.eyebrow}</span>
            <span className="mt-auto block pt-28 font-display text-3xl">{card.title}</span>
          </motion.button>
        ))}
      </div>
      <AnimatePresence>
        {story ? (
          <motion.div
            className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActive(null)}
          >
            <motion.article
              layoutId={reduced ? undefined : `story-${story.title}`}
              className="w-full max-w-lg rounded-3xl p-8 text-white"
              style={{ background: `linear-gradient(180deg, ${story.tint}, #09090b)` }}
              onClick={(event) => event.stopPropagation()}
            >
              <p className="text-xs tracking-[0.2em] uppercase opacity-70">{story.eyebrow}</p>
              <h3 className="font-display mt-3 text-4xl">{story.title}</h3>
              <p className="mt-4 text-sm text-white/80">{story.body}</p>
              <button type="button" className="mt-6 text-sm underline" onClick={() => setActive(null)}>
                关闭
              </button>
            </motion.article>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  )
}

export { AppleCardsCarousel }
