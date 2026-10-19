"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

export interface TextAlongPathProps {
  text: string
  path?: string
  className?: string
}

const DEFAULT_PATH = "M 12 70 C 80 10, 160 130, 228 70"

function TextAlongPath({ text, path = DEFAULT_PATH, className }: TextAlongPathProps) {
  const id = React.useId().replace(/:/g, "")

  return (
    <svg viewBox="0 0 240 140" className={cn("w-full text-foreground", className)}>
      <path id={id} d={path} fill="none" stroke="currentColor" strokeOpacity="0.18" strokeWidth="1" />
      <text className="fill-current text-[14px] font-medium">
        <textPath href={`#${id}`} startOffset="0%">
          {text}
        </textPath>
      </text>
    </svg>
  )
}

export { TextAlongPath }
