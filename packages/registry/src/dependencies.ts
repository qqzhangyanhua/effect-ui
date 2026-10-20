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

function basenameNoExt(file: string): string {
  const base = file.slice(file.lastIndexOf("/") + 1)
  return stripExtension(base)
}

export interface DerivedDependencies {
  dependencies: string[]
  registryDependencies: string[]
}

/** sources 的键是 registry 源码路径；同一 item 的其它文件按 sibling 处理，不算 registry 依赖。 */
export function deriveDependencies(
  sources: Readonly<Record<string, string>>,
  extraDependencies: readonly string[] = [],
): DerivedDependencies {
  const npm = new Set<string>(extraDependencies)
  const registry = new Set<string>()
  for (const content of Object.values(sources)) {
    const found = collectDependencies(content)
    for (const pkg of found.npm) {
      if (!ignoredNpmPackages.has(pkg)) npm.add(pkg)
    }
    for (const dep of found.registry) registry.add(dep)
  }
  for (const file of Object.keys(sources)) registry.delete(basenameNoExt(file))
  return {
    dependencies: [...npm].sort(),
    registryDependencies: [...registry].sort(),
  }
}
