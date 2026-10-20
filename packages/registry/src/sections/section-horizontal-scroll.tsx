"use client"

import * as React from "react"
import { motion, useScroll, useTransform } from "motion/react"

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export interface HorizontalChapter {
  title: string
  body: string
  tint: string
}

export interface SectionHorizontalScrollProps {
  chapters?: HorizontalChapter[]
  className?: string
}

const defaultChapters: HorizontalChapter[] = [
  { title: "起势", body: "先把画面撑满一屏。", tint: "#312e81" },
  { title: "推进", body: "竖向滚动换成横向章节。", tint: "#0e7490" },
  { title: "收束", body: "最后一章停在视口里。", tint: "#9d174d" },
]

function SectionHorizontalScroll({
  chapters = defaultChapters,
  className,
}: SectionHorizontalScrollProps) {
  const reduced = usePrefersReducedMotion()
  const ref = React.useRef<HTMLElement>(null)
  const [width, setWidth] = React.useState(0)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  })
  const x = useTransform(scrollYProgress, [0, 1], [0, -width * Math.max(chapters.length - 1, 0)])

  React.useEffect(() => {
    const element = ref.current
    if (!element) return
    const update = () => setWidth(element.clientWidth)
    update()
    const observer = new ResizeObserver(update)
    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  return (
    <section ref={ref} className={cn(reduced ? "space-y-4" : "h-[220vh]", className)}>
      <div className={cn(reduced ? "" : "sticky top-0 flex h-[70vh] items-center overflow-hidden")}>
        <motion.div style={{ x: reduced ? 0 : x }} className={cn(reduced ? "grid gap-4" : "flex h-full")}>
          {chapters.map((chapter) => (
            <article
              key={chapter.title}
              className="grid h-full shrink-0 place-items-end p-8 text-white"
              style={{
                width: reduced ? "100%" : width || "100%",
                background: `linear-gradient(160deg, ${chapter.tint}, #09090b)`,
                minHeight: reduced ? "16rem" : undefined,
              }}
            >
              <div>
                <h2 className="font-display text-5xl">{chapter.title}</h2>
                <p className="mt-2 max-w-sm text-sm text-white/75">{chapter.body}</p>
              </div>
            </article>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

export { SectionHorizontalScroll }
