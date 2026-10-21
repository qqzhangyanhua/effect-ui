"use client"

// Ported from Magic UI (MIT) — https://github.com/magicuidesign/magicui/blob/main/apps/www/registry/magicui/line-shadow-text.tsx

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export interface LineShadowTextProps {
  children?: string
  shadowColor?: string
  className?: string
}

function LineShadowText({ children = "斜纹阴影", shadowColor = "var(--foreground)", className }: LineShadowTextProps) {
  const reduced = usePrefersReducedMotion()
  return (
    <span
      data-slot="line-shadow-text"
      data-reduced={reduced ? "true" : "false"}
      data-text={children}
      className={cn("relative z-0 inline-block text-5xl font-semibold whitespace-nowrap", className)}
      style={{ ["--shadow-color" as string]: shadowColor }}
    >
      <style>
        {`@keyframes effect-ui-line-shadow { from { background-position: 0 0; } to { background-position: 100% -100%; } }
[data-slot="line-shadow-text"]::after {
  content: attr(data-text);
  position: absolute;
  z-index: -1;
  top: 0.04em;
  left: 0.04em;
  background-image: linear-gradient(45deg, transparent 45%, var(--shadow-color) 45%, var(--shadow-color) 55%, transparent 55%);
  background-size: 0.06em 0.06em;
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  pointer-events: none;
  white-space: nowrap;
}
[data-slot="line-shadow-text"][data-reduced="false"]::after { animation: effect-ui-line-shadow 15s linear infinite; }`}
      </style>
      {children}
    </span>
  )
}

export { LineShadowText }
