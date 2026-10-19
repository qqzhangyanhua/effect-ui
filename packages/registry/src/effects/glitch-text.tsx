"use client"

import { cn } from "@/lib/utils"

export interface GlitchTextProps {
  text: string
  className?: string
}

function GlitchText({ text, className }: GlitchTextProps) {
  return (
    <span className={cn("relative inline-block", className)}>
      <span aria-hidden className="absolute inset-0 animate-[glitch-r_1.6s_steps(2,end)_infinite] text-red-500/80">
        {text}
      </span>
      <span aria-hidden className="absolute inset-0 animate-[glitch-c_1.8s_steps(2,end)_infinite] text-cyan-400/80">
        {text}
      </span>
      <span className="relative">{text}</span>
    </span>
  )
}

export { GlitchText }
