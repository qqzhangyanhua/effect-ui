"use client"

// Ported from Cult UI (MIT, (c) 2023 Jordan-Gilliam) — https://github.com/nolly-studio/cult-ui/blob/main/apps/www/registry/default/ui/neumorph-button.tsx. Modified for effect-ui.

import { useRef, type ButtonHTMLAttributes, type ReactNode } from "react"
import { cva } from "class-variance-authority"
import { Loader2 } from "lucide-react"

import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center px-4 text-sm font-medium transition-[box-shadow,background-color] disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      intent: {
        default:
          "bg-[#36322F] text-white hover:enabled:bg-[#4a4542] active:bg-[#2A2724] [box-shadow:inset_0px_-2.108433723449707px_0px_0px_#171310,_0px_1.2048193216323853px_6.325301647186279px_0px_rgba(58,_33,_8,_58%)]",
        primary:
          "bg-[#2C7BE5] text-white hover:enabled:bg-[#3D8DF5] active:bg-[#1A68D1] [box-shadow:inset_0px_-2.108433723449707px_0px_0px_#1A68D1,_0px_1.2048193216323853px_6.325301647186279px_0px_rgba(28,_100,_242,_58%)]",
        secondary:
          "border border-[#E0E0E0] bg-white text-[#36322F] hover:enabled:bg-[#F8F8F8] active:bg-[#F0F0F0] [box-shadow:inset_0px_-2.108433723449707px_0px_0px_#E0E0E0,_0px_1.2048193216323853px_6.325301647186279px_0px_rgba(0,_0,_0,_10%)]",
        danger:
          "bg-[#E6492D] text-white hover:enabled:bg-[#F05B41] active:bg-[#D63A1F] [box-shadow:inset_0px_-2.108433723449707px_0px_0px_#D63A1F,_0px_1.2048193216323853px_6.325301647186279px_0px_rgba(214,_58,_31,_58%)]",
      },
      buttonSize: {
        small: "h-11 rounded-[8px] px-2 text-xs",
        medium: "h-11 rounded-[9px] px-4 text-base uppercase",
        large: "h-14 rounded-[11px] px-6 text-lg",
      },
      fullWidth: { true: "w-full", false: "" },
    },
    defaultVariants: { intent: "default", buttonSize: "medium", fullWidth: false },
  },
)

export interface NeumorphButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> {
  children: ReactNode
  intent?: "default" | "primary" | "secondary" | "danger"
  buttonSize?: "small" | "medium" | "large"
  fullWidth?: boolean
  loading?: boolean
}

export function NeumorphButton({
  className,
  intent = "default",
  buttonSize = "medium",
  fullWidth = false,
  children,
  loading = false,
  disabled,
  ...props
}: NeumorphButtonProps) {
  const ref = useRef<HTMLButtonElement>(null)
  const reduced = usePrefersReducedMotion()
  const motionOn = useAnimationActive(ref)
  const moving = motionOn && !reduced
  return (
    <button
      {...props}
      ref={ref}
      className={cn(buttonVariants({ intent, buttonSize, fullWidth }), className)}
      data-motion={moving ? "on" : "off"}
      data-reduced={reduced ? "true" : "false"}
      data-slot="neumorph-button"
      disabled={disabled || loading}
      type="button"
    >
      <style>
        {`@keyframes neumorph-button-spin { to { transform: rotate(360deg); } }
[data-slot="neumorph-button"][data-motion="on"] [data-part="spinner"] { animation: neumorph-button-spin 0.8s linear infinite; }
[data-slot="neumorph-button"][data-motion="on"]:hover { transform: scale(1.02); }
[data-slot="neumorph-button"][data-motion="on"]:active { transform: scale(0.98); }
[data-slot="neumorph-button"] { transition: transform 180ms cubic-bezier(0.2, 0.8, 0.2, 1); }`}
      </style>
      {loading ? <Loader2 aria-hidden className="mr-2 size-4" data-part="spinner" /> : null}
      <span style={{ opacity: loading ? 0.7 : 1 }}>{children}</span>
    </button>
  )
}
