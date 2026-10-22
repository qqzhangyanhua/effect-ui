import { batch34Components } from "./catalog-batch34"
import { batch35Components } from "./catalog-batch35"
import { effectCategories } from "./prop-vocabulary"
import { registryFiles, type RegistryCatalogEntry } from "./registry-item"

export const auditGaps = ["控件不足", "缺减弱动效", "缺测试"] as const

export type AuditGap = (typeof auditGaps)[number]

export interface AuditExemption {
  name: string
  gaps: readonly string[]
  reason: string
}

const auditGapSet = new Set<string>(auditGaps)
const baseCategories = new Set(["ui", "utility", "sections"])

const importSpecifier = /(?:from|import)\s+["'](\.[^"']+)["']/g

export function requiresComponentTest(category: string | undefined): boolean {
  if (!category) return false
  return effectCategories.has(category) || baseCategories.has(category)
}

export function exemptionClosedNames(): ReadonlySet<string> {
  return new Set([...batch34Components, ...batch35Components].map((entry) => entry.name))
}

export function testedSourceFiles(tests: readonly { file: string; text: string }[]): ReadonlySet<string> {
  const tested = new Set<string>()
  for (const test of tests) {
    const dir = posixDir(test.file)
    for (const match of test.text.matchAll(importSpecifier)) {
      const spec = match[1]
      if (!spec) continue
      const resolved = posixNormalize(posixJoin(dir, spec))
      tested.add(resolved)
      if (!posixExtname(resolved)) {
        tested.add(`${resolved}.ts`)
        tested.add(`${resolved}.tsx`)
      }
    }
  }
  return tested
}

export function componentIsTested(entry: RegistryCatalogEntry, tested: ReadonlySet<string>): boolean {
  return registryFiles(entry).some((file) => tested.has(file.file))
}

export function exemptionProblems(
  exemptions: readonly AuditExemption[],
  catalogNames: ReadonlySet<string>,
  closedNames: ReadonlySet<string>,
  testedGap: (name: string) => boolean,
): { name: string; type: ExemptionProblemType; description: string }[] {
  const problems: { name: string; type: ExemptionProblemType; description: string }[] = []
  for (const entry of exemptions) {
    if (!exemptionShapeIsValid(entry)) {
      problems.push({
        name: entry.name.trim() || "audit-exemptions",
        type: "invalid-exemption",
        description: "豁免名单条目缺少组件名、原因，或缺失项不是「控件不足」「缺减弱动效」「缺测试」。",
      })
      continue
    }
    if (!catalogNames.has(entry.name)) {
      problems.push({
        name: entry.name,
        type: "unknown-exemption",
        description: `豁免名单里的「${entry.name}」不在 catalog 中。`,
      })
      continue
    }
    if (closedNames.has(entry.name)) {
      problems.push({
        name: entry.name,
        type: "closed-batch-exemption",
        description: `「${entry.name}」属于 Batch 34 及以后，不能进入豁免名单。`,
      })
      continue
    }
    if (entry.gaps.includes("缺测试") && testedGap(entry.name)) {
      problems.push({
        name: entry.name,
        type: "stale-exemption",
        description: `「${entry.name}」的「缺测试」豁免已经过期。`,
      })
    }
  }
  return problems
}

export function activeExemptionGaps(
  exemptions: readonly AuditExemption[],
  catalogNames: ReadonlySet<string>,
  closedNames: ReadonlySet<string>,
): ReadonlyMap<string, ReadonlySet<string>> {
  const active = new Map<string, Set<string>>()
  for (const entry of exemptions) {
    if (!exemptionShapeIsValid(entry)) continue
    if (!catalogNames.has(entry.name) || closedNames.has(entry.name)) continue
    const gaps = active.get(entry.name) ?? new Set<string>()
    for (const gap of entry.gaps) gaps.add(gap)
    active.set(entry.name, gaps)
  }
  return active
}

export type ExemptionProblemType =
  | "invalid-exemption"
  | "unknown-exemption"
  | "closed-batch-exemption"
  | "stale-exemption"

function exemptionShapeIsValid(entry: AuditExemption): boolean {
  return (
    entry.name.trim().length > 0 &&
    entry.reason.trim().length > 0 &&
    entry.gaps.length > 0 &&
    entry.gaps.every((gap) => auditGapSet.has(gap))
  )
}

function posixDir(file: string): string {
  const slash = file.lastIndexOf("/")
  return slash < 0 ? "" : file.slice(0, slash)
}

function posixJoin(dir: string, spec: string): string {
  const parts = `${dir}/${spec}`.split("/")
  const stack: string[] = []
  for (const part of parts) {
    if (part === "" || part === ".") continue
    if (part === "..") stack.pop()
    else stack.push(part)
  }
  return stack.join("/")
}

function posixNormalize(file: string): string {
  return posixJoin("", file)
}

function posixExtname(file: string): string {
  const base = file.slice(file.lastIndexOf("/") + 1)
  const dot = base.lastIndexOf(".")
  return dot <= 0 ? "" : base.slice(dot)
}
