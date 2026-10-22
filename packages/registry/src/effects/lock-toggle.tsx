"use client"

// Ported from Uiverse.io (MIT), author mobinkakei — https://github.com/uiverse-io/galaxy/blob/main/Checkboxes/mobinkakei_strange-frog-14.html. Modified for effect-ui.

import { useRef, useState, type ButtonHTMLAttributes, type CSSProperties } from "react"

import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export interface LockToggleProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "color"> {
  locked?: boolean
  defaultLocked?: boolean
  onLockedChange?: (locked: boolean) => void
  /** 未锁定时的底色。 */
  unlockedColor?: string
  /** 锁定时的底色。 */
  lockedColor?: string
}

export function LockToggle({
  locked,
  defaultLocked = false,
  onLockedChange,
  unlockedColor = "var(--destructive)",
  lockedColor = "var(--chart-2)",
  className,
  style,
  type = "button",
  ...props
}: LockToggleProps) {
  const ref = useRef<HTMLButtonElement>(null)
  const reduced = usePrefersReducedMotion()
  const motionOn = useAnimationActive(ref)
  const [uncontrolled, setUncontrolled] = useState(defaultLocked)
  const on = locked ?? uncontrolled
  const moving = motionOn && !reduced
  const painted = {
    background: on ? lockedColor : unlockedColor,
    ...style,
  } as CSSProperties

  return (
    <button
      {...props}
      ref={ref}
      aria-label={props["aria-label"] ?? (on ? "已锁定" : "未锁定")}
      aria-pressed={on}
      className={cn("inline-flex size-16 cursor-pointer items-start justify-center rounded-full border-0 pt-3 pl-1", className)}
      data-locked={on ? "true" : "false"}
      data-motion={moving ? "on" : "off"}
      data-reduced={reduced ? "true" : "false"}
      data-slot="lock-toggle"
      onClick={(event) => {
        props.onClick?.(event)
        if (event.defaultPrevented) return
        const next = !on
        if (locked === undefined) setUncontrolled(next)
        onLockedChange?.(next)
      }}
      style={painted}
      type={type}
    >
      <style>
        {`[data-slot="lock-toggle"] .lock-shackle{stroke:#fff;stroke-width:4;stroke-linecap:round;stroke-linejoin:round;fill:none;stroke-dasharray:36}
[data-slot="lock-toggle"] .lock-body{fill:#fff;transform:rotate(8deg);transform-origin:14px 20px}
[data-slot="lock-toggle"] .lock-bling{stroke:#fff;stroke-width:2.5;stroke-linecap:round;fill:none;stroke-dasharray:3;stroke-dashoffset:15}
[data-slot="lock-toggle"][data-locked="true"] .lock-shackle{stroke-dasharray:48}
[data-slot="lock-toggle"][data-locked="true"] .lock-body{transform:rotate(0deg);transform-origin:14px 22px}
[data-slot="lock-toggle"][data-motion="on"] .lock-shackle,[data-slot="lock-toggle"][data-motion="on"] .lock-body,[data-slot="lock-toggle"][data-motion="on"] .lock-bling{transition:all .3s ease}
[data-slot="lock-toggle"][data-motion="on"][data-locked="true"] .lock-shackle{animation:lock-toggle-lift .3s linear forwards}
[data-slot="lock-toggle"][data-motion="on"][data-locked="true"] .lock-bling{animation:lock-toggle-bling .3s linear .2s forwards}
@keyframes lock-toggle-lift{50%{transform:translateY(1px)}}
@keyframes lock-toggle-bling{50%{stroke-dashoffset:12}100%{stroke-dashoffset:9}}`}
      </style>
      <svg aria-hidden="true" height="40" viewBox="0 0 36 40" width="36">
        <path className="lock-body" d="M27 27C27 34.1797 21.1797 40 14 40C6.8203 40 1 34.1797 1 27C1 19.8203 6.8203 14 14 14C21.1797 14 27 19.8203 27 27ZM15.6298 26.5191C16.4544 25.9845 17 25.056 17 24C17 22.3431 15.6569 21 14 21C12.3431 21 11 22.3431 11 24C11 25.056 11.5456 25.9845 12.3702 26.5191L11 32H17L15.6298 26.5191Z" />
        <path className="lock-shackle" d="M6 21V10C6 5.58172 9.58172 2 14 2V2C18.4183 2 22 5.58172 22 10V21" />
        <path className="lock-bling" d="M29 20L31 22" />
        <path className="lock-bling" d="M31.5 15H34.5" />
        <path className="lock-bling" d="M29 10L31 8" />
      </svg>
    </button>
  )
}
