"use client"

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/cn"

export interface InlineMascotProps {
  className?: string
}

function InlineMascot({ className }: InlineMascotProps) {
  const reduced = usePrefersReducedMotion()

  return (
    <span className={cn("mx-2 inline-flex translate-y-1 align-middle", className)} aria-hidden>
      <style>
        {`@keyframes eu-bob { 50% { transform: translateY(-7px); } }
          @keyframes eu-blink { 0%, 42%, 100% { transform: scaleY(1); } 47% { transform: scaleY(0.12); } }`}
      </style>
      <span
        className="relative grid h-14 w-16 place-items-center rounded-[42%_42%_48%_48%] bg-[linear-gradient(180deg,#c4b5fd,#7c3aed)] shadow-md"
        style={{ animation: reduced ? undefined : "eu-bob 2.6s ease-in-out infinite" }}
      >
        <span className="flex gap-2.5">
          {[0, 1].map((eye) => (
            <span
              key={eye}
              className="h-2.5 w-1.5 origin-center rounded-full bg-white"
              style={{ animation: reduced ? undefined : `eu-blink 3.4s ${eye * 0.08}s infinite` }}
            />
          ))}
        </span>
        <span className="absolute -bottom-1 h-2 w-8 rounded-full bg-black/10" />
      </span>
    </span>
  )
}

export interface HeroInlineMascotProps {
  before?: string
  after?: string
  className?: string
}

function HeroInlineMascot({
  before = "让标题",
  after = "自己眨眼",
  className,
}: HeroInlineMascotProps) {
  return (
    <section className={cn("rounded-2xl border bg-background px-6 py-16 text-center", className)}>
      <p className="text-xs tracking-[0.28em] text-muted-foreground uppercase">Inline mascot</p>
      <h2 className="font-display mt-4 text-5xl leading-tight tracking-tight text-balance sm:text-7xl">
        {before}
        <InlineMascot />
        {after}
      </h2>
      <p className="mx-auto mt-4 max-w-md text-sm text-muted-foreground">
        吉祥物嵌在词与词之间，会轻轻浮动。减弱动效时停在句子里。
      </p>
    </section>
  )
}

export { HeroInlineMascot, InlineMascot }
