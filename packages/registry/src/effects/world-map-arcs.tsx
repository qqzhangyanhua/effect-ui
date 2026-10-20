"use client"

import { motion } from "motion/react"
import * as React from "react"

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export interface WorldMapCity {
  name: string
  x: number
  y: number
}

export interface WorldMapRoute {
  from: string
  to: string
}

export interface WorldMapArcsProps {
  className?: string
  cities?: readonly WorldMapCity[]
  routes?: readonly WorldMapRoute[]
}

const LAND: readonly (readonly [number, number])[][] = [
  [
    [8, 16],
    [18, 12],
    [30, 13],
    [36, 20],
    [34, 28],
    [28, 34],
    [18, 38],
    [12, 32],
    [8, 24],
  ],
  [
    [26, 42],
    [34, 40],
    [37, 50],
    [33, 64],
    [27, 66],
    [23, 56],
    [24, 46],
  ],
  [
    [44, 16],
    [52, 13],
    [57, 18],
    [55, 26],
    [47, 27],
    [43, 22],
  ],
  [
    [46, 30],
    [56, 29],
    [60, 38],
    [57, 54],
    [49, 58],
    [44, 48],
    [44, 36],
  ],
  [
    [58, 16],
    [72, 12],
    [88, 16],
    [92, 28],
    [80, 36],
    [66, 34],
    [58, 26],
  ],
  [
    [78, 48],
    [90, 46],
    [93, 54],
    [84, 58],
    [76, 54],
  ],
  [
    [36, 8],
    [44, 6],
    [45, 12],
    [38, 14],
  ],
  [
    [84, 28],
    [89, 26],
    [90, 33],
    [85, 34],
  ],
]

function inside(x: number, y: number, poly: readonly (readonly [number, number])[]) {
  let hit = false
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const current = poly[i]
    const previous = poly[j]
    if (!current || !previous) continue
    const crosses = current[1] > y !== previous[1] > y
    const xCross =
      ((previous[0] - current[0]) * (y - current[1])) / (previous[1] - current[1] || 0.0001) + current[0]
    if (crosses && x < xCross) hit = !hit
  }
  return hit
}

function buildDots() {
  const dots: { x: number; y: number }[] = []
  for (let y = 5; y <= 67; y += 1.45) {
    for (let x = 6; x <= 95; x += 1.45) {
      if (LAND.some((poly) => inside(x, y, poly))) {
        dots.push({ x: Math.round(x * 10) / 10, y: Math.round(y * 10) / 10 })
      }
    }
  }
  return dots
}

const DOTS = buildDots()

const DEFAULT_CITIES: readonly WorldMapCity[] = [
  { name: "纽约", x: 29, y: 30 },
  { name: "圣保罗", x: 32, y: 56 },
  { name: "伦敦", x: 48, y: 22 },
  { name: "内罗毕", x: 54, y: 46 },
  { name: "上海", x: 80, y: 30 },
  { name: "悉尼", x: 86, y: 54 },
]

const DEFAULT_ROUTES: readonly WorldMapRoute[] = [
  { from: "上海", to: "纽约" },
  { from: "伦敦", to: "内罗毕" },
  { from: "悉尼", to: "上海" },
  { from: "纽约", to: "圣保罗" },
  { from: "伦敦", to: "纽约" },
]

function arcPath(from: WorldMapCity, to: WorldMapCity) {
  const mx = (from.x + to.x) / 2
  const lift = Math.hypot(to.x - from.x, to.y - from.y) * 0.38
  const my = Math.min(from.y, to.y) - lift
  return `M ${from.x} ${from.y} Q ${mx} ${my} ${to.x} ${to.y}`
}

function WorldMapArcs({
  className,
  cities = DEFAULT_CITIES,
  routes = DEFAULT_ROUTES,
}: WorldMapArcsProps) {
  const reduced = usePrefersReducedMotion()
  const byName = new Map(cities.map((city) => [city.name, city]))
  const paths = routes.flatMap((route) => {
    const from = byName.get(route.from)
    const to = byName.get(route.to)
    if (!from || !to) return []
    return [{ id: `${route.from}-${route.to}`, d: arcPath(from, to) }]
  })

  return (
    <div
      data-slot="world-map-arcs"
      className={cn("overflow-hidden rounded-xl border border-white/10 bg-zinc-950 text-cyan-100", className)}
    >
      <svg viewBox="0 0 100 72" className="h-auto w-full" role="img" aria-labelledby="world-map-arcs-title">
        <title id="world-map-arcs-title">点状世界地图，城市之间有发光弧线</title>
        {DOTS.map((dot) => (
          <circle key={`${dot.x}-${dot.y}`} cx={dot.x} cy={dot.y} r={0.38} fill="rgba(186,230,253,0.85)" />
        ))}
        {paths.map((path, index) => (
          <g key={path.id}>
            <path d={path.d} fill="none" stroke="rgba(103,232,249,0.28)" strokeWidth={1.15} />
            <motion.path
              d={path.d}
              fill="none"
              stroke="#67e8f9"
              strokeWidth={0.42}
              strokeLinecap="round"
              initial={{ pathLength: reduced ? 1 : 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: reduced ? 0 : 1.35, delay: reduced ? 0 : index * 0.18, ease: "easeInOut" }}
            />
          </g>
        ))}
        {cities.map((city, index) => (
          <g key={city.name}>
            <motion.circle
              cx={city.x}
              cy={city.y}
              fill="none"
              stroke="#a5f3fc"
              strokeWidth={0.28}
              initial={false}
              animate={reduced ? { r: 1.5, opacity: 0.45 } : { r: [1.1, 2.6, 1.1], opacity: [0.85, 0, 0.85] }}
              transition={reduced ? { duration: 0 } : { duration: 2.2, repeat: Infinity, delay: index * 0.15 }}
            />
            <circle cx={city.x} cy={city.y} r={0.7} fill="#ecfeff" />
            <text x={city.x + 1.4} y={city.y - 1.2} fill="#e0f2fe" fontSize={2.35}>
              {city.name}
            </text>
          </g>
        ))}
      </svg>
    </div>
  )
}

export { WorldMapArcs }
