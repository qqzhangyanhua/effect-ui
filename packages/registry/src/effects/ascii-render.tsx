"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

export interface AsciiRenderProps {
  src: string
  className?: string
  charset?: string
}

const DEFAULT_CHARS = " .:-=+*#%@"

function AsciiRender({ src, className, charset = DEFAULT_CHARS }: AsciiRenderProps) {
  const preRef = React.useRef<HTMLPreElement>(null)

  React.useEffect(() => {
    const img = new Image()
    img.crossOrigin = "anonymous"
    img.src = src
    img.onload = () => {
      const canvas = document.createElement("canvas")
      const cols = 56
      const scale = cols / img.width
      const rows = Math.max(8, Math.floor(img.height * scale * 0.46))
      canvas.width = cols
      canvas.height = rows
      const ctx = canvas.getContext("2d")
      if (!ctx || !preRef.current) return
      ctx.drawImage(img, 0, 0, cols, rows)
      const data = ctx.getImageData(0, 0, cols, rows).data
      let out = ""
      for (let y = 0; y < rows; y += 1) {
        for (let x = 0; x < cols; x += 1) {
          const i = (y * cols + x) * 4
          const lum = ((data[i] ?? 0) * 0.3 + (data[i + 1] ?? 0) * 0.59 + (data[i + 2] ?? 0) * 0.11) / 255
          out += charset[Math.min(charset.length - 1, Math.floor(lum * (charset.length - 1)))] ?? " "
        }
        out += "\n"
      }
      preRef.current.textContent = out
    }
  }, [charset, src])

  return (
    <pre
      ref={preRef}
      className={cn(
        "overflow-auto rounded-xl border bg-zinc-950 p-3 font-mono text-[7px] leading-[7px] text-emerald-300",
        className,
      )}
    >
      加载 ASCII…
    </pre>
  )
}

export { AsciiRender }
