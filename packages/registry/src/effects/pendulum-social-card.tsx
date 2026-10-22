"use client"

// Ported from Uiverse galaxy（MIT，(c) 2023 Uiverse.io, author SouravBandyopadhyay）— https://github.com/uiverse-io/galaxy/blob/main/Cards/SouravBandyopadhyay_tricky-puma-59.html. Modified for effect-ui.

import { useRef, type HTMLAttributes, type ReactNode } from "react"

import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export interface PendulumSocialCardProps extends HTMLAttributes<HTMLElement> {
  image: { src: string; alt: string }
  heading: ReactNode
  links: readonly { label: string; href: string; icon?: ReactNode }[]
}

export function PendulumSocialCard({ image, heading, links, className, ...props }: PendulumSocialCardProps) {
  const ref = useRef<HTMLElement>(null)
  const reduced = usePrefersReducedMotion()
  const motionOn = useAnimationActive(ref)
  const moving = motionOn && !reduced

  return (
    <article
      {...props}
      ref={ref}
      className={cn("w-[350px] max-w-full rounded-[15px] px-5 py-5 text-center text-white shadow-[0_8px_16px_rgba(0,0,0,0.1)]", className)}
      data-motion={moving ? "on" : "off"}
      data-reduced={reduced ? "true" : "false"}
      data-slot="pendulum-social-card"
      style={{ background: "linear-gradient(112.1deg, rgb(32, 38, 57) 11.4%, rgb(63, 76, 119) 70.2%)" }}
    >
      <style>
        {`[data-slot="pendulum-social-card"][data-motion="on"] [data-part="photo"]:hover{animation:pendulum-social-card-swing 1s infinite ease-in-out}
@keyframes pendulum-social-card-swing{0%{transform:rotate(-10deg)}50%{transform:rotate(10deg)}100%{transform:rotate(-10deg)}}`}
      </style>
      {/* eslint-disable-next-line @next/next/no-img-element -- registry 组件用 img，不引入 next/image */}
      <img
        alt={image.alt}
        className="mx-auto mb-[15px] block size-[100px] rounded-full object-scale-down shadow-[0_4px_8px_rgba(0,0,0,0.1)]"
        data-part="photo"
        height={100}
        src={image.src}
        width={100}
      />
      <h3 className="mb-2.5 text-[1.5em] font-bold">{heading}</h3>
      <div className="flex justify-center gap-[15px]">
        {links.map((link) => (
          <a
            key={link.href + link.label}
            aria-label={link.label}
            className="flex size-10 items-center justify-center rounded-full bg-white/20 text-sm text-[#f1f4ee] transition-colors duration-300 hover:bg-white/40"
            href={link.href}
          >
            {link.icon ?? link.label.slice(0, 1)}
          </a>
        ))}
      </div>
    </article>
  )
}
