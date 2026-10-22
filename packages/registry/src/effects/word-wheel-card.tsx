"use client"

// Ported from Uiverse galaxy（MIT，(c) 2023 Uiverse.io, author NotReal22）— https://github.com/uiverse-io/galaxy/blob/main/Cards/NotReal22_popular-gecko-14.html. Modified for effect-ui.

import { useRef, type HTMLAttributes, type ReactNode } from "react"

import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export interface WordWheelCardProps extends Omit<HTMLAttributes<HTMLElement>, "title"> {
  title?: ReactNode
  wordsA: readonly string[]
  wordsB: readonly string[]
}

export function WordWheelCard({ title, wordsA, wordsB, className, ...props }: WordWheelCardProps) {
  const ref = useRef<HTMLElement>(null)
  const reduced = usePrefersReducedMotion()
  const motionOn = useAnimationActive(ref)
  const moving = motionOn && !reduced

  return (
    <article
      {...props}
      ref={ref}
      className={cn("relative h-[400px] w-[300px] max-w-full overflow-hidden rounded-[30px] border-2 border-white", className)}
      data-motion={moving ? "on" : "off"}
      data-reduced={reduced ? "true" : "false"}
      data-slot="word-wheel-card"
      style={{ backgroundImage: "linear-gradient(to top, rgb(117, 117, 197), #67be96)" }}
    >
      <style>
        {`[data-slot="word-wheel-card"] [data-part="wheel"]{position:absolute;right:70px;width:400px;height:400px;border-radius:50%;opacity:.8;background-image:radial-gradient(circle at center,#8798c5,#494fa1)}
[data-slot="word-wheel-card"][data-motion="on"] [data-part="wheel"]{animation:word-wheel-card-back 1s linear backwards}
[data-slot="word-wheel-card"][data-motion="on"]:hover [data-part="wheel"]{animation:word-wheel-card-go 1s linear forwards}
[data-slot="word-wheel-card"] [data-part="words-a"],[data-slot="word-wheel-card"] [data-part="words-b"]{position:absolute;top:100px;left:200px;margin:0;padding:0;color:#fff;font-size:20px}
[data-slot="word-wheel-card"] [data-part="words-b"]{opacity:0;transition:opacity 1s ease-in}
[data-slot="word-wheel-card"] [data-part="words-a"]{transition:opacity .5s ease-in}
[data-slot="word-wheel-card"] [data-part="words-b"] li{transform:rotate(180deg);margin:30px}
[data-slot="word-wheel-card"][data-motion="on"]:hover [data-part="words-b"]{opacity:1}
[data-slot="word-wheel-card"][data-motion="on"]:hover [data-part="words-a"]{opacity:0}
@keyframes word-wheel-card-back{0%{rotate:160deg;right:-170px}50%{right:20px;rotate:75deg}100%{rotate:0deg}}
@keyframes word-wheel-card-go{0%{rotate:0deg}50%{right:20px;rotate:90deg}100%{rotate:180deg;right:-170px}}`}
      </style>
      <span
        className="absolute top-2.5 left-[60px] z-10 text-[40px] uppercase"
        data-part="title"
        style={{
          background: "linear-gradient(to bottom right, transparent, white 90%), rgb(117, 190, 117)",
          WebkitBackgroundClip: "text",
          backgroundClip: "text",
          color: "transparent",
        }}
      >
        {title}
      </span>
      <div data-part="wheel">
        <ul data-part="words-a">
          {wordsA.map((word) => (
            <li key={word} className="my-5 list-none">
              {word}
            </li>
          ))}
        </ul>
        <ul data-part="words-b">
          {wordsB.map((word) => (
            <li key={`b-${word}`} className="list-none">
              {word}
            </li>
          ))}
        </ul>
      </div>
    </article>
  )
}
