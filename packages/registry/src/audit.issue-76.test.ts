import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

import { expect, test } from "vitest"

import { auditRegistry, type AuditInput } from "./audit"
import { components } from "./catalog"

const registrySrc = path.resolve(path.dirname(fileURLToPath(import.meta.url)))
const names = new Set(["marketing-blocks", "ecommerce-blocks", "tracing-beam"])

function listFiles(dir: string, prefix = ""): string[] {
  const files: string[] = []
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const rel = prefix ? `${prefix}/${entry.name}` : entry.name
    if (entry.isDirectory()) files.push(...listFiles(path.join(dir, entry.name), rel))
    else files.push(rel)
  }
  return files
}

function repoInput(): AuditInput {
  return {
    catalog: components,
    readSource: (file) => {
      const abs = path.join(registrySrc, file)
      return fs.existsSync(abs) ? fs.readFileSync(abs, "utf8") : undefined
    },
    sourceFiles: listFiles(registrySrc),
    demoNames: components.map((entry) => entry.name),
    readme: components.map((entry) => entry.name).join(" "),
    staticJson: { indexes: [], items: {} },
    packageDependencies: [],
  }
}

test("marketing-blocks、ecommerce-blocks、tracing-beam 没有 prop-not-in-catalog", () => {
  expect(
    auditRegistry(repoInput()).filter((issue) => issue.type === "prop-not-in-catalog" && names.has(issue.name)),
  ).toEqual([])
})
