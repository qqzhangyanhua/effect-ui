"use client"

// Ported from Uiverse.io (MIT), author Lakshay-art — https://github.com/uiverse-io/galaxy/blob/main/Cards/Lakshay-art_shy-puma-30.html. Modified for effect-ui.

import { useRef, type CSSProperties, type HTMLAttributes } from "react"

import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export interface PropellerOrbProps extends HTMLAttributes<HTMLDivElement> {
  /** 圆球直径，单位像素。 */
  size?: number
  /** 螺旋桨转一圈的秒数。悬停时按源站比例加快。 */
  speed?: number
  /** 径向、机翼和桨叶用色。不传时使用源站色板。 */
  colors?: string[]
}

export function PropellerOrb({
  size = 200,
  speed = 1.5,
  colors,
  className,
  style,
  ...props
}: PropellerOrbProps) {
  const ref = useRef<HTMLDivElement>(null)
  const reduced = usePrefersReducedMotion()
  const motionOn = useAnimationActive(ref)
  const moving = motionOn && !reduced
  const core = colors?.[0] ?? "black"
  const mid = colors?.[1] ?? "rgb(69, 11, 11)"
  const ring = colors?.[2] ?? "red"
  const bladeA = colors?.[3] ?? "rgb(255, 179, 0)"
  const bladeB = colors?.[4] ?? "rgb(244, 205, 205)"
  const bladeC = colors?.[5] ?? "rgb(5, 56, 99)"
  const propLight = colors?.[6] ?? "#eee"
  const propShade = colors?.[7] ?? "#777"
  const fast = Math.max(speed * (0.35 / 1.5), 0.2)
  const painted = {
    width: size,
    height: size,
    "--orb": size,
    "--propeller-speed": `${Math.max(speed, 0.2)}s`,
    "--propeller-fast": `${fast}s`,
    "--blade-a": bladeA,
    "--blade-b": bladeB,
    "--blade-c": bladeC,
    "--prop-light": propLight,
    "--prop-shade": propShade,
    backgroundImage: `radial-gradient(circle, ${core} 25%, ${mid} 45%, ${ring} 46%, ${core}, ${ring})`,
    ...style,
  } as CSSProperties

  return (
    <div
      {...props}
      ref={ref}
      aria-hidden="true"
      className={cn("propeller-orb relative rounded-full", className)}
      data-motion={moving ? "on" : "off"}
      data-reduced={reduced ? "true" : "false"}
      data-slot="propeller-orb"
      style={painted}
    >
      <style>
        {`[data-slot="propeller-orb"]::before{content:"";position:absolute;height:calc(var(--orb) * .3px);width:calc(var(--orb) * 2.1px);bottom:calc(var(--orb) * -.1px);left:calc(var(--orb) * -.5px);z-index:-1;border-radius:30px 30px 70% 70%;transform-origin:50% 0%;background-image:linear-gradient(180deg,var(--blade-a) 20%,var(--blade-b),var(--blade-a) 30%,var(--blade-c) 90%)}
[data-slot="propeller-orb"]::after{content:"";position:absolute;height:calc(var(--orb) * 1.4px);width:calc(var(--orb) * .15px);top:calc(var(--orb) * -.15px);left:calc(var(--orb) * .425px);border-radius:9999px;z-index:1;background-image:linear-gradient(0deg,var(--blade-a),var(--prop-shade) 25px,var(--prop-light),var(--prop-shade) calc(100% - 25px),var(--blade-a))}
[data-slot="propeller-orb"][data-motion="on"]::before{transition:all 1s linear}
[data-slot="propeller-orb"][data-motion="on"]:hover::before{transform:rotate(20deg);left:calc(var(--orb) * -.55px)}
[data-slot="propeller-orb"][data-motion="on"]::after{animation:propeller-orb-spin var(--propeller-speed) linear infinite}
[data-slot="propeller-orb"][data-motion="on"]:hover::after{animation-duration:var(--propeller-fast)}
@keyframes propeller-orb-spin{to{transform:rotateZ(360deg)}}`}
      </style>
    </div>
  )
}
