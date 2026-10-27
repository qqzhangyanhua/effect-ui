import fs from "node:fs"
import os from "node:os"
import path from "node:path"

import { expect, test } from "vitest"

import { readUsageExample } from "./usage"

const heroAnnotatedShowcaseUsage = `import { HeroAnnotatedShowcase } from "@/components/ui/hero-annotated-showcase"

export function HeroAnnotatedShowcaseDemo() {
  return <HeroAnnotatedShowcase className="w-full" />
}
`

test("无参 demo 的用法代码与改写前一致", () => {
  expect(readUsageExample("hero-annotated-showcase")).toBe(heroAnnotatedShowcaseUsage)
})

test("单行带默认值的 demo 被改写成常量", () => {
  const usage = readUsageExample("shuffle-grid-hero")
  expect(usage).toMatch(/export function ShuffleGridHeroDemo\(\) \{/)
  expect(usage).toContain("const interval = 1800")
  expect(usage).toContain("interval={interval}")
  expect(usage).not.toMatch(/ShuffleGridHeroDemo\s*\(\s*\{/)
  expect(usage).not.toContain("values")
  expect(usage).not.toContain("= {}")
})

test("多行解构、类型标注和默认空对象被改写成常量", () => {
  const usage = readUsageExample("aurora-background")
  const childrenAt = usage.indexOf('const children = "极光铺在内容后面"')
  const speedAt = usage.indexOf("const speed = 1")
  const intensityAt = usage.indexOf("const intensity = 0.7")
  const colorsAt = usage.indexOf("const colors = undefined")
  const sizeAt = usage.indexOf("const size = 64")
  expect(childrenAt).toBeGreaterThan(-1)
  expect(speedAt).toBeGreaterThan(childrenAt)
  expect(intensityAt).toBeGreaterThan(speedAt)
  expect(colorsAt).toBeGreaterThan(intensityAt)
  expect(sizeAt).toBeGreaterThan(colorsAt)
  expect(usage).toContain("speed={speed}")
  expect(usage).toContain("intensity={intensity}")
  expect(usage).toContain("colors={colors}")
  expect(usage).toContain("size={size}")
  expect(usage).toContain("{children}")
  expect(usage).toMatch(/export function AuroraBackgroundDemo\(\) \{/)
  expect(usage).not.toMatch(/AuroraBackgroundDemo\s*\(\s*\{/)
  expect(usage).not.toContain("values")
  expect(usage).not.toContain("= {}")
  expect(usage).not.toContain("Partial<")
})

test("Demo 索引变化后无需重启就能读到新登记的示例", () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "effect-ui-usage-"))
  try {
    const examples = path.join(root, "examples")
    fs.mkdirSync(examples)
    fs.writeFileSync(
      path.join(examples, "fresh-demos.tsx"),
      `export function FreshDemo() {
  return (
    <div>新登记示例</div>
  )
}
`,
    )
    const indexPath = path.join(examples, "index.ts")
    const header = 'import * as freshDemos from "./fresh-demos"\n\nconst demoMap = {\n'
    fs.writeFileSync(indexPath, `${header}}\n`)
    expect(() => readUsageExample("fresh-demo", indexPath)).toThrow(/找不到 fresh-demo/)

    fs.writeFileSync(indexPath, `${header}  "fresh-demo": freshDemos.FreshDemo,\n}\n`)
    const bumped = new Date(fs.statSync(indexPath).mtimeMs + 5000)
    fs.utimesSync(indexPath, bumped, bumped)

    const usage = readUsageExample("fresh-demo", indexPath)
    expect(usage).toContain("export function FreshDemo()")
    expect(usage).toContain("新登记示例")
  } finally {
    fs.rmSync(root, { recursive: true, force: true })
  }
})
