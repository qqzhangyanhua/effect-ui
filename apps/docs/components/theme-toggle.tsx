"use client"

import { useSyncExternalStore } from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

import { cn } from "@/lib/utils"

const emptySubscribe = () => () => {}

function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  )

  if (!mounted) {
    return (
      <div className="flex items-center gap-1 text-muted-foreground p-1">
        <Sun className="size-4 opacity-50" />
        <Moon className="size-4 opacity-50" />
      </div>
    )
  }

  return (
    <div className="flex items-center gap-0.5 rounded-full border border-border/60 bg-muted/20 p-0.5 text-muted-foreground">
      <button
        type="button"
        onClick={() => setTheme("light")}
        className={cn(
          "rounded-full p-1.5 transition-all",
          resolvedTheme === "light"
            ? "bg-background text-foreground shadow-xs"
            : "text-muted-foreground/70 hover:text-foreground"
        )}
        aria-label="切换至浅色模式"
      >
        <Sun className="size-3.5" />
      </button>
      <button
        type="button"
        onClick={() => setTheme("dark")}
        className={cn(
          "rounded-full p-1.5 transition-all",
          resolvedTheme === "dark"
            ? "bg-background text-foreground shadow-xs"
            : "text-muted-foreground/70 hover:text-foreground"
        )}
        aria-label="切换至深色模式"
      >
        <Moon className="size-3.5" />
      </button>
    </div>
  )
}

export { ThemeToggle }
