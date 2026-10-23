"use client"

// Ported from AI Canvas (MIT, (c) 2026 AI Canvas) — https://github.com/uiNerd16/aicanvas/blob/main/components-workspace/ai-job-cards/index.tsx

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { useAnimationActive } from "@/hooks/use-animation-active"
import { useRef, useState, useLayoutEffect, useEffect, useCallback, type ReactNode } from 'react'
import { motion } from "motion/react"
import { Bookmark } from "lucide-react"
const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect

function Monogram({ name }: { name: string }) {
  const letter = name.trim().charAt(0).toUpperCase() || "?"
  return (
    <span className="flex size-6 items-center justify-center rounded-full bg-foreground text-[11px] font-bold leading-none text-background">
      {letter}
    </span>
  )
}

interface CardData {
  rate: string
  title: string
  role: string
}

interface StackData {
  logo?: ReactNode
  company: string
  // Both colors: 6-digit hex only, since the card border appends a 1A alpha.
  borderColor: string
  borderColorLight?: string
  cards: [CardData, CardData, CardData]
}

export const defaultJobStacks: readonly StackData[] = [
  {
    company: 'Anthropic',
    borderColor: '#d97757',
    cards: [
      { rate: '$120/hr',     title: 'Prompt Engineer',        role: 'AI Research'        },
      { rate: '$145/hr',     title: 'AI Safety Researcher',   role: 'Safety & Alignment' },
      { rate: '$155/hr',     title: 'Interpretability Lead',  role: 'Research'           },
    ],
  },
  {
    company: 'Perplexity',
    borderColor: '#FFFFFF',
    borderColorLight: '#1C1C1C',
    cards: [
      { rate: '$160/hr',     title: 'Generative AI Lead',     role: 'AI Platform'        },
      { rate: '$135/hr',     title: 'ML Engineer',            role: 'Infrastructure'     },
      { rate: '$140/hr',     title: 'Search AI Researcher',   role: 'Research'           },
    ],
  },
  {
    company: 'Google',
    borderColor: '#4893FC',
    cards: [
      { rate: '$130–160/hr', title: 'LLM Platform Engineer',  role: 'Engineering'        },
      { rate: '$150/hr',     title: 'AI Research Scientist',  role: 'Research'           },
      { rate: '$165/hr',     title: 'Multimodal AI Lead',     role: 'DeepMind'           },
    ],
  },
]

const CARD_H = 234
const PEEK   = 20

const SLOTS = [
  { y: 0,        scale: 1,    z: 3 },
  { y: PEEK,     scale: 0.96, z: 2 },
  { y: PEEK * 2, scale: 0.92, z: 1 },
]

function useIsDark(ref: React.RefObject<HTMLElement | null>) {
  const [isDark, setIsDark] = useState(false)
  useIsomorphicLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const check = () => {
      const card = el.closest('[data-card-theme]')
      setIsDark(card
        ? card.classList.contains('dark')
        : document.documentElement.classList.contains('dark'))
    }
    check()
    const obs = new MutationObserver(check)
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    const cardWrapper = el.closest('[data-card-theme]')
    if (cardWrapper) obs.observe(cardWrapper, { attributes: true, attributeFilter: ['class'] })
    return () => obs.disconnect()
  }, [ref])
  return isDark
}

interface SingleCardProps {
  card: CardData
  stack: StackData
  isDark: boolean
  isFront: boolean
  frontIndex: number
  onCycle: () => void
}

function SingleCard({ card, stack, isDark, isFront, frontIndex, onCycle }: SingleCardProps) {
  const [bookmarked, setBookmarked] = useState(false)

  const cardBg = isDark ? '#1e1e1c' : '#F7F7EF'
  const borderColor = isDark ? stack.borderColor : (stack.borderColorLight ?? stack.borderColor)
  const rateColor    = isDark ? 'rgba(255,255,255,0.55)' : 'rgba(30,30,28,0.55)'
  const titleColor   = isDark ? '#F5F5F0' : '#141412'
  const arrowColor   = isFront
    ? (isDark ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.55)')
    : (isDark ? 'rgba(255,255,255,0.18)' : 'rgba(0,0,0,0.18)')
  const dotFill      = isDark ? '#E5E5E0' : '#2a2a28'
  const dotEmpty     = isDark ? 'rgba(255,255,255,0.18)' : 'rgba(0,0,0,0.15)'
  const dividerColor = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'
  const companyColor = isDark ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.45)'
  const roleColor    = isDark ? 'rgba(255,255,255,0.65)' : 'rgba(0,0,0,0.65)'
  const btnBg        = isDark ? '#e8e8e0' : '#1a1a18'
  const btnText      = isDark ? '#1a1a18' : '#FFFFFF'
  const shadowVal    = isDark
    ? '0 2px 12px rgba(0,0,0,0.35)'
    : '0 2px 8px rgba(0,0,0,0.07)'
  const shadowHover  = isDark
    ? '0 12px 32px rgba(0,0,0,0.55)'
    : '0 12px 24px rgba(0,0,0,0.13)'

  return (
    <div
      onMouseEnter={e => { if (isFront) (e.currentTarget as HTMLDivElement).style.boxShadow = shadowHover }}
      onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = shadowVal }}
      style={{
        background: cardBg,
        borderRadius: 32,
        border: `1px solid ${borderColor}1A`,
        padding: '18px 18px 16px',
        display: 'flex',
        flexDirection: 'column',
        gap: 0,
        boxShadow: shadowVal,
        transition: 'box-shadow 0.25s ease',
        height: CARD_H,
        boxSizing: 'border-box',
        overflow: 'hidden',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: rateColor, letterSpacing: '0.02em' }}>
          {card.rate}
        </span>
        <motion.button
          onClick={(e) => { e.stopPropagation(); setBookmarked(b => !b) }}
          whileTap={{ scale: 1.3 }}
          transition={{ type: 'spring', stiffness: 400, damping: 18 }}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, display: 'flex' }}
          aria-label={bookmarked ? 'Remove bookmark' : 'Add bookmark'}
        >
          <Bookmark size={18} color={bookmarked ? '#e05c6a' : arrowColor} />
        </motion.button>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, flex: 1 }}>
        <h3
          style={{
            fontSize: 20,
            fontWeight: 800,
            color: titleColor,
            lineHeight: 1.18,
            letterSpacing: '-0.025em',
            margin: 0,
            flex: 1,
            maxWidth: '72%',
          }}
        >
          {card.title}
        </h3>
        <motion.button
          onClick={(e) => { e.stopPropagation(); if (isFront) onCycle() }}
          whileTap={isFront ? { scale: 0.9 } : {}}
          transition={{ type: 'spring', stiffness: 400, damping: 20 }}
          style={{
            background: 'none', border: 'none',
            cursor: isFront ? 'pointer' : 'default',
            padding: 0, display: 'flex', flexDirection: 'column',
            alignItems: 'center', gap: 5, flexShrink: 0, marginRight: 6,
          }}
          aria-label={isFront ? 'Next card' : undefined}
        >
          {[0, 1, 2].map(i => {
            const isFrontDot = i === frontIndex
            return (
              <div key={i} style={{
                width: 5,
                height: isFrontDot ? 32 : 5,
                borderRadius: 3,
                background: isFrontDot ? dotFill : dotEmpty,
                transition: 'height 0.25s ease, background 0.25s ease',
              }} />
            )
          })}
        </motion.button>
      </div>

      <div style={{ height: 1, background: dividerColor, marginBottom: 14 }} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 24, height: 24, flexShrink: 0 }}>
            {stack.logo ?? <Monogram name={stack.company} />}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: roleColor, lineHeight: 1.2 }}>
              {stack.company}
            </span>
            <span style={{ fontSize: 10, fontWeight: 500, color: companyColor, lineHeight: 1.2 }}>
              {card.role}
            </span>
          </div>
        </div>
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          transition={{ type: 'spring', stiffness: 400, damping: 20 }}
          onClick={(e) => e.stopPropagation()}
          style={{
            background: btnBg, color: btnText, border: 'none',
            borderRadius: 999, padding: '7px 16px',
            fontSize: 12, fontWeight: 600, cursor: 'pointer',
            letterSpacing: '0.01em', flexShrink: 0,
          }}
        >
          View
        </motion.button>
      </div>
    </div>
  )
}

interface CardStackProps {
  stack: StackData
  isDark: boolean
  still: boolean
}

function CardStack({ stack, isDark, still }: CardStackProps) {
  const [order, setOrder] = useState<[number, number, number]>([0, 1, 2])
  const [exitingId, setExitingId] = useState<number | null>(null)
  const [exitDir, setExitDir] = useState<'up' | 'down'>('up')
  const [returningIds, setReturningIds] = useState<Set<number>>(new Set())
  const dismissing = useRef(false)
  const orderRef = useRef(order)

  useEffect(() => {
    orderRef.current = order
  }, [order])

  const cycle = useCallback((dir: 'up' | 'down' = 'up') => {
    if (dismissing.current) return
    dismissing.current = true
    setExitDir(dir)

    const frontId = orderRef.current[0]
    setExitingId(frontId)

    const wait = still ? 0 : 380
    setTimeout(() => {
      setReturningIds(new Set([frontId]))
      setOrder(prev => [prev[1], prev[2], prev[0]])
      setExitingId(null)

      requestAnimationFrame(() => requestAnimationFrame(() => {
        setReturningIds(new Set())
        dismissing.current = false
      }))
    }, wait)
  }, [still])

  const containerHeight = CARD_H + PEEK * 2 + 4

  return (
    <div
      style={{
        position: 'relative',
        height: containerHeight,
        width: '100%',
      }}
    >
      {([0, 1, 2] as const).map((cardIndex) => {
        const slotIndex = order.indexOf(cardIndex)
        const slot = SLOTS[slotIndex]
        if (!slot) return null
        const isExiting = exitingId === cardIndex
        const isReturning = returningIds.has(cardIndex)
        const isFront = slotIndex === 0

        const animTarget = isExiting
          ? { y: exitDir === 'down' ? 160 : -160, scale: 0.88, opacity: 0 }
          : { y: slot.y, scale: slot.scale, opacity: 1 }

        // The exit duration must equal the 380 ms timeout in cycle().
        const animTransition = still || isReturning
          ? { duration: 0 }
          : isExiting
            ? { duration: 0.38, ease: [0.4, 0, 0.2, 1] as [number, number, number, number] }
            : { type: 'spring' as const, stiffness: 280, damping: 26 }

        return (
          <motion.div
            key={cardIndex}
            animate={animTarget}
            transition={animTransition}
            drag={isFront ? 'y' : false}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={0.2}
            onDragEnd={(_, info) => {
              if (Math.abs(info.offset.y) > 60 || Math.abs(info.velocity.y) > 400) {
                cycle(info.offset.y > 0 ? 'down' : 'up')
              }
            }}
            whileHover={isFront ? { y: slot.y - 4, transition: { type: 'spring', stiffness: 300, damping: 24 } } : {}}
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              top: 0,
              zIndex: isExiting ? 10 : slot.z,
              transformOrigin: 'center top',
              cursor: isFront ? 'grab' : 'default',
            }}
          >
            <SingleCard
              card={stack.cards[cardIndex]}
              stack={stack}
              isDark={isDark}
              isFront={isFront}
              frontIndex={order[0]}
              onCycle={cycle}
            />
          </motion.div>
        )
      })}
    </div>
  )
}

export interface AiJobCardsProps {
  stacks?: readonly StackData[]
  className?: string
}

export function AiJobCards({ stacks = defaultJobStacks, className }: AiJobCardsProps = {}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const reduced = usePrefersReducedMotion()
  const live = useAnimationActive(containerRef)
  const still = reduced || !live
  const isDark = useIsDark(containerRef)
  const [narrow, setNarrow] = useState(false)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const obs = new ResizeObserver(entries => {
      for (const entry of entries) {
        setNarrow(entry.contentRect.width < 480)
      }
    })
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  const outerBg = isDark ? '#0d0d0c' : '#CADBDD'

  return (
    <div
      ref={containerRef}
      data-reduced={reduced ? "true" : "false"}
      data-motion={still ? "off" : "on"}
      className={`flex min-h-[32rem] w-full items-center justify-center motion-reduce:transition-none ${className ?? ""}`}
      style={{ background: outerBg }}
    >
      <div
        style={{
          width: '100%',
          padding: 'clamp(16px, 5%, 40px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: narrow ? 'column' : 'row',
            gap: 16,
            width: '100%',
            maxWidth: 760,
            alignItems: narrow ? 'stretch' : 'flex-start',
          }}
        >
          {stacks.map((stack) => (
            <div key={stack.company} style={{ flex: 1, minWidth: 0 }}>
              <CardStack stack={stack} isDark={isDark} still={still} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
