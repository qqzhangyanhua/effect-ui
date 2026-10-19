"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

interface Particle {
  id: number
  x: number
  y: number
  color: string
  rotate: number
}

const COLORS = ["#a78bfa", "#22d3ee", "#f472b6", "#facc15", "#34d399"]

export interface ConfettiBurstProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  pieces?: number
}

function ConfettiBurst({
  className,
  children,
  pieces = 18,
  onClick,
  ...props
}: ConfettiBurstProps) {
  const [particles, setParticles] = React.useState<Particle[]>([])

  const burst = (event: React.MouseEvent<HTMLButtonElement>) => {
    onClick?.(event)
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
    const next = Array.from({ length: pieces }, (_, index) => ({
      id: Date.now() + index,
      x: (Math.random() - 0.5) * 180,
      y: -40 - Math.random() * 90,
      color: COLORS[index % COLORS.length] ?? "#a78bfa",
      rotate: Math.random() * 220,
    }))
    setParticles(next)
    window.setTimeout(() => setParticles([]), 800)
  }

  return (
    <button
      data-slot="confetti-burst"
      className={cn("relative inline-flex h-10 items-center rounded-md bg-primary px-4 text-sm text-primary-foreground", className)}
      onClick={burst}
      {...props}
    >
      {children}
      {particles.map((particle) => (
        <span
          key={particle.id}
          className="pointer-events-none absolute top-1/2 left-1/2 size-2 rounded-[1px]"
          style={{
            background: particle.color,
            animation: "confetti-pop 0.8s ease-out forwards",
            ["--dx" as string]: `${particle.x}px`,
            ["--dy" as string]: `${particle.y}px`,
            ["--rot" as string]: `${particle.rotate}deg`,
          }}
        />
      ))}
    </button>
  )
}

export { ConfettiBurst }
