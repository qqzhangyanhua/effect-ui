"use client"

import * as React from "react"
import { Maximize2, Minimize2, Pause, PictureInPicture2, Play, Volume2, VolumeX } from "lucide-react"

import { cn } from "@/lib/utils"

export interface VideoPlayerProps {
  src: string
  poster?: string
  className?: string
}

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds)) return "0:00"
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, "0")}`
}

function VideoPlayer({ src, poster, className }: VideoPlayerProps) {
  const videoRef = React.useRef<HTMLVideoElement>(null)
  const [playing, setPlaying] = React.useState(false)
  const [muted, setMuted] = React.useState(false)
  const [current, setCurrent] = React.useState(0)
  const [duration, setDuration] = React.useState(0)
  const [volume, setVolume] = React.useState(1)
  const [fullscreen, setFullscreen] = React.useState(false)

  const togglePlay = React.useCallback(() => {
    const video = videoRef.current
    if (!video) return
    if (video.paused) {
      void video.play()
    } else {
      video.pause()
    }
  }, [])

  React.useEffect(() => {
    const video = videoRef.current
    if (!video) return
    const onPlay = () => setPlaying(true)
    const onPause = () => setPlaying(false)
    const onTime = () => setCurrent(video.currentTime)
    const onMeta = () => setDuration(video.duration)
    video.addEventListener("play", onPlay)
    video.addEventListener("pause", onPause)
    video.addEventListener("timeupdate", onTime)
    video.addEventListener("loadedmetadata", onMeta)
    return () => {
      video.removeEventListener("play", onPlay)
      video.removeEventListener("pause", onPause)
      video.removeEventListener("timeupdate", onTime)
      video.removeEventListener("loadedmetadata", onMeta)
    }
  }, [])

  const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const video = videoRef.current
    if (!video) return
    if (event.key === " " || event.key === "k") {
      event.preventDefault()
      togglePlay()
    }
    if (event.key === "ArrowRight") video.currentTime = Math.min(video.duration, video.currentTime + 5)
    if (event.key === "ArrowLeft") video.currentTime = Math.max(0, video.currentTime - 5)
    if (event.key === "m") {
      video.muted = !video.muted
      setMuted(video.muted)
    }
    if (event.key === "f") void toggleFullscreen()
  }

  const toggleFullscreen = async () => {
    const root = videoRef.current?.parentElement
    if (!root) return
    if (document.fullscreenElement) {
      await document.exitFullscreen()
      setFullscreen(false)
    } else {
      await root.requestFullscreen()
      setFullscreen(true)
    }
  }

  const togglePip = async () => {
    const video = videoRef.current
    if (!video) return
    if (document.pictureInPictureElement) {
      await document.exitPictureInPicture()
    } else {
      await video.requestPictureInPicture()
    }
  }

  return (
    <div
      tabIndex={0}
      onKeyDown={onKeyDown}
      className={cn("group relative overflow-hidden rounded-xl border bg-black outline-none", className)}
    >
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        className="aspect-video w-full"
        onClick={togglePlay}
        playsInline
      />
      <div className="absolute inset-x-0 bottom-0 flex flex-col gap-2 bg-linear-to-t from-black/70 to-transparent p-3 text-white opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
        <input
          type="range"
          min={0}
          max={duration || 0}
          step={0.1}
          value={current}
          aria-label="进度"
          className="w-full accent-white"
          onChange={(event) => {
            const next = Number(event.target.value)
            if (videoRef.current) videoRef.current.currentTime = next
            setCurrent(next)
          }}
        />
        <div className="flex items-center gap-2 text-xs">
          <button type="button" onClick={togglePlay} aria-label={playing ? "暂停" : "播放"}>
            {playing ? <Pause className="size-4" /> : <Play className="size-4" />}
          </button>
          <span className="tabular-nums">
            {formatTime(current)} / {formatTime(duration)}
          </span>
          <button
            type="button"
            className="ml-1"
            aria-label={muted ? "取消静音" : "静音"}
            onClick={() => {
              const video = videoRef.current
              if (!video) return
              video.muted = !video.muted
              setMuted(video.muted)
            }}
          >
            {muted || volume === 0 ? <VolumeX className="size-4" /> : <Volume2 className="size-4" />}
          </button>
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={muted ? 0 : volume}
            aria-label="音量"
            className="w-16 accent-white"
            onChange={(event) => {
              const next = Number(event.target.value)
              setVolume(next)
              if (videoRef.current) {
                videoRef.current.volume = next
                videoRef.current.muted = next === 0
                setMuted(next === 0)
              }
            }}
          />
          <span className="ml-auto flex items-center gap-2">
            <button type="button" aria-label="画中画" onClick={() => void togglePip()}>
              <PictureInPicture2 className="size-4" />
            </button>
            <button type="button" aria-label={fullscreen ? "退出全屏" : "全屏"} onClick={() => void toggleFullscreen()}>
              {fullscreen ? <Minimize2 className="size-4" /> : <Maximize2 className="size-4" />}
            </button>
          </span>
        </div>
      </div>
    </div>
  )
}

export { VideoPlayer }
