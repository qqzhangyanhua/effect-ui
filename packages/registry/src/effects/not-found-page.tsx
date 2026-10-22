"use client"

// Ported from Meraki UI (MIT, (c) 2021 Khatab Wedaa) — https://github.com/merakiuilabs/merakiui/blob/main/components/404-pages/CenteredWithLinks.html and https://github.com/merakiuilabs/merakiui/blob/main/components/404-pages/Image.html. Modified for effect-ui.

import { useRef, type ReactNode } from "react"

import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export interface NotFoundLink {
  title: string
  description: string
  href: string
}

export interface NotFoundPageProps {
  variant?: "centered" | "image"
  title: string
  eyebrow?: string
  description?: string
  links?: NotFoundLink[]
  onBack?: () => void
  homeHref?: string
  backLabel?: string
  homeLabel?: string
  imageUrl?: string
  imageAlt?: string
  className?: string
}

export function NotFoundPage({
  variant = "centered",
  title,
  eyebrow,
  description,
  links = [],
  onBack,
  homeHref = "/",
  backLabel = "返回",
  homeLabel = "回到首页",
  imageUrl,
  imageAlt = "",
  className,
}: NotFoundPageProps) {
  const ref = useRef<HTMLElement>(null)
  const reduced = usePrefersReducedMotion()
  const motionOn = useAnimationActive(ref)
  const centered = variant === "centered"

  const actions = (
    <div className={cn("mt-6 flex flex-wrap items-center gap-3", centered && "justify-center")}>
      <button
        className={cn(
          "rounded-lg bg-primary px-5 py-2.5 text-sm text-primary-foreground",
          reduced ? "transition-none" : "transition-colors",
        )}
        onClick={onBack}
        type="button"
      >
        {backLabel}
      </button>
      <a className="rounded-lg border border-border px-5 py-2.5 text-sm text-foreground" href={homeHref}>
        {homeLabel}
      </a>
    </div>
  )

  let body: ReactNode
  if (centered) {
    body = (
      <div className="mx-auto max-w-3xl px-6 py-16 text-center">
        {eyebrow ? <p className="text-sm font-medium text-primary">{eyebrow}</p> : null}
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-foreground">{title}</h1>
        {description ? <p className="mt-4 text-muted-foreground">{description}</p> : null}
        {actions}
        {links.length > 0 ? (
          <ul className="mt-12 grid gap-4 text-left sm:grid-cols-3">
            {links.map((link) => (
              <li key={link.href}>
                <a className="block rounded-xl border border-border bg-card p-4 text-foreground" href={link.href}>
                  <span className="font-medium">{link.title}</span>
                  <span className="mt-2 block text-sm text-muted-foreground">{link.description}</span>
                </a>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    )
  } else {
    body = (
      <div className="grid min-h-[28rem] lg:grid-cols-2">
        <div className="flex flex-col justify-center px-6 py-16 lg:px-12">
          {eyebrow ? <p className="text-sm font-medium text-primary">{eyebrow}</p> : null}
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-foreground">{title}</h1>
          {description ? <p className="mt-4 text-muted-foreground">{description}</p> : null}
          {links.length > 0 ? (
            <p className="mt-4 text-sm text-muted-foreground">
              {links.map((link, index) => (
                <span key={link.href}>
                  {index > 0 ? " · " : null}
                  <a className="text-primary underline-offset-4 hover:underline" href={link.href}>
                    {link.title}
                  </a>
                </span>
              ))}
            </p>
          ) : null}
          {actions}
        </div>
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- registry 组件用 img，不引入 next/image
          <img alt={imageAlt} className="h-full max-h-[36rem] w-full object-cover" src={imageUrl} />
        ) : null}
      </div>
    )
  }

  return (
    <section
      ref={ref}
      className={cn("bg-background text-foreground", className)}
      data-motion={motionOn && !reduced ? "on" : "off"}
      data-reduced={reduced ? "true" : "false"}
      data-slot="not-found-page"
      data-variant={variant}
    >
      {body}
    </section>
  )
}
