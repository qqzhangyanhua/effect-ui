"use client"

// Ported from Flowbite (MIT, (c) 2023 Bergside Inc.) — https://github.com/themesberg/flowbite/blob/main/content/typography/blockquote.md. Modified for effect-ui.

import { useRef, type HTMLAttributes, type ReactNode } from "react"

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export interface BlockquoteProps extends HTMLAttributes<HTMLQuoteElement> {
  variant?: "default" | "solid" | "icon" | "testimonial" | "review"
  align?: "left" | "center" | "right"
  size?: "sm" | "md" | "lg"
  cite?: string
  author?: string
  portrait?: string
  portraitAlt?: string
  rating?: number
  children?: ReactNode
}

const sizes = { sm: "text-lg", md: "text-xl", lg: "text-2xl" } as const
const aligns = { left: "text-left", center: "text-center", right: "text-right" } as const

function Stars({ rating = 0 }: { rating?: number }) {
  const score = Math.max(0, Math.min(5, Math.round(rating)))
  return (
    <div aria-label={`${score} 星`} className="mb-4 flex items-center gap-1">
      {Array.from({ length: 5 }, (_, index) => (
        <svg key={index} aria-hidden="true" className={cn("size-5", index < score ? "text-amber-400" : "text-muted-foreground")} fill="currentColor" viewBox="0 0 24 24">
          <path d="M13.849 4.22c-.684-1.626-3.014-1.626-3.698 0L8.397 8.387l-4.552.361c-1.775.14-2.495 2.331-1.142 3.477l3.468 2.937-1.06 4.392c-.413 1.713 1.472 3.067 2.992 2.149L12 19.35l3.897 2.354c1.52.918 3.405-.436 2.992-2.15l-1.06-4.39 3.468-2.938c1.353-1.146.633-3.336-1.142-3.477l-4.552-.36-1.754-4.17Z" />
        </svg>
      ))}
    </div>
  )
}

function QuoteMark() {
  return (
    <svg aria-hidden="true" className="mb-4 size-9" fill="none" viewBox="0 0 24 24">
      <path d="M10 11V8a1 1 0 0 0-1-1H6a1 1 0 0 0-1 1v3a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1Zm0 0v2a4 4 0 0 1-4 4H5m14-6V8a1 1 0 0 0-1-1h-3a1 1 0 0 0-1 1v3a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1Zm0 0v2a4 4 0 0 1-4 4h-1" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
    </svg>
  )
}

export function Blockquote({
  variant = "default",
  align = "left",
  size = "md",
  cite,
  author,
  portrait,
  portraitAlt = "",
  rating,
  className,
  children,
  ...props
}: BlockquoteProps) {
  const ref = useRef<HTMLQuoteElement>(null)
  const reduced = usePrefersReducedMotion()
  const quote = (
    <blockquote
      {...props}
      ref={ref}
      className={cn(
        "italic font-semibold tracking-tight text-foreground",
        sizes[size],
        aligns[align],
        variant === "solid" && "my-4 border-s-4 border-border bg-muted p-4 not-italic font-medium",
        variant === "testimonial" && "text-center",
        reduced ? "transition-none" : "transition-colors",
        className,
      )}
      data-reduced={reduced ? "true" : "false"}
      data-slot="blockquote"
      data-variant={variant}
    >
      {variant === "icon" ? <QuoteMark /> : null}
      <p>{children}</p>
    </blockquote>
  )

  if (variant !== "testimonial" && variant !== "review") return quote

  return (
    <figure className={cn("max-w-3xl", variant === "testimonial" && "mx-auto text-center")}>
      {variant === "review" ? <Stars rating={rating} /> : <QuoteMark />}
      {quote}
      <figcaption className={cn("mt-6 flex items-center gap-3", variant === "testimonial" && "justify-center")}>
        {portrait ? (
          // eslint-disable-next-line @next/next/no-img-element -- registry 组件用 img，不引入 next/image
          <img alt={portraitAlt} className="size-6 rounded-full" height={24} src={portrait} width={24} />
        ) : null}
        <div className="flex items-center divide-x divide-border">
          {author ? <cite className="pe-3 font-medium text-foreground not-italic">{author}</cite> : null}
          {cite ? <cite className="ps-3 text-sm text-muted-foreground not-italic">{cite}</cite> : null}
        </div>
      </figcaption>
    </figure>
  )
}
