"use client"

import { cn } from "@/lib/utils"

export interface SiriOrbProps {
  className?: string
  size?: number
}

function SiriOrb({ className, size = 160 }: SiriOrbProps) {
  return (
    <div
      className={cn("relative grid place-items-center", className)}
      style={{ width: size, height: size }}
    >
      <span className="absolute inset-[8%] rounded-full bg-[conic-gradient(from_90deg,#60a5fa,#a78bfa,#fb7185,#22d3ee,#60a5fa)] opacity-90 blur-md animate-[orb-spin_8s_linear_infinite] motion-reduce:animate-none" />
      <span className="absolute inset-[18%] rounded-full bg-[radial-gradient(circle_at_30%_30%,#fff8,transparent_42%),conic-gradient(from_200deg,#38bdf8,#c084fc,#f472b6,#38bdf8)] animate-[orb-spin_12s_linear_infinite_reverse] motion-reduce:animate-none" />
      <span className="absolute inset-[32%] rounded-full bg-zinc-950/40 backdrop-blur-sm" />
      <span className="absolute inset-[38%] rounded-full bg-[radial-gradient(circle_at_35%_30%,#ffffffaa,transparent_46%)]" />
    </div>
  )
}

export { SiriOrb }
