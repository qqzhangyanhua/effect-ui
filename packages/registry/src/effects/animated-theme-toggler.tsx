"use client"

import type { MouseEvent } from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export interface AnimatedThemeTogglerProps {
  className?: string
  duration?: number
}

function AnimatedThemeToggler({ className, duration = 500 }: AnimatedThemeTogglerProps) {
  const { resolvedTheme, setTheme } = useTheme()

  const toggle = async (event: MouseEvent<HTMLButtonElement>) => {
    const next = resolvedTheme === "dark" ? "light" : "dark"
    const origin = event.currentTarget.getBoundingClientRect()
    const x = origin.left + origin.width / 2
    const y = origin.top + origin.height / 2
    const radius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y),
    )

    const apply = () => setTheme(next)
    const doc = document as Document & {
      startViewTransition?: (cb: () => void) => { ready: Promise<void> }
    }

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    if (reduceMotion || !doc.startViewTransition) {
      apply()
      return
    }

    const transition = doc.startViewTransition(apply)
    await transition.ready
    document.documentElement.animate(
      {
        clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`],
      },
      {
        duration,
        easing: "ease-out",
        pseudoElement: "::view-transition-new(root)",
      },
    )
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      aria-label="切换主题"
      className={cn(className)}
      onClick={(event) => void toggle(event)}
    >
      <Sun className="size-4 dark:hidden" />
      <Moon className="hidden size-4 dark:block" />
    </Button>
  )
}

export { AnimatedThemeToggler }
