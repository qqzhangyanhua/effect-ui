"use client"

import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent as ReactPointerEvent } from "react"

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/cn"

export interface UploadFile {
  id: string
  name: string
}

export interface UploadOrbitProps {
  files?: readonly UploadFile[]
  onComplete?: () => void
  color?: string
  size?: number
  duration?: number
  className?: string
}

const DEFAULT_FILES: readonly UploadFile[] = [
  { id: "brief", name: "需求.pdf" },
  { id: "sketch", name: "草图.png" },
  { id: "notes", name: "备注.txt" },
]

type Phase = "ready" | "orbit" | "settle" | "row"

interface Point {
  x: number
  y: number
}

function ringPoint(index: number, count: number, spin: number, radius: number): Point {
  const turn = spin + (Math.PI * 2 * index) / Math.max(1, count)
  return { x: Math.cos(turn) * radius, y: Math.sin(turn) * radius * 0.62 }
}

function rowPoint(index: number, count: number, width: number): Point {
  const span = width * 0.7
  const step = count <= 1 ? 0 : span / (count - 1)
  return { x: -span / 2 + step * index, y: width * 0.1 }
}

function readyPoint(index: number, count: number): Point {
  const mid = (count - 1) / 2
  return { x: (index - mid) * 18, y: 4 }
}

function UploadOrbit({
  files = DEFAULT_FILES,
  onComplete,
  color,
  size = 320,
  duration = 1600,
  className,
}: UploadOrbitProps) {
  const reduced = usePrefersReducedMotion()
  const [phase, setPhase] = useState<Phase>("ready")
  const [spin, setSpin] = useState(0)
  const [blend, setBlend] = useState(0)
  const [from, setFrom] = useState<readonly Point[]>([])
  const [acknowledged, setAcknowledged] = useState(false)
  const reported = useRef(false)
  const phaseRef = useRef<Phase>("ready")
  const onCompleteRef = useRef(onComplete)
  const reducedRef = useRef(reduced)
  const durationRef = useRef(duration)
  useEffect(() => {
    phaseRef.current = phase
    onCompleteRef.current = onComplete
    reducedRef.current = reduced
    durationRef.current = duration
  })

  const accent = color ?? "var(--primary)"
  const list = files
  const count = list.length
  const radius = size * 0.28
  const layout: Phase = reduced || phase === "row" ? "row" : phase

  function report() {
    if (reported.current) return
    reported.current = true
    setAcknowledged(true)
    setPhase("row")
    onCompleteRef.current?.()
  }

  useEffect(() => {
    if (reduced || phase !== "orbit") return
    let raf = 0
    let last = 0
    const step = (now: number) => {
      if (reducedRef.current || phaseRef.current !== "orbit") return
      const dt = last === 0 ? 16 : Math.min(32, Math.max(0, now - last))
      last = now
      setSpin((value) => value + (dt / Math.max(1, durationRef.current)) * Math.PI * 2)
      raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [phase, reduced])

  useEffect(() => {
    if (reduced || phase !== "settle") return
    let raf = 0
    let last = 0
    let elapsed = 0
    const step = (now: number) => {
      if (reducedRef.current || phaseRef.current !== "settle") {
        if (phaseRef.current === "settle") report()
        return
      }
      const dt = last === 0 ? 16 : Math.min(32, Math.max(0, now - last))
      last = now
      elapsed += dt
      const t = Math.min(1, elapsed / Math.max(1, durationRef.current))
      if (t >= 1) {
        report()
        return
      }
      setBlend(t)
      raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [phase, reduced])

  function activate() {
    if (acknowledged) return
    if (reduced || phase === "row" || count === 0) {
      report()
      return
    }
    if (phase === "settle") return
    if (phase === "ready") {
      setSpin(0)
      setPhase("orbit")
      return
    }
    setFrom(list.map((_, index) => ringPoint(index, count, spin, radius)))
    setBlend(0)
    setPhase("settle")
  }

  function onKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (event.repeat) return
    if (event.key !== "Enter" && event.key !== " ") return
    event.preventDefault()
    activate()
  }

  function onPointerUp(event: ReactPointerEvent<HTMLButtonElement>) {
    if (event.pointerType === "mouse" && event.button !== 0) return
    activate()
  }

  function poseAt(index: number): Point {
    const row = rowPoint(index, count, size)
    if (layout === "row") return row
    if (phase === "ready") return readyPoint(index, count)
    if (phase === "settle") {
      const start = from[index] ?? ringPoint(index, count, spin, radius)
      return { x: start.x + (row.x - start.x) * blend, y: start.y + (row.y - start.y) * blend }
    }
    return ringPoint(index, count, spin, radius)
  }

  const status =
    layout === "row" ? "文件已排成一行" : phase === "orbit" ? "文件正在绕圈上传" : phase === "settle" ? "正在排成一行" : "准备上传"
  const action = acknowledged ? "已完成" : layout === "row" || phase === "orbit" ? "完成上传" : phase === "settle" ? "正在归位" : "开始上传"

  return (
    <div
      className={cn("flex flex-col items-center gap-3", className)}
      data-layout={layout}
      data-reduced={reduced ? "true" : undefined}
      data-slot="upload-orbit"
      style={{ width: size }}
    >
      <div className="relative w-full" style={{ height: Math.round(size * 0.72) }}>
        {count === 0 ? <p className="text-muted-foreground absolute inset-0 grid place-items-center text-sm">没有文件</p> : null}
        {list.map((file, index) => {
          const pose = poseAt(index)
          return (
            <div
              className="bg-card text-card-foreground absolute top-[46%] left-1/2 grid w-24 place-items-center rounded-xl border px-2 py-2 text-sm shadow-sm motion-reduce:transition-none"
              data-file={file.id}
              key={file.id}
              style={{
                borderColor: accent,
                transform: `translate(calc(-50% + ${pose.x}px), calc(-50% + ${pose.y}px))`,
              }}
            >
              {file.name}
            </div>
          )
        })}
      </div>
      <p className="text-muted-foreground text-sm">{status}</p>
      <button
        className="bg-primary text-primary-foreground rounded-full px-4 py-2 text-sm font-medium disabled:opacity-60 motion-reduce:transition-none"
        disabled={acknowledged || (!reduced && phase === "settle")}
        onKeyDown={onKeyDown}
        onPointerUp={onPointerUp}
        type="button"
      >
        {action}
      </button>
    </div>
  )
}

export { UploadOrbit }
