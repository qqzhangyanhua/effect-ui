"use client"

// Ported from Meraki UI（MIT，(c) 2021 Khatab Wedaa）— https://github.com/merakiuilabs/merakiui/blob/main/components/footers/SubscribeFromAndLinks.html. Modified for effect-ui.

import { useState, type FormEvent, type HTMLAttributes, type ReactNode } from "react"

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export interface SiteFooterLink {
  label: string
  href: string
}

export interface SiteFooterGroup {
  title: string
  links: SiteFooterLink[]
}

export interface SiteFooterSocial {
  label: string
  href: string
}

export interface SiteFooterProps extends HTMLAttributes<HTMLElement> {
  variant?: "subscribe" | "cta" | "simple"
  groups?: SiteFooterGroup[]
  onSubscribe?: (email: string) => void
  social?: SiteFooterSocial[]
  brand?: ReactNode
  heading?: ReactNode
  copyright?: ReactNode
  ctaLabel?: ReactNode
  ctaHref?: string
}

function Groups({ groups, reduced }: { groups: SiteFooterGroup[]; reduced: boolean }) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {groups.map((group) => (
        <div key={group.title}>
          <p className="font-semibold text-foreground">{group.title}</p>
          <div className="mt-4 grid gap-2">
            {group.links.map((link) => (
              <a
                key={link.href + link.label}
                className="text-sm text-muted-foreground underline-offset-4 hover:text-primary hover:underline"
                href={link.href}
                style={{ transition: reduced ? "none" : "color 0.3s" }}
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

function SocialRow({ social, reduced }: { social: SiteFooterSocial[]; reduced: boolean }) {
  return (
    <div className="flex flex-wrap gap-4">
      {social.map((item) => (
        <a
          key={item.href + item.label}
          aria-label={item.label}
          className="text-sm text-muted-foreground hover:text-primary"
          href={item.href}
          style={{ transition: reduced ? "none" : "color 0.3s" }}
        >
          {item.label}
        </a>
      ))}
    </div>
  )
}

export function SiteFooter({
  variant = "subscribe",
  groups = [],
  onSubscribe,
  social = [],
  brand,
  heading,
  copyright,
  ctaLabel,
  ctaHref = "#",
  className,
  ...props
}: SiteFooterProps) {
  const reduced = usePrefersReducedMotion()
  const [email, setEmail] = useState("")

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    onSubscribe?.(email)
  }

  return (
    <footer {...props} className={cn("bg-background text-foreground", className)} data-reduced={reduced ? "true" : "false"} data-slot="site-footer" data-variant={variant}>
      <div className="mx-auto grid max-w-6xl gap-8 px-6 py-12">
        {variant === "subscribe" ? (
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
            <form className="grid gap-4" onSubmit={submit}>
              {heading != null ? <h2 className="max-w-lg text-xl font-semibold tracking-tight">{heading}</h2> : null}
              <div className="flex flex-col gap-3 sm:flex-row">
                <input
                  aria-label="邮箱"
                  className="h-10 w-full min-w-0 rounded-md border border-border bg-background px-3 text-sm sm:flex-1"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                />
                <button className="inline-flex h-10 shrink-0 items-center justify-center rounded-lg bg-primary px-6 text-sm font-medium whitespace-nowrap text-primary-foreground" type="submit">
                  订阅
                </button>
              </div>
            </form>
            <Groups groups={groups} reduced={reduced} />
          </div>
        ) : null}
        {variant === "cta" ? (
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            {heading != null ? <h2 className="text-xl font-semibold tracking-tight">{heading}</h2> : null}
            <a className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm text-primary-foreground" href={ctaHref} style={{ transition: reduced ? "none" : "background-color 0.3s" }}>
              {ctaLabel}
            </a>
          </div>
        ) : null}
        {variant === "simple" ? <div className="text-base font-semibold">{brand}</div> : null}
        {variant === "cta" ? <Groups groups={groups} reduced={reduced} /> : null}
        <div className="flex flex-col gap-4 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
          {variant !== "simple" ? <div className="font-semibold">{brand}</div> : null}
          {copyright != null ? <p className="text-sm text-muted-foreground">{copyright}</p> : null}
          {variant !== "cta" ? <SocialRow reduced={reduced} social={social} /> : null}
        </div>
      </div>
    </footer>
  )
}
