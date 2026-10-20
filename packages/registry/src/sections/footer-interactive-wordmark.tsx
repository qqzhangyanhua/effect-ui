"use client"

import * as React from "react"
import Matter from "matter-js"

import { VariableFontProximity } from "@/components/ui/variable-font-proximity"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export interface FooterInteractiveWordmarkProps {
  word?: string
  note?: string
  className?: string
}

function FooterInteractiveWordmark({
  word = "EFFECT",
  note = "字重跟随光标（variable-font-proximity）。点击字母，经 matter-js 坠落。",
  className,
}: FooterInteractiveWordmarkProps) {
  const reduced = usePrefersReducedMotion()
  const hostRef = React.useRef<HTMLElement>(null)
  const letters = React.useMemo(() => Array.from(word), [word])
  const [fallen, setFallen] = React.useState<number[]>([])
  const remaining = letters.map((char, index) => (fallen.includes(index) ? " " : char)).join("")

  React.useEffect(() => {
    const host = hostRef.current
    if (!host || reduced || fallen.length === 0) return
    const { width, height } = host.getBoundingClientRect()
    const engine = Matter.Engine.create({ gravity: { x: 0, y: 1.1 } })
    const wall = 36
    const bounds = [
      Matter.Bodies.rectangle(width / 2, height + wall / 2, width, wall, { isStatic: true }),
      Matter.Bodies.rectangle(-wall / 2, height / 2, wall, height, { isStatic: true }),
      Matter.Bodies.rectangle(width + wall / 2, height / 2, wall, height, { isStatic: true }),
    ]
    const chips = fallen.map((index, order) => {
      const body = Matter.Bodies.rectangle(72 + order * 58, 28, 44, 48, {
        restitution: 0.45,
        friction: 0.1,
        chamfer: { radius: 8 },
      })
      const el = document.createElement("div")
      el.textContent = letters[index] ?? ""
      el.className =
        "pointer-events-none absolute grid place-items-center rounded-md border border-white/15 bg-white/10 font-sans text-2xl font-semibold text-white"
      el.style.width = "44px"
      el.style.height = "48px"
      host.appendChild(el)
      return { body, el }
    })
    Matter.Composite.add(engine.world, [...bounds, ...chips.map((chip) => chip.body)])
    let frame = 0
    const tick = () => {
      Matter.Engine.update(engine, 1000 / 60)
      for (const chip of chips) {
        chip.el.style.transform = `translate(${chip.body.position.x - 22}px, ${chip.body.position.y - 24}px) rotate(${chip.body.angle}rad)`
      }
      frame = window.requestAnimationFrame(tick)
    }
    frame = window.requestAnimationFrame(tick)
    return () => {
      window.cancelAnimationFrame(frame)
      Matter.Engine.clear(engine)
      for (const chip of chips) chip.el.remove()
    }
  }, [fallen, letters, reduced])

  return (
    <footer
      ref={hostRef}
      className={cn(
        "relative min-h-64 overflow-hidden rounded-2xl border bg-zinc-950 px-6 py-10 text-white",
        className,
      )}
    >
      <p className="text-xs tracking-[0.28em] text-white/40 uppercase">Interactive wordmark</p>
      <div className="relative z-10 mx-auto mt-6 w-fit">
        <VariableFontProximity
          label={remaining}
          fromFontVariationSettings="'wght' 300"
          toFontVariationSettings="'wght' 900"
          containerRef={hostRef}
          radius={140}
          className="font-sans text-6xl tracking-tight"
        />
        <div className="absolute inset-0 flex">
          {letters.map((char, index) => (
            <button
              key={`${char}-${index}`}
              type="button"
              disabled={fallen.includes(index) || reduced}
              className="flex-1 cursor-pointer bg-transparent"
              aria-label={fallen.includes(index) ? `${char} 已坠落` : `点击使 ${char} 坠落`}
              onClick={() =>
                setFallen((current) => (current.includes(index) ? current : [...current, index]))
              }
            />
          ))}
        </div>
      </div>
      <p className="relative z-10 mt-6 text-center text-sm text-white/50">{note}</p>
    </footer>
  )
}

export { FooterInteractiveWordmark }
