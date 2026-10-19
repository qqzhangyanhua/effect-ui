"use client"

import * as React from "react"
import { useScroll } from "motion/react"

import { cn } from "@/lib/utils"

export interface ScrollImageSequenceProps {
  frames: string[]
  className?: string
}

function ScrollImageSequence({ frames, className }: ScrollImageSequenceProps) {
  const ref = React.useRef<HTMLDivElement>(null)
  const imgRef = React.useRef<HTMLImageElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.8", "end 0.2"] })

  React.useEffect(() => {
    return scrollYProgress.on("change", (value) => {
      const index = Math.min(frames.length - 1, Math.max(0, Math.floor(value * frames.length)))
      if (imgRef.current && frames[index]) imgRef.current.src = frames[index]
    })
  }, [frames, scrollYProgress])

  return (
    <div ref={ref} className={cn("space-y-2", className)}>
      <div className="overflow-hidden rounded-xl border bg-muted">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img ref={imgRef} src={frames[0]} alt="" className="aspect-video w-full object-cover" />
      </div>
      <p className="text-center text-xs text-muted-foreground">滚动切换帧 · 灵感来自 Apple 产品页，原创实现</p>
    </div>
  )
}

export { ScrollImageSequence }
