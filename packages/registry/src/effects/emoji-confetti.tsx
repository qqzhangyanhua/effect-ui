"use client"

// Ported from SyntaxUI (MIT, (c) 2024 SyntaxUI) — https://github.com/SyntaxUI/syntaxui/blob/main/src/showcase/effects/EmojiConfetti.tsx

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  type ButtonHTMLAttributes,
} from "react"
import { createPortal } from "react-dom"

const DEFAULT_EMOJIS = ["🎉", "🎊", "🥳", "🍾", "🎈", "🎇", "✨", "💥"]

interface Particle {
  x: number
  y: number
  emoji: string
  size: number
  vx: number
  vy: number
  rotation: number
  spin: number
}

interface Pop {
  x: number
  y: number
  emoji: string
}

export interface EmojiConfettiHandle {
  fire: (x: number, y: number) => void
}

export interface EmojiConfettiProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> {
  emojis?: string[]
  children?: React.ReactNode
}

const POP_FRAMES = `
@keyframes effect-ui-emoji-pop {
  from { opacity: 1; transform: translate(-50%, -50%) scale(0.6); }
  to { opacity: 0; transform: translate(-50%, -50%) scale(1.35); }
}
`

export const EmojiConfetti = forwardRef<EmojiConfettiHandle, EmojiConfettiProps>(function EmojiConfetti(
  { emojis = DEFAULT_EMOJIS, children = "放一串", className, onClick, ...props },
  ref,
) {
  const prefersReducedMotion = usePrefersReducedMotion()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const particles = useRef<Particle[]>([])
  const frame = useRef(0)
  const [pop, setPop] = useState<Pop | null>(null)
  const [mounted, setMounted] = useState(false)
  const emojisRef = useRef(emojis)

  useEffect(() => {
    emojisRef.current = emojis
  }, [emojis])

  useEffect(() => {
    queueMicrotask(() => setMounted(true))
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener("resize", resize)
    return () => window.removeEventListener("resize", resize)
  }, [mounted])

  useEffect(() => {
    return () => cancelAnimationFrame(frame.current)
  }, [])

  const fire = useCallback((x: number, y: number) => {
    const palette = emojisRef.current.length > 0 ? emojisRef.current : DEFAULT_EMOJIS
    const first = palette[0] ?? "🎉"
    if (prefersReducedMotion) {
      setPop({ x, y, emoji: first })
      window.setTimeout(() => setPop(null), 700)
      return
    }
    const canvas = canvasRef.current
    const ctx = canvas?.getContext("2d")
    if (!canvas || !ctx) {
      setPop({ x, y, emoji: first })
      window.setTimeout(() => setPop(null), 700)
      return
    }
    particles.current = Array.from({ length: 42 }, () => {
      const angle = Math.random() * Math.PI * 2
      const velocity = 4 + Math.random() * 6
      const emoji = palette[Math.floor(Math.random() * palette.length)] ?? first
      return {
        x,
        y,
        emoji,
        size: 18 + Math.random() * 16,
        vx: Math.cos(angle) * velocity,
        vy: Math.sin(angle) * velocity - 2,
        rotation: Math.random() * Math.PI * 2,
        spin: (Math.random() - 0.5) * 0.2,
      }
    })
    cancelAnimationFrame(frame.current)
    const tick = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      particles.current = particles.current.filter((particle) => {
        particle.x += particle.vx
        particle.y += particle.vy
        particle.vy += 0.12
        particle.rotation += particle.spin
        if (particle.y > canvas.height + 40) return false
        ctx.save()
        ctx.translate(particle.x, particle.y)
        ctx.rotate(particle.rotation)
        ctx.font = `${particle.size}px sans-serif`
        ctx.textAlign = "center"
        ctx.textBaseline = "middle"
        ctx.fillText(particle.emoji, 0, 0)
        ctx.restore()
        return true
      })
      if (particles.current.length > 0) frame.current = requestAnimationFrame(tick)
    }
    frame.current = requestAnimationFrame(tick)
  }, [prefersReducedMotion])

  useImperativeHandle(ref, () => ({ fire }), [fire])

  return (
    <>
      <button
        {...props}
        className={cn("bg-primary text-primary-foreground rounded-lg px-5 py-2 text-sm font-semibold", className)}
        data-reduced={prefersReducedMotion ? "true" : "false"}
        data-slot="emoji-confetti"
        onClick={(event) => {
          const rect = event.currentTarget.getBoundingClientRect()
          fire(rect.left + rect.width / 2, rect.top + rect.height / 2)
          onClick?.(event)
        }}
        type="button"
      >
        {children}
      </button>
      {mounted
        ? createPortal(
            <>
              <style>{POP_FRAMES}</style>
              <canvas className="pointer-events-none fixed inset-0 z-[80]" ref={canvasRef} />
              {pop ? (
                <span
                  className="pointer-events-none fixed z-[80] text-3xl"
                  style={{
                    left: pop.x,
                    top: pop.y,
                    animation: "effect-ui-emoji-pop 700ms ease-out forwards",
                  }}
                >
                  {pop.emoji}
                </span>
              ) : null}
            </>,
            document.body,
          )
        : null}
    </>
  )
})
