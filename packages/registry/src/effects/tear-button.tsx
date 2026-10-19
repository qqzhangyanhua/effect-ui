"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

export type TearButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement>

function TearButton({ className, children = "撕开", onClick, ...props }: TearButtonProps) {
  const [torn, setTorn] = React.useState(false)

  return (
    <button
      type="button"
      className={cn("relative inline-flex h-10 min-w-28 items-center justify-center text-sm font-medium", className)}
      onClick={(event) => {
        setTorn(true)
        window.setTimeout(() => setTorn(false), 900)
        onClick?.(event)
      }}
      {...props}
    >
      <span
        className={cn(
          "absolute inset-0 overflow-hidden rounded-md bg-primary text-primary-foreground",
          torn && "animate-[tear-left_0.7s_ease-in_forwards] motion-reduce:animate-none motion-reduce:opacity-0",
        )}
        style={{ clipPath: "inset(0 50% 0 0)" }}
      >
        <span className="flex h-full items-center justify-center">{children}</span>
      </span>
      <span
        className={cn(
          "absolute inset-0 overflow-hidden rounded-md bg-primary text-primary-foreground",
          torn && "animate-[tear-right_0.7s_ease-in_forwards] motion-reduce:animate-none motion-reduce:opacity-0",
        )}
        style={{ clipPath: "inset(0 0 0 50%)" }}
      >
        <span className="flex h-full items-center justify-center">{children}</span>
      </span>
      <span className="invisible">{children}</span>
    </button>
  )
}

export { TearButton }
