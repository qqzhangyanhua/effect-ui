"use client"

import * as React from "react"

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export interface ScrollSvgGraphProps {
  className?: string
}

const POINTS = [
  { label: "一", value: 22 },
  { label: "二", value: 38 },
  { label: "三", value: 30 },
  { label: "四", value: 56 },
  { label: "五", value: 48 },
  { label: "六", value: 74 },
  { label: "七", value: 63 },
  { label: "八", value: 88 },
]

function linePath() {
  return POINTS.map((point, index) => {
    const x = (index / (POINTS.length - 1)) * 100
    const y = 100 - point.value
    return `${index === 0 ? "M" : "L"} ${x.toFixed(2)} ${y.toFixed(2)}`
  }).join(" ")
}

function ScrollSvgGraph({ className }: ScrollSvgGraphProps) {
  const reduced = usePrefersReducedMotion()
  const [progress, setProgress] = React.useState(0)
  const drawn = reduced ? 1 : progress
  const path = linePath()

  return (
    <div data-slot="scroll-svg-graph" className={cn("w-full", className)}>
      <div
        className="h-80 overflow-y-auto rounded-xl border"
        onScroll={(event) => {
          const el = event.currentTarget
          const max = el.scrollHeight - el.clientHeight
          setProgress(max <= 0 ? 1 : el.scrollTop / max)
        }}
      >
        <div className="h-[160vh]">
          <div className="sticky top-0 flex h-80 flex-col justify-center px-4">
            <p className="mb-3 text-xs text-muted-foreground">在这个区域里滚动，折线沿路径画出来。</p>
            <svg viewBox="0 0 100 100" className="h-48 w-full" role="img" aria-label="八个节点的滚动折线">
              <line x1="0" y1="100" x2="100" y2="100" stroke="currentColor" strokeOpacity="0.25" strokeWidth="0.6" />
              <path
                d={path}
                fill="none"
                stroke="#a78bfa"
                strokeWidth="1.6"
                strokeLinejoin="round"
                strokeLinecap="round"
                pathLength={100}
                strokeDasharray={100}
                strokeDashoffset={100 - drawn * 100}
              />
              {POINTS.map((point, index) => {
                const x = (index / (POINTS.length - 1)) * 100
                const y = 100 - point.value
                const visible = index / (POINTS.length - 1) <= drawn + 0.001
                return <circle key={point.label} cx={x} cy={y} r="1.5" fill="#e9d5ff" opacity={visible ? 1 : 0} />
              })}
            </svg>
            <table className="sr-only">
              <caption>折线数据</caption>
              <tbody>
                {POINTS.map((point) => (
                  <tr key={point.label}>
                    <th scope="row">{point.label}</th>
                    <td>{point.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

export { ScrollSvgGraph }
