"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

export type VfxKind = "glitch" | "glow" | "crt" | "rgb-shift" | "pixelate"

export interface VfxElementProps {
  effects?: VfxKind[]
  className?: string
  children?: React.ReactNode
}

const COMBINED = `
precision highp float;
uniform vec2 resolution;
uniform vec2 offset;
uniform float time;
uniform bool autoCrop;
uniform sampler2D src;
uniform float uGlitch;
uniform float uGlow;
uniform float uCrt;
uniform float uRgb;
uniform float uPixel;
out vec4 outColor;

vec4 readTex(sampler2D tex, vec2 uv) {
  if (autoCrop && (uv.x < 0. || uv.x > 1. || uv.y < 0. || uv.y > 1.)) return vec4(0);
  return texture(tex, uv);
}

void main() {
  vec2 uv = (gl_FragCoord.xy - offset) / resolution;
  float cell = mix(1.0, 18.0, uPixel);
  vec2 puv = floor(uv * resolution / cell) * cell / resolution;
  puv = mix(uv, puv, uPixel);

  float g = step(0.92, fract(sin(floor(time * 12.0) * 78.2) * 43758.5));
  puv.x += (g * 0.03 - 0.015) * uGlitch;
  puv.y += sin(puv.x * 40.0 + time * 8.0) * 0.006 * uGlitch;

  vec4 base = readTex(src, puv);
  vec4 r = readTex(src, puv + vec2(0.008 * uRgb, 0.0));
  vec4 b = readTex(src, puv - vec2(0.008 * uRgb, 0.0));
  vec4 color = vec4(r.r, base.g, b.b, max(base.a, max(r.a, b.a)));

  float scan = sin((uv.y + time * 0.04) * resolution.y * 1.15) * 0.12 * uCrt;
  color.rgb *= 1.0 - scan;
  color.rgb *= mix(1.0, 0.78 + 0.22 * sin(uv.y * 220.0), uCrt);

  vec3 glow = color.rgb * (0.35 + 0.65 * color.rgb);
  color.rgb = mix(color.rgb, color.rgb + glow * 0.55, uGlow);
  outColor = color;
}
`

function flag(effects: VfxKind[], name: VfxKind) {
  return effects.includes(name) ? 1 : 0
}

function fallbackClass(effects: VfxKind[]) {
  return cn(
    effects.includes("glitch") && "animate-pulse",
    effects.includes("glow") && "shadow-[0_0_28px_color-mix(in_oklab,var(--primary)_55%,transparent)]",
    effects.includes("crt") && "[background-image:repeating-linear-gradient(to_bottom,transparent,transparent_2px,rgb(0_0_0/18%)_3px)]",
    effects.includes("rgb-shift") && "[text-shadow:2px_0_#f43f5e,-2px_0_#22d3ee]",
    effects.includes("pixelate") && "[image-rendering:pixelated]",
  )
}

function useReducedMotion() {
  return React.useSyncExternalStore(
    (onChange) => {
      const mq = window.matchMedia("(prefers-reduced-motion: reduce)")
      mq.addEventListener("change", onChange)
      return () => mq.removeEventListener("change", onChange)
    },
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    () => false,
  )
}

function VfxElement({ effects = ["glitch"], className, children }: VfxElementProps) {
  const hostRef = React.useRef<HTMLDivElement>(null)
  const targetRef = React.useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()
  const [fallback, setFallback] = React.useState(false)
  const key = effects.join(",")

  React.useEffect(() => {
    const host = hostRef.current
    const target = targetRef.current
    if (!host || !target || reduced) return

    let disposed = false
    let instance: { destroy: () => void } | null = null

    const selected = key.split(",") as VfxKind[]
    void import("@vfx-js/core").then(({ VFX }) => {
      if (disposed) return
      const vfx = VFX.init({
        wrapper: host,
        zIndex: 2,
        pixelRatio: Math.min(window.devicePixelRatio || 1, 1.5),
        scrollPadding: false,
      })
      if (!vfx) {
        queueMicrotask(() => setFallback(true))
        return
      }
      instance = vfx
      void vfx.add(target, {
        shader: COMBINED,
        overflow: 28,
        uniforms: {
          uGlitch: flag(selected, "glitch"),
          uGlow: flag(selected, "glow"),
          uCrt: flag(selected, "crt"),
          uRgb: flag(selected, "rgb-shift"),
          uPixel: flag(selected, "pixelate"),
        },
      })
    })

    return () => {
      disposed = true
      instance?.destroy()
    }
  }, [key, reduced])

  return (
    <div ref={hostRef} className={cn("relative overflow-hidden rounded-xl", className)}>
      <div
        ref={targetRef}
        className={cn("grid min-h-40 place-items-center bg-zinc-950 px-6 py-8 text-center text-white", (fallback || reduced) && fallbackClass(effects))}
      >
        {children ?? <p className="font-display text-3xl">VFX</p>}
      </div>
    </div>
  )
}

export { VfxElement }
