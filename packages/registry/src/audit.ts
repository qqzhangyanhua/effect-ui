import {
  activeExemptionGaps,
  componentIsTested,
  exemptionClosedNames,
  exemptionProblems,
  insufficientControls,
  missingReducedMotion,
  requiresComponentTest,
  sourceFilesFor,
  testedSourceFiles,
  type AuditExemption,
} from "./audit-coverage"
import { layerGroupError, owesEffectChecks, unclassifiedLayerIssue } from "./catalog-layer"
import { deriveDependencies } from "./dependencies"
import {
  catalogDemoNames,
  missingPropNames,
  propsMissingFromCatalog,
  readDemoBindings,
  type DemoBinding,
} from "./prop-type-text"
import { vocabularyWord, type VocabularyWord } from "./prop-vocabulary"
import {
  buildRegistry,
  buildRegistryItem,
  registryFiles,
  type RegistryCatalogEntry,
} from "./registry-item"

export type AuditIssueType =
  | "duplicate-name"
  | "missing-source"
  | "unregistered-source"
  | "missing-demo"
  | "missing-static-json"
  | "stale-static-json"
  | "missing-readme"
  | "empty-props"
  | "missing-package-dependency"
  | "unknown-registry-dependency"
  | "control-out-of-range"
  | "vocabulary-mismatch"
  | "preset-invalid"
  | "prop-not-in-type"
  | "control-not-in-demo"
  | "prop-not-in-catalog"
  | "missing-test"
  | "insufficient-controls"
  | "missing-reduced-motion"
  | "stale-exemption"
  | "unknown-exemption"
  | "closed-batch-exemption"
  | "invalid-exemption"
  | "missing-layer"
  | "stale-unclassified"
  | "layer-mismatch"
  | "missing-batch"

export interface AuditIssue {
  name: string
  type: AuditIssueType
  description: string
}

export interface AuditCatalogEntry extends RegistryCatalogEntry {
  props: readonly unknown[]
  category?: string
  presets?: readonly unknown[]
  layer?: string
  effectCategory?: string
  purposeGroup?: string
  batch?: number
}

export interface AuditStaticJson {
  indexes: readonly { label: string; json: unknown }[]
  items: Readonly<Record<string, unknown>>
}

export interface AuditInput {
  catalog: readonly AuditCatalogEntry[]
  readSource: (file: string) => string | undefined
  sourceFiles: readonly string[]
  demoNames: readonly string[]
  readme: string
  staticJson: AuditStaticJson
  packageDependencies: readonly string[]
  /** 省略时不套用豁免。仓库审计要传入 audit-exemptions.ts。 */
  exemptions?: readonly AuditExemption[]
}

const componentSourceDirs: Record<string, true> = {
  ui: true,
  effects: true,
  sections: true,
  templates: true,
  lib: true,
  hooks: true,
}

function hasDocsPage(entry: AuditCatalogEntry): boolean {
  return entry.type === "registry:ui" || entry.type === "registry:block"
}

function catalogSourceFiles(entry: AuditCatalogEntry): string[] {
  return registryFiles(entry).map((file) => file.file)
}

function isComponentSource(file: string): boolean {
  const slash = file.indexOf("/")
  const dir = slash > 0 ? file.slice(0, slash) : ""
  if (!componentSourceDirs[dir]) return false
  if (file.endsWith(".test.ts") || file.endsWith(".test.tsx")) return false
  return file.endsWith(".ts") || file.endsWith(".tsx")
}

function componentName(file: string): string {
  const base = file.slice(file.lastIndexOf("/") + 1)
  return base.replace(/\.tsx?$/, "")
}

function readmeMentions(readme: string, name: string): boolean {
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
  return new RegExp(`(^|[^A-Za-z0-9-])${escaped}([^A-Za-z0-9-]|$)`).test(readme)
}

function pushDifferingPaths(actual: unknown, expected: unknown, path: string, paths: string[]): void {
  if (Object.is(actual, expected)) return
  if (Array.isArray(actual) && Array.isArray(expected)) {
    const length = Math.max(actual.length, expected.length)
    for (let index = 0; index < length; index += 1) {
      pushDifferingPaths(actual[index], expected[index], `${path}[${index}]`, paths)
    }
    return
  }
  if (
    typeof actual === "object" &&
    actual !== null &&
    !Array.isArray(actual) &&
    typeof expected === "object" &&
    expected !== null &&
    !Array.isArray(expected)
  ) {
    const actualFields = actual as Record<string, unknown>
    const expectedFields = expected as Record<string, unknown>
    const keys = [...new Set([...Object.keys(actualFields), ...Object.keys(expectedFields)])].sort()
    for (const key of keys) {
      pushDifferingPaths(actualFields[key], expectedFields[key], path ? `${path}.${key}` : key, paths)
    }
    return
  }
  paths.push(path)
}

function differingPaths(actual: unknown, expected: unknown): string[] {
  const paths: string[] = []
  pushDifferingPaths(actual, expected, "", paths)
  return paths
}

function differenceDescription(label: string, actual: unknown, expected: unknown): string {
  const paths = differingPaths(actual, expected)
  const shown = paths.slice(0, 5).map((path) => path || "根节点")
  const more = paths.length > 5 ? " 等" : ""
  return `静态 JSON ${label} 与构建器输出不一致：${shown.join("、")}${more}。`
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function pushControlIssues(issues: AuditIssue[], entry: AuditCatalogEntry): void {
  for (const prop of entry.props) {
    if (!isRecord(prop) || !isRecord(prop.control)) continue
    const control = prop.control
    const name = typeof prop.name === "string" ? prop.name : "prop"
    if (control.kind === "range") {
      const value = control.value
      const min = control.min
      const max = control.max
      if (typeof value !== "number" || typeof min !== "number" || typeof max !== "number") {
        issues.push({
          name: entry.name,
          type: "control-out-of-range",
          description: `控件 “${name}” 的 range 起始值、最小值或最大值不是数字。`,
        })
        continue
      }
      if (value < min || value > max) {
        issues.push({
          name: entry.name,
          type: "control-out-of-range",
          description: `控件 “${name}” 的起始值 ${value} 不在 ${min} 到 ${max} 之间。`,
        })
      }
    }
    if (control.kind === "select") {
      const value = control.value
      const options = control.options
      const choices = Array.isArray(options) ? options : []
      const strings = choices.every((option) => typeof option === "string")
      if (typeof value !== "string" || !Array.isArray(options) || !strings) {
        issues.push({
          name: entry.name,
          type: "control-out-of-range",
          description: `控件 “${name}” 的 select 起始值或可选项不是字符串。`,
        })
        continue
      }
      if (!choices.includes(value)) {
        issues.push({
          name: entry.name,
          type: "control-out-of-range",
          description: `控件 “${name}” 的起始值 “${value}” 不在可选项中。`,
        })
      }
    }
  }
}

function unionMembers(type: string): readonly string[] | undefined {
  const parts = type.split("|").map((part) => part.trim()).filter((part) => part.length > 0)
  if (parts.length === 0) return undefined
  const members: string[] = []
  for (const part of parts) {
    const match = /^"([^"]*)"$/.exec(part)
    const member = match?.[1]
    if (member === undefined) return undefined
    members.push(member)
  }
  return members
}

function typeMatches(word: VocabularyWord, type: unknown): boolean {
  if (typeof type !== "string") return false
  if (!word.options) return type === word.type
  const members = unionMembers(type)
  if (!members) return false
  return members.every((member) => word.options?.includes(member))
}

function expectedType(word: VocabularyWord): string {
  if (!word.options) return word.type
  return word.options.map((option) => `"${option}"`).join(" | ") + " 的子集"
}

function pushVocabularyIssues(issues: AuditIssue[], entry: AuditCatalogEntry): void {
  if (!owesEffectChecks(entry)) return
  for (const prop of entry.props) {
    if (!isRecord(prop) || typeof prop.name !== "string") continue
    const word = vocabularyWord(prop.name)
    if (!word) continue
    if ("vocabularyExemption" in prop) {
      const exemption = prop.vocabularyExemption
      if (typeof exemption === "string" && exemption.trim().length > 0) continue
      issues.push({
        name: entry.name,
        type: "vocabulary-mismatch",
        description: `Prop “${prop.name}” 的词汇表豁免说明为空。`,
      })
      continue
    }
    if (!typeMatches(word, prop.type)) {
      const shown = typeof prop.type === "string" ? prop.type : "缺失"
      issues.push({
        name: entry.name,
        type: "vocabulary-mismatch",
        description: `Prop “${prop.name}” 的类型是 ${shown}，词汇表要求 ${expectedType(word)}。`,
      })
    }
    if (!isRecord(prop.control)) continue
    const kind = prop.control.kind
    if (kind !== word.kind) {
      const shown = typeof kind === "string" ? kind : "缺失"
      issues.push({
        name: entry.name,
        type: "vocabulary-mismatch",
        description: `控件 “${prop.name}” 的种类是 ${shown}，词汇表要求 ${word.kind}。`,
      })
    }
    if (word.options && kind === "select" && Array.isArray(prop.control.options)) {
      const options = prop.control.options
      const strings = options.every((option) => typeof option === "string")
      if (strings) {
        const extra = options.filter((option) => !word.options?.includes(option))
        if (extra.length > 0) {
          issues.push({
            name: entry.name,
            type: "vocabulary-mismatch",
            description: `控件 “${prop.name}” 的可选项 ${extra.join("、")} 不在词汇表取值内。`,
          })
        }
      }
    }
    const explicit = prop.control.group
    const group = typeof explicit === "string" ? explicit : word.group
    if (group !== word.group) {
      issues.push({
        name: entry.name,
        type: "vocabulary-mismatch",
        description: `控件 “${prop.name}” 的分组是 ${group}，词汇表要求 ${word.group}。`,
      })
    }
  }
}

function presetValueLegal(control: Record<string, unknown>, value: unknown): boolean {
  if (control.kind === "range") {
    const min = control.min
    const max = control.max
    return typeof value === "number" && typeof min === "number" && typeof max === "number" && value >= min && value <= max
  }
  if (control.kind === "select") {
    const options = control.options
    return typeof value === "string" && Array.isArray(options) && options.includes(value)
  }
  if (control.kind === "boolean") return typeof value === "boolean"
  if (control.kind === "text" || control.kind === "color") return typeof value === "string"
  if (control.kind === "colors") {
    const start = control.value
    return (
      Array.isArray(value) &&
      Array.isArray(start) &&
      value.length === start.length &&
      value.every((item) => typeof item === "string")
    )
  }
  return false
}

function pushPresetIssues(issues: AuditIssue[], entry: AuditCatalogEntry): void {
  if (entry.presets === undefined) return
  if (!Array.isArray(entry.presets)) {
    issues.push({
      name: entry.name,
      type: "preset-invalid",
      description: "预设必须是数组。",
    })
    return
  }
  const controls = new Map<string, Record<string, unknown>>()
  for (const prop of entry.props) {
    if (!isRecord(prop) || typeof prop.name !== "string" || !isRecord(prop.control)) continue
    controls.set(prop.name, prop.control)
  }
  for (const preset of entry.presets) {
    if (!isRecord(preset) || typeof preset.label !== "string" || !isRecord(preset.values)) {
      issues.push({
        name: entry.name,
        type: "preset-invalid",
        description: "预设缺少 label 或 values。",
      })
      continue
    }
    for (const [key, value] of Object.entries(preset.values)) {
      const control = controls.get(key)
      if (!control) {
        issues.push({
          name: entry.name,
          type: "preset-invalid",
          description: `预设 “${preset.label}” 引用了没有控件的 prop “${key}”。`,
        })
        continue
      }
      if (!presetValueLegal(control, value)) {
        const shown = typeof value === "string" ? `“${value}”` : JSON.stringify(value)
        issues.push({
          name: entry.name,
          type: "preset-invalid",
          description: `预设 “${preset.label}” 的 ${key} 值 ${shown} 不在控件允许的范围内。`,
        })
      }
    }
  }
}

function catalogPropNames(entry: AuditCatalogEntry) {
  const names: string[] = []
  for (const prop of entry.props) {
    if (isRecord(prop) && typeof prop.name === "string") names.push(prop.name)
  }
  return names
}

function pushPropTypeIssues(issues: AuditIssue[], entry: AuditCatalogEntry, source: string) {
  for (const name of missingPropNames(source, catalogPropNames(entry))) {
    issues.push({
      name: entry.name,
      type: "prop-not-in-type",
      description: `Prop “${name}” 没有出现在导出的 Props 类型中。`,
    })
  }
}

function pushCatalogPropIssues(issues: AuditIssue[], entry: AuditCatalogEntry, source: string) {
  for (const name of propsMissingFromCatalog(source, catalogPropNames(entry))) {
    issues.push({
      name: entry.name,
      type: "prop-not-in-catalog",
      description: `Prop “${name}” 没有写进 catalog 的 props。`,
    })
  }
}

function fallbackDemoName(catalogName: string): string {
  let pascal = ""
  for (const part of catalogName.split("-")) {
    if (part.length === 0) continue
    pascal += part.charAt(0).toUpperCase() + part.slice(1)
  }
  return `${pascal}Demo`
}

interface DemoIndex {
  functions: Map<string, DemoBinding>
  names: Map<string, string>
}

function indexDemos(input: AuditInput): DemoIndex {
  const functions = new Map<string, DemoBinding>()
  const names = new Map<string, string>()
  const fromExamples = new Set<string>()
  const dropped = new Set<string>()
  const seen = new Set<string>()
  for (const file of input.sourceFiles) {
    if (seen.has(file) || file.endsWith(".test.ts") || file.endsWith(".test.tsx")) continue
    seen.add(file)
    const text = input.readSource(file)
    if (text === undefined) continue
    if (text.includes("const demoMap")) {
      for (const [catalogName, fn] of catalogDemoNames(text)) names.set(catalogName, fn)
    }
    if (!text.includes("Demo")) continue
    const examples = file.startsWith("examples/") || file.includes("/examples/")
    for (const [fn, binding] of readDemoBindings(text)) {
      if (dropped.has(fn)) continue
      const prev = functions.get(fn)
      if (!prev) {
        functions.set(fn, binding)
        if (examples) fromExamples.add(fn)
        continue
      }
      const prevExamples = fromExamples.has(fn)
      if (examples && !prevExamples) {
        functions.set(fn, binding)
        fromExamples.add(fn)
        continue
      }
      if (!examples && prevExamples) continue
      functions.delete(fn)
      fromExamples.delete(fn)
      dropped.add(fn)
    }
  }
  return { functions, names }
}

function pushControlDemoIssues(issues: AuditIssue[], entry: AuditCatalogEntry, demos: DemoIndex) {
  const fn = demos.names.get(entry.name) ?? fallbackDemoName(entry.name)
  const demo = demos.functions.get(fn)
  if (!demo) return
  for (const prop of entry.props) {
    if (!isRecord(prop) || typeof prop.name !== "string" || !isRecord(prop.control)) continue
    if (!demo.params.has(prop.name)) {
      issues.push({
        name: entry.name,
        type: "control-not-in-demo",
        description: `控件 “${prop.name}” 不在 Demo 的参数里。`,
      })
      continue
    }
    if (!demo.passed.has(prop.name)) {
      issues.push({
        name: entry.name,
        type: "control-not-in-demo",
        description: `控件 “${prop.name}” 在 Demo 参数里，但没有传给组件。`,
      })
    }
  }
}

function pushDependencyIssues(
  issues: AuditIssue[],
  entry: AuditCatalogEntry,
  contents: Readonly<Record<string, string>>,
  catalogNames: ReadonlySet<string>,
  packageDependencies: ReadonlySet<string>,
): void {
  const derived = deriveDependencies(contents, entry.extraDependencies)
  for (const pkg of derived.dependencies) {
    if (!packageDependencies.has(pkg)) {
      issues.push({
        name: entry.name,
        type: "missing-package-dependency",
        description: `npm 包 “${pkg}” 未出现在 registry 包的依赖清单中。`,
      })
    }
  }
  for (const dep of derived.registryDependencies) {
    if (!catalogNames.has(dep)) {
      issues.push({
        name: entry.name,
        type: "unknown-registry-dependency",
        description: `源码引用了 registry 组件 “${dep}”，但 catalog 中没有这个组件。`,
      })
    }
  }
}

export function auditRegistry(input: AuditInput): AuditIssue[] {
  const issues: AuditIssue[] = []
  const listed = new Set(input.sourceFiles)
  const demos = new Set(input.demoNames)
  const registered = new Set(input.catalog.flatMap((entry) => catalogSourceFiles(entry)))
  const catalogNames = new Set(input.catalog.map((entry) => entry.name))
  const packageDependencies = new Set(input.packageDependencies)
  const counts = new Map<string, number>()
  for (const entry of input.catalog) {
    counts.set(entry.name, (counts.get(entry.name) ?? 0) + 1)
  }

  const reportedDuplicates = new Set<string>()
  for (const entry of input.catalog) {
    const count = counts.get(entry.name) ?? 0
    if (count < 2 || reportedDuplicates.has(entry.name)) continue
    reportedDuplicates.add(entry.name)
    issues.push({
      name: entry.name,
      type: "duplicate-name",
      description: `catalog 中名称 “${entry.name}” 出现了 ${count} 次。`,
    })
  }

  const demoIndex = indexDemos(input)
  const allContents: Record<string, string> = {}
  let allComplete = true
  for (const entry of input.catalog) {
    const sources = catalogSourceFiles(entry)
    const contents: Record<string, string> = {}
    let complete = true
    for (const file of sources) {
      const text = listed.has(file) ? input.readSource(file) : undefined
      if (text === undefined) {
        complete = false
        issues.push({
          name: entry.name,
          type: "missing-source",
          description: `源码文件 ${file} 不存在。`,
        })
      } else {
        contents[file] = text
        allContents[file] = text
      }
    }
    if (!complete) allComplete = false
    if (hasDocsPage(entry) && !demos.has(entry.name)) {
      issues.push({
        name: entry.name,
        type: "missing-demo",
        description: "缺少 demo。",
      })
    }
    if (!readmeMentions(input.readme, entry.name)) {
      issues.push({
        name: entry.name,
        type: "missing-readme",
        description: `README 中未出现组件名 ${entry.name}。`,
      })
    }
    if (!Number.isInteger(entry.batch) || (entry.batch ?? 0) < 1) {
      issues.push({
        name: entry.name,
        type: "missing-batch",
        description: "catalog 条目没有 Batch 编号。",
      })
    }
    const groupError = layerGroupError(entry)
    if (groupError) {
      issues.push({
        name: entry.name,
        type: "layer-mismatch",
        description: groupError,
      })
    }
    const unclassified = unclassifiedLayerIssue(entry)
    if (unclassified) {
      issues.push({
        name: entry.name,
        type: unclassified.type,
        description: unclassified.description,
      })
    }
    if (hasDocsPage(entry) && entry.props.length === 0) {
      issues.push({
        name: entry.name,
        type: "empty-props",
        description: "Props 文档为空。",
      })
    }
    pushControlIssues(issues, entry)
    pushControlDemoIssues(issues, entry, demoIndex)
    pushVocabularyIssues(issues, entry)
    pushPresetIssues(issues, entry)

    const itemJson = input.staticJson.items[entry.name]
    if (itemJson === undefined) {
      issues.push({
        name: entry.name,
        type: "missing-static-json",
        description: `静态 JSON ${entry.name}.json 缺失。`,
      })
    } else if (complete) {
      const expected = buildRegistryItem(entry, (file) => contents[file])
      if (differingPaths(itemJson, expected).length > 0) {
        issues.push({
          name: entry.name,
          type: "stale-static-json",
          description: differenceDescription(`${entry.name}.json`, itemJson, expected),
        })
      }
    }
    if (complete) {
      const sourceText = Object.values(contents).join("\n")
      pushPropTypeIssues(issues, entry, sourceText)
      pushCatalogPropIssues(issues, entry, sourceText)
      pushDependencyIssues(issues, entry, contents, catalogNames, packageDependencies)
    }
  }

  const seenFiles = new Set<string>()
  for (const file of input.sourceFiles) {
    if (seenFiles.has(file) || !isComponentSource(file) || registered.has(file)) continue
    seenFiles.add(file)
    issues.push({
      name: componentName(file),
      type: "unregistered-source",
      description: `源码文件 ${file} 未登记到 catalog。`,
    })
  }

  // 总表里的依赖要读全部源码才能推导；缺源码时已报告 missing-source，这里跳过过期比较。
  const expectedIndex = allComplete
    ? buildRegistry(input.catalog, (file) => allContents[file])
    : undefined
  for (const index of input.staticJson.indexes) {
    if (index.json === undefined) {
      issues.push({
        name: "registry",
        type: "missing-static-json",
        description: `静态 JSON ${index.label} 缺失。`,
      })
      continue
    }
    if (expectedIndex && differingPaths(index.json, expectedIndex).length > 0) {
      issues.push({
        name: "registry",
        type: "stale-static-json",
        description: differenceDescription(index.label, index.json, expectedIndex),
      })
    }
  }

  pushCoverageIssues(issues, input, catalogNames)
  return issues
}

function pushCoverageIssues(
  issues: AuditIssue[],
  input: AuditInput,
  catalogNames: ReadonlySet<string>,
): void {
  const tests = input.sourceFiles.flatMap((file) => {
    if (!/\.test\.tsx?$/.test(file)) return []
    const text = input.readSource(file)
    return text === undefined ? [] : [{ file, text }]
  })
  const tested = testedSourceFiles(tests)
  const closedNames = exemptionClosedNames()
  const exemptions = input.exemptions ?? []
  const entryByName = (name: string) => input.catalog.find((item) => item.name === name)
  const testedGap = (name: string) => {
    const entry = entryByName(name)
    if (!entry || !requiresComponentTest(entry)) return true
    return componentIsTested(entry, tested)
  }
  const controlsSufficient = (name: string) => {
    const entry = entryByName(name)
    if (!entry) return true
    return !insufficientControls(entry, entry.props)
  }
  const motionSatisfied = (name: string) => {
    const entry = entryByName(name)
    if (!entry || !owesEffectChecks(entry)) return true
    const text = readCatalogSource(entry, input.readSource)
    if (text === undefined) return false
    return !missingReducedMotion(entry, text)
  }
  issues.push(
    ...exemptionProblems(exemptions, catalogNames, closedNames, testedGap, {
      controlsSufficient,
      motionSatisfied,
    }),
  )
  const suppressed = activeExemptionGaps(exemptions, catalogNames, closedNames)
  for (const entry of input.catalog) {
    if (!requiresComponentTest(entry) || componentIsTested(entry, tested)) continue
    if (suppressed.get(entry.name)?.has("缺测试")) continue
    issues.push({
      name: entry.name,
      type: "missing-test",
      description: "没有任何测试文件导入该组件源码。",
    })
  }
  for (const entry of input.catalog) {
    if (!owesEffectChecks(entry)) continue
    const gaps = suppressed.get(entry.name)
    if (insufficientControls(entry, entry.props) && !gaps?.has("控件不足")) {
      issues.push({
        name: entry.name,
        type: "insufficient-controls",
        description: "Effect 组件的可调控件少于 3 个。",
      })
    }
    const text = readCatalogSource(entry, input.readSource)
    if (text !== undefined && missingReducedMotion(entry, text) && !gaps?.has("缺减弱动效")) {
      issues.push({
        name: entry.name,
        type: "missing-reduced-motion",
        description: "Effect 组件有动画特征，但没有减弱动效处理。",
      })
    }
  }
}

function readCatalogSource(
  entry: { file: string; files?: readonly { file: string }[] },
  readSource: (file: string) => string | undefined,
): string | undefined {
  const parts: string[] = []
  for (const file of sourceFilesFor(entry)) {
    const text = readSource(file)
    if (text !== undefined) parts.push(text)
  }
  return parts.length === 0 ? undefined : parts.join("\n")
}
