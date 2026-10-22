"use client"

// Ported from HyperUI (MIT, (c) Mark Mead) — https://github.com/markmead/hyperui/blob/main/public/examples/marketing/blog-cards/1.html. Modified for effect-ui.

import type { HTMLAttributes } from "react"

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export interface BlogCardProps extends HTMLAttributes<HTMLElement> {
  variant?: "image-top" | "overlay" | "horizontal"
  excerpt?: string
  date?: string
  dateTime?: string
  href?: string
  imageUrl: string
  imageAlt: string
  cta?: string
}

function CardImage({ src, alt, className }: { src: string; alt: string; className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element -- registry 组件用 img，不引入 next/image
    <img alt={alt} className={className} src={src} />
  )
}

export function BlogCard({
  variant = "image-top",
  title,
  excerpt,
  date,
  dateTime,
  href,
  imageUrl,
  imageAlt,
  cta,
  className,
  ...props
}: BlogCardProps) {
  const reduced = usePrefersReducedMotion()
  const motion = reduced ? "transition-none" : "transition hover:shadow-lg"
  const time = date ? (
    <time className={cn("block text-xs", variant === "overlay" ? "text-white/90" : "text-muted-foreground")} dateTime={dateTime}>
      {date}
    </time>
  ) : null
  const heading = title ? (
    href ? (
      <a href={href}>
        <h3 className={cn("font-medium", variant === "horizontal" && "font-bold uppercase", variant === "overlay" ? "mt-0.5 text-lg text-white" : "mt-0.5 text-lg text-foreground")}>
          {title}
        </h3>
      </a>
    ) : (
      <h3 className={cn("font-medium", variant === "horizontal" && "font-bold uppercase", variant === "overlay" ? "mt-0.5 text-lg text-white" : "mt-0.5 text-lg text-foreground")}>{title}</h3>
    )
  ) : null
  const body = excerpt ? (
    <p className={cn("mt-2 line-clamp-3 text-sm/relaxed", variant === "overlay" ? "text-white/95" : "text-muted-foreground")}>{excerpt}</p>
  ) : null
  const action = cta && href ? (
    <a
      className={cn(
        "mt-4 inline-flex text-sm font-medium text-primary",
        variant === "horizontal" && "mt-0 block bg-primary px-5 py-3 text-center text-xs font-bold text-primary-foreground uppercase",
        reduced ? "transition-none" : "transition hover:opacity-90",
      )}
      href={href}
    >
      {cta}
    </a>
  ) : null

  if (variant === "overlay") {
    return (
      <article {...props} className={cn("relative overflow-hidden rounded-lg shadow-sm", motion, className)} data-reduced={reduced ? "true" : "false"} data-slot="blog-card" data-variant={variant}>
        <CardImage alt={imageAlt} className="absolute inset-0 h-full w-full object-cover" src={imageUrl} />
        <div className="relative bg-gradient-to-t from-black/55 to-black/25 pt-32 sm:pt-48">
          <div className="p-4 sm:p-6">
            {time}
            {heading}
            {body}
            {action}
          </div>
        </div>
      </article>
    )
  }

  if (variant === "horizontal") {
    return (
      <article {...props} className={cn("flex bg-card shadow-sm", motion, className)} data-reduced={reduced ? "true" : "false"} data-slot="blog-card" data-variant={variant}>
        {date ? (
          <div className="flex rotate-180 items-center p-2 [writing-mode:vertical-lr]">
            <time className="flex items-center gap-4 text-xs font-bold text-foreground uppercase" dateTime={dateTime}>
              {date}
              <span className="h-8 w-px bg-foreground/10" />
            </time>
          </div>
        ) : null}
        <div className="hidden sm:block sm:basis-56">
          <CardImage alt={imageAlt} className="aspect-square h-full w-full object-cover" src={imageUrl} />
        </div>
        <div className="flex flex-1 flex-col justify-between">
          <div className="border-s border-border p-4 sm:border-s-transparent sm:p-6">
            {heading}
            {body}
          </div>
          {action ? <div className="sm:flex sm:items-end sm:justify-end">{action}</div> : null}
        </div>
      </article>
    )
  }

  return (
    <article {...props} className={cn("overflow-hidden rounded-lg bg-card shadow-sm", motion, className)} data-reduced={reduced ? "true" : "false"} data-slot="blog-card" data-variant={variant}>
      <CardImage alt={imageAlt} className="h-56 w-full object-cover" src={imageUrl} />
      <div className="p-4 sm:p-6">
        {time}
        {heading}
        {body}
        {action}
      </div>
    </article>
  )
}
