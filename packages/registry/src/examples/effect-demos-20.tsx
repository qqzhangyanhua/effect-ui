"use client"
import { Parallax } from "../effects/parallax"

export function ParallaxDemo({
  offset = 40,
  speed,
  intensity,
  scale,
}: {
  offset?: number
  speed?: number
  intensity?: number
  scale?: number
} = {}) {
  return (
    <div className="h-40 w-full overflow-auto rounded-xl border">
      <div className="flex h-80 items-center justify-center bg-muted/40">
        <Parallax offset={offset} speed={speed} intensity={intensity} scale={scale}>
          <p className="text-lg font-medium">滚动这块区域看视差</p>
        </Parallax>
      </div>
    </div>
  )
}
