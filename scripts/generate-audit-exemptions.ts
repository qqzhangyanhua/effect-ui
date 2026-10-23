import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

import {
  componentIsTested,
  exemptionClosedNames,
  insufficientControls,
  missingReducedMotion,
  requiresComponentTest,
  sourceFilesFor,
  testedSourceFiles,
  type AuditGap,
} from "../packages/registry/src/audit-coverage.ts"
import { components, type ComponentMeta } from "../packages/registry/src/catalog.ts"

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const registrySrc = path.join(root, "packages/registry/src")
const outFile = path.join(registrySrc, "audit-exemptions.ts")

function listFiles(dir: string, prefix = ""): string[] {
  const files: string[] = []
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const rel = prefix ? `${prefix}/${entry.name}` : entry.name
    if (entry.isDirectory()) files.push(...listFiles(path.join(dir, entry.name), rel))
    else files.push(rel)
  }
  return files
}

function readEntrySource(entry: ComponentMeta): string | undefined {
  const parts: string[] = []
  for (const file of sourceFilesFor(entry)) {
    const full = path.join(registrySrc, file)
    if (!fs.existsSync(full)) continue
    parts.push(fs.readFileSync(full, "utf8"))
  }
  return parts.length === 0 ? undefined : parts.join("\n")
}

function gapsFor(entry: ComponentMeta, tested: ReadonlySet<string>): AuditGap[] {
  const gaps: AuditGap[] = []
  if (insufficientControls(entry.category, entry.props)) gaps.push("控件不足")
  const source = readEntrySource(entry)
  if (source !== undefined && missingReducedMotion(entry.category, source)) gaps.push("缺减弱动效")
  if (requiresComponentTest(entry.category) && !componentIsTested(entry, tested)) gaps.push("缺测试")
  return gaps
}

const tests = listFiles(registrySrc)
  .filter((file) => /\.test\.tsx?$/.test(file))
  .map((file) => ({ file, text: fs.readFileSync(path.join(registrySrc, file), "utf8") }))
const tested = testedSourceFiles(tests)
const closed = exemptionClosedNames()
const blocked = components.flatMap((entry) => {
  if (!closed.has(entry.name)) return []
  const gaps = gapsFor(entry, tested)
  return gaps.length > 0 ? [`${entry.name}：${gaps.join("、")}`] : []
})
if (blocked.length > 0) {
  console.error(["Batch 34 及以后不能进豁免名单，这些组件还没达标：", ...blocked].join("\n"))
  process.exit(1)
}

const rows = components
  .flatMap((entry) => {
    if (closed.has(entry.name)) return []
    const gaps = gapsFor(entry, tested)
    return gaps.length > 0 ? [{ name: entry.name, gaps }] : []
  })
  .sort((left, right) => left.name.localeCompare(right.name))

/** 控件不足但已发布 prop 不够 3 个。重新生成时保留这条说明。 */
const statedControlReasons: Readonly<Record<string, string>> = {
  singularity: "只有 className，没有已发布的可调 prop。",
  "rain-puddle": "只有 className，没有已发布的可调 prop。",
  "distorted-glass": "只有 children，没有已发布的数值或颜色 prop。",
  "merging-bubbles": "已发布的可调项只有数量和颜色两组，不够 3 个 Control。",
  "svg-bands": "已发布的可调项只有颜色一组，不够 3 个 Control。",
  "hover-blocks-grid": "已发布的可调项是两色和一组坐标，坐标不适合做成单个控件。",
  "rubber-band-drag": "只有 className，没有已发布的可调 prop。",
  "cool-mode": "已发布的可调项只有粒子字符，不够 3 个 Control。",
  "morphing-popover": "已发布的可调项只有打开和默认打开两个布尔值，不够 3 个 Control。",
  "transition-panel": "已发布的可调项只有当前下标和方向，不够 3 个 Control。",
  "animated-background": "value 一传入就变成受控，文档预览里的点击会失效，剩下的 defaultValue 和 enableHover 不够 3 个 Control。",
  disclosure: "已发布的可调项只有展开和默认展开两个布尔值，不够 3 个 Control。",
  "floating-panel": "已发布的可调项只有标题，按钮、正文和底部都是节点。",
  "feature-voting": "已发布的可调项是条目数组和票数记录，不适合做成单个控件。",
  "ai-tool-approval": "已发布的可调项只有工具调用列表，不适合做成单个控件。",
  "wheel-picker": "已发布的可调项只有无障碍名称，列和选中值是复合数据。",
  "synced-transcript": "已发布的可调项只有标题和时长，句子列表不适合做成单个控件。",
  "liquid-slider": "已发布的可调项只有单位，formatValue 是函数。",
  "avatar-picker": "已发布的可调项只有说明和提交文案，不够 3 个 Control。",
  "timezone-planner": "已发布的可调项只有开始分钟和时长，人物列表不适合做成单个控件。",
  "clip-trimmer": "已发布的可调项只有时长和最短选区，选区是对象。",
  "duration-picker": "已发布的可调项只有 scrub，单位是数组。",
  "exposure-slider": "已发布的可调项只有强调色和是否显示指示。",
  scrubber: "已发布的可调项只有小数位和刻度数量。",
  "social-selector": "已发布的可调项只有账号，平台列表不适合做成单个控件。",
}

function exemptionReason(name: string, gaps: readonly string[]): string {
  if (gaps.length === 1 && gaps[0] === "控件不足") {
    const stated = statedControlReasons[name]
    if (stated) return stated
  }
  return "落地前已有缺口"
}

const body = rows
  .map((row) => `  { name: "${row.name}", gaps: ${JSON.stringify(row.gaps)}, reason: ${JSON.stringify(exemptionReason(row.name, row.gaps))} },`)
  .join("\n")

const source = `import type { AuditExemption } from "./audit-coverage"

/** 由 scripts/generate-audit-exemptions.ts 生成。手改后要重新跑脚本核对。 */
export const auditExemptions: readonly AuditExemption[] = [
${body}
]
`

fs.writeFileSync(outFile, source)
console.log(`Wrote ${rows.length} audit exemptions`)
