"use client"

import * as React from "react"
import { AnimatePresence, motion, useInView } from "motion/react"

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export interface StickyFeature {
  title: string
  body: string
  tint: string
}

export interface SectionStickyFeatureScrollProps {
  features?: StickyFeature[]
  className?: string
}

const defaultFeatures: StickyFeature[] = [
  {
    title: "可替换背景槽",
    body: "Hero 把 Silk / Iridescence / Lightning 当成插槽，而不是写死一张图。",
    tint: "#7c3aed",
  },
  {
    title: "减弱动效回退",
    body: "系统开启 prefers-reduced-motion 时，着色器和地球仪换成静态渐变。",
    tint: "#22d3ee",
  },
  {
    title: "组合现有特效",
    body: "区块优先引用 registry 里已有的按钮、数字翻滚和设备框。",
    tint: "#f472b6",
  },
]

function FeatureRow({
  feature,
  index,
  onVisible,
}: {
  feature: StickyFeature
  index: number
  onVisible: (index: number) => void
}) {
  const ref = React.useRef<HTMLLIElement>(null)
  const inView = useInView(ref, { amount: 0.55 })

  React.useEffect(() => {
    if (inView) onVisible(index)
  }, [inView, index, onVisible])

  return (
    <li ref={ref} className="min-h-48 py-8">
      <h3 className="font-display text-2xl">{feature.title}</h3>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">{feature.body}</p>
    </li>
  )
}

function SectionStickyFeatureScroll({
  features = defaultFeatures,
  className,
}: SectionStickyFeatureScrollProps) {
  const reduced = usePrefersReducedMotion()
  const [active, setActive] = React.useState(0)
  const current = features[active] ?? features[0]

  return (
    <section className={cn("rounded-2xl border bg-background px-6 py-12", className)}>
      <p className="text-xs tracking-[0.28em] text-muted-foreground uppercase">Sticky features</p>
      <h2 className="font-display mt-2 text-3xl">滚动时左侧粘住，右侧换故事</h2>
      <div className="mt-8 grid gap-8 md:grid-cols-2">
        <div className="md:sticky md:top-8 h-64 overflow-hidden rounded-2xl border">
          <AnimatePresence mode="wait">
            <motion.div
              key={current?.title ?? "empty"}
              initial={reduced ? false : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduced ? { opacity: 1 } : { opacity: 0, y: -16 }}
              className="flex h-full flex-col justify-end p-6 text-white"
              style={{
                background: `linear-gradient(160deg, ${current?.tint ?? "#7c3aed"}, #09090b)`,
              }}
            >
              <p className="text-xs tracking-[0.2em] uppercase opacity-70">0{active + 1}</p>
              <p className="font-display mt-2 text-2xl">{current?.title}</p>
            </motion.div>
          </AnimatePresence>
        </div>
        <ul>
          {features.map((feature, index) => (
            <FeatureRow key={feature.title} feature={feature} index={index} onVisible={setActive} />
          ))}
        </ul>
      </div>
    </section>
  )
}

export { SectionStickyFeatureScroll }
