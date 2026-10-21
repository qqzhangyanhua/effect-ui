"use client"

// Ported from Magic UI (MIT) — https://github.com/magicuidesign/magicui/blob/main/apps/www/registry/magicui/cool-mode.tsx

import { useEffect, useRef, type ReactNode } from "react"

import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export interface CoolModeProps {
  children?: ReactNode
  particle?: string
  className?: string
}

interface Particle {
  el: HTMLDivElement
  x: number
  y: number
  vx: number
  vy: number
  spin: number
  spinSpeed: number
}

let containers = 0

function particleContainer() {
  const id = "effect-ui-cool-mode"
  const existing = document.getElementById(id)
  if (existing) return existing
  const container = document.createElement("div")
  container.id = id
  container.setAttribute(
    "style",
    "position:fixed;inset:0;overflow:hidden;pointer-events:none;z-index:2147483646",
  )
  document.body.append(container)
  return container
}

function isImageParticle(particle: string) {
  return particle.startsWith("http") || particle.startsWith("/") || particle.startsWith("data:")
}

function CoolMode({ children, particle = "✨", className }: CoolModeProps) {
  const hostRef = useRef<HTMLSpanElement>(null)
  const reduced = usePrefersReducedMotion()
  const active = useAnimationActive(hostRef)
  const reducedRef = useRef(reduced)
  const activeRef = useRef(active)
  const resumeRef = useRef<() => void>(() => {})

  useEffect(() => {
    reducedRef.current = reduced
    activeRef.current = active
    if (!reduced && active) resumeRef.current()
  }, [reduced, active])

  useEffect(() => {
    const host = hostRef.current
    if (!host || reduced) return
    const container = particleContainer()
    containers += 1
    let particles: Particle[] = []
    let frame = 0
    let holding = false
    let lastSpawn = 0

    const spawn = (x: number, y: number, count: number) => {
      for (let index = 0; index < count; index += 1) {
        const el = document.createElement("div")
        el.style.position = "absolute"
        el.style.left = "0"
        el.style.top = "0"
        el.style.lineHeight = "1"
        if (isImageParticle(particle)) {
          const image = document.createElement("img")
          image.src = particle
          image.alt = ""
          image.width = 28
          image.height = 28
          el.append(image)
        } else {
          el.textContent = particle
          el.style.fontSize = "28px"
        }
        container.append(el)
        particles.push({
          el,
          x: x - 14,
          y: y - 14,
          vx: (Math.random() - 0.5) * 8,
          vy: -5 - Math.random() * 7,
          spin: Math.random() * 40,
          spinSpeed: (Math.random() - 0.5) * 12,
        })
      }
    }

    const tick = (now: number) => {
      frame = 0
      if (reducedRef.current || !activeRef.current) return
      if (holding && now - lastSpawn > 45 && particles.length < 60) {
        const rect = host.getBoundingClientRect()
        spawn(rect.left + rect.width / 2, rect.top + rect.height / 2, 1)
        lastSpawn = now
      }
      particles = particles.filter((item) => {
        item.vy += 0.28
        item.x += item.vx
        item.y += item.vy
        item.spin += item.spinSpeed
        item.el.style.transform = `translate(${item.x}px, ${item.y}px) rotate(${item.spin}deg)`
        if (item.y > window.innerHeight + 40) {
          item.el.remove()
          return false
        }
        return true
      })
      if (holding || particles.length > 0) frame = requestAnimationFrame(tick)
    }

    const start = () => {
      if (reducedRef.current || !activeRef.current || frame !== 0) return
      if (!holding && particles.length === 0) return
      frame = requestAnimationFrame(tick)
    }
    resumeRef.current = start

    const onDown = (event: PointerEvent) => {
      if (reducedRef.current) return
      holding = true
      spawn(event.clientX, event.clientY, 8)
      start()
    }
    const onUp = () => {
      holding = false
    }

    host.addEventListener("pointerdown", onDown)
    window.addEventListener("pointerup", onUp)
    window.addEventListener("pointercancel", onUp)
    return () => {
      holding = false
      host.removeEventListener("pointerdown", onDown)
      window.removeEventListener("pointerup", onUp)
      window.removeEventListener("pointercancel", onUp)
      if (frame) cancelAnimationFrame(frame)
      for (const item of particles) item.el.remove()
      containers -= 1
      if (containers <= 0) container.remove()
    }
  }, [particle, reduced])

  return (
    <span ref={hostRef} data-slot="cool-mode" data-reduced={reduced ? "true" : "false"} className={cn("inline-flex", className)}>
      {children}
    </span>
  )
}

export { CoolMode }
