"use client"

// Ported from Motiq (MIT, (c) 2026 Mahammad Rustamov) — https://github.com/RMahammad/motiq/blob/main/packages/registry/registry/text/kinetic-emphasis.tsx

import { useId, useMemo, useRef, type HTMLAttributes, type ReactNode } from "react"

import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export interface KineticEmphasisProps extends HTMLAttributes<HTMLElement> {
  children?: ReactNode
  color?: string
  duration?: number
  intensity?: number
  fontSize?: number
  trigger?: "mount" | "inView"
}

interface Segment {
  text: string
  em: boolean
}

function textOf(node: ReactNode): string {
  if (typeof node === "string" || typeof node === "number") return String(node)
  if (Array.isArray(node)) return node.map(textOf).join("")
  return ""
}

function segment(children: ReactNode): Segment[] {
  const segs: Segment[] = []
  const push = (raw: string, em: boolean) => {
    const tokens = raw.split(/\s+/).filter(Boolean)
    for (const token of tokens) segs.push({ text: token, em })
  }
  const walk = (node: ReactNode) => {
    if (node == null || typeof node === "boolean") return
    if (typeof node === "string" || typeof node === "number") {
      push(String(node), false)
      return
    }
    if (Array.isArray(node)) {
      for (const child of node) walk(child)
      return
    }
    if (typeof node === "object" && "props" in node) {
      const element = node as { type?: unknown; props?: { children?: ReactNode } }
      if (element.type === "em" || element.type === "strong") push(textOf(element.props?.children), true)
      else walk(element.props?.children)
    }
  }
  walk(children)
  return segs
}

export function KineticEmphasis({
  children,
  color = "var(--primary)",
  duration = 500,
  intensity = 0.6,
  fontSize = 32,
  trigger = "inView",
  className,
  ...props
}: KineticEmphasisProps) {
  const rootRef = useRef<HTMLParagraphElement>(null)
  const reduced = usePrefersReducedMotion()
  const live = useAnimationActive(rootRef)
  const animation = `ke-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`
  const segs = useMemo(() => segment(children), [children])
  const armed = !reduced && (trigger === "mount" || live)
  const moving = armed && live
  const trail = Math.min(1, Math.max(0, intensity))

  return (
    <p
      ref={rootRef}
      data-motion={moving ? "on" : "off"}
      {...props}
      className={cn("max-w-3xl text-balance leading-snug text-foreground motion-reduce:animate-none", className)}
      style={{ fontSize }}
    >
      <style>{`@keyframes ${animation}{from{opacity:.35;transform:translateY(.38em)}to{opacity:1;transform:none}}@keyframes ${animation}-line{from{transform:scaleX(0)}to{transform:scaleX(1)}}@media (prefers-reduced-motion:reduce){.${animation}{animation:none!important;opacity:1;transform:none}}`}</style>
      <span className="sr-only">{children}</span>
      <span aria-hidden className="select-none">
        {segs.map((seg, index) => (
          <span key={`${seg.text}-${index}`} className="relative mr-[0.3em] inline-block">
            <span
              className={cn(animation, "inline-block motion-reduce:animate-none", seg.em && "font-semibold")}
              style={{
                color: seg.em ? color : undefined,
                animation: armed ? `${animation} ${duration}ms cubic-bezier(.22,1,.36,1) ${index * (duration * 0.16)}ms both` : undefined,
                animationPlayState: moving ? "running" : "paused",
              }}
            >
              {seg.text}
            </span>
            {seg.em ? (
              <span
                className="absolute inset-x-0 bottom-0 h-[0.08em] origin-left rounded-full motion-reduce:scale-x-100"
                style={{
                  background: color,
                  transform: armed ? undefined : "scaleX(1)",
                  animation: armed ? `${animation}-line ${duration}ms ease-out ${index * (duration * 0.16) + duration * 0.3}ms both` : undefined,
                  animationPlayState: moving ? "running" : "paused",
                  opacity: 0.35 + trail * 0.65,
                }}
              />
            ) : (
              <span
                aria-hidden
                className="absolute inset-x-0 bottom-0 h-px origin-left motion-reduce:opacity-0"
                style={{ background: color, opacity: armed ? trail * 0.45 : 0 }}
              />
            )}
          </span>
        ))}
      </span>
    </p>
  )
}
