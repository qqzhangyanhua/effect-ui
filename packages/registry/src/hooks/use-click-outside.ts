"use client"

import { useEffect, useRef, type RefObject } from "react"

export function useClickOutside(ref: RefObject<HTMLElement | null>, onOutside: () => void) {
  const onOutsideRef = useRef(onOutside)

  useEffect(() => {
    onOutsideRef.current = onOutside
  }, [onOutside])

  useEffect(() => {
    const onPointer = (event: PointerEvent) => {
      const node = ref.current
      if (!node || !(event.target instanceof Node) || node.contains(event.target)) return
      onOutsideRef.current()
    }
    document.addEventListener("pointerdown", onPointer)
    return () => document.removeEventListener("pointerdown", onPointer)
  }, [ref])
}
