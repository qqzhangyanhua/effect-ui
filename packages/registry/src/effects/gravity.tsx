"use client"

import * as React from "react"
import Matter from "matter-js"

import { cn } from "@/lib/utils"

export interface GravityProps {
  className?: string
  labels?: string[]
}

function Gravity({ className, labels = ["UI", "FX", "MIT", "React"] }: GravityProps) {
  const hostRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const host = hostRef.current
    if (!host) return
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const els = labels.map((label, index) => {
        const el = document.createElement("div")
        el.textContent = label
        el.className =
          "pointer-events-none absolute grid place-items-center rounded-lg border bg-card text-xs font-medium shadow-sm"
        el.style.width = "72px"
        el.style.height = "32px"
        el.style.transform = `translate(${16 + (index % 4) * 80}px, ${16 + Math.floor(index / 4) * 40}px)`
        host.appendChild(el)
        return el
      })
      return () => {
        for (const el of els) el.remove()
      }
    }
    const { width, height } = host.getBoundingClientRect()
    const engine = Matter.Engine.create({ gravity: { x: 0, y: 1.05 } })
    const world = engine.world
    const wall = 40
    const bounds = [
      Matter.Bodies.rectangle(width / 2, height + wall / 2, width, wall, { isStatic: true }),
      Matter.Bodies.rectangle(-wall / 2, height / 2, wall, height, { isStatic: true }),
      Matter.Bodies.rectangle(width + wall / 2, height / 2, wall, height, { isStatic: true }),
    ]
    const chips = labels.map((label, index) => {
      const body = Matter.Bodies.rectangle(40 + index * 52, 24 + (index % 2) * 16, 72, 32, {
        restitution: 0.55,
        friction: 0.12,
        chamfer: { radius: 10 },
      })
      const el = document.createElement("div")
      el.textContent = label
      el.className =
        "pointer-events-none absolute grid place-items-center rounded-lg border bg-card text-xs font-medium shadow-sm"
      el.style.width = "72px"
      el.style.height = "32px"
      host.appendChild(el)
      return { body, el }
    })
    Matter.Composite.add(world, [...bounds, ...chips.map((item) => item.body)])
    const mouse = Matter.Mouse.create(host)
    const constraint = Matter.MouseConstraint.create(engine, {
      mouse,
      constraint: { stiffness: 0.18, render: { visible: false } },
    })
    Matter.Composite.add(world, constraint)

    let frame = 0
    const tick = () => {
      Matter.Engine.update(engine, 1000 / 60)
      for (const chip of chips) {
        chip.el.style.transform = `translate(${chip.body.position.x - 36}px, ${chip.body.position.y - 16}px) rotate(${chip.body.angle}rad)`
      }
      frame = window.requestAnimationFrame(tick)
    }
    frame = window.requestAnimationFrame(tick)
    return () => {
      window.cancelAnimationFrame(frame)
      Matter.Engine.clear(engine)
      for (const chip of chips) chip.el.remove()
    }
  }, [labels])

  return <div ref={hostRef} className={cn("relative min-h-56 overflow-hidden rounded-xl border bg-muted/30", className)} />
}

export { Gravity }
