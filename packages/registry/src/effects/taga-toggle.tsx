"use client"

// Ported from AI Canvas (MIT, (c) 2026 AI Canvas) — https://github.com/uiNerd16/aicanvas/blob/main/components-workspace/taga-toggle/index.tsx

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { useAnimationActive } from "@/hooks/use-animation-active"
import { useState, useCallback, useLayoutEffect, useEffect, useRef, type RefObject } from "react"
import { motion, AnimatePresence, useMotionValue, useTransform, animate } from "motion/react"
const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect






export interface TagaToggleProps {
  /** Face ink. Defaults to the foreground token. */
  color?: string
  /** Track width, in pixels. @default 80 */
  size?: number
  /** Face transition, in milliseconds. @default 280 */
  duration?: number
  className?: string
}

export function TagaToggle({
  color = "var(--foreground)",
  size = 80,
  duration = 280,
  className = "",
}: TagaToggleProps = {}) {
  const [isOn, setIsOn]             = useState(false)
  const [animating, setAnimating]   = useState(false)
  const [pageIsDark, setPageIsDark] = useState(false)
  const trackW = size
  const containerRef                = useRef<HTMLDivElement>(null)
  const isOnRef                     = useRef(false)
  const reduced = usePrefersReducedMotion()
  const live = useAnimationActive(containerRef as RefObject<Element | null>)

  const trackH = Math.round(trackW * 0.58)
  const thumb  = Math.round(trackW * 0.50)
  const pad    = Math.max(3, Math.round(trackW * 0.04))
  const offX   = pad
  const onX    = trackW - thumb - pad

  const thumbX = useMotionValue(offX)

  useIsomorphicLayoutEffect(() => {
    const el = containerRef.current
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
    return () => { mo.disconnect() }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    thumbX.set(isOnRef.current ? onX : offX)
  }, [trackW]) // eslint-disable-line react-hooks/exhaustive-deps

  const offTrack   = pageIsDark ? '#4A4540' : '#9E9890'
  const onTrack    = pageIsDark ? '#D4960A' : '#F5C518'
  const trackColor = useTransform(thumbX, [offX, onX], [offTrack, onTrack])

  const handleToggle = useCallback(async () => {
    if (animating) return
    const target = isOn ? offX : onX
    isOnRef.current = !isOn
    setIsOn((v) => !v)
    if (reduced || !live) {
      thumbX.set(target)
      return
    }
    setAnimating(true)
    await animate(thumbX, target, { type: "spring", stiffness: 500, damping: 36, duration: duration / 1000 })
    setAnimating(false)
  }, [isOn, animating, thumbX, offX, onX, reduced, live, duration])

  const previewBg   = pageIsDark ? '#110F0C' : '#EDEAE5'
  const trackInset  = pageIsDark
    ? 'inset 0 1px 4px rgba(0,0,0,0.50)'
    : 'inset 0 1px 3px rgba(0,0,0,0.14)'
  const thumbShadow = pageIsDark
    ? '0 3px 8px rgba(0,0,0,0.50), 0 1px 3px rgba(0,0,0,0.30)'
    : '0 3px 8px rgba(0,0,0,0.18), 0 1px 3px rgba(0,0,0,0.10)'

  const mouthPath = isOn
    ? 'M -0.40,0.15 Q 0,0.50 0.40,0.15'
    : 'M -0.40,0.43 Q 0,0.43 0.40,0.43'

  const faceSize = thumb * 0.78

  const eyeSpring = { duration: 0.16, ease: [0.34, 1.56, 0.64, 1] as [number, number, number, number] }

  return (
    <div
      ref={containerRef}
      data-reduced={reduced ? "true" : "false"}
      data-motion={live && !reduced ? "on" : "off"}
      className={`motion-reduce:transition-none flex h-full w-full items-center justify-center ${className}`}
      style={{ background: previewBg }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.88 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }}
        className="select-none"
      >
        <motion.button
          type="button"
          role="switch"
          aria-checked={isOn}
          aria-label="Toggle"
          onClick={handleToggle}
          style={{
            width: trackW,
            height: trackH,
            borderRadius: trackH / 2,
            backgroundColor: trackColor,
            boxShadow: trackInset,
            position: 'relative',
            cursor: 'pointer',
            border: 'none',
            outline: 'none',
            display: 'block',
          }}
          whileTap={{ scale: 0.96 }}
          transition={{ type: 'spring', stiffness: 400, damping: 28 }}
        >
          <motion.div
            style={{
              position: 'absolute',
              top: pad,
              x: thumbX,
              width: thumb,
              height: thumb,
              borderRadius: '50%',
              background: 'white',
              boxShadow: thumbShadow,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <svg
              viewBox="-1 -1 2 2"
              width={faceSize}
              height={faceSize}
            >
              <AnimatePresence mode="wait">
                {isOn ? (
                  <motion.path
                    key="le-happy"
                    d="M -0.50,-0.28 Q -0.32,-0.06 -0.14,-0.28"
                    stroke={color} strokeWidth={0.13} strokeLinecap="round" fill="none"
                    initial={{ opacity: 0, scale: 0.3 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.3 }}
                    transition={eyeSpring}
                  />
                ) : (
                  <motion.g
                    key="le-dead"
                    initial={{ opacity: 0, scale: 0.3 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.3 }}
                    transition={eyeSpring}
                  >
                    <line x1="-0.50" y1="-0.33" x2="-0.14" y2="-0.01"
                      stroke={color} strokeWidth={0.13} strokeLinecap="round" />
                    <line x1="-0.14" y1="-0.33" x2="-0.50" y2="-0.01"
                      stroke={color} strokeWidth={0.13} strokeLinecap="round" />
                  </motion.g>
                )}
              </AnimatePresence>

              <AnimatePresence mode="wait">
                {isOn ? (
                  <motion.path
                    key="re-happy"
                    d="M 0.14,-0.28 Q 0.32,-0.06 0.50,-0.28"
                    stroke={color} strokeWidth={0.13} strokeLinecap="round" fill="none"
                    initial={{ opacity: 0, scale: 0.3 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.3 }}
                    transition={eyeSpring}
                  />
                ) : (
                  <motion.g
                    key="re-dead"
                    initial={{ opacity: 0, scale: 0.3 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.3 }}
                    transition={eyeSpring}
                  >
                    <line x1="0.14" y1="-0.33" x2="0.50" y2="-0.01"
                      stroke={color} strokeWidth={0.13} strokeLinecap="round" />
                    <line x1="0.50" y1="-0.33" x2="0.14" y2="-0.01"
                      stroke={color} strokeWidth={0.13} strokeLinecap="round" />
                  </motion.g>
                )}
              </AnimatePresence>

              <motion.path
                initial={false}
                animate={{ d: mouthPath }}
                stroke={color}
                strokeWidth={0.13}
                strokeLinecap="round"
                fill="none"
                transition={{ duration: reduced || !live ? 0 : duration / 1000, ease: "easeInOut" }}
              />
            </svg>
          </motion.div>
        </motion.button>
      </motion.div>
    </div>
  )
}
