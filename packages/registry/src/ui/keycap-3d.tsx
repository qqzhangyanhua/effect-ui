"use client"

import * as React from "react"

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export interface Keycap3DProps {
  keys?: string[]
  className?: string
}

const defaultKeys = ["Q", "W", "E", "R", "T", "A", "S", "D", "F", "G"]

function Keycap3D({ keys = defaultKeys, className }: Keycap3DProps) {
  const reduced = usePrefersReducedMotion()
  const [pressed, setPressed] = React.useState<string | null>(null)

  React.useEffect(() => {
    const down = (event: KeyboardEvent) => {
      const key = event.key.toUpperCase()
      if (keys.includes(key)) setPressed(key)
    }
    const up = () => setPressed(null)
    window.addEventListener("keydown", down)
    window.addEventListener("keyup", up)
    return () => {
      window.removeEventListener("keydown", down)
      window.removeEventListener("keyup", up)
    }
  }, [keys])

  return (
    <div className={cn("rounded-2xl border bg-zinc-950 p-6 text-white", className)}>
      <p className="font-mono text-xs tracking-[0.2em] text-white/50 uppercase">
        {pressed ? `key ${pressed}` : "按下键盘"}
      </p>
      <div className="mt-6 grid grid-cols-5 gap-3 [perspective:800px]">
        {keys.map((key) => {
          const down = pressed === key
          return (
            <button
              key={key}
              type="button"
              onPointerDown={() => setPressed(key)}
              onPointerUp={() => setPressed(null)}
              onPointerLeave={() => setPressed((current) => (current === key ? null : current))}
              className="relative h-16 rounded-lg border border-white/10 bg-gradient-to-b from-zinc-100 to-zinc-300 text-lg font-medium text-zinc-900 shadow-[0_8px_0_#3f3f46]"
              style={{
                transform: down ? "translateY(6px) rotateX(8deg)" : "translateY(0) rotateX(18deg)",
                boxShadow: down ? "0 2px 0 #3f3f46" : undefined,
                transition: reduced ? "none" : "transform 80ms ease, box-shadow 80ms ease",
              }}
            >
              {key}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export { Keycap3D }
