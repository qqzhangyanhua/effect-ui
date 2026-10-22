"use client"

// Ported from Flowbite (MIT, (c) 2023 Bergside Inc.) — https://github.com/themesberg/flowbite/blob/main/content/components/bottom-navigation.md. Modified for effect-ui.

import { useRef, useState, type HTMLAttributes } from "react"
import { Mic, MicOff, PhoneOff, Settings, Smile, Video, VideoOff } from "lucide-react"

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export interface MeetingControlState {
  mic: boolean
  cam: boolean
  feedback: boolean
  settings: boolean
}

const empty: MeetingControlState = { mic: false, cam: false, feedback: false, settings: false }

export interface MeetingControlBarProps extends Omit<HTMLAttributes<HTMLElement>, "onToggle"> {
  time?: string
  controls?: MeetingControlState
  onToggle?: (key: keyof MeetingControlState, pressed: boolean) => void
  onEnd?: () => void
  end?: string
}

const tips: Record<keyof MeetingControlState, { on: string; off: string; label: string }> = {
  mic: { label: "麦克风", off: "关闭麦克风", on: "打开麦克风" },
  cam: { label: "摄像头", off: "关闭摄像头", on: "打开摄像头" },
  feedback: { label: "反馈", off: "分享反馈", on: "收起反馈" },
  settings: { label: "设置", off: "打开设置", on: "关闭设置" },
}

function glyph(key: keyof MeetingControlState, pressed: boolean) {
  if (key === "mic") return pressed ? <MicOff aria-hidden="true" className="size-4" /> : <Mic aria-hidden="true" className="size-4" />
  if (key === "cam") return pressed ? <VideoOff aria-hidden="true" className="size-4" /> : <Video aria-hidden="true" className="size-4" />
  if (key === "feedback") return <Smile aria-hidden="true" className="size-4" />
  return <Settings aria-hidden="true" className="size-4" />
}

export function MeetingControlBar({ time, controls, onToggle, onEnd, end = "结束", className, ...props }: MeetingControlBarProps) {
  const ref = useRef<HTMLElement>(null)
  const reduced = usePrefersReducedMotion()
  const [local, setLocal] = useState<MeetingControlState>(empty)
  const state = controls ?? local
  const keys = ["mic", "cam", "feedback", "settings"] as const

  function press(key: keyof MeetingControlState) {
    const next = !state[key]
    onToggle?.(key, next)
    if (!controls) setLocal({ ...state, [key]: next })
  }

  return (
    <section
      {...props}
      ref={ref}
      aria-label="会议控制"
      className={cn(
        "fixed inset-x-0 bottom-0 z-40 flex h-16 items-center justify-between gap-3 border-t border-border bg-background px-4",
        reduced ? "transition-none" : "transition-colors",
        className,
      )}
      data-reduced={reduced ? "true" : "false"}
      data-slot="meeting-control-bar"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <style>{`[data-slot="meeting-control-bar"]{padding-bottom:env(safe-area-inset-bottom)}`}</style>
      <div className="flex min-w-0 items-center text-sm text-muted-foreground">
        <span aria-hidden="true" className="me-1.5 size-4 rounded-full border border-current" />
        <span>{time}</span>
      </div>
      <div className="flex items-center justify-center gap-3">
        {keys.map((key) => {
          const pressed = state[key]
          const tip = pressed ? tips[key].on : tips[key].off
          return (
            <button
              key={key}
              aria-label={tips[key].label}
              aria-pressed={pressed}
              className={cn(
                "group relative inline-flex size-10 items-center justify-center rounded-full border border-border bg-background text-foreground shadow-sm hover:bg-accent",
                pressed && "border-destructive text-destructive",
              )}
              onClick={() => press(key)}
              title={tip}
              type="button"
            >
              {glyph(key, pressed)}
              <span
                aria-hidden="true"
                className="pointer-events-none absolute bottom-full left-1/2 mb-2 -translate-x-1/2 rounded-md bg-foreground px-2 py-1 text-xs whitespace-nowrap text-background opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100"
              >
                {tip}
              </span>
            </button>
          )
        })}
      </div>
      <div className="flex justify-end">
        <button className="inline-flex items-center gap-2 rounded-full bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700" onClick={() => onEnd?.()} type="button">
          <PhoneOff aria-hidden="true" className="size-4" />
          {end}
        </button>
      </div>
    </section>
  )
}
