"use client"

import { useId, useState, type CSSProperties, type ReactNode } from "react"

import { Button } from "@effect-ui/registry/ui/button"
import { cn } from "@/lib/utils"

type PreviewTheme = "site" | "light" | "dark"
type PreviewPattern = "none" | "grid" | "checker"

const themeOptions: readonly { value: PreviewTheme; label: string }[] = [
  { value: "site", label: "跟随站点" },
  { value: "light", label: "亮" },
  { value: "dark", label: "暗" },
]

const patternOptions: readonly { value: PreviewPattern; label: string }[] = [
  { value: "none", label: "无" },
  { value: "grid", label: "网格" },
  { value: "checker", label: "棋盘格" },
]

function patternStyle(pattern: PreviewPattern): CSSProperties {
  if (pattern === "grid") {
    return {
      backgroundImage:
        "linear-gradient(to right, color-mix(in oklab, var(--foreground) 16%, transparent) 1px, transparent 1px), linear-gradient(to bottom, color-mix(in oklab, var(--foreground) 16%, transparent) 1px, transparent 1px)",
      backgroundSize: "20px 20px",
    }
  }
  if (pattern === "checker") {
    return {
      backgroundImage:
        "repeating-conic-gradient(color-mix(in oklab, var(--foreground) 12%, transparent) 0% 25%, transparent 0% 50%)",
      backgroundSize: "20px 20px",
    }
  }
  return {
    backgroundImage:
      "radial-gradient(circle at top, color-mix(in oklab, var(--primary) 8%, transparent), transparent 46%)",
  }
}

function PreviewFrame({ children, className }: { children: ReactNode; className?: string }) {
  const [theme, setTheme] = useState<PreviewTheme>("site")
  const [pattern, setPattern] = useState<PreviewPattern>("none")
  const [replayKey, setReplayKey] = useState(0)
  const themeLabel = themeOptions.find((option) => option.value === theme)?.label ?? "跟随站点"
  const patternLabel = patternOptions.find((option) => option.value === pattern)?.label ?? "无"

  return (
    <section
      aria-label={`组件预览，主题 ${themeLabel}，底纹 ${patternLabel}`}
      className={cn(
        "flex min-h-64 flex-col gap-4 rounded-xl border bg-background p-4 text-foreground",
        theme === "dark" && "dark",
        theme === "light" && "theme-light",
        className,
      )}
      style={{
        ...patternStyle(pattern),
        colorScheme: theme === "light" ? "light" : theme === "dark" ? "dark" : undefined,
      }}
    >
      <div className="flex flex-wrap items-center justify-end gap-3">
        <Button type="button" variant="outline" size="sm" onClick={() => setReplayKey((key) => key + 1)}>
          重放
        </Button>
        <ChoiceGroup label="预览主题" value={theme} options={themeOptions} onChange={setTheme} />
        <ChoiceGroup label="预览底纹" value={pattern} options={patternOptions} onChange={setPattern} />
      </div>
      <div key={replayKey} className="flex flex-1 items-center justify-center">
        {children}
      </div>
    </section>
  )
}

function ChoiceGroup<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: T
  options: readonly { value: T; label: string }[]
  onChange: (value: T) => void
}) {
  const name = useId()
  return (
    <fieldset className="flex flex-wrap items-center gap-2">
      <legend className="sr-only">{label}</legend>
      {options.map((option) => (
        <label key={option.value} className="flex items-center gap-1 text-xs">
          <input
            type="radio"
            name={name}
            checked={value === option.value}
            onChange={() => onChange(option.value)}
          />
          {option.label}
        </label>
      ))}
    </fieldset>
  )
}

export { PreviewFrame }
