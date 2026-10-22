"use client"

// Ported from SyntaxUI (MIT, (c) 2024 SyntaxUI) — https://github.com/SyntaxUI/syntaxui/blob/main/src/showcase/blocks/features/HoverSpringFeatures.tsx

import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

import { motion } from "motion/react"
import { useRef } from "react"

export interface HoverSpringFeature {
  id: string
  title: string
  description: string
  href?: string
  image?: string
  alt?: string
}

export interface HoverSpringFeaturesProps {
  items: HoverSpringFeature[]
  className?: string
}

export function HoverSpringFeatures({ items, className }: HoverSpringFeaturesProps) {
  const ref = useRef<HTMLDivElement>(null)
  const prefersReducedMotion = usePrefersReducedMotion()
  const motionOn = useAnimationActive(ref)
  const animate = !prefersReducedMotion && motionOn

  return (
    <div
      className={cn("grid w-full grid-cols-2 gap-x-8 gap-y-5 md:grid-cols-3", className)}
      data-reduced={prefersReducedMotion ? "true" : "false"}
      data-slot="hover-spring-features"
      ref={ref}
    >
      {items.map((item) => {
        const body = (
          <>
            {item.image ? (
              // eslint-disable-next-line @next/next/no-img-element -- registry 组件不能依赖 next/image
              <img alt={item.alt ?? item.title} className="mb-3 size-8 rounded-lg border" height={32} src={item.image} width={32} />
            ) : null}
            <div className="mb-1 text-sm font-medium">{item.title}</div>
            <div className="max-w-[16rem] text-sm text-muted-foreground">{item.description}</div>
          </>
        )
        return (
          <motion.div
            className="text-left"
            key={item.id}
            transition={animate ? { type: "spring", bounce: 0.7 } : { duration: 0 }}
            whileHover={animate ? { y: -8 } : undefined}
          >
            {item.href ? (
              <a href={item.href} rel="noreferrer" target="_blank">
                {body}
              </a>
            ) : (
              body
            )}
          </motion.div>
        )
      })}
    </div>
  )
}
