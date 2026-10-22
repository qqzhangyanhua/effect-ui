"use client"

// Ported from Uiverse.io (MIT), author yaroslavas2001 — https://github.com/uiverse-io/galaxy/blob/main/Buttons/yaroslavas2001_lovely-fox-50.html. Modified for effect-ui.

import { useRef, type ButtonHTMLAttributes, type CSSProperties } from "react"

import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

const FLOWERS = [
  { name: "f1", place: "top-[-12px] left-[-13px]", duration: "15s", delay: "0s", from: "5deg", to: "365deg" },
  { name: "f2", place: "bottom-[-5px] left-2", duration: "13s", delay: "1s", from: "35deg", to: "-325deg" },
  { name: "f3", place: "bottom-[-15px]", duration: "16s", delay: "1s", from: "0deg", to: "360deg" },
  { name: "f4", place: "top-[-14px]", duration: "17s", delay: "1s", from: "15deg", to: "375deg" },
  { name: "f5", place: "top-[-3px] right-[11px]", duration: "20s", delay: "1s", from: "25deg", to: "-335deg" },
  { name: "f6", place: "right-[-15px] bottom-[-15px]", duration: "15s", delay: "1s", from: "30deg", to: "390deg" },
] as const

const PETAL_TURN = ["rotate-0", "rotate-90", "rotate-270", "rotate-180"] as const

export interface FlowerBurstButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label?: string
  /** 前两项是静止花瓣渐变，后两项是悬停渐变。 */
  petalColors?: string[]
}

export function FlowerBurstButton({
  petalColors,
  label,
  children,
  className,
  style,
  type = "button",
  ...props
}: FlowerBurstButtonProps) {
  const ref = useRef<HTMLButtonElement>(null)
  const reduced = usePrefersReducedMotion()
  const motionOn = useAnimationActive(ref)
  const moving = motionOn && !reduced
  const restA = petalColors?.[0] ?? "#07a6d7"
  const restB = petalColors?.[1] ?? "#93e0ee"
  const hoverA = petalColors?.[2] ?? "#0761d7"
  const hoverB = petalColors?.[3] ?? "#93bdee"
  const painted = {
    "--petal-a": restA,
    "--petal-b": restB,
    "--petal-ha": hoverA,
    "--petal-hb": hoverB,
    ...style,
  } as CSSProperties

  return (
    <button
      {...props}
      ref={ref}
      className={cn("relative inline-flex h-16 w-48 cursor-pointer items-center justify-center border-0 bg-transparent p-0", className)}
      data-motion={moving ? "on" : "off"}
      data-reduced={reduced ? "true" : "false"}
      data-slot="flower-burst-button"
      style={painted}
      type={type}
    >
      <style>
        {`[data-slot="flower-burst-button"] .flower{display:grid;grid-template-columns:1em 1em;position:absolute}
[data-slot="flower-burst-button"] .petal{height:1em;width:1em;border-radius:40% 70% / 7% 90%;background:linear-gradient(var(--petal-a),var(--petal-b));border:.5px solid #96d1ec}
[data-slot="flower-burst-button"]:hover .petal{background:linear-gradient(var(--petal-ha),var(--petal-hb));border-color:#96b4ec;width:1.5em;height:1.5em}
[data-slot="flower-burst-button"]:hover .flower{grid-template-columns:1.5em 1.5em}
[data-slot="flower-burst-button"][data-reduced="false"] .flower,[data-slot="flower-burst-button"][data-reduced="false"] .petal{transition:width .8s ease,height .8s ease,grid-template-columns .8s ease}
${FLOWERS.map(
  (flower) =>
    `[data-slot="flower-burst-button"][data-motion="on"]:hover .${flower.name}{animation:${flower.name}-spin ${flower.duration} linear ${flower.delay} infinite}
@keyframes ${flower.name}-spin{from{transform:rotate(${flower.from})}to{transform:rotate(${flower.to})}}`,
).join("")}`}
      </style>
      <span className={cn("relative z-1 rounded bg-white/70 px-3 py-1 text-[17px] text-black", reduced ? "transition-none" : "transition hover:bg-white/40")}>
        {children ?? label}
      </span>
      {FLOWERS.map((flower) => (
        <span className={cn("flower", flower.name, flower.place)} key={flower.name} style={{ transform: `rotate(${flower.from})` }}>
          {PETAL_TURN.map((turn) => (
            <span className={cn("petal", turn)} key={turn} />
          ))}
        </span>
      ))}
    </button>
  )
}
