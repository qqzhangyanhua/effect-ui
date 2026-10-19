import {
  buildRegistry,
  buildRegistryItem,
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
  | "missing-npm-dependency"
  | "extra-npm-dependency"
  | "missing-package-dependency"
  | "missing-registry-dependency"
  | "extra-registry-dependency"
  | "unknown-registry-dependency"

export interface AuditIssue {
  name: string
  type: AuditIssueType
  description: string
}

export interface AuditCatalogEntry extends RegistryCatalogEntry {
  props: readonly unknown[]
}

export interface AuditException {
  name: string
  type: AuditIssueType
  reason: string
  /** 只抑制这一条依赖。省略则抑制该组件该类型的全部问题。 */
  dependency?: string
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
  exceptions?: readonly AuditException[]
  packageDependencies: readonly string[]
}

const componentSourceDirs: Record<string, true> = {
  ui: true,
  effects: true,
  lib: true,
  hooks: true,
}

function hasDocsPage(entry: AuditCatalogEntry): boolean {
  return entry.type === "registry:ui"
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

const ignoredNpmPackages = new Set(["react", "react-dom"])
const registryPrefixes = ["@/components/ui/", "@/lib/", "@/hooks/"]
const statementStarters = new Set([
  "import",
  "export",
  "const",
  "let",
  "var",
  "function",
  "class",
  "return",
  "if",
  "for",
  "while",
  "void",
  "interface",
  "enum",
  "type",
  "declare",
  "async",
  "default",
])

function isIdentStart(char: string): boolean {
  return /[A-Za-z_$]/.test(char)
}

function isIdent(char: string): boolean {
  return /[A-Za-z0-9_$]/.test(char)
}

function skipTrivia(source: string, index: number): { index: number; crossedNewline: boolean } {
  let cursor = index
  let crossedNewline = false
  while (cursor < source.length) {
    const char = source[cursor] ?? ""
    if (char === " " || char === "\t" || char === "\f") {
      cursor += 1
      continue
    }
    if (char === "\n" || char === "\r") {
      crossedNewline = true
      cursor += 1
      continue
    }
    if (char === "/" && source[cursor + 1] === "/") {
      crossedNewline = true
      const newline = source.indexOf("\n", cursor + 2)
      cursor = newline < 0 ? source.length : newline + 1
      continue
    }
    if (char === "/" && source[cursor + 1] === "*") {
      const end = source.indexOf("*/", cursor + 2)
      if (source.slice(cursor, end < 0 ? source.length : end).includes("\n")) crossedNewline = true
      cursor = end < 0 ? source.length : end + 2
      continue
    }
    break
  }
  return { index: cursor, crossedNewline }
}

function readWord(source: string, index: number): { text: string; end: number } | undefined {
  if (!isIdentStart(source[index] ?? "")) return undefined
  let cursor = index + 1
  while (isIdent(source[cursor] ?? "")) cursor += 1
  return { text: source.slice(index, cursor), end: cursor }
}

function readSpecifier(source: string, index: number): { value: string; end: number } | undefined {
  const quote = source[index]
  if (quote !== "'" && quote !== '"') return undefined
  let value = ""
  let cursor = index + 1
  while (cursor < source.length) {
    const char = source[cursor] ?? ""
    if (char === "\\") {
      value += source[cursor + 1] ?? ""
      cursor += 2
      continue
    }
    if (char === quote) return { value, end: cursor + 1 }
    if (char === "\n") return undefined
    value += char
    cursor += 1
  }
  return undefined
}

function endOfQuoted(source: string, start: number): number {
  const quote = source[start]
  let cursor = start + 1
  while (cursor < source.length) {
    const char = source[cursor] ?? ""
    if (char === "\\") {
      cursor += 2
      continue
    }
    if (char === quote) return cursor + 1
    if (char === "\n") return cursor
    cursor += 1
  }
  return cursor
}

function endOfTemplate(source: string, start: number): number {
  let cursor = start + 1
  while (cursor < source.length) {
    const char = source[cursor] ?? ""
    if (char === "\\") {
      cursor += 2
      continue
    }
    if (char === "`") return cursor + 1
    cursor += 1
  }
  return cursor
}

function stripExtension(name: string): string {
  return name.replace(/\.(tsx|ts|jsx|js|mjs|cjs)$/, "")
}

function registryDependencyName(spec: string): string | undefined {
  for (const prefix of registryPrefixes) {
    if (!spec.startsWith(prefix)) continue
    const segment = spec.slice(prefix.length).split("/")[0] ?? ""
    const name = stripExtension(segment)
    return name || undefined
  }
  if (!spec.startsWith("./")) return undefined
  const relative = spec.slice(2)
  if (relative.includes("/")) return undefined
  const name = stripExtension(relative)
  return name || undefined
}

function packageName(spec: string): string | undefined {
  if (spec.startsWith(".") || spec.startsWith("@/") || spec.startsWith("node:")) return undefined
  if (spec.startsWith("@")) {
    const [scope, name] = spec.split("/")
    if (!scope || !name) return undefined
    return `${scope}/${name}`
  }
  const name = spec.split("/")[0]
  return name || undefined
}

function addSpecifier(spec: string, npm: Set<string>, registry: Set<string>): void {
  const registryName = registryDependencyName(spec)
  if (registryName) {
    registry.add(registryName)
    return
  }
  const pkg = packageName(spec)
  if (pkg) npm.add(pkg)
}

function readFromSpecifier(source: string, index: number, add: (spec: string) => void): number {
  let depth = 0
  let cursor = index
  while (cursor < source.length) {
    const char = source[cursor] ?? ""
    if (char === " " || char === "\t" || char === "\f") {
      cursor += 1
      continue
    }
    if ((char === "\n" || char === "\r") && depth === 0) {
      const next = skipTrivia(source, cursor + 1)
      const word = readWord(source, next.index)
      if (word && statementStarters.has(word.text)) return cursor + 1
      cursor += 1
      continue
    }
    if (char === "\n" || char === "\r") {
      cursor += 1
      continue
    }
    if (char === "/" && source[cursor + 1] === "/") {
      const newline = source.indexOf("\n", cursor + 2)
      cursor = newline < 0 ? source.length : newline + 1
      continue
    }
    if (char === "/" && source[cursor + 1] === "*") {
      const end = source.indexOf("*/", cursor + 2)
      cursor = end < 0 ? source.length : end + 2
      continue
    }
    if (char === "'" || char === '"') {
      cursor = endOfQuoted(source, cursor)
      continue
    }
    if (char === "`" || char === "(") {
      if (depth === 0) return cursor
      cursor += 1
      continue
    }
    if (char === "{") {
      depth += 1
      cursor += 1
      continue
    }
    if (char === "}") {
      depth = Math.max(0, depth - 1)
      cursor += 1
      continue
    }
    if (char === ";" && depth === 0) return cursor + 1
    const word = readWord(source, cursor)
    if (!word) {
      cursor += 1
      continue
    }
    if (word.text === "from" && depth === 0) {
      const after = skipTrivia(source, word.end)
      const spec = readSpecifier(source, after.index)
      if (spec) {
        add(spec.value)
        return spec.end
      }
      return after.index
    }
    cursor = word.end
  }
  return cursor
}

function readImport(source: string, index: number, add: (spec: string) => void): number {
  const trivia = skipTrivia(source, index)
  const char = source[trivia.index] ?? ""
  if (char === ".") return trivia.index
  if (char === "(" && !trivia.crossedNewline) {
    const afterParen = skipTrivia(source, trivia.index + 1)
    const spec = readSpecifier(source, afterParen.index)
    if (spec) {
      add(spec.value)
      return spec.end
    }
    return trivia.index + 1
  }
  const sideEffect = readSpecifier(source, trivia.index)
  if (sideEffect) {
    add(sideEffect.value)
    return sideEffect.end
  }
  return readFromSpecifier(source, trivia.index, add)
}

function readExportFrom(source: string, index: number, add: (spec: string) => void): number {
  const trivia = skipTrivia(source, index)
  let cursor = trivia.index
  const word = readWord(source, cursor)
  if (word?.text === "type") cursor = skipTrivia(source, word.end).index
  const char = source[cursor] ?? ""
  if (char === "*" || char === "{") return readFromSpecifier(source, cursor, add)
  return trivia.index
}

function collectDependencies(source: string): { npm: string[]; registry: string[] } {
  const npm = new Set<string>()
  const registry = new Set<string>()
  const add = (spec: string) => addSpecifier(spec, npm, registry)
  let index = 0
  while (index < source.length) {
    const start = index
    const char = source[index] ?? ""
    if (char === " " || char === "\t" || char === "\n" || char === "\r" || char === "\f") {
      index += 1
      continue
    }
    if (char === "/" && source[index + 1] === "/") {
      const newline = source.indexOf("\n", index + 2)
      index = newline < 0 ? source.length : newline + 1
      continue
    }
    if (char === "/" && source[index + 1] === "*") {
      const end = source.indexOf("*/", index + 2)
      index = end < 0 ? source.length : end + 2
      continue
    }
    if (char === "'" || char === '"') {
      index = endOfQuoted(source, index)
      continue
    }
    if (char === "`") {
      index = endOfTemplate(source, index)
      continue
    }
    const word = readWord(source, index)
    if (!word || (index > 0 && isIdent(source[index - 1] ?? ""))) {
      index += 1
      continue
    }
    index = word.end
    if (word.text === "import") index = readImport(source, index, add)
    else if (word.text === "export") index = readExportFrom(source, index, add)
    if (index <= start) index = start + 1
  }
  return { npm: [...npm], registry: [...registry] }
}

function sorted(values: Iterable<string>): string[] {
  return [...values].sort()
}

function pushDependencyIssues(
  issues: AuditIssue[],
  entry: AuditCatalogEntry,
  content: string,
  catalogNames: ReadonlySet<string>,
  packageDependencies: ReadonlySet<string>,
): void {
  const found = collectDependencies(content)
  const imported = new Set(found.npm.filter((pkg) => !ignoredNpmPackages.has(pkg)))
  const declaredNpm = new Set(entry.dependencies.filter((pkg) => !ignoredNpmPackages.has(pkg)))
  const referenced = new Set(found.registry)
  const declaredRegistry = new Set(entry.registryDependencies)

  for (const pkg of sorted(imported)) {
    if (!declaredNpm.has(pkg)) {
      issues.push({
        name: entry.name,
        type: "missing-npm-dependency",
        description: `源码引用了 npm 包 “${pkg}”，但 dependencies 未声明。`,
      })
    }
    if (!packageDependencies.has(pkg)) {
      issues.push({
        name: entry.name,
        type: "missing-package-dependency",
        description: `npm 包 “${pkg}” 未出现在 registry 包的依赖清单中。`,
      })
    }
  }
  for (const pkg of sorted(declaredNpm)) {
    if (!imported.has(pkg)) {
      issues.push({
        name: entry.name,
        type: "extra-npm-dependency",
        description: `dependencies 声明了 “${pkg}”，但源码未引用。`,
      })
    }
  }
  for (const dep of sorted(referenced)) {
    if (!declaredRegistry.has(dep)) {
      issues.push({
        name: entry.name,
        type: "missing-registry-dependency",
        description: `源码引用了 registry 组件 “${dep}”，但 registryDependencies 未声明。`,
      })
    }
  }
  for (const dep of sorted(declaredRegistry)) {
    if (!catalogNames.has(dep)) {
      issues.push({
        name: entry.name,
        type: "unknown-registry-dependency",
        description: `registryDependencies 指向不存在的组件 “${dep}”。`,
      })
      continue
    }
    if (!referenced.has(dep)) {
      issues.push({
        name: entry.name,
        type: "extra-registry-dependency",
        description: `registryDependencies 声明了 “${dep}”，但源码未引用。`,
      })
    }
  }
}

function applyExceptions(
  issues: readonly AuditIssue[],
  exceptions: readonly AuditException[],
): AuditIssue[] {
  return issues.filter(
    (issue) =>
      !exceptions.some((exception) => {
        if (exception.reason.trim() === "") return false
        if (exception.name !== issue.name || exception.type !== issue.type) return false
        if (
          exception.dependency !== undefined &&
          !issue.description.includes(`“${exception.dependency}”`)
        ) {
          return false
        }
        return true
      }),
  )
}

export function auditRegistry(input: AuditInput): AuditIssue[] {
  const issues: AuditIssue[] = []
  const listed = new Set(input.sourceFiles)
  const demos = new Set(input.demoNames)
  const registered = new Set(input.catalog.map((entry) => entry.file))
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

  for (const entry of input.catalog) {
    const content = listed.has(entry.file) ? input.readSource(entry.file) : undefined
    if (content === undefined) {
      issues.push({
        name: entry.name,
        type: "missing-source",
        description: `源码文件 ${entry.file} 不存在。`,
      })
    }
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
    if (hasDocsPage(entry) && entry.props.length === 0) {
      issues.push({
        name: entry.name,
        type: "empty-props",
        description: "Props 文档为空。",
      })
    }

    const itemJson = input.staticJson.items[entry.name]
    if (itemJson === undefined) {
      issues.push({
        name: entry.name,
        type: "missing-static-json",
        description: `静态 JSON ${entry.name}.json 缺失。`,
      })
    } else if (content !== undefined) {
      const expected = buildRegistryItem(entry, content)
      if (differingPaths(itemJson, expected).length > 0) {
        issues.push({
          name: entry.name,
          type: "stale-static-json",
          description: differenceDescription(`${entry.name}.json`, itemJson, expected),
        })
      }
    }
    if (content !== undefined) {
      pushDependencyIssues(issues, entry, content, catalogNames, packageDependencies)
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

  const expectedIndex = buildRegistry(input.catalog)
  for (const index of input.staticJson.indexes) {
    if (index.json === undefined) {
      issues.push({
        name: "registry",
        type: "missing-static-json",
        description: `静态 JSON ${index.label} 缺失。`,
      })
      continue
    }
    if (differingPaths(index.json, expectedIndex).length > 0) {
      issues.push({
        name: "registry",
        type: "stale-static-json",
        description: differenceDescription(index.label, index.json, expectedIndex),
      })
    }
  }

  return applyExceptions(issues, input.exceptions ?? [])
}
