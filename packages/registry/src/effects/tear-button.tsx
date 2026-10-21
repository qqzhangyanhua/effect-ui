"use client"

import * as React from "react"

import { Button, buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export type TearButtonProps = React.ComponentProps<typeof Button> & {
  /** 撕开时长，毫秒。不传或 700 仍是 0.7s。 */
  duration?: number
  /** 复位等待，毫秒。不传或 900 仍等 900。 */
  delay?: number
}

function TearButton({
  className,
  children = "撕开",
  duration,
  delay,
  variant,
  size,
  asChild = false,
  onClick,
  ...props
}: TearButtonProps) {
  const [torn, setTorn] = React.useState(false)
  const slotted =
    asChild && React.isValidElement<{ children?: React.ReactNode }>(children) ? children : null
  const label = slotted ? slotted.props.children : children
  const timed = duration === undefined || duration === 700
  const ms = timed ? 700 : duration
  const waited = delay === undefined || delay === 900
  const wait = waited ? 900 : delay

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    onClick?.(event)
    // 撕开半边在减弱动效下是 opacity 0，而占位标签是 invisible。进入 torn 会把文字整段藏掉。
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
    setTorn(true)
    window.setTimeout(() => setTorn(false), wait)
  }

  const face = (clipPath: string, tornClass: string) => (
    <span
      className={cn(
        variant == null ? "bg-primary text-primary-foreground" : buttonVariants({ variant }),
        "absolute inset-0 block h-full w-full overflow-hidden rounded-md border-0 px-0 py-0 shadow-none transition-none",
        torn && tornClass,
      )}
      style={timed ? { clipPath } : { clipPath, animationDuration: `${ms}ms` }}
    >
      <span className="flex h-full items-center justify-center">{label}</span>
    </span>
  )

  const body = (
    <>
      {face(
        "inset(0 50% 0 0)",
        "animate-[tear-left_0.7s_ease-in_forwards] motion-reduce:animate-none motion-reduce:opacity-0",
      )}
      {face(
        "inset(0 0 0 50%)",
        "animate-[tear-right_0.7s_ease-in_forwards] motion-reduce:animate-none motion-reduce:opacity-0",
      )}
      <span className="invisible">{label}</span>
    </>
  )

  return (
    <Button
      type="button"
      // Button 在 props 之前写入 data-slot="button"；这个组件原先没有 data-slot。
      data-slot={undefined}
      variant={variant}
      size={size}
      asChild={slotted !== null}
      className={cn(
        "relative min-w-28 bg-transparent hover:bg-transparent",
        size == null && "h-10 px-0",
        className,
      )}
      onClick={handleClick}
      {...props}
    >
      {slotted ? React.cloneElement(slotted, undefined, body) : body}
    </Button>
  )
}

export { TearButton }
