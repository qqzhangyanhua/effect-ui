"use client"

// Copyright Spectrum UI (Made by Arihant)
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Modified by effect-ui: 移到 @/hooks，并把 isHoveringPointer 内联进来，不再依赖 @/lib/touch。
// Ported from Spectrum UI（Apache-2.0，Made by Arihant）— https://github.com/arihantcodes/spectrum-ui/blob/main/lib/hooks/use-hover-gesture.ts

import { useMemo, useRef } from "react"

interface BoundaryEvent {
  pointerId: number
  pointerType: string
  buttons: number
}

export interface HoverGesture {
  enter: (event: BoundaryEvent) => boolean
  leave: (event: BoundaryEvent) => boolean
}

function isHoveringPointer(event: { pointerType: string; buttons: number }) {
  return event.pointerType !== "touch" && event.buttons === 0
}

export function useHoverGesture(): HoverGesture {
  const contact = useRef(new Set<number>())

  return useMemo(
    () => ({
      enter: (event) => {
        if (isHoveringPointer(event)) {
          contact.current.delete(event.pointerId)
          return true
        }
        contact.current.add(event.pointerId)
        return false
      },
      leave: (event) => {
        const arrivedInContact = contact.current.delete(event.pointerId)
        return !arrivedInContact && event.pointerType !== "touch"
      },
    }),
    [],
  )
}
