"use client"

// Ported from HyperUI (MIT, (c) Mark Mead) — https://github.com/markmead/hyperui/blob/main/public/examples/marketing/team-sections/1.html. Modified for effect-ui.

import { useId, type HTMLAttributes } from "react"

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export interface TeamMember {
  name: string
  role: string
  imageUrl: string
  imageAlt: string
  href: string
  linkLabel: string
}

export interface TeamSectionProps extends HTMLAttributes<HTMLDivElement> {
  members: TeamMember[]
}

export function TeamSection({ members, className, ...props }: TeamSectionProps) {
  const reduced = usePrefersReducedMotion()
  const baseId = useId()

  return (
    <div {...props} className={cn("mx-auto grid max-w-5xl grid-cols-1 gap-8 md:grid-cols-3", className)} data-reduced={reduced ? "true" : "false"} data-slot="team-section">
      {members.map((member, index) => {
        const labelId = `${baseId}-link-${index}`
        return (
          <article key={member.name}>
            {/* eslint-disable-next-line @next/next/no-img-element -- registry 组件用 img，不引入 next/image */}
            <img alt={member.imageAlt} className="aspect-video w-full rounded-lg object-cover" src={member.imageUrl} />
            <div className="mt-4 flex items-center justify-between gap-4">
              <div>
                <h3 className="text-lg/tight font-semibold text-foreground">{member.name}</h3>
                <p className="mt-0.5 text-sm text-muted-foreground">{member.role}</p>
              </div>
              <a
                aria-labelledby={labelId}
                className={cn("text-primary", reduced ? "transition-none" : "transition-opacity hover:opacity-80")}
                href={member.href}
                rel="noreferrer"
                target="_blank"
              >
                <span className="sr-only" id={labelId}>
                  {member.linkLabel}
                </span>
                <svg aria-hidden="true" className="size-7" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M16.34 1.5H3.66A2.16 2.16 0 0 0 1.5 3.66v12.68A2.16 2.16 0 0 0 3.66 18.5h12.68a2.16 2.16 0 0 0 2.16-2.16V3.66A2.16 2.16 0 0 0 16.34 1.5ZM6.74 16H4.37V7.5h2.37V16ZM5.55 6.45a1.38 1.38 0 1 1 0-2.76 1.38 1.38 0 0 1 0 2.76ZM16 16h-2.36v-4.13c0-.98-.02-2.25-1.37-2.25-1.37 0-1.58 1.07-1.58 2.18V16H8.33V7.5h2.27v1.16h.03c.32-.6 1.09-1.23 2.24-1.23 2.4 0 2.84 1.58 2.84 3.63V16Z" />
                </svg>
              </a>
            </div>
          </article>
        )
      })}
    </div>
  )
}
