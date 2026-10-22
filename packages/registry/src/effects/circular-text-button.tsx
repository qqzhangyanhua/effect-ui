"use client"

// Ported from Uiverse.io (MIT), author Creatlydev — https://github.com/uiverse-io/galaxy/blob/main/Buttons/Creatlydev_fresh-goose-83.html. Modified for effect-ui.

import { useRef, type ButtonHTMLAttributes, type CSSProperties, type MouseEvent } from "react"

import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

const ARROW =
  "M13.376 11.552l-.264-10.44-10.44-.24.024 2.28 6.96-.048L.2 12.56l1.488 1.488 9.432-9.432-.048 6.912 2.304.024z"

export interface CircularTextButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "color"> {
  /** 沿圆周拆开的文字。 */
  text: string
  href?: string
  /** 圆形底色。白字固定，避免暗色主题的 primary-foreground 变暗。 */
  color?: string
}

export function CircularTextButton({
  text,
  href,
  color = "#7808d0",
  className,
  style,
  onClick,
  type = "button",
  ...props
}: CircularTextButtonProps) {
  const ref = useRef<Element | null>(null)
  const reduced = usePrefersReducedMotion()
  const motionOn = useAnimationActive(ref)
  const moving = motionOn && !reduced
  const letters = Array.from(text)
  const step = letters.length > 0 ? 360 / letters.length : 0
  const painted = {
    "--circular-bg": color,
    "--ring-step": `${step}deg`,
    ...style,
  } as CSSProperties
  const classes = cn(
    "relative grid size-[100px] cursor-pointer place-content-center overflow-hidden rounded-full border-0 font-semibold text-white",
    reduced ? "transition-none" : "transition duration-300",
    className,
  )

  function assignRef(node: HTMLElement | null) {
    ref.current = node
  }

  function activate(event: MouseEvent<HTMLElement>) {
    onClick?.(event as MouseEvent<HTMLButtonElement>)
  }

  const inner = (
    <>
      <style>
        {`[data-slot="circular-text-button"]{background:var(--circular-bg)}
[data-slot="circular-text-button"]:hover{background:#000}
[data-slot="circular-text-button"][data-reduced="false"]:hover{transform:scale(1.05)}
[data-slot="circular-text-button"][data-motion="on"] .circular-spin{animation:circular-text-spin 8s linear infinite}
@keyframes circular-text-spin{to{rotate:360deg}}
[data-slot="circular-text-button"] .circular-letter{position:absolute;inset:7px;text-align:center;transform:rotate(calc(var(--ring-step) * var(--index)))}
[data-slot="circular-text-button"] .circular-copy{position:absolute;transform:translate(-150%,150%)}
[data-slot="circular-text-button"][data-reduced="false"]:hover .circular-icon{color:#000;transition:transform .3s ease-in-out;transform:translate(150%,-150%)}
[data-slot="circular-text-button"][data-reduced="false"]:hover .circular-copy{transition:transform .3s ease-in-out .1s;transform:translate(0,0)}`}
      </style>
      <p className="circular-spin pointer-events-none absolute inset-0 m-0 text-[10px] uppercase">
        {letters.map((letter, index) => (
          <span className="circular-letter" key={`${letter}-${index}`} style={{ "--index": index } as CSSProperties}>
            {letter === " " ? "\u00a0" : letter}
          </span>
        ))}
      </p>
      <span aria-hidden="true" className="relative flex size-10 items-center justify-center overflow-hidden rounded-full bg-white" style={{ color }}>
        <svg className="circular-icon" fill="none" viewBox="0 0 14 15" width="14">
          <path d={ARROW} fill="currentColor" />
        </svg>
        <svg className="circular-copy" fill="none" viewBox="0 0 14 15" width="14">
          <path d={ARROW} fill="currentColor" />
        </svg>
      </span>
    </>
  )

  if (href) {
    return (
      <a
        ref={assignRef}
        className={classes}
        data-motion={moving ? "on" : "off"}
        data-reduced={reduced ? "true" : "false"}
        data-slot="circular-text-button"
        href={href}
        onClick={activate}
        style={painted}
      >
        {inner}
      </a>
    )
  }

  return (
    <button
      {...props}
      ref={assignRef}
      className={classes}
      data-motion={moving ? "on" : "off"}
      data-reduced={reduced ? "true" : "false"}
      data-slot="circular-text-button"
      onClick={activate}
      style={painted}
      type={type}
    >
      {inner}
    </button>
  )
}
