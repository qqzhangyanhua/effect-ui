"use client"

import * as React from "react"

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export interface Keycap3DProps {
  keys?: string[]
  className?: string
  /** 按下过渡，毫秒。不传或 80 仍是 80ms。 */
  duration?: number
  /** 静止倾斜角。不传或 18 时静止 18°、按下 8°。 */
  angle?: number
  /** 按下深度倍率。不传或 1 时下移 6px、阴影 8px。 */
  intensity?: number
  /** 键间距，像素。不传或 12 仍是 gap-3。 */
  gap?: number
}

const defaultKeys = ["Q", "W", "E", "R", "T", "A", "S", "D", "F", "G"]

function Keycap3D({ keys = defaultKeys, className, duration, angle, intensity, gap }: Keycap3DProps) {
  const reduced = usePrefersReducedMotion()
  const [pressed, setPressed] = React.useState<string | null>(null)
  const ms = duration === undefined || duration === 80 ? 80 : duration
  const rest = angle === undefined || angle === 18 ? 18 : angle
  const pressedAngle = angle === undefined || angle === 18 ? 8 : (8 * angle) / 18
  const depth = intensity === undefined || intensity === 1 ? 6 : 6 * intensity
  const shadow = intensity === undefined || intensity === 1 ? 8 : 8 * intensity
  const spaced = gap === undefined || gap === 12

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
      <div className={cn("mt-6 grid grid-cols-5 [perspective:800px]", spaced && "gap-3")} style={spaced ? undefined : { gap }}>
        {keys.map((key) => {
          const down = pressed === key
          const canonicalPose = (angle === undefined || angle === 18) && (intensity === undefined || intensity === 1)
          return (
            <button
              key={key}
              type="button"
              onPointerDown={() => setPressed(key)}
              onPointerUp={() => setPressed(null)}
              onPointerLeave={() => setPressed((current) => (current === key ? null : current))}
              className={cn(
                "relative h-16 rounded-lg border border-white/10 bg-gradient-to-b from-zinc-100 to-zinc-300 text-lg font-medium text-zinc-900",
                canonicalPose && "shadow-[0_8px_0_#3f3f46]",
              )}
              style={{
                transform: canonicalPose
                  ? down
                    ? "translateY(6px) rotateX(8deg)"
                    : "translateY(0) rotateX(18deg)"
                  : down
                    ? `translateY(${depth}px) rotateX(${pressedAngle}deg)`
                    : `translateY(0) rotateX(${rest}deg)`,
                boxShadow: canonicalPose ? (down ? "0 2px 0 #3f3f46" : undefined) : down ? `0 ${shadow / 4}px 0 #3f3f46` : `0 ${shadow}px 0 #3f3f46`,
                transition: reduced ? "none" : ms === 80 ? "transform 80ms ease, box-shadow 80ms ease" : `transform ${ms}ms ease, box-shadow ${ms}ms ease`,
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
