"use client"

import * as React from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Marquee } from "@/components/ui/marquee"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export interface FooterSocialMarqueeProps {
  word?: string
  className?: string
}

const tiles = [
  { label: "01", tint: "#7c3aed" },
  { label: "02", tint: "#22d3ee" },
  { label: "03", tint: "#f472b6" },
  { label: "04", tint: "#f59e0b" },
]

function FooterSocialMarquee({ word = "FIELD", className }: FooterSocialMarqueeProps) {
  const reduced = usePrefersReducedMotion()
  const [sent, setSent] = React.useState(false)

  return (
    <footer className={cn("overflow-hidden rounded-2xl border bg-background", className)}>
      <Marquee className="border-b py-3 [--duration:22s]" pauseOnHover>
        {tiles.map((tile) => (
          <span key={tile.label} className="flex items-center gap-4 pr-4">
            <span className="grid h-14 w-20 place-items-end rounded-md p-2 text-xs text-white" style={{ background: tile.tint }}>
              {tile.label}
            </span>
            <span className="font-mono text-sm tracking-[0.35em]">FOLLOW</span>
          </span>
        ))}
      </Marquee>
      <form
        className="mx-auto flex max-w-md flex-col gap-2 px-6 py-8 sm:flex-row"
        onSubmit={(event) => {
          event.preventDefault()
          setSent(true)
        }}
      >
        <Input type="email" required placeholder="通讯邮件" aria-label="通讯邮件" />
        <Button type="submit">{sent ? "已记下" : "订阅"}</Button>
      </form>
      <p
        className="font-display px-4 pb-4 text-center text-[18vw] leading-none font-black tracking-tight"
        style={{ transition: reduced ? "none" : undefined }}
      >
        {word}
      </p>
    </footer>
  )
}

export { FooterSocialMarquee }
