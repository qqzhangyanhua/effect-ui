"use client"

// Ported from Uiverse galaxy（MIT，(c) 2023 Uiverse.io, author htwarriors108）— https://github.com/uiverse-io/galaxy/blob/main/Cards/htwarriors108_brave-grasshopper-38.html. Modified for effect-ui.

import { useRef, type CSSProperties, type HTMLAttributes } from "react"

import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

const CSS = `
[data-slot="neon-hold-card"] {
  position: relative;
  display: flex;
  width: 190px;
  height: 254px;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  background: linear-gradient(43deg, var(--neon-a), var(--neon-b) 46%, var(--neon-c));
  color: #fff;
  font-size: 2.2em;
  font-weight: 800;
  transform: rotateX(-55deg) rotateY(15deg) rotateZ(60deg);
  transition: transform 0.5s;
}
[data-slot="neon-hold-card"][data-motion="off"] {
  transform: none;
  transition: none;
}
[data-slot="neon-hold-card"][data-motion="on"]:hover {
  transform: rotate(0deg);
}
[data-slot="neon-hold-card"][data-motion="on"]:active {
  scale: 1.1;
  rotate: 5deg;
}
[data-slot="neon-hold-card"]::before {
  content: "";
  position: absolute;
  top: 50%;
  left: 50%;
  z-index: -1;
  width: 120%;
  height: 110%;
  border-radius: 15px;
  background: linear-gradient(43deg, var(--neon-a), var(--neon-b) 46%, var(--neon-c));
  filter: blur(30px);
  transform: translate(-50%, -50%);
  animation: neon-hold-card-pulse 5s linear infinite;
}
[data-slot="neon-hold-card"][data-motion="off"]::before {
  animation: none;
  opacity: 0.55;
  filter: blur(12px);
}
@keyframes neon-hold-card-pulse {
  0% { opacity: 0.3; }
  80% { opacity: 1; }
  100% { opacity: 0.3; }
}
`

export interface NeonHoldCardProps extends HTMLAttributes<HTMLDivElement> {
  /** 渐变的三色。不传时使用图表色。 */
  colors?: string[]
}

export function NeonHoldCard({ colors, className, style, children, ...props }: NeonHoldCardProps) {
  const ref = useRef<HTMLDivElement>(null)
  const reduced = usePrefersReducedMotion()
  const motionOn = useAnimationActive(ref)
  const painted = {
    "--neon-a": colors?.[0] ?? "var(--chart-1)",
    "--neon-b": colors?.[1] ?? "var(--chart-2)",
    "--neon-c": colors?.[2] ?? "var(--chart-3)",
    ...style,
  } as CSSProperties

  return (
    <div className={cn("inline-block [perspective:800px]", className)}>
      <div
        {...props}
        ref={ref}
        className="cursor-pointer"
        data-motion={motionOn && !reduced ? "on" : "off"}
        data-reduced={reduced ? "true" : "false"}
        data-slot="neon-hold-card"
        style={painted}
      >
        <style>{CSS}</style>
        {children}
      </div>
    </div>
  )
}
