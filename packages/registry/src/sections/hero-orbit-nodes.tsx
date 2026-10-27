"use client"

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/cn"

export interface OrbitNode {
  label: string
  tint: string
}

export interface HeroOrbitNodesProps {
  title?: string
  nodes?: OrbitNode[]
  className?: string
}

const defaultNodes: OrbitNode[] = [
  { label: "采集", tint: "#a78bfa" },
  { label: "同步", tint: "#67e8f9" },
  { label: "发布", tint: "#f9a8d4" },
  { label: "回放", tint: "#fcd34d" },
]

function HeroOrbitNodes({
  title = "虚线椭圆轨道，每颗光球都连回中心",
  nodes = defaultNodes,
  className,
}: HeroOrbitNodesProps) {
  const reduced = usePrefersReducedMotion()

  return (
    <section className={cn("overflow-hidden rounded-2xl border bg-zinc-950 px-6 py-14 text-white", className)}>
      <style>
        {`@keyframes eu-spin { to { transform: rotate(360deg); } }`}
      </style>
      <div className="mx-auto grid max-w-4xl items-center gap-8 md:grid-cols-[0.8fr_1.2fr]">
        <div>
          <p className="font-mono text-xs tracking-[0.28em] text-white/50 uppercase">Orbit nodes</p>
          <h2 className="font-display mt-3 text-4xl tracking-tight text-balance">{title}</h2>
        </div>
        <div className="relative mx-auto h-72 w-full max-w-md [perspective:900px]">
          <div className="absolute inset-0 [transform:rotateX(62deg)]">
            {nodes.map((node, index) => {
              const radius = 72 + index * 18
              return (
                <div
                  key={node.label}
                  className="absolute top-1/2 left-1/2"
                  style={{
                    width: radius * 2,
                    height: radius * 0.72,
                    marginLeft: -radius,
                    marginTop: -radius * 0.36,
                  }}
                >
                  <div className="absolute inset-0 rounded-[50%] border border-dashed border-white/30" />
                  <div
                    className="absolute inset-0"
                    style={{ animation: reduced ? undefined : `eu-spin ${16 + index * 5}s linear infinite` }}
                  >
                    <span className="absolute top-1/2 left-0 h-px w-1/2 -translate-y-1/2 border-t border-dashed border-white/50" />
                    <span
                      className="absolute top-1/2 left-0 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full shadow-[0_0_18px_currentColor]"
                      style={{ background: node.tint, color: node.tint }}
                    />
                  </div>
                </div>
              )
            })}
            <span className="absolute top-1/2 left-1/2 size-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white" />
          </div>
          <ul className="absolute inset-x-0 bottom-0 flex justify-center gap-3 text-[11px] text-white/70">
            {nodes.map((node) => (
              <li key={node.label} className="flex items-center gap-1">
                <span className="size-1.5 rounded-full" style={{ background: node.tint }} />
                {node.label}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}

export { HeroOrbitNodes }
