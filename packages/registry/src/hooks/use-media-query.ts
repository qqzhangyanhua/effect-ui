"use client"

// Ported from UI Layouts (MIT, (c) 2024 UI LAYOUT) — https://github.com/ui-layouts/uilayouts/blob/main/apps/ui-layout/hooks/use-media-query.tsx. Modified for effect-ui.

import { useSyncExternalStore } from "react"

export function useMediaQuery(query: string) {
  return useSyncExternalStore(
    (onChange) => {
      const media = window.matchMedia(query)
      media.addEventListener("change", onChange)
      return () => media.removeEventListener("change", onChange)
    },
    () => window.matchMedia(query).matches,
    () => false,
  )
}
