"use client"

// Ported from Uiverse galaxy（MIT，(c) 2023 Uiverse.io, author TanimMahbub）— https://github.com/uiverse-io/galaxy/blob/main/Buttons/TanimMahbub_selfish-goat-90.html. Modified for effect-ui.

import type { ButtonHTMLAttributes, CSSProperties } from "react"

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export interface RetroPressButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  color?: string
  shadowColor?: string
}

export function RetroPressButton({ color = "var(--primary)", shadowColor = "var(--foreground)", className, style, type = "button", children, ...props }: RetroPressButtonProps) {
  const reduced = usePrefersReducedMotion()
  const painted = {
    "--retro-press-color": color,
    "--retro-press-shadow": shadowColor,
    ...style,
  } as CSSProperties

  return (
    <button
      {...props}
      className={cn(
        "inline-block cursor-pointer rounded-lg px-8 py-3 font-mono text-[22px] font-semibold tracking-wide text-primary-foreground uppercase",
        "bg-(--retro-press-color) shadow-[0_0_0_3px_var(--retro-press-shadow),0_6px_0_var(--retro-press-shadow)]",
        "hover:brightness-95 active:translate-y-0.5 active:shadow-[0_0_0_3px_var(--retro-press-shadow),0_4px_0_var(--retro-press-shadow)]",
        reduced ? "transition-none" : "transition-all duration-100",
        className,
      )}
      data-reduced={reduced ? "true" : "false"}
      data-slot="retro-press-button"
      style={painted}
      type={type}
    >
      {children}
    </button>
  )
}
