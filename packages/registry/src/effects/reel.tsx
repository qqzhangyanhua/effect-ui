"use client"

// Ported from Kibo UI (MIT, (c) shadcnblocks) — https://github.com/shadcnblocks/kibo/blob/main/packages/reel/index.tsx

import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { useAnimationActive } from "@/hooks/use-animation-active"
import { useControllableState } from "@/hooks/use-controllable-state"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

import { ChevronLeft, ChevronRight, Pause, Play, Volume2, VolumeX } from "lucide-react"
import { AnimatePresence, motion } from "motion/react"
import {
  createContext,
  useContext,
  useCallback,
  useEffect,
  useRef,
  type ComponentProps,
  type HTMLAttributes,
  type MouseEventHandler,
  type ReactNode,
  type VideoHTMLAttributes,
} from "react"

export interface ReelItem {
  id: string | number
  type: "video" | "image"
  src: string
  duration: number
  alt?: string
  title?: string
  description?: string
}

interface ReelContextValue {
  currentIndex: number
  setCurrentIndex: (index: number) => void
  isPlaying: boolean
  setIsPlaying: (playing: boolean) => void
  isMuted: boolean
  setIsMuted: (muted: boolean) => void
  progress: number
  setProgress: (progress: number) => void
  data: ReelItem[]
  currentItem: ReelItem
  animate: boolean
  isTransitioning: boolean
  setIsTransitioning: (transitioning: boolean) => void
}

const ReelContext = createContext<ReelContextValue | null>(null)

function useReelContext() {
  const context = useContext(ReelContext)
  if (!context) throw new Error("Reel 组件必须放在 Reel 里面。")
  return context
}

export interface ReelProps extends HTMLAttributes<HTMLDivElement> {
  data: ReelItem[]
  defaultIndex?: number
  index?: number
  onIndexChange?: (index: number) => void
  defaultPlaying?: boolean
  playing?: boolean
  onPlayingChange?: (playing: boolean) => void
  defaultMuted?: boolean
  muted?: boolean
  onMutedChange?: (muted: boolean) => void
  autoPlay?: boolean
}

export function Reel({
  className,
  data,
  defaultIndex = 0,
  index,
  onIndexChange,
  defaultPlaying,
  playing,
  onPlayingChange,
  defaultMuted = true,
  muted,
  onMutedChange,
  autoPlay = true,
  ...props
}: ReelProps) {
  const ref = useRef<HTMLDivElement>(null)
  const prefersReducedMotion = usePrefersReducedMotion()
  const motionOn = useAnimationActive(ref)
  const animate = !prefersReducedMotion && motionOn
  const [currentIndex, setCurrentIndexState] = useControllableState({
    value: index,
    defaultValue: defaultIndex,
    onChange: onIndexChange,
  })
  const [isPlaying, setIsPlaying] = useControllableState({
    value: playing,
    defaultValue: defaultPlaying ?? autoPlay,
    onChange: onPlayingChange,
  })
  const [isMuted, setIsMuted] = useControllableState({
    value: muted,
    defaultValue: defaultMuted,
    onChange: onMutedChange,
  })
  const progressRef = useRef(0)
  const [progress, setProgressState] = useControllableState({ value: undefined, defaultValue: 0 })
  const [isTransitioning, setIsTransitioning] = useControllableState({ value: undefined, defaultValue: false })
  const safeIndex = data.length === 0 ? 0 : Math.min(Math.max(currentIndex, 0), data.length - 1)
  const currentItem = data[safeIndex]

  const setProgress = useCallback(
    (next: number) => {
      progressRef.current = next
      setProgressState(next)
    },
    [setProgressState],
  )

  const setCurrentIndex = useCallback(
    (next: number) => {
      setIsTransitioning(true)
      setProgress(0)
      setCurrentIndexState(next)
    },
    [setCurrentIndexState, setIsTransitioning, setProgress],
  )

  if (!currentItem) return null

  return (
    <ReelContext.Provider
      value={{
        currentIndex: safeIndex,
        setCurrentIndex,
        isPlaying,
        setIsPlaying,
        isMuted,
        setIsMuted,
        progress,
        setProgress,
        data,
        currentItem,
        animate,
        isTransitioning,
        setIsTransitioning,
      }}
    >
      <div
        className={cn("relative isolate aspect-[9/16] w-full overflow-hidden bg-black", className)}
        data-reduced={prefersReducedMotion ? "true" : "false"}
        data-slot="reel"
        ref={ref}
        {...props}
      />
    </ReelContext.Provider>
  )
}

function useItemClock(duration: number) {
  const { isPlaying, animate, currentIndex, setCurrentIndex, data, setProgress } = useReelContext()
  const paused = useRef(0)
  const indexSeen = useRef(currentIndex)

  useEffect(() => {
    if (indexSeen.current !== currentIndex) {
      indexSeen.current = currentIndex
      paused.current = 0
    }
    if (!isPlaying || !animate || duration <= 0) return
    const started = performance.now() - (paused.current / 100) * duration * 1000
    let frame = 0
    const tick = (now: number) => {
      const next = ((now - started) / 1000 / duration) * 100
      if (next >= 100) {
        const last = data.length - 1
        setCurrentIndex(currentIndex < last ? currentIndex + 1 : 0)
        return
      }
      paused.current = next
      setProgress(next)
      frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [animate, currentIndex, data.length, duration, isPlaying, setCurrentIndex, setProgress])
}

export function ReelContent({
  className,
  children,
  ...props
}: Omit<HTMLAttributes<HTMLDivElement>, "children"> & {
  children: (item: ReelItem, index: number) => ReactNode
}) {
  const { currentIndex, currentItem, setIsTransitioning, animate } = useReelContext()
  if (!animate) {
    return (
      <div className={cn("relative size-full", className)} {...props}>
        <div className="absolute inset-0">{children(currentItem, currentIndex)}</div>
      </div>
    )
  }
  return (
    <div className={cn("relative size-full", className)} {...props}>
      <AnimatePresence mode="wait">
        <motion.div
          animate={{ opacity: 1 }}
          className="absolute inset-0"
          exit={{ opacity: 0 }}
          initial={{ opacity: 0 }}
          key={currentIndex}
          onAnimationComplete={() => setIsTransitioning(false)}
          transition={{ duration: 0.3 }}
        >
          {children(currentItem, currentIndex)}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

export function ReelItemView({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("relative size-full overflow-hidden", className)} {...props} />
}

export function ReelVideo({ className, ...props }: VideoHTMLAttributes<HTMLVideoElement>) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const { isMuted, currentItem, currentIndex } = useReelContext()
  useItemClock(currentItem.duration)

  useEffect(() => {
    const video = videoRef.current
    if (video) video.muted = isMuted
  }, [isMuted])

  useEffect(() => {
    const video = videoRef.current
    if (video) video.currentTime = 0
  }, [currentIndex])

  return (
    <video
      className={cn("absolute inset-0 size-full object-cover", className)}
      loop
      muted={isMuted}
      playsInline
      ref={videoRef}
      {...props}
    />
  )
}

export interface ReelImageProps extends Omit<ComponentProps<"img">, "alt"> {
  alt: string
  duration?: number
}

export function ReelImage({ className, alt, duration, ...props }: ReelImageProps) {
  const { currentItem } = useReelContext()
  useItemClock(duration ?? currentItem.duration)
  return (
    // eslint-disable-next-line @next/next/no-img-element -- registry 组件不能依赖 next/image
    <img alt={alt} className={cn("absolute inset-0 size-full object-cover", className)} {...props} />
  )
}

export function ReelProgress({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  const { progress, currentIndex, data } = useReelContext()
  return (
    <div className={cn("absolute inset-x-0 top-0 z-40 flex gap-1 p-2", className)} data-slot="reel-progress" {...props}>
      {data.map((item, index) => {
        const value = index < currentIndex ? 100 : index === currentIndex ? progress : 0
        return (
          <Progress
            className="h-0.5 flex-1 bg-white/30 [&>div]:bg-white [&>div]:transition-none"
            key={item.id}
            value={value}
          />
        )
      })}
    </div>
  )
}

export function ReelControls({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "absolute inset-x-0 bottom-0 z-20 flex items-center justify-between bg-gradient-to-t from-black/60 to-transparent p-3",
        className,
      )}
      {...props}
    />
  )
}

export function ReelPreviousButton({ className, children, ...props }: ComponentProps<typeof Button>) {
  const { currentIndex, setCurrentIndex } = useReelContext()
  return (
    <Button
      aria-label="上一段"
      className={cn("rounded-full text-white hover:bg-white/15 hover:text-white", className)}
      disabled={currentIndex === 0}
      onClick={() => {
        if (currentIndex > 0) setCurrentIndex(currentIndex - 1)
      }}
      size="icon"
      type="button"
      variant="ghost"
      {...props}
    >
      {children ?? <ChevronLeft />}
    </Button>
  )
}

export function ReelNextButton({ className, children, ...props }: ComponentProps<typeof Button>) {
  const { currentIndex, setCurrentIndex, data } = useReelContext()
  return (
    <Button
      aria-label="下一段"
      className={cn("rounded-full text-white hover:bg-white/15 hover:text-white", className)}
      disabled={currentIndex >= data.length - 1}
      onClick={() => {
        if (currentIndex < data.length - 1) setCurrentIndex(currentIndex + 1)
      }}
      size="icon"
      type="button"
      variant="ghost"
      {...props}
    >
      {children ?? <ChevronRight />}
    </Button>
  )
}

export function ReelPlayButton({ className, children, ...props }: ComponentProps<typeof Button>) {
  const { isPlaying, setIsPlaying } = useReelContext()
  return (
    <Button
      aria-label={isPlaying ? "暂停" : "播放"}
      className={cn("rounded-full text-white hover:bg-white/15 hover:text-white", className)}
      onClick={() => setIsPlaying(!isPlaying)}
      size="icon"
      type="button"
      variant="ghost"
      {...props}
    >
      {children ?? (isPlaying ? <Pause /> : <Play />)}
    </Button>
  )
}

export function ReelMuteButton({ className, children, ...props }: ComponentProps<typeof Button>) {
  const { isMuted, setIsMuted } = useReelContext()
  return (
    <Button
      aria-label={isMuted ? "开声" : "静音"}
      className={cn("rounded-full text-white hover:bg-white/15 hover:text-white", className)}
      onClick={() => setIsMuted(!isMuted)}
      size="icon"
      type="button"
      variant="ghost"
      {...props}
    >
      {children ?? (isMuted ? <VolumeX /> : <Volume2 />)}
    </Button>
  )
}

export function ReelNavigation({ className, ...props }: HTMLAttributes<HTMLButtonElement>) {
  const { setCurrentIndex, currentIndex, data } = useReelContext()
  const handleClick: MouseEventHandler<HTMLButtonElement> = (event) => {
    const rect = event.currentTarget.getBoundingClientRect()
    const onLeft = event.clientX - rect.left < rect.width / 2
    if (onLeft && currentIndex > 0) setCurrentIndex(currentIndex - 1)
    if (!onLeft && currentIndex < data.length - 1) setCurrentIndex(currentIndex + 1)
  }
  return <button className={cn("absolute inset-0 z-10", className)} onClick={handleClick} type="button" {...props} />
}

export function ReelOverlay({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("pointer-events-none absolute inset-0 z-30", className)} {...props} />
}

export function ReelHeader({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("absolute inset-x-0 top-0 z-20 bg-gradient-to-b from-black/60 to-transparent p-4 pt-6", className)} {...props} />
  )
}

export function ReelFooter({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-black/60 to-transparent p-4", className)} {...props} />
  )
}
