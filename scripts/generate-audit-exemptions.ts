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

const body = rows
  .map((row) => `  { name: "${row.name}", gaps: ${JSON.stringify(row.gaps)}, reason: "落地前已有缺口" },`)
  .join("\n")

const source = `import type { AuditExemption } from "./audit-coverage"

/** 由 scripts/generate-audit-exemptions.ts 生成。手改后要重新跑脚本核对。 */
export const auditExemptions: readonly AuditExemption[] = [
${body}
]
`

fs.writeFileSync(outFile, source)
console.log(`Wrote ${rows.length} audit exemptions`)
