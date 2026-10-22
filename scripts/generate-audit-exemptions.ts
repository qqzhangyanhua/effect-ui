import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

import {
  componentIsTested,
  exemptionClosedNames,
  requiresComponentTest,
  testedSourceFiles,
} from "../packages/registry/src/audit-coverage.ts"
import { components } from "../packages/registry/src/catalog.ts"

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

const tests = listFiles(registrySrc)
  .filter((file) => /\.test\.tsx?$/.test(file))
  .map((file) => ({ file, text: fs.readFileSync(path.join(registrySrc, file), "utf8") }))
const tested = testedSourceFiles(tests)
const closed = exemptionClosedNames()
const blocked = components.filter(
  (entry) => requiresComponentTest(entry.category) && closed.has(entry.name) && !componentIsTested(entry, tested),
)
if (blocked.length > 0) {
  console.error(blocked.map((entry) => `${entry.name} 属于 Batch 34 及以后，但没有测试导入`).join("\n"))
  process.exit(1)
}

const rows = components
  .filter((entry) => requiresComponentTest(entry.category) && !closed.has(entry.name) && !componentIsTested(entry, tested))
  .map((entry) => ({ name: entry.name, gaps: ["缺测试"] as const, reason: "落地前已有缺口" }))
  .sort((left, right) => left.name.localeCompare(right.name))

const body = rows
  .map((row) => `  { name: "${row.name}", gaps: ["缺测试"], reason: "落地前已有缺口" },`)
  .join("\n")

const source = `import type { AuditExemption } from "./audit-coverage"

/** 由 scripts/generate-audit-exemptions.ts 生成。手改后要重新跑脚本核对。 */
export const auditExemptions: readonly AuditExemption[] = [
${body}
]
`

fs.writeFileSync(outFile, source)
console.log(`Wrote ${rows.length} audit exemptions`)
