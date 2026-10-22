"use client"

// Ported from daisyUI（MIT，(c) 2020 Pouya Saadeghi）— https://github.com/saadeghi/daisyui/blob/main/packages/daisyui/src/components/swap.css. Modified for effect-ui.

import { useState, type ButtonHTMLAttributes, type CSSProperties, type ReactNode } from "react"

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export interface IconSwapProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "onToggle"> {
  on: ReactNode
  off: ReactNode
  indeterminate?: ReactNode
  effect?: "rotate" | "flip"
  pressed?: boolean | "mixed"
  onPressedChange?: (pressed: boolean) => void
}

function layerStyle(visible: boolean, transform: string, reduced: boolean): CSSProperties {
  return {
    opacity: visible ? 1 : 0,
    transform,
    transition: reduced ? "none" : "transform 0.2s cubic-bezier(0, 0, 0.2, 1), opacity 0.2s cubic-bezier(0, 0, 0.2, 1)",
    backfaceVisibility: "hidden",
  }
}

export function IconSwap({
  on,
  off,
  indeterminate,
  effect = "rotate",
  pressed,
  onPressedChange,
  className,
  ...props
}: IconSwapProps) {
  const reduced = usePrefersReducedMotion()
  const [uncontrolled, setUncontrolled] = useState(false)
  const current = pressed ?? uncontrolled
  const mixed = current === "mixed"
  const onVisible = current === true
  const offVisible = current === false && !mixed

  function pose(kind: "on" | "off" | "mixed") {
    if (effect === "flip") {
      if (kind === "on") return onVisible || mixed ? "rotateY(0deg)" : "rotateY(180deg)"
      if (kind === "off") return offVisible ? "rotateY(0deg)" : "rotateY(-180deg)"
      return "rotateY(0deg)"
    }
    if (kind === "on") return onVisible ? "rotate(0deg)" : "rotate(45deg)"
    if (kind === "off") return offVisible ? "rotate(0deg)" : "rotate(-45deg)"
    return "rotate(0deg)"
  }

  return (
    <button
      {...props}
      type="button"
      aria-pressed={mixed ? "mixed" : onVisible}
      className={cn("relative inline-grid cursor-pointer place-items-center border-0 bg-transparent p-0 align-middle select-none", className)}
      data-effect={effect}
      data-reduced={reduced ? "true" : "false"}
      data-slot="icon-swap"
      data-state={mixed ? "mixed" : onVisible ? "on" : "off"}
      onClick={(event) => {
        props.onClick?.(event)
        if (event.defaultPrevented) return
        const next = current !== true
        if (pressed === undefined) setUncontrolled(next)
        onPressedChange?.(next)
      }}
      style={effect === "flip" ? { transformStyle: "preserve-3d", perspective: "20rem" } : undefined}
    >
      <span aria-hidden={!offVisible} className="col-start-1 row-start-1" data-layer="off" style={layerStyle(offVisible, pose("off"), reduced)}>
        {off}
      </span>
      <span aria-hidden={!onVisible} className="col-start-1 row-start-1" data-layer="on" style={layerStyle(onVisible, pose("on"), reduced)}>
        {on}
      </span>
      {indeterminate != null ? (
        <span aria-hidden={!mixed} className="col-start-1 row-start-1" data-layer="indeterminate" style={layerStyle(mixed, pose("mixed"), reduced)}>
          {indeterminate}
        </span>
      ) : null}
    </button>
  )
}
