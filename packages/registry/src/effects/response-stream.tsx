"use client"

// Ported from prompt-kit (MIT, (c) 2025 Julien Thibeaut) — https://github.com/ibelick/prompt-kit/blob/main/components/prompt-kit/response-stream.tsx. Modified for effect-ui.

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react"

import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export type ResponseStreamMode = "typewriter" | "fade"

export type UseTextStreamOptions = {
  textStream: string | AsyncIterable<string>
  speed?: number
  mode?: ResponseStreamMode
  onComplete?: () => void
  fadeDuration?: number
  segmentDelay?: number
  characterChunkSize?: number
  onError?: (error: unknown) => void
  active?: boolean
}

export type TextSegment = { text: string; index: number }

export type UseTextStreamResult = {
  displayedText: string
  isComplete: boolean
  segments: TextSegment[]
  getFadeDuration: () => number
  getSegmentDelay: () => number
  reset: () => void
  startStreaming: () => void
  pause: () => void
  resume: () => void
}

function wordSegments(text: string): TextSegment[] {
  try {
    if (typeof Intl !== "undefined" && "Segmenter" in Intl) {
      const segmenter = new Intl.Segmenter(undefined, { granularity: "word" })
      return Array.from(segmenter.segment(text)).map((segment, index) => ({ text: segment.segment, index }))
    }
  } catch {
    // 没有 Intl.Segmenter 时按空白切分。
  }
  return text.split(/(\s+)/).filter(Boolean).map((word, index) => ({ text: word, index }))
}

export function useTextStream({
  textStream,
  speed = 20,
  mode = "typewriter",
  onComplete,
  fadeDuration,
  segmentDelay,
  characterChunkSize,
  onError,
  active = true,
}: UseTextStreamOptions): UseTextStreamResult {
  const reduced = usePrefersReducedMotion()
  const [tracked, setTracked] = useState(textStream)
  const [runId, setRunId] = useState(0)
  const [displayedText, setDisplayedText] = useState("")
  const [isComplete, setIsComplete] = useState(false)
  const [segments, setSegments] = useState<TextSegment[]>([])
  const indexRef = useRef(0)
  const frameRef = useRef(0)
  const pausedRef = useRef(false)
  const loopRef = useRef<(() => void) | null>(null)
  const completedRef = useRef(false)
  const onCompleteRef = useRef(onComplete)
  const onErrorRef = useRef(onError)

  if (tracked !== textStream) {
    setTracked(textStream)
    setDisplayedText("")
    setIsComplete(false)
    setSegments([])
  }

  const showFull = reduced && typeof textStream === "string"
  if (showFull && displayedText !== textStream) {
    setDisplayedText(textStream)
    setIsComplete(true)
    setSegments(mode === "fade" ? wordSegments(textStream) : [])
  }

  const normalizedSpeed = Math.min(100, Math.max(1, speed))
  const getChunkSize = useCallback(() => {
    if (typeof characterChunkSize === "number") return Math.max(1, characterChunkSize)
    if (mode === "typewriter" && normalizedSpeed >= 25) return Math.max(1, Math.round((normalizedSpeed - 25) / 10))
    return 1
  }, [characterChunkSize, mode, normalizedSpeed])

  const getProcessingDelay = useCallback(() => {
    if (typeof segmentDelay === "number") return Math.max(0, segmentDelay)
    return Math.max(1, Math.round(100 / Math.sqrt(normalizedSpeed)))
  }, [normalizedSpeed, segmentDelay])

  const getFadeDuration = useCallback(() => {
    if (typeof fadeDuration === "number") return Math.max(10, fadeDuration)
    return Math.round(1000 / Math.sqrt(normalizedSpeed))
  }, [fadeDuration, normalizedSpeed])

  const getSegmentDelay = useCallback(() => {
    if (typeof segmentDelay === "number") return Math.max(0, segmentDelay)
    return Math.max(1, Math.round(100 / Math.sqrt(normalizedSpeed)))
  }, [normalizedSpeed, segmentDelay])

  const markComplete = useCallback(() => {
    if (completedRef.current) return
    completedRef.current = true
    setIsComplete(true)
    onCompleteRef.current?.()
  }, [])

  const reset = useCallback(() => {
    pausedRef.current = false
    completedRef.current = false
    indexRef.current = 0
    setDisplayedText("")
    setIsComplete(false)
    setSegments([])
    setRunId((value) => value + 1)
  }, [])

  const startStreaming = reset

  useEffect(() => {
    onCompleteRef.current = onComplete
    onErrorRef.current = onError
  }, [onComplete, onError])

  useEffect(() => {
    indexRef.current = 0
    completedRef.current = false
  }, [textStream, runId])

  useEffect(() => {
    if (!(reduced && typeof textStream === "string")) return
    if (completedRef.current) return
    completedRef.current = true
    onCompleteRef.current?.()
  }, [reduced, textStream, runId])

  useEffect(() => {
    if (reduced || !active || typeof textStream !== "string") return
    let last = 0
    let stopped = false
    const tick = (timestamp: number) => {
      if (stopped || pausedRef.current) return
      const delay = getProcessingDelay()
      if (delay > 0 && timestamp - last < delay) {
        frameRef.current = requestAnimationFrame(tick)
        return
      }
      last = timestamp
      if (indexRef.current >= textStream.length) {
        markComplete()
        return
      }
      const nextIndex = Math.min(indexRef.current + getChunkSize(), textStream.length)
      indexRef.current = nextIndex
      const next = textStream.slice(0, nextIndex)
      setDisplayedText(next)
      if (mode === "fade") setSegments(wordSegments(next))
      if (nextIndex < textStream.length) frameRef.current = requestAnimationFrame(tick)
      else markComplete()
    }
    loopRef.current = () => {
      if (!stopped) frameRef.current = requestAnimationFrame(tick)
    }
    if (!pausedRef.current) frameRef.current = requestAnimationFrame(tick)
    return () => {
      stopped = true
      cancelAnimationFrame(frameRef.current)
      loopRef.current = null
    }
  }, [active, getChunkSize, getProcessingDelay, markComplete, mode, reduced, runId, textStream])

  useEffect(() => {
    if (typeof textStream === "string" || textStream == null) return
    let cancelled = false
    let displayed = ""
    const run = async () => {
      try {
        for await (const chunk of textStream) {
          if (cancelled) return
          displayed += chunk
          setDisplayedText(displayed)
          if (mode === "fade") setSegments(wordSegments(displayed))
        }
        if (!cancelled) markComplete()
      } catch (error) {
        if (!cancelled) {
          onErrorRef.current?.(error)
          markComplete()
        }
      }
    }
    void run()
    return () => {
      cancelled = true
    }
  }, [markComplete, mode, runId, textStream])

  const pause = useCallback(() => {
    pausedRef.current = true
    cancelAnimationFrame(frameRef.current)
  }, [])

  const resume = useCallback(() => {
    pausedRef.current = false
    loopRef.current?.()
  }, [])

  return { displayedText, isComplete, segments, getFadeDuration, getSegmentDelay, reset, startStreaming, pause, resume }
}

export interface ResponseStreamProps {
  textStream: string | AsyncIterable<string>
  mode?: ResponseStreamMode
  speed?: number
  className?: string
  onComplete?: () => void
  as?: "div" | "p" | "span"
  fadeDuration?: number
  segmentDelay?: number
  characterChunkSize?: number
  onError?: (error: unknown) => void
}

export function ResponseStream({
  textStream,
  mode = "typewriter",
  speed = 20,
  className,
  onComplete,
  as = "div",
  fadeDuration,
  segmentDelay,
  characterChunkSize,
  onError,
}: ResponseStreamProps) {
  const ref = useRef<HTMLDivElement>(null)
  const reduced = usePrefersReducedMotion()
  const motionOn = useAnimationActive(ref)
  const { displayedText, isComplete, segments, getFadeDuration, getSegmentDelay } = useTextStream({
    textStream,
    speed,
    mode,
    onComplete,
    fadeDuration,
    segmentDelay,
    characterChunkSize,
    onError,
    active: motionOn || reduced,
  })
  const fadeMs = getFadeDuration()
  const delayMs = getSegmentDelay()
  const Tag = as
  let content: ReactNode = displayedText
  if (mode === "fade" && !reduced) {
    content = segments.map((segment, index) => {
      const whitespace = /^\s+$/.test(segment.text)
      return (
        <span
          key={`${segment.index}-${segment.text}`}
          className={cn("response-stream-segment", whitespace && "whitespace-pre")}
          style={{ animationDelay: `${index * delayMs}ms`, animationDuration: `${fadeMs}ms` }}
        >
          {segment.text}
        </span>
      )
    })
  }

  return (
    <div ref={ref} className={className} data-complete={isComplete ? "true" : "false"} data-reduced={reduced ? "true" : "false"} data-slot="response-stream">
      <style>{`
        @keyframes response-stream-fade { from { opacity: 0; } to { opacity: 1; } }
        [data-slot="response-stream"] .response-stream-segment {
          display: inline-block;
          opacity: 0;
          animation-name: response-stream-fade;
          animation-timing-function: ease-out;
          animation-fill-mode: forwards;
        }
      `}</style>
      <Tag>{content}</Tag>
    </div>
  )
}
