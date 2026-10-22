"use client"

// Ported from daisyUI（MIT，(c) 2020 Pouya Saadeghi）— https://github.com/saadeghi/daisyui/blob/main/packages/daisyui/src/components/mask.css. Modified for effect-ui.

import { useSyncExternalStore, type HTMLAttributes, type ReactNode } from "react"

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export const shapeMaskShapes = ["squircle", "heart", "hexagon", "hexagon-2", "decagon", "pentagon", "diamond", "circle", "star", "star-2", "triangle"] as const

export type ShapeMaskShape = (typeof shapeMaskShapes)[number]

const masks: Record<ShapeMaskShape, string> = {
  squircle: "url(\"data:image/svg+xml,%3csvg width='200' height='200' xmlns='http://www.w3.org/2000/svg'%3e%3cpath d='M100 0C20 0 0 20 0 100s20 100 100 100 100-20 100-100S180 0 100 0Z'/%3e%3c/svg%3e\")",
  decagon: "url(\"data:image/svg+xml,%3csvg width='192' height='200' xmlns='http://www.w3.org/2000/svg'%3e%3cpath fill='black' d='m96 0 58.779 19.098 36.327 50v61.804l-36.327 50L96 200l-58.779-19.098-36.327-50V69.098l36.327-50z' fill-rule='evenodd'/%3e%3c/svg%3e\")",
  diamond: "url(\"data:image/svg+xml,%3csvg width='200' height='200' xmlns='http://www.w3.org/2000/svg'%3e%3cpath fill='black' d='m100 0 100 100-100 100L0 100z' fill-rule='evenodd'/%3e%3c/svg%3e\")",
  heart: "url(\"data:image/svg+xml,%3csvg width='200' height='185' xmlns='http://www.w3.org/2000/svg'%3e%3cpath d='M100 184.606a15.384 15.384 0 0 1-8.653-2.678C53.565 156.28 37.205 138.695 28.182 127.7 8.952 104.264-.254 80.202.005 54.146.308 24.287 24.264 0 53.406 0c21.192 0 35.869 11.937 44.416 21.879a2.884 2.884 0 0 0 4.356 0C110.725 11.927 125.402 0 146.594 0c29.142 0 53.098 24.287 53.4 54.151.26 26.061-8.956 50.122-28.176 73.554-9.023 10.994-25.383 28.58-63.165 54.228a15.384 15.384 0 0 1-8.653 2.673Z' fill='black' fill-rule='nonzero'/%3e%3c/svg%3e\")",
  hexagon: "url(\"data:image/svg+xml,%3csvg width='182' height='201' xmlns='http://www.w3.org/2000/svg'%3e%3cpath d='M.3 65.486c0-9.196 6.687-20.063 14.211-25.078l61.86-35.946c8.36-5.016 20.899-5.016 29.258 0l61.86 35.946c8.36 5.015 14.211 15.882 14.211 25.078v71.055c0 9.196-6.687 20.063-14.211 25.079l-61.86 35.945c-8.36 4.18-20.899 4.18-29.258 0L14.51 161.62C6.151 157.44.3 145.737.3 136.54V65.486Z' fill='black' fill-rule='nonzero'/%3e%3c/svg%3e\")",
  "hexagon-2": "url(\"data:image/svg+xml,%3csvg width='200' height='182' xmlns='http://www.w3.org/2000/svg'%3e%3cpath d='M64.786 181.4c-9.196 0-20.063-6.687-25.079-14.21L3.762 105.33c-5.016-8.36-5.016-20.9 0-29.259l35.945-61.86C44.723 5.851 55.59 0 64.786 0h71.055c9.196 0 20.063 6.688 25.079 14.211l35.945 61.86c4.18 8.36 4.18 20.899 0 29.258l-35.945 61.86c-4.18 8.36-15.883 14.211-25.079 14.211H64.786Z' fill='black' fill-rule='nonzero'/%3e%3c/svg%3e\")",
  circle: "url(\"data:image/svg+xml,%3csvg width='200' height='200' xmlns='http://www.w3.org/2000/svg'%3e%3ccircle fill='black' cx='100' cy='100' r='100' fill-rule='evenodd'/%3e%3c/svg%3e\")",
  pentagon: "url(\"data:image/svg+xml,%3csvg width='192' height='181' xmlns='http://www.w3.org/2000/svg'%3e%3cpath fill='black' d='m96 0 95.106 69.098-36.327 111.804H37.22L.894 69.098z' fill-rule='evenodd'/%3e%3c/svg%3e\")",
  star: "url(\"data:image/svg+xml,%3csvg width='192' height='180' xmlns='http://www.w3.org/2000/svg'%3e%3cpath fill='black' d='m96 137.263-58.779 42.024 22.163-68.389L.894 68.481l72.476-.243L96 0l22.63 68.238 72.476.243-58.49 42.417 22.163 68.389z' fill-rule='evenodd'/%3e%3c/svg%3e\")",
  "star-2": "url(\"data:image/svg+xml,%3csvg width='192' height='180' xmlns='http://www.w3.org/2000/svg'%3e%3cpath fill='black' d='m96 153.044-58.779 26.243 7.02-63.513L.894 68.481l63.117-13.01L96 0l31.989 55.472 63.117 13.01-43.347 47.292 7.02 63.513z' fill-rule='evenodd'/%3e%3c/svg%3e\")",
  triangle: "url(\"data:image/svg+xml,%3csvg width='174' height='149' xmlns='http://www.w3.org/2000/svg'%3e%3cpath fill='black' d='m87 148.476-86.603.185L43.86 74.423 87 0l43.14 74.423 43.463 74.238z' fill-rule='evenodd'/%3e%3c/svg%3e\")",
}

const halfCss = `
[data-slot="shape-mask"][data-half="1"] { mask-size: 200%; mask-position: left; }
[data-slot="shape-mask"][data-half="2"] { mask-size: 200%; mask-position: right; }
[dir="rtl"] [data-slot="shape-mask"][data-half="1"] { mask-position: right; }
[dir="rtl"] [data-slot="shape-mask"][data-half="2"] { mask-position: left; }
`

function subscribe() {
  return () => {}
}

function maskSupported() {
  return typeof CSS !== "undefined" && typeof CSS.supports === "function" && CSS.supports("mask-image", "none")
}

function useMaskSupport() {
  return useSyncExternalStore(subscribe, maskSupported, () => true)
}

export interface ShapeMaskProps extends HTMLAttributes<HTMLDivElement> {
  shape?: ShapeMaskShape
  half?: "1" | "2"
  as?: "div" | "span" | "figure"
  children?: ReactNode
}

export function ShapeMask({ shape = "squircle", half, as = "div", className, children, ...props }: ShapeMaskProps) {
  const reduced = usePrefersReducedMotion()
  const supported = useMaskSupport()
  const mask = masks[shape]
  const shared = {
    ...props,
    className: cn("inline-block overflow-hidden align-middle", className),
    "data-fallback": supported ? "false" : "true",
    "data-half": half,
    "data-reduced": reduced ? "true" : "false",
    "data-shape": shape,
    "data-slot": "shape-mask",
    style: supported
      ? {
          maskImage: mask,
          WebkitMaskImage: mask,
          maskRepeat: "no-repeat",
          WebkitMaskRepeat: "no-repeat",
          maskPosition: half ? undefined : "center",
          WebkitMaskPosition: half ? undefined : "center",
          maskSize: half ? "200%" : "contain",
          WebkitMaskSize: half ? "200%" : "contain",
        }
      : { borderRadius: shape === "circle" ? "9999px" : "1.25rem" },
  }

  const body = (
    <>
      {supported ? <style>{halfCss}</style> : null}
      {children}
    </>
  )

  if (as === "span") return <span {...shared}>{body}</span>
  if (as === "figure") return <figure {...shared}>{body}</figure>
  return <div {...shared}>{body}</div>
}
