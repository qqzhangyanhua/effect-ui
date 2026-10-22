"use client"

// Ported from Uiverse.io (MIT), author Galahhad — https://github.com/uiverse-io/galaxy/blob/main/Checkboxes/Galahhad_mighty-warthog-42.html. Modified for effect-ui.

import { useId, useRef, useState, type CSSProperties, type InputHTMLAttributes } from "react"

import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

const MARK = "M27 4v27a1 1 0 0 1-1.625.781L16 24.281l-9.375 7.5A1 1 0 0 1 5 31V4a4 4 0 0 1 4-4h14a4 4 0 0 1 4 4z"

export interface BookmarkBurstToggleProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "color" | "type"> {
  onCheckedChange?: (checked: boolean) => void
  /** 勾选后的填充色。不传时使用主色。 */
  color?: string
}

export function BookmarkBurstToggle({
  checked,
  defaultChecked = false,
  onCheckedChange,
  color = "var(--primary)",
  className,
  style,
  onChange,
  ...props
}: BookmarkBurstToggleProps) {
  const ref = useRef<HTMLLabelElement>(null)
  const reduced = usePrefersReducedMotion()
  const motionOn = useAnimationActive(ref)
  const [uncontrolled, setUncontrolled] = useState(defaultChecked)
  const on = checked ?? uncontrolled
  const moving = motionOn && !reduced
  const inputId = useId()
  const painted = {
    "--bookmark-color": color,
    ...style,
  } as CSSProperties

  return (
    <label
      ref={ref}
      className={cn("relative inline-flex cursor-pointer", className)}
      data-checked={on ? "true" : "false"}
      data-motion={moving ? "on" : "off"}
      data-reduced={reduced ? "true" : "false"}
      data-slot="bookmark-burst-toggle"
      style={painted}
    >
      <style>
        {`[data-slot="bookmark-burst-toggle"] .bookmark-mark{fill:var(--muted-foreground);transform-origin:top center}
[data-slot="bookmark-burst-toggle"]:hover .bookmark-mark{fill:var(--foreground)}
[data-slot="bookmark-burst-toggle"][data-checked="true"] .bookmark-mark{fill:var(--bookmark-color)}
[data-slot="bookmark-burst-toggle"][data-motion="on"][data-checked="true"] .bookmark-mark{animation:bookmark-burst-drop .3s forwards}
[data-slot="bookmark-burst-toggle"] .bookmark-glyph{position:relative;display:flex;width:24px;height:32px}
[data-slot="bookmark-burst-toggle"] .bookmark-glyph::before,[data-slot="bookmark-burst-toggle"] .bookmark-glyph::after{content:"";position:absolute;left:50%;top:50%;border-radius:9999px;opacity:0;pointer-events:none}
[data-slot="bookmark-burst-toggle"] .bookmark-glyph::before{border:1px solid var(--bookmark-color);transform:translate(-50%,-50%)}
[data-slot="bookmark-burst-toggle"] .bookmark-glyph::after{width:10px;height:10px;transform:translate(-50%,-50%) scale(0);box-shadow:0 30px 0 -4px var(--bookmark-color),30px 0 0 -4px var(--bookmark-color),0 -30px 0 -4px var(--bookmark-color),-30px 0 0 -4px var(--bookmark-color),-22px 22px 0 -4px var(--bookmark-color),-22px -22px 0 -4px var(--bookmark-color),22px -22px 0 -4px var(--bookmark-color),22px 22px 0 -4px var(--bookmark-color)}
[data-slot="bookmark-burst-toggle"][data-motion="on"][data-checked="true"] .bookmark-glyph::before{animation:bookmark-burst-ring .3s cubic-bezier(.175,.885,.32,1.275) .3s forwards}
[data-slot="bookmark-burst-toggle"][data-motion="on"][data-checked="true"] .bookmark-glyph::after{animation:bookmark-burst-dots .3s cubic-bezier(.175,.885,.32,1.275) .3s forwards}
@keyframes bookmark-burst-drop{50%{transform:scaleY(.6)}100%{transform:scaleY(1)}}
@keyframes bookmark-burst-ring{0%{width:0;height:0;opacity:0}90%{width:35px;height:35px;opacity:1}100%{opacity:0}}
@keyframes bookmark-burst-dots{0%{transform:translate(-50%,-50%) scale(0)}40%{opacity:1}100%{transform:translate(-50%,-50%) scale(.8);opacity:0}}`}
      </style>
      <input
        {...props}
        aria-label={props["aria-label"] ?? "收藏"}
        checked={on}
        className="sr-only"
        id={props.id ?? inputId}
        onChange={(event) => {
          onChange?.(event)
          if (event.defaultPrevented) return
          const next = event.target.checked
          if (checked === undefined) setUncontrolled(next)
          onCheckedChange?.(next)
        }}
        type="checkbox"
      />
      <span aria-hidden="true" className="bookmark-glyph">
        <svg className="bookmark-mark h-auto w-6" viewBox="0 0 32 32">
          <path d={MARK} />
        </svg>
      </span>
    </label>
  )
}
