"use client"

// Ported from AI Canvas (MIT, (c) 2026 AI Canvas) — https://github.com/uiNerd16/aicanvas/blob/main/components-workspace/blind-pull-toggle/index.tsx

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { useAnimationActive } from "@/hooks/use-animation-active"
import { useState, useCallback, useLayoutEffect, useEffect, useRef, type RefObject } from "react"
import { motion, useAnimate, stagger } from "motion/react"
import { Moon, Sun } from "lucide-react"
const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect

const SLATS = 6

export interface BlindPullToggleProps {
  /** Icon ink. Defaults to the foreground token. */
  color?: string
  /** Slat close and open, in milliseconds. @default 700 */
  duration?: number
  /** Button edge length, in pixels. @default 80 */
  size?: number
  className?: string
}

export function BlindPullToggle({
  color = "var(--foreground)",
  duration = 700,
  size = 80,
  className = "",
}: BlindPullToggleProps = {}) {
  const [toggleDark, setToggleDark] = useState(true)
  const [pageIsDark, setPageIsDark] = useState(false)
  const [animating, setAnimating]   = useState(false)
  const sizeRef                     = useRef(size)
  const [scope, animate]            = useAnimate()
  const reduced = usePrefersReducedMotion()
  const live = useAnimationActive(scope as RefObject<Element | null>)
  const reducedRef = useRef(reduced)
  const liveRef = useRef(live)
  useEffect(() => {
    reducedRef.current = reduced
    liveRef.current = live
    sizeRef.current = size
  }, [reduced, live, size])

  useIsomorphicLayoutEffect(() => {
    const el = scope.current
    if (!el) return
    const check = () => {
      const card = el.closest('[data-card-theme]')
      setPageIsDark(
        card
          ? card.classList.contains('dark')
          : document.documentElement.classList.contains('dark'),
      )
    }
    check()
    const mo = new MutationObserver(check)
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    const cardWrapper = el.closest('[data-card-theme]')
    if (cardWrapper) mo.observe(cardWrapper, { attributes: true, attributeFilter: ['class'] })
    return () => mo.disconnect()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const iconSize   = Math.round(size * 0.45)
  const radius     = Math.round(size * 0.275)
  const cordRestH  = Math.round(size * 0.30)
  const dotSize    = Math.max(8, Math.round(size * 0.138))

  const previewBg    = pageIsDark ? '#110F0C' : '#EDEAE5'
  const buttonBg     = pageIsDark
    ? 'linear-gradient(145deg, #3a3530, #252019)'
    : 'linear-gradient(145deg, #E8E4DC, #DFDBD4)'
  const buttonBorder = pageIsDark
    ? '1.5px solid rgba(255,255,255,0.10)'
    : '1.5px solid rgba(0,0,0,0.12)'
  const buttonShadow = pageIsDark
    ? '0 6px 28px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.07)'
    : '0 4px 20px rgba(0,0,0,0.18), inset 0 1px 0 rgba(255,255,255,0.08)'
  const iconColor    = color
  const cordTop      = pageIsDark ? 'rgba(255,255,255,0.28)' : 'rgba(0,0,0,0.22)'
  const cordBottom   = pageIsDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.05)'
  const dotBg        = pageIsDark ? 'rgba(255,255,255,0.62)' : 'rgba(0,0,0,0.32)'
  const dotShadow    = pageIsDark ? '0 2px 8px rgba(0,0,0,0.5)' : '0 2px 6px rgba(0,0,0,0.12)'

  const handleToggle = useCallback(async () => {
    if (animating) return
    if (reducedRef.current || !liveRef.current) {
      setToggleDark((d) => !d)
      return
    }
    setAnimating(true)

    const scale = duration / 700
    const pullH = Math.round(sizeRef.current * 0.65)
    const restH = Math.round(sizeRef.current * 0.30)

    await animate('.cord-line', { height: pullH }, { duration: 0.1 * scale, ease: [0.4, 0, 1, 1] })
    animate('.cord-line', { height: restH }, { type: 'spring', stiffness: 300, damping: 18 })
    await animate('.slat', { scaleY: 0 }, { delay: stagger(0.04 * scale), duration: 0.1 * scale, ease: 'easeIn' })
    setToggleDark((d) => !d)
    await animate('.slat', { scaleY: 1 }, { delay: stagger(0.04 * scale), duration: 0.13 * scale, ease: 'easeOut' })

    setAnimating(false)
  }, [animating, animate, duration])

  return (
    <div
      ref={scope}
      data-reduced={reduced ? "true" : "false"}
      data-motion={live && !reduced ? "on" : "off"}
      className={`motion-reduce:transition-none flex h-full w-full items-center justify-center ${className}`}
      style={{ background: previewBg }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="flex select-none flex-col items-center"
      >
        <motion.button
          type="button"
          aria-pressed={toggleDark}
          aria-label={toggleDark ? "Dark" : "Light"}
          onClick={handleToggle}
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.97 }}
          transition={{ type: 'spring', stiffness: 400, damping: 28 }}
          style={{
            width: size,
            height: size,
            borderRadius: radius,
            border: buttonBorder,
            boxShadow: buttonShadow,
            cursor: 'pointer',
            position: 'relative',
            background: 'transparent',
          }}
        >
          <div
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: radius - 1,
              overflow: 'hidden',
            }}
          >
            {Array.from({ length: SLATS }).map((_, i) => {
              const topPx     = Math.round((i / SLATS) * size)
              const nextTopPx = i === SLATS - 1
                ? size
                : Math.round(((i + 1) / SLATS) * size)
              const heightPx  = nextTopPx - topPx

              return (
                <div
                  key={i}
                  className="slat"
                  style={{
                    position: 'absolute',
                    top: topPx,
                    left: 0,
                    width: '100%',
                    height: heightPx,
                    overflow: 'hidden',
                    transformOrigin: '50% 50%',
                  }}
                >
                  <div
                    style={{
                      position: 'absolute',
                      top: -topPx,
                      left: 0,
                      width: size,
                      height: size,
                      background: buttonBg,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: iconColor,
                    }}
                  >
                    {toggleDark ? (
                      <Moon size={iconSize} />
                    ) : (
                      <Sun size={iconSize} />
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </motion.button>

        <div
          className="flex cursor-pointer flex-col items-center"
          onClick={handleToggle}
        >
          <div
            className="cord-line"
            style={{
              width: 2,
              height: cordRestH,
              background: `linear-gradient(to bottom, ${cordTop}, ${cordBottom})`,
              borderRadius: 1,
            }}
          />
          <div
            style={{
              width: dotSize,
              height: dotSize,
              borderRadius: '50%',
              background: dotBg,
              boxShadow: dotShadow,
            }}
          />
        </div>
      </motion.div>
    </div>
  )
}
