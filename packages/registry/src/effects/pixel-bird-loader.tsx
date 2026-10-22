"use client"

// Ported from Uiverse galaxy（MIT，(c) 2023 Uiverse.io, author Subaashbala）— https://github.com/uiverse-io/galaxy/blob/main/loaders/Subaashbala_tender-baboon-47.html. Modified for effect-ui.

import { useRef, type HTMLAttributes } from "react"

import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export interface PixelBirdLoaderProps extends HTMLAttributes<HTMLDivElement> {
  size?: number
  speed?: number
}

const pipe = "linear-gradient(to right, #9de558 0px, #9de558 3px, #e7ff8d 3px, #e7ff8d 5px, #9de858 5px, #9de858 10px, #74c029 10px, #74c029 13px, #9de558 13px, #9de558 15px, #74c029 22px, #74c029 28px, #59811a 28px, #59811a 100%)"
const lip = "linear-gradient(to right, #9de558 0px, #9de558 3px, #e7ff8d 3px, #e7ff8d 5px, #9de858 5px, #9de858 10px, #74c029 10px, #74c029 13px, #9de558 13px, #9de558 15px, #74c029 22px, #74c029 28px, #59811a 28px, #59811a 100%)"

const keyframes = `
@keyframes pixel-bird-loader-flap {
  from { transform: translate(-80%, -50%); }
  25% { transform: translate(-80%, -50%) rotate(-15deg); }
  50% { transform: translate(-80%, -12%) rotate(5deg); }
  100% { transform: translate(-80%, -50%); }
}
@keyframes pixel-bird-loader-flow {
  from { transform: translate(0, -43%); }
  to { transform: translate(-50%, -43%); }
}
@keyframes pixel-bird-loader-flow-bottom {
  from { transform: translate(0, 75%) rotateX(180deg); }
  to { transform: translate(-50%, 75%) rotateX(180deg); }
}
`

const obstacles = [
  { className: "relative" },
  { className: "relative left-[15%] translate-y-[15%]" },
  { className: "relative left-[30%] translate-y-[18%]" },
  { className: "relative left-[45%] translate-y-[15%]" },
]

function Pipes({ flipped }: { flipped?: boolean }) {
  return (
    <div className={cn("relative flex w-[20em]", flipped ? "bottom-[-25%] left-0" : "top-[-23%]")}>
      {obstacles.map((item, index) => (
        <span
          key={index}
          aria-hidden
          className={cn("relative h-[8em] w-[2em] border border-solid", item.className)}
          style={{ background: pipe }}
        >
          <span aria-hidden className="absolute top-full left-1/2 h-[1.25em] w-[135%] -translate-x-1/2 border border-solid" style={{ background: lip }} />
        </span>
      ))}
    </div>
  )
}

function PixelBird() {
  return (
    <svg aria-hidden fill="none" height="81" viewBox="0 0 115 81" width="115" xmlns="http://www.w3.org/2000/svg">
      <rect fill="#FFEB3B" height="7" width="20" x="41" y="47" />
      <rect fill="#FFC107" height="7" width="33" x="35" y="67" />
      <rect fill="#FFC107" height="14" width="40" x="21" y="54" />
      <rect fill="#FFEB3B" height="7" width="20" x="48" y="40" />
      <rect fill="#FFEB3B" height="7" width="20" x="48" y="33" />
      <rect fill="#FFEB3B" height="7" width="20" x="41" y="27" />
      <rect fill="#FFEB3B" height="7" width="20" x="34" y="20" />
      <rect fill="#FFEB3B" height="7" width="20" x="28" y="14" />
      <rect fill="#FFEB3B" height="7" width="21" x="40" y="7" />
      <rect fill="black" height="13" width="7" x="41" y="34" />
      <rect fill="black" height="7" width="7" x="21" y="14" />
      <rect fill="black" height="7" width="40" x="41" />
      <rect fill="black" height="7" width="13" x="28" y="7" />
      <rect fill="#FFFFCC" height="27" width="34" x="7" y="27" />
      <rect fill="white" height="28" width="34" x="61" y="12" />
      <rect fill="black" height="7" width="27" x="7" y="20" />
      <rect fill="black" height="7" width="7" x="34" y="27" />
      <rect fill="#FFEB3B" height="7" width="7" x="7" y="40" />
      <rect fill="#FFEB3B" height="7" width="7" x="34" y="40" />
      <rect fill="#FFEB3B" height="7" width="7" x="48" y="14" />
      <rect fill="black" height="7" width="7" x="7" y="47" />
      <rect fill="#FFEB3B" height="7" width="20" x="14" y="47" />
      <rect fill="black" height="7" transform="rotate(-90 0 47)" width="20" y="47" />
      <rect fill="black" height="7" width="7" x="34" y="47" />
      <rect fill="black" height="7" width="7" x="88" y="13" />
      <rect fill="black" height="7" width="7" x="81" y="6" />
      <rect fill="black" height="7" transform="rotate(-90 95 40)" width="20" x="95" y="40" />
      <rect fill="black" height="7" transform="rotate(-90 81 33)" width="13" x="81" y="33" />
      <rect fill="white" height="7" transform="rotate(-180 81 13)" width="13" x="81" y="13" />
      <rect fill="black" height="7" width="7" x="61" y="33" />
      <rect fill="black" height="7" width="7" x="61" y="6" />
      <rect fill="black" height="7" transform="rotate(-90 54 33)" width="20" x="54" y="33" />
      <rect fill="black" height="7" width="7" x="14" y="60" />
      <rect fill="black" height="7" width="14" x="21" y="67" />
      <rect fill="black" height="7" width="33" x="35" y="74" />
      <rect fill="black" height="7" width="20" x="14" y="54" />
      <rect fill="black" height="7" width="7" x="108" y="47" />
      <rect fill="black" height="7" width="33" x="68" y="53" />
      <rect fill="#F44336" height="7" width="40" x="68" y="46" />
      <rect fill="#F44336" height="7" width="40" x="65" y="60" />
      <rect fill="black" height="7" transform="rotate(-90 101 67)" width="14" x="101" y="67" />
      <rect fill="black" height="7" width="7" x="61" y="46" />
      <rect fill="black" height="7" width="40" x="68" y="40" />
      <rect fill="black" height="7" width="33" x="68" y="67" />
      <rect fill="black" height="7" width="7" x="54" y="53" />
      <rect fill="#F44336" height="7" width="7" x="61" y="53" />
      <rect fill="black" height="7" width="7" x="61" y="60" />
    </svg>
  )
}

export function PixelBirdLoader({ size = 288, speed = 1, className, ...props }: PixelBirdLoaderProps) {
  const ref = useRef<HTMLDivElement>(null)
  const reduced = usePrefersReducedMotion()
  const motionOn = useAnimationActive(ref)
  const active = !reduced && motionOn
  const rate = Math.max(0.2, speed)
  const flap = 0.5 / rate
  const flow = 5 / rate

  return (
    <div
      {...props}
      ref={ref}
      aria-label="加载中"
      className={cn("relative overflow-hidden rounded-full", className)}
      data-motion={active ? "on" : "off"}
      data-reduced={reduced ? "true" : "false"}
      data-slot="pixel-bird-loader"
      role="status"
      style={{ width: size, height: size, fontSize: size / 18, background: "linear-gradient(to bottom, #6ccee7 60%, white)" }}
    >
      <style>{keyframes}</style>
      <div
        className="absolute top-1/2 left-1/2 h-auto w-[3em]"
        data-part="bird"
        style={{
          animation: active ? `pixel-bird-loader-flap ${flap}s linear infinite` : "none",
          transform: active ? undefined : "translate(-80%, -50%) rotate(-15deg)",
        }}
      >
        <PixelBird />
      </div>
      <div
        className="flex w-fit"
        data-part="pipes-top"
        style={{
          animation: active ? `pixel-bird-loader-flow ${flow}s linear infinite` : "none",
          transform: active ? undefined : "translate(0, -43%)",
        }}
      >
        <Pipes />
        <Pipes />
      </div>
      <div
        className="flex w-fit"
        data-part="pipes-bottom"
        style={{
          animation: active ? `pixel-bird-loader-flow-bottom ${flow}s linear infinite` : "none",
          transform: active ? undefined : "translate(0, 75%) rotateX(180deg)",
        }}
      >
        <Pipes flipped />
        <Pipes flipped />
      </div>
    </div>
  )
}
