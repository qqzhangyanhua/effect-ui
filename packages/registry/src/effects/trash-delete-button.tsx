"use client"

// Ported from Uiverse galaxy（MIT，(c) 2023 Uiverse.io, author boryanakrasteva）— https://github.com/uiverse-io/galaxy/blob/main/Buttons/boryanakrasteva_tidy-falcon-17.html. Modified for effect-ui.

import type { ButtonHTMLAttributes, CSSProperties } from "react"

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

const CSS = `
[data-slot="trash-delete-button"]::after {
  content: attr(data-tooltip);
  position: absolute;
  top: -130%;
  left: 50%;
  transform: translateX(-50%);
  width: max-content;
  border-radius: 5px;
  background: var(--trash-color);
  padding: 4px 8px;
  color: #fff;
  font-size: 12px;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.2s linear 0.2s, top 0.2s linear 0.2s;
  pointer-events: none;
}
[data-slot="trash-delete-button"][data-reduced="true"]::after {
  transition: none;
}
[data-slot="trash-delete-button"]:hover::after,
[data-slot="trash-delete-button"]:focus-visible::after {
  visibility: visible;
  opacity: 1;
  top: -160%;
}
`

export interface TrashDeleteButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** 悬停提示，同时作为按钮的无障碍名称。 */
  tooltip?: string
  /** 悬停时的图标色。不传时使用危险色。 */
  color?: string
}

export function TrashDeleteButton({
  tooltip = "删除",
  color = "var(--destructive)",
  className,
  style,
  type = "button",
  ...props
}: TrashDeleteButtonProps) {
  const reduced = usePrefersReducedMotion()
  const painted = { "--trash-color": color, ...style } as CSSProperties

  return (
    <button
      {...props}
      aria-label={props["aria-label"] ?? tooltip}
      className={cn("group relative cursor-pointer border-0 bg-transparent p-2 text-foreground", className)}
      data-reduced={reduced ? "true" : "false"}
      data-slot="trash-delete-button"
      data-tooltip={tooltip}
      style={painted}
      type={type}
    >
      <style>{CSS}</style>
      <svg
        aria-hidden="true"
        className={cn("size-5 fill-current group-hover:fill-(--trash-color)", reduced ? "transition-none" : "transition duration-200 group-hover:scale-150")}
        viewBox="0 0 15 17.5"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path transform="translate(-2.5 -1.25)" d="M15,18.75H5A1.251,1.251,0,0,1,3.75,17.5V5H2.5V3.75h15V5H16.25V17.5A1.251,1.251,0,0,1,15,18.75ZM5,5V17.5H15V5Zm7.5,10H11.25V7.5H12.5V15ZM8.75,15H7.5V7.5H8.75V15ZM12.5,2.5h-5V1.25h5V2.5Z" />
      </svg>
    </button>
  )
}
