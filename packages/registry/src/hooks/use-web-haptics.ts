"use client"

// Ported from Amicro (MIT, (c) 2026 SYED SUBHAN UDDIN) — https://github.com/Subhan-code/Amicro--Micro-transitions-/blob/dc2a183/src/hooks/useWebHaptics.ts

import { useCallback } from "react"

export interface UseWebHapticsProps {
  enabled?: boolean
}

export type HapticsType = "light" | "medium" | "heavy" | "success" | "warning" | "error"

const PATTERNS: Record<HapticsType, number[]> = {
  light: [10],
  medium: [25],
  heavy: [50],
  success: [15, 60, 15],
  warning: [30, 60, 30],
  error: [60, 60, 60, 60, 60],
}

export function useWebHaptics({ enabled = true }: UseWebHapticsProps = {}) {
  const trigger = useCallback((type: HapticsType = "light") => {
    if (!enabled) return false
    const vibrate = typeof navigator === "undefined" ? undefined : navigator.vibrate
    if (typeof vibrate !== "function") return false
    try {
      return vibrate.call(navigator, PATTERNS[type] ?? PATTERNS.light)
    } catch {
      return false
    }
  }, [enabled])

  return { trigger }
}
