"use client"

import { motion, useMotionValue } from "motion/react"
import * as React from "react"

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export interface AvatarPerson {
  name: string
  color: string
}

export interface AvatarGroupTooltipProps {
  people?: readonly AvatarPerson[]
  max?: number
  className?: string
  /** 悬停放大倍率。不传或 1 时悬停仍是 1.06。 */
  scale?: number
  /** 抬起距离倍率。不传或 1 时仍抬起 8px。 */
  intensity?: number
  /** 头像边长，像素。不传或 48 仍是 size-12。 */
  size?: number
  /** 弹簧倍率。不传或 1 时刚度 420、阻尼 24。 */
  speed?: number
}

function pace(speed: number | undefined) {
  return speed === undefined || !Number.isFinite(speed) || speed <= 0 ? 1 : speed
}

const PEOPLE: readonly AvatarPerson[] = [
  { name: "林夏", color: "#6366f1" },
  { name: "周宁", color: "#0ea5e9" },
  { name: "陈可", color: "#f97316" },
  { name: "赵衡", color: "#10b981" },
  { name: "孙晚", color: "#e11d48" },
  { name: "吴舟", color: "#a855f7" },
]

function initial(name: string) {
  return name.slice(0, 1)
}

function AvatarGroupTooltip({ people = PEOPLE, max = 4, className, scale, intensity, size, speed }: AvatarGroupTooltipProps) {
  const reduced = usePrefersReducedMotion()
  const hoverScale = scale === undefined || scale === 1 ? 1.06 : 1.06 * scale
  const lift = intensity === undefined || intensity === 1 ? 8 : 8 * intensity
  const edge = size === undefined || size === 48 ? 48 : size
  const rate = pace(speed)
  const spring = {
    type: "spring" as const,
    stiffness: rate === 1 ? 420 : 420 * rate,
    damping: rate === 1 ? 24 : 24 * rate,
  }
  const groupRef = React.useRef<HTMLDivElement>(null)
  const tipX = useMotionValue(0)
  const tipY = useMotionValue(0)
  const [active, setActive] = React.useState<string | null>(null)
  const shown = people.slice(0, max)
  const extra = people.slice(max)

  const place = (clientX: number, clientY: number) => {
    const group = groupRef.current
    if (!group) return
    const rect = group.getBoundingClientRect()
    tipX.set(clientX - rect.left)
    tipY.set(clientY - rect.top - 40)
  }

  const placeOn = (target: HTMLElement) => {
    const group = groupRef.current
    if (!group) return
    const rect = group.getBoundingClientRect()
    const item = target.getBoundingClientRect()
    tipX.set(item.left - rect.left + item.width / 2)
    tipY.set(item.top - rect.top - 40)
  }

  return (
    <div
      ref={groupRef}
      data-slot="avatar-group-tooltip"
      className={cn("relative flex min-h-24 items-center px-3", className)}
      onMouseLeave={() => setActive(null)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setActive(null)
      }}
    >
      {shown.map((person) => (
        <motion.button
          key={person.name}
          type="button"
          aria-label={person.name}
          className={cn(
            "relative -ml-3 flex items-center justify-center rounded-full border-2 border-background text-sm font-medium text-white first:ml-0",
            edge === 48 && "size-12",
          )}
          style={{ background: person.color, width: edge === 48 ? undefined : edge, height: edge === 48 ? undefined : edge }}
          whileHover={reduced ? undefined : { y: -lift, scale: hoverScale, zIndex: 20 }}
          whileFocus={reduced ? undefined : { y: -lift, scale: hoverScale, zIndex: 20 }}
          transition={spring}
          onPointerMove={(event) => {
            place(event.clientX, event.clientY)
            setActive(person.name)
          }}
          onFocus={(event) => {
            placeOn(event.currentTarget)
            setActive(person.name)
          }}
          onPointerEnter={(event) => {
            place(event.clientX, event.clientY)
            setActive(person.name)
          }}
        >
          {initial(person.name)}
        </motion.button>
      ))}
      {extra.length > 0 ? (
        <button
          type="button"
          aria-label={`还有 ${extra.map((person) => person.name).join("、")}`}
          className={cn(
            "relative -ml-3 flex items-center justify-center rounded-full border-2 border-background bg-muted text-sm font-medium",
            edge === 48 && "size-12",
          )}
          style={{ width: edge === 48 ? undefined : edge, height: edge === 48 ? undefined : edge }}
          onPointerMove={(event) => {
            place(event.clientX, event.clientY)
            setActive(`+${extra.length}`)
          }}
          onPointerEnter={(event) => {
            place(event.clientX, event.clientY)
            setActive(`+${extra.length}`)
          }}
          onFocus={(event) => {
            placeOn(event.currentTarget)
            setActive(`还有 ${extra.length} 人`)
          }}
        >
          +{extra.length}
        </button>
      ) : null}
      {active ? (
        <motion.div
          role="tooltip"
          className="pointer-events-none absolute z-30 rounded-md bg-foreground px-2 py-1 text-xs text-background shadow-lg"
          style={{ left: tipX, top: tipY, x: "-50%" }}
          initial={reduced ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={reduced ? { duration: 0 } : { type: "spring", stiffness: rate === 1 ? 500 : 500 * rate, damping: rate === 1 ? 30 : 30 * rate }}
        >
          {active}
        </motion.div>
      ) : null}
    </div>
  )
}

export { AvatarGroupTooltip }
