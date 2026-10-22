"use client"

// Ported from Uiverse galaxy（MIT，(c) 2023 Uiverse.io, author Admin12121）— https://github.com/uiverse-io/galaxy/blob/main/Buttons/Admin12121_cold-dodo-65.html. Modified for effect-ui.

import { useRef, type ButtonHTMLAttributes, type CSSProperties } from "react"

import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export interface PrinterIconButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "color"> {
  label?: string
  color?: string
}

export function PrinterIconButton({ label = "打印", color = "var(--foreground)", className, style, ...props }: PrinterIconButtonProps) {
  const ref = useRef<HTMLButtonElement>(null)
  const reduced = usePrefersReducedMotion()
  const motionOn = useAnimationActive(ref)
  const moving = motionOn && !reduced
  const painted = { "--printer-border": color, "--printer-paper": "#fff", ...style } as CSSProperties

  return (
    <button
      {...props}
      ref={ref}
      aria-label={label}
      className={cn("inline-flex cursor-pointer items-center justify-center border-0 bg-transparent p-2", className)}
      data-motion={moving ? "on" : "off"}
      data-reduced={reduced ? "true" : "false"}
      data-slot="printer-icon-button"
      style={painted}
      type="button"
    >
      <style>
        {`[data-slot="printer-icon-button"] [data-part="body"]{width:32px;height:18px;position:relative;--state:paused}
[data-slot="printer-icon-button"][data-motion="on"]:hover [data-part="body"]{--state:running}
[data-slot="printer-icon-button"] [data-part="body"]::before,[data-slot="printer-icon-button"] [data-part="body"]::after{content:"";position:absolute;box-shadow:inset 0 0 0 2px var(--printer-border);background:var(--printer-paper)}
[data-slot="printer-icon-button"] [data-part="body"]::before{left:0;right:0;bottom:0;height:14px;border-radius:3px;z-index:2}
[data-slot="printer-icon-button"] [data-part="body"]::after{width:26px;height:6px;top:0;left:3px;border-radius:3px 3px 0 0}
[data-slot="printer-icon-button"] [data-part="paper"]{position:absolute;z-index:1;width:18px;height:20px;border-radius:2px;box-shadow:inset 0 0 0 2px var(--printer-border);background:var(--printer-paper);left:7px;bottom:10px;display:flex;justify-content:center;transform:perspective(40px) translateY(0) rotateX(4deg) translateZ(0);animation:printer-icon-button-paper 1.2s ease infinite;animation-play-state:var(--state,paused)}
[data-slot="printer-icon-button"] [data-part="out"]{position:absolute;z-index:1;width:18px;height:20px;border-radius:2px;box-shadow:inset 0 0 0 2px var(--printer-border);background:var(--printer-paper);left:7px;bottom:0;transform:perspective(40px) rotateX(40deg) translateY(-12px) translateZ(6px);animation:printer-icon-button-paper-out 1.2s ease infinite;animation-play-state:var(--state,paused)}
[data-slot="printer-icon-button"] [data-part="out"]::before{content:"";position:absolute;left:3px;top:4px;right:3px;height:2px;border-radius:1px;opacity:.5;background:var(--printer-border);box-shadow:0 3px 0 var(--printer-border),0 6px 0 var(--printer-border)}
@keyframes printer-icon-button-paper{50%{transform:translateY(10px) translateZ(0)}}
@keyframes printer-icon-button-paper-out{50%{transform:perspective(40px) rotateX(30deg) translateY(-4px) translateZ(6px)}}`}
      </style>
      <span className="sr-only">{label}</span>
      <span aria-hidden="true" className="relative block" data-part="body">
        <span className="absolute bottom-1 left-1 z-[4] h-0.5 w-6 rounded-sm bg-[var(--printer-border)] before:absolute before:top-[-5px] before:right-0 before:h-0.5 before:w-0.5 before:rounded-sm before:bg-[var(--printer-border)] before:content-[''] after:absolute after:top-[-5px] after:right-[3px] after:h-0.5 after:w-1 after:rounded-sm after:bg-[var(--printer-border)] after:content-['']" />
        <span data-part="paper">
          <svg aria-hidden="true" className="mt-1 block size-2" viewBox="0 0 8 8">
            <path
              d="M6.28951 1.3867C6.91292 0.809799 7.00842 0 7.00842 0C7.00842 0 6.45246 0.602112 5.54326 0.602112C4.82505 0.602112 4.27655 0.596787 4.07703 0.595012L3.99644 0.594302C1.94904 0.594302 0.290039 2.25224 0.290039 4.29715C0.290039 6.34206 1.94975 8 3.99644 8C6.04312 8 7.70284 6.34206 7.70284 4.29715C7.70347 3.73662 7.57647 3.18331 7.33147 2.67916C7.08647 2.17502 6.7299 1.73327 6.2888 1.38741L6.28951 1.3867ZM3.99679 6.532C2.76133 6.532 1.75875 5.53084 1.75875 4.29609C1.75875 3.06133 2.76097 2.06018 3.99679 2.06018C4.06423 2.06014 4.13163 2.06311 4.1988 2.06905L4.2414 2.07367C4.25028 2.07438 4.26057 2.0758 4.27406 2.07651C4.81533 2.1436 5.31342 2.40616 5.67465 2.81479C6.03589 3.22342 6.23536 3.74997 6.23554 4.29538C6.23554 5.53084 5.23439 6.532 3.9975 6.532H3.99679Z"
              fill="#0077FF"
            />
            <path
              d="M6.756 1.82386C6.19293 2.09 5.58359 2.24445 4.96173 2.27864C4.74513 2.17453 4.51296 2.10653 4.27441 2.07734C4.4718 2.09225 5.16906 2.07947 5.90892 1.66374C6.04642 1.58672 6.1743 1.49364 6.28986 1.38647C6.45751 1.51849 6.61346 1.6647 6.756 1.8235V1.82386Z"
              fill="#0055BB"
            />
          </svg>
        </span>
        <span className="pointer-events-none absolute top-[13px] left-0 z-[3] h-6 w-8 overflow-hidden">
          <span data-part="out" />
        </span>
      </span>
    </button>
  )
}
