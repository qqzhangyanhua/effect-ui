"use client"

import * as React from "react"

import { Button, buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export type TearButtonProps = React.ComponentProps<typeof Button>

function slotTargetOf(asChild: boolean, children: React.ReactNode) {
  if (asChild && React.isValidElement<{ children?: React.ReactNode }>(children)) return children
  return null
}

function TearButton({
  className,
  children = "撕开",
  variant,
  size = "lg",
  asChild = false,
  onClick,
  ...props
}: TearButtonProps) {
  const [torn, setTorn] = React.useState(false)
  const slotTarget = slotTargetOf(asChild, children)
  const label = slotTarget ? slotTarget.props.children : children

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setTorn(true)
    window.setTimeout(() => setTorn(false), 900)
    onClick?.(event)
  }

  const face = (clipPath: string, tornClass: string) => (
    <span
      className={cn(
        buttonVariants({ variant }),
        "absolute inset-0 block h-full w-full overflow-hidden rounded-md border-0 px-0 py-0 shadow-none transition-none",
        torn && tornClass,
      )}
      style={{ clipPath }}
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
      asChild={slotTarget !== null}
      className={cn("relative min-w-28 bg-transparent hover:bg-transparent", className)}
      onClick={handleClick}
      {...props}
    >
      {slotTarget ? React.cloneElement(slotTarget, undefined, body) : body}
    </Button>
  )
}

export { TearButton }
