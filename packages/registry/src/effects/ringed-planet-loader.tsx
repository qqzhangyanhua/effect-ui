"use client"

// Ported from Uiverse galaxy（MIT，(c) 2023 Uiverse.io, author Admin12121）— https://github.com/uiverse-io/galaxy/blob/main/loaders/Admin12121_white-husky-41.html. Modified for effect-ui.

import { useRef, type HTMLAttributes } from "react"

import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export interface RingedPlanetLoaderProps extends HTMLAttributes<HTMLDivElement> {
  size?: number
  colors?: string[]
  label?: string
}

const spots = [
  { top: 20, right: 50, size: 30 },
  { top: 40, left: 50, size: 15 },
  { top: 80, left: 20, size: 25 },
  { top: 80, left: 90, size: 40 },
  { top: 160, left: 70, size: 15 },
  { top: 165, left: 125, size: 10 },
]

const keyframes = `
@keyframes ringed-planet-loader-planet {
  0% { transform: rotate(10deg); }
  100% { transform: rotate(-10deg); }
}
@keyframes ringed-planet-loader-ring {
  0% { transform: rotateX(110deg) rotateZ(0deg) translate(-50px, 5px); }
  100% { transform: rotateX(110deg) rotateZ(360deg) translate(-50px, 5px); }
}
@keyframes ringed-planet-loader-dots {
  0% { box-shadow: inset -3px 3px 0px rgba(0, 0, 0, 0.3); }
  100% { box-shadow: inset 3px 3px 0px rgba(0, 0, 0, 0.3); }
}
@keyframes ringed-planet-loader-text {
  0% { transform: translateX(-30px); letter-spacing: 0px; color: var(--planet-ring); }
  25% { letter-spacing: 3px; color: var(--planet-inner); }
  50% { transform: translateX(30px); letter-spacing: 0px; color: var(--planet-ring); }
  75% { letter-spacing: 3px; color: var(--planet-inner); }
  100% { transform: translateX(-30px); letter-spacing: 0px; color: var(--planet-ring); }
}
`

export function RingedPlanetLoader({
  size = 300,
  colors,
  label = "加载中",
  className,
  ...props
}: RingedPlanetLoaderProps) {
  const ref = useRef<HTMLDivElement>(null)
  const reduced = usePrefersReducedMotion()
  const motionOn = useAnimationActive(ref)
  const active = !reduced && motionOn
  const planet = colors?.[0] ?? "var(--muted)"
  const ring = colors?.[1] ?? "var(--border)"
  const inner = colors?.[2] ?? "var(--primary)"
  const spot = colors?.[3] ?? "var(--foreground)"
  const ink = colors?.[4] ?? "var(--muted-foreground)"
  const scale = size / 300

  return (
    <div
      {...props}
      ref={ref}
      className={cn("relative inline-block", className)}
      data-motion={active ? "on" : "off"}
      data-reduced={reduced ? "true" : "false"}
      data-slot="ringed-planet-loader"
      role="status"
      style={{ width: size, height: size + 28, ["--planet-ring" as string]: ring, ["--planet-inner" as string]: inner }}
    >
      <style>{keyframes}</style>
      <div className="absolute top-0 left-0" style={{ width: 300, height: 300, transform: `scale(${scale})`, transformOrigin: "top left" }}>
        <div className="relative flex size-full items-center justify-center">
          <div
            className="absolute flex items-center rounded-full"
            data-part="planet"
            style={{
              width: "65%",
              height: "65%",
              backgroundColor: planet,
              boxShadow: "inset 2px -10px 0px rgba(0, 0, 0, 0.1)",
              transformOrigin: "center center",
              animation: active ? "ringed-planet-loader-planet 5s ease infinite alternate" : "none",
              transform: active ? undefined : "rotate(10deg)",
            }}
          >
            <div
              className="absolute flex items-center justify-center rounded-full"
              data-part="ring"
              style={{
                width: 300,
                height: 300,
                backgroundColor: ring,
                transformOrigin: "33% center",
                boxShadow: "2px -10px 0px rgba(0, 0, 0, 0.1), inset -5px -10px 0px rgba(0, 0, 0, 0.1)",
                animation: active ? "ringed-planet-loader-ring 3s ease infinite" : "none",
                transform: active ? undefined : "rotateX(110deg) rotateZ(40deg) translate(-50px, 5px)",
              }}
            >
              <span
                aria-hidden
                className="absolute z-[2] rounded-full"
                style={{ width: 10, height: 30, left: -5, backgroundColor: inner, boxShadow: "inset -3px 3px 0px rgba(0, 0, 0, 0.2)" }}
              />
              <span aria-hidden className="absolute rounded-full" style={{ width: 240, height: 240, backgroundColor: inner, boxShadow: "inset 2px -10px 0px rgba(0, 0, 0, 0.1)" }} />
            </div>
            <div
              aria-hidden
              className="absolute z-[2] w-full"
              style={{
                height: "50%",
                backgroundColor: planet,
                borderBottomLeftRadius: "80%",
                borderBottomRightRadius: "80%",
                borderTopLeftRadius: 100,
                borderTopRightRadius: 100,
                transform: "translate(0px, -17px)",
                boxShadow: "inset 0px -2px 0px rgba(0, 0, 0, 0.1)",
              }}
            />
            <div className="absolute z-[2] size-full">
              {spots.map((item) => (
                <span
                  key={`${item.top}-${item.size}`}
                  aria-hidden
                  className="absolute rounded-full"
                  style={{
                    top: item.top,
                    left: item.left,
                    right: item.right,
                    width: item.size,
                    height: item.size,
                    backgroundColor: spot,
                    boxShadow: "inset -2px 3px 0px rgba(0, 0, 0, 0.3)",
                    animation: active ? "ringed-planet-loader-dots 5s ease infinite alternate" : "none",
                  }}
                />
              ))}
            </div>
          </div>
          <p
            className="absolute z-[2] w-[100px] text-center font-mono text-sm"
            style={{
              bottom: -20,
              color: ink,
              animation: active ? "ringed-planet-loader-text 4s ease infinite" : "none",
              letterSpacing: active ? undefined : 0,
            }}
          >
            {label}
          </p>
        </div>
      </div>
    </div>
  )
}
