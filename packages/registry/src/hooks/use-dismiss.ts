"use client"

// Copyright Spectrum UI (Made by Arihant)
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Modified by effect-ui: 移到 @/hooks，供 expandable-action-bar 使用。
// Ported from Spectrum UI（Apache-2.0，Made by Arihant）— https://github.com/arihantcodes/spectrum-ui/blob/main/lib/hooks/use-dismiss.ts

import { type RefObject, useEffect } from "react"

export type DismissBehavior = "pass-through" | "consume"

export interface DismissOptions {
  behavior?: DismissBehavior
  escape?: boolean
  ignore?: (target: Element) => boolean
}

const openScopes = new Set<(target: Element) => boolean>()

function claimedByAnotherScope(self: (target: Element) => boolean, target: Element) {
  for (const scope of openScopes) {
    if (scope !== self && scope(target)) return true
  }
  return false
}

function consumeActivation(source: Event) {
  const swallow = (event: MouseEvent) => {
    event.preventDefault()
    event.stopPropagation()
    release()
  }
  const restart = (event: Event) => {
    if (event !== source) release()
  }
  const release = () => {
    window.removeEventListener("click", swallow, true)
    window.removeEventListener("pointerdown", restart, true)
    window.removeEventListener("pointercancel", restart, true)
    window.removeEventListener("keydown", release, true)
  }
  window.addEventListener("click", swallow, true)
  window.addEventListener("pointerdown", restart, true)
  window.addEventListener("pointercancel", restart, true)
  window.addEventListener("keydown", release, true)
}

export function useDismiss(
  open: boolean,
  onDismiss: () => void,
  ref: RefObject<HTMLElement | null> | null,
  { behavior = "pass-through", escape: dismissOnEscape = true, ignore }: DismissOptions = {},
) {
  useEffect(() => {
    if (!open) return
    const inside = (target: Element) => Boolean(ref?.current?.contains(target)) || Boolean(ignore?.(target))
    const onKey = (event: KeyboardEvent) => {
      if (dismissOnEscape && event.key === "Escape") onDismiss()
    }
    const onPointer = (event: PointerEvent) => {
      const target = event.target instanceof Element ? event.target : null
      if (!target || inside(target)) return
      if (behavior === "consume" && !claimedByAnotherScope(inside, target)) consumeActivation(event)
      onDismiss()
    }
    openScopes.add(inside)
    window.addEventListener("keydown", onKey)
    window.addEventListener("pointerdown", onPointer, true)
    return () => {
      openScopes.delete(inside)
      window.removeEventListener("keydown", onKey)
      window.removeEventListener("pointerdown", onPointer, true)
    }
  }, [open, onDismiss, ref, behavior, dismissOnEscape, ignore])
}
