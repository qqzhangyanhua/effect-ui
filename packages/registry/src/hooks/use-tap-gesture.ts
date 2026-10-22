"use client"

// Copyright Spectrum UI (Made by Arihant)
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Modified by effect-ui: 移到 @/hooks，供 expandable-action-bar 区分指针与键盘点击。
// Ported from Spectrum UI（Apache-2.0，Made by Arihant）— https://github.com/arihantcodes/spectrum-ui/blob/main/lib/hooks/use-tap-gesture.ts

import { useMemo, useRef } from "react"

export interface TapRecord<S> {
  pointerType: string
  state: S
}

export interface TapGesture<S> {
  start: (event: { pointerType: string }, state: S) => void
  take: () => TapRecord<S> | null
  drop: () => void
}

export function useTapGesture<S>(): TapGesture<S> {
  const record = useRef<TapRecord<S> | null>(null)

  return useMemo(
    () => ({
      start: (event, state) => {
        record.current = { pointerType: event.pointerType, state }
      },
      take: () => {
        const spent = record.current
        record.current = null
        return spent
      },
      drop: () => {
        record.current = null
      },
    }),
    [],
  )
}
