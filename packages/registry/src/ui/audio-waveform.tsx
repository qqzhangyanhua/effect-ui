"use client"

import * as React from "react"
import WaveSurfer from "wavesurfer.js"
import { Pause, Play } from "lucide-react"

import { cn } from "@/lib/utils"

export interface AudioWaveformProps {
  src: string
  height?: number
  className?: string
}

function AudioWaveform({ src, height = 80, className }: AudioWaveformProps) {
  const containerRef = React.useRef<HTMLDivElement>(null)
  const waveRef = React.useRef<WaveSurfer | null>(null)
  const [ready, setReady] = React.useState(false)
  const [playing, setPlaying] = React.useState(false)

  React.useEffect(() => {
    const node = containerRef.current
    if (!node) return
    const wave = WaveSurfer.create({
      container: node,
      height,
      waveColor: "color-mix(in oklab, var(--primary) 55%, transparent)",
      progressColor: "var(--primary)",
      cursorColor: "var(--foreground)",
      barWidth: 2,
      barGap: 1,
      barRadius: 2,
      url: src,
    })
    waveRef.current = wave
    const onReady = () => setReady(true)
    const onPlay = () => setPlaying(true)
    const onPause = () => setPlaying(false)
    wave.on("ready", onReady)
    wave.on("play", onPlay)
    wave.on("pause", onPause)
    return () => {
      wave.destroy()
      waveRef.current = null
    }
  }, [src, height])

  return (
    <div className={cn("w-full space-y-2 rounded-xl border p-3", className)}>
      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={!ready}
          aria-label={playing ? "暂停" : "播放"}
          className="grid size-8 place-items-center rounded-md bg-primary text-primary-foreground disabled:opacity-50"
          onClick={() => void waveRef.current?.playPause()}
        >
          {playing ? <Pause className="size-4" /> : <Play className="size-4" />}
        </button>
        <span className="text-xs text-muted-foreground">{ready ? "波形已就绪" : "加载波形…"}</span>
      </div>
      <div ref={containerRef} />
    </div>
  )
}

export { AudioWaveform }
