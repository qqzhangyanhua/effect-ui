"use client"

import { useEffect, useState, useSyncExternalStore, type RefObject } from "react"

function subscribe(onStoreChange: () => void) {
  document.addEventListener("visibilitychange", onStoreChange)
  return () => document.removeEventListener("visibilitychange", onStoreChange)
}

function visibleNow() {
  return document.visibilityState === "visible"
}

export function useAnimationActive(ref: RefObject<Element | null>) {
  const visible = useSyncExternalStore(subscribe, visibleNow, () => false)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const node = ref.current
    if (!node || typeof IntersectionObserver === "undefined") return
    const observer = new IntersectionObserver((entries) => {
      const entry = entries[entries.length - 1]
      setInView(entry?.isIntersecting ?? false)
    })
    observer.observe(node)
    return () => observer.disconnect()
  }, [ref])

  return visible && inView
}
