"use client"

import * as React from "react"
import Lenis from "lenis"

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

const LenisContext = React.createContext<Lenis | null>(null)

function useLenis() {
  return React.useContext(LenisContext)
}

export interface SmoothScrollProviderProps {
  children?: React.ReactNode
  className?: string
}

function ScrollReadout() {
  const lenis = useLenis()
  const [y, setY] = React.useState(0)

  React.useEffect(() => {
    if (!lenis) return
    const onScroll = () => setY(Math.round(lenis.scroll))
    lenis.on("scroll", onScroll)
    return () => {
      lenis.off("scroll", onScroll)
    }
  }, [lenis])

  return (
    <p className="mb-2 font-mono text-xs tracking-[0.16em] text-muted-foreground uppercase">
      {lenis ? `smooth ${y}` : "native scroll"}
    </p>
  )
}

function SmoothScrollProvider({ children, className }: SmoothScrollProviderProps) {
  const reduced = usePrefersReducedMotion()
  const wrapperRef = React.useRef<HTMLDivElement>(null)
  const contentRef = React.useRef<HTMLDivElement>(null)
  const [lenis, setLenis] = React.useState<Lenis | null>(null)

  React.useEffect(() => {
    const wrapper = wrapperRef.current
    const content = contentRef.current
    if (reduced || !wrapper || !content) return
    const instance = new Lenis({
      wrapper,
      content,
      eventsTarget: wrapper,
      autoRaf: true,
      overscroll: false,
    })
    setLenis(instance)
    return () => {
      instance.destroy()
      setLenis(null)
    }
  }, [reduced])

  return (
    <LenisContext.Provider value={lenis}>
      <div className={cn("rounded-2xl border bg-background p-4", className)}>
        <ScrollReadout />
        <div
          ref={wrapperRef}
          className="h-72 overflow-hidden rounded-xl border bg-muted/30"
          style={{ overflowY: reduced ? "auto" : "hidden" }}
        >
          <div ref={contentRef} className="space-y-3 p-4">
            {children ??
              Array.from({ length: 8 }, (_, index) => (
                <div key={index} className="rounded-xl border bg-card px-4 py-6">
                  段落 {index + 1}
                </div>
              ))}
          </div>
        </div>
      </div>
    </LenisContext.Provider>
  )
}

export { SmoothScrollProvider, useLenis }
