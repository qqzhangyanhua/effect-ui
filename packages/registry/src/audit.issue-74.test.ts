import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

import { expect, test } from "vitest"

import { auditRegistry, type AuditInput, type AuditStaticJson } from "./audit"
import { components } from "./catalog"
import { demoNames } from "./examples/index"

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..")
const registrySrc = path.join(repoRoot, "packages/registry/src")

const issue74 = [
  "wavefield-neon",
  "shuffle-grid-hero",
  "countdown-timer",
  "progress-ring",
  "kpi-sparkline-card",
  "curved-scrollbar",
]

function listFiles(dir: string, prefix = ""): string[] {
  const files: string[] = []
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const rel = prefix ? `${prefix}/${entry.name}` : entry.name
    if (entry.isDirectory()) files.push(...listFiles(path.join(dir, entry.name), rel))
    else files.push(rel)
  }
  return files
}

function readJson(file: string): unknown {
  return JSON.parse(fs.readFileSync(file, "utf8"))
}

function staticJson(): AuditStaticJson {
  const publicDir = path.join(repoRoot, "apps/docs/public/r")
  const items: Record<string, unknown> = {}
  for (const file of fs.readdirSync(publicDir)) {
    if (!file.endsWith(".json") || file === "registry.json") continue
    items[file.slice(0, -".json".length)] = readJson(path.join(publicDir, file))
  }
  const index = (label: string) => {
    const abs = path.join(repoRoot, label)
    return {
      label,
      json: fs.existsSync(abs) ? readJson(abs) : undefined,
    }
  }
  return {
    indexes: [index("registry.json"), index("apps/docs/public/r/registry.json")],
    items,
  }
}

function repoInput(): AuditInput {
  const packageJson = readJson(path.join(repoRoot, "packages/registry/package.json")) as {
    dependencies?: Record<string, string>
  }
  return {
    catalog: components,
    readSource: (file) => {
      const abs = path.join(registrySrc, file)
      return fs.existsSync(abs) ? fs.readFileSync(abs, "utf8") : undefined
    },
    sourceFiles: listFiles(registrySrc),
    demoNames,
    readme: fs.readFileSync(path.join(repoRoot, "README.md"), "utf8"),
    staticJson: staticJson(),
    packageDependencies: Object.keys(packageJson.dependencies ?? {}),
  }
}

test("issue 74 的六个条目不报 control-not-in-demo", () => {
  const names = new Set(issue74)
  expect(
    auditRegistry(repoInput()).filter((issue) => issue.type === "control-not-in-demo" && names.has(issue.name)),
  ).toEqual([])
})
