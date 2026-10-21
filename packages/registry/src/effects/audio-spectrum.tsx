"use client"

import * as React from "react"

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export type SpectrumMode = "bars" | "circle" | "wave"

export interface AudioSpectrumProps {
  src?: string
  mode?: SpectrumMode
  className?: string
  size?: number
  color?: string
}

const STATIC = [18, 36, 58, 44, 70, 32, 50, 24, 40, 62, 28, 46]

function AudioSpectrum({ src, mode = "bars", className, size, color }: AudioSpectrumProps) {
  const reduced = usePrefersReducedMotion()
  const canvasRef = React.useRef<HTMLCanvasElement>(null)
  const hostRef = React.useRef<HTMLDivElement>(null)
  const labelRef = React.useRef<HTMLSpanElement>(null)
  const modeRef = React.useRef(mode)
  const [playing, setPlaying] = React.useState<"none" | "tone" | "mic" | "file">("none")
  const [error, setError] = React.useState("")
  const [currentMode, setCurrentMode] = React.useState<SpectrumMode>(mode)
  const [incomingMode, setIncomingMode] = React.useState(mode)
  if (incomingMode !== mode) {
    setIncomingMode(mode)
    setCurrentMode(mode)
  }
  const sizeRef = React.useRef(size)
  const colorRef = React.useRef(color)

  React.useEffect(() => {
    modeRef.current = currentMode
    sizeRef.current = size
    colorRef.current = color
  }, [color, currentMode, size])

  React.useEffect(() => {
    if (!reduced) return
    const canvas = canvasRef.current
    if (!canvas) return
    const context = canvas.getContext("2d")
    if (!context) return
    const width = canvas.clientWidth || 320
    const height = canvas.clientHeight || 160
    canvas.width = width
    canvas.height = height
    context.clearRect(0, 0, width, height)
    STATIC.forEach((value, index) => {
      const barWidth = width / STATIC.length - 6
      context.fillStyle = color ?? "#38bdf8"
      context.fillRect(index * (barWidth + 6) + 3, height - value, barWidth, value)
    })
  }, [color, reduced])

  React.useEffect(() => {
    if (reduced || playing === "none") return
    const canvas = canvasRef.current
    const host = hostRef.current
    if (!canvas || !host) return
    const context2d = canvas.getContext("2d")
    if (!context2d) return
    const AudioContext = window.AudioContext ?? window.webkitAudioContext
    if (!AudioContext) {
      return
    }
    let stopped = false
    let frame = 0
    const visibleRef = { current: true }
    const audioContext = new AudioContext()
    const analyser = audioContext.createAnalyser()
    analyser.fftSize = 64
    const data = new Uint8Array(analyser.frequencyBinCount)
    const osc = playing === "tone" ? audioContext.createOscillator() : null
    const gain = playing === "tone" ? audioContext.createGain() : null
    const media = playing === "file" && src ? new Audio(src) : null
    let micStream: MediaStream | null = null

    if (osc && gain) {
      osc.frequency.value = 196
      osc.type = "sawtooth"
      gain.gain.value = 0.04
      osc.connect(gain)
      gain.connect(analyser)
      analyser.connect(audioContext.destination)
      osc.start()
    }

    const startMic = async () => {
      micStream = await navigator.mediaDevices.getUserMedia({ audio: true })
      if (stopped) {
        micStream.getTracks().forEach((track) => track.stop())
        return
      }
      audioContext.createMediaStreamSource(micStream).connect(analyser)
    }
    const startFile = () => {
      if (!media) return
      audioContext.createMediaElementSource(media).connect(analyser)
      analyser.connect(audioContext.destination)
      void media.play()
    }

    if (playing === "mic") {
      startMic().catch(() => {
        if (!stopped) setError("没有拿到麦克风。")
      })
    }
    if (playing === "file") startFile()

    const resize = () => {
      const rect = host.getBoundingClientRect()
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = Math.max(1, Math.floor(rect.width * dpr))
      canvas.height = Math.max(1, Math.floor(160 * dpr))
      context2d.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()
    const resizeObserver = new ResizeObserver(resize)
    resizeObserver.observe(host)

    const tick = () => {
      if (stopped) return
      if (!visibleRef.current) {
        frame = 0
        return
      }
      analyser.getByteFrequencyData(data)
      const width = host.clientWidth
      const height = 160
      let total = 0
      let peak = 0
      for (const value of data) {
        total += value
        if (value > peak) peak = value
      }
      const volume = data.length ? total / data.length / 255 : 0
      const level = Math.max(volume, peak / 255)
      if (labelRef.current) labelRef.current.textContent = `${Math.round(level * 100)}`
      context2d.clearRect(0, 0, width, height)
      const hue = 205 - level * 170
      const paint = colorRef.current
      if (paint) {
        context2d.strokeStyle = paint
        context2d.fillStyle = paint
      } else {
        context2d.strokeStyle = `hsl(${hue} 90% 62%)`
        context2d.fillStyle = `hsl(${hue} 90% 62%)`
      }
      if (modeRef.current === "circle") {
        const cx = width / 2
        const cy = height / 2
        const reach = sizeRef.current === undefined || sizeRef.current === 48 ? 1 : sizeRef.current / 48
        const inner = reach === 1 ? 28 : 28 * reach
        const outer = reach === 1 ? 48 : 48 * reach
        data.forEach((value, index) => {
          const angle = (index / data.length) * Math.PI * 2
          const radius = inner + (value / 255) * outer
          context2d.beginPath()
          context2d.moveTo(cx, cy)
          context2d.lineTo(cx + Math.cos(angle) * radius, cy + Math.sin(angle) * radius)
          context2d.stroke()
        })
      } else if (modeRef.current === "wave") {
        context2d.beginPath()
        data.forEach((value, index) => {
          const x = (index / Math.max(data.length - 1, 1)) * width
          const y = height / 2 + ((value / 255) - 0.35) * height
          if (index === 0) context2d.moveTo(x, y)
          else context2d.lineTo(x, y)
        })
        context2d.stroke()
      } else {
        const barWidth = width / data.length
        data.forEach((value, index) => {
          const barHeight = (value / 255) * (height - 12)
          context2d.fillRect(index * barWidth + 2, height - barHeight, Math.max(barWidth - 4, 1), barHeight)
        })
      }
      frame = window.requestAnimationFrame(tick)
    }
    const viewObserver = new IntersectionObserver((entries) => {
      visibleRef.current = entries.some((entry) => entry.isIntersecting)
      if (visibleRef.current && !stopped && frame === 0) frame = window.requestAnimationFrame(tick)
    })
    viewObserver.observe(host)
    frame = window.requestAnimationFrame(tick)

    return () => {
      stopped = true
      window.cancelAnimationFrame(frame)
      resizeObserver.disconnect()
      viewObserver.disconnect()
      osc?.stop()
      media?.pause()
      micStream?.getTracks().forEach((track) => track.stop())
      void audioContext.close()
    }
  }, [playing, reduced, src])

  return (
    <div ref={hostRef} data-slot="audio-spectrum" className={cn("w-full space-y-3", className)}>
      <div className="flex flex-wrap gap-2">
        {(["bars", "circle", "wave"] as const).map((item) => (
          <button key={item} type="button" aria-pressed={currentMode === item} className={cn("rounded-md border px-2 py-1 text-xs", currentMode === item && "bg-primary text-primary-foreground")} onClick={() => setCurrentMode(item)}>
            {item === "bars" ? "条形" : item === "circle" ? "环形" : "波形"}
          </button>
        ))}
        {reduced ? null : (
          <>
            <button type="button" className="rounded-md border px-2 py-1 text-xs" onClick={() => { setError(""); setPlaying("tone") }}>播放示例</button>
            <button type="button" className="rounded-md border px-2 py-1 text-xs" onClick={() => { setError(""); setPlaying("mic") }}>麦克风</button>
            {src ? <button type="button" className="rounded-md border px-2 py-1 text-xs" onClick={() => { setError(""); setPlaying("file") }}>播放音频</button> : null}
          </>
        )}
        <span className="text-xs text-muted-foreground">音量 <span ref={labelRef}>{reduced ? "—" : "0"}</span></span>
      </div>
      <canvas ref={canvasRef} className="h-40 w-full rounded-xl border bg-slate-950" aria-label={reduced ? "静态频谱" : "实时频谱"} />
      {error ? <p role="alert" className="text-sm text-destructive">{error}</p> : null}
      {reduced ? <p className="text-xs text-muted-foreground">减弱动效时显示静态频谱。</p> : null}
    </div>
  )
}

declare global {
  interface Window {
    webkitAudioContext?: typeof AudioContext
  }
}

export { AudioSpectrum }
