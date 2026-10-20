"use client"

import * as React from "react"

import { AnimatedTabs } from "@/components/ui/animated-tabs"
import { CodeBlock } from "@/components/ui/code-block"
import { QuantityStepper } from "@/components/ui/quantity-stepper"
import { cn } from "@/lib/utils"

export interface EmbedValues {
  width: number
  height: number
  unit: "px" | "%"
  radius: number
  theme: "light" | "dark"
  autoplay: boolean
}

export interface EmbedCodeGeneratorProps {
  className?: string
  template?: (values: EmbedValues) => { iframe: string; script: string }
}

function defaultTemplate(values: EmbedValues) {
  const unit = values.unit
  const style = `width:${values.width}${unit};height:${values.height}${unit};border:0;border-radius:${values.radius}px`
  const src = `https://embed.example.com/widget?theme=${values.theme}&autoplay=${values.autoplay ? 1 : 0}`
  return {
    iframe: `<iframe src="${src}" title="嵌入预览" style="${style}"></iframe>`,
    script: `<script src="https://embed.example.com/widget.js" data-theme="${values.theme}" data-width="${values.width}${unit}" data-height="${values.height}${unit}" data-radius="${values.radius}" data-autoplay="${values.autoplay}"></script>`,
  }
}

function EmbedCodeGenerator({ className, template = defaultTemplate }: EmbedCodeGeneratorProps) {
  const [unit, setUnit] = React.useState<"px" | "%">("px")
  const [width, setWidth] = React.useState(480)
  const [height, setHeight] = React.useState(270)
  const [radius, setRadius] = React.useState(16)
  const [theme, setTheme] = React.useState<"light" | "dark">("dark")
  const [autoplay, setAutoplay] = React.useState(true)
  const values = { width, height, unit, radius, theme, autoplay }
  const code = template(values)
  const max = unit === "px" ? 960 : 100

  return (
    <div data-slot="embed-code-generator" className={cn("w-full space-y-4", className)}>
      <AnimatedTabs
        value={unit}
        onValueChange={(next) => setUnit(next === "%" ? "%" : "px")}
        items={[
          { value: "px", label: "像素", content: "尺寸按像素计算。" },
          { value: "%", label: "百分比", content: "尺寸按容器百分比计算。" },
        ]}
      />
      <div className="flex flex-wrap items-center gap-4 text-sm">
        <label className="flex items-center gap-2">
          宽度
          <QuantityStepper value={Math.min(width, max)} min={10} max={max} onValueChange={setWidth} />
        </label>
        <label className="flex items-center gap-2">
          高度
          <QuantityStepper value={Math.min(height, max)} min={10} max={max} onValueChange={setHeight} />
        </label>
        <label className="flex items-center gap-2">
          圆角
          <QuantityStepper value={radius} min={0} max={48} onValueChange={setRadius} />
        </label>
        <label className="flex items-center gap-2">
          主题
          <select
            aria-label="主题"
            className="h-9 rounded-md border bg-background px-2"
            value={theme}
            onChange={(event) => setTheme(event.target.value === "light" ? "light" : "dark")}
          >
            <option value="dark">深色</option>
            <option value="light">浅色</option>
          </select>
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={autoplay} onChange={(event) => setAutoplay(event.target.checked)} />
          自动播放
        </label>
      </div>
      <div className="rounded-xl border bg-muted/40 p-4">
        <div
          data-theme={theme}
          className={cn("flex items-center justify-center border text-sm", theme === "dark" ? "bg-slate-950 text-white" : "bg-white text-slate-900")}
          style={{
            width: unit === "%" ? `${width}%` : width,
            height: unit === "%" ? undefined : height,
            aspectRatio: unit === "%" ? `${width} / ${height}` : undefined,
            borderRadius: radius,
            maxWidth: "100%",
          }}
        >
          实时预览 {width}
          {unit} × {height}
          {unit}
        </div>
      </div>
      <p className="sr-only">
        {code.iframe}
        {code.script}
      </p>
      <CodeBlock
        files={[
          { filename: "iframe.html", language: "html", code: code.iframe },
          { filename: "embed.js", language: "html", code: code.script },
        ]}
      />
    </div>
  )
}

export { EmbedCodeGenerator }
