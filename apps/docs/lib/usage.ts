import fs from "node:fs"
import path from "node:path"

interface Specifier {
  local: string
  typeOnly: boolean
}

interface ImportRecord {
  typeOnly: boolean
  defaultName?: string
  namespace?: string
  specifiers: Specifier[]
  source: string
  order: number
}

interface LocalDecl {
  name: string
  code: string
  order: number
}

interface DemoLocation {
  file: string
  fn: string
}

const previewTags = new Set(["Frame", "PreviewFrame"])

function registrySrc() {
  const fromApp = path.join(process.cwd(), "../../packages/registry/src")
  if (fs.existsSync(fromApp)) return fromApp
  return path.join(process.cwd(), "packages/registry/src")
}

let demoLocations: Map<string, DemoLocation> | undefined

function getDemoLocations() {
  if (demoLocations) return demoLocations
  const index = fs.readFileSync(path.join(registrySrc(), "examples/index.ts"), "utf8")
  const files = new Map<string, string>()
  for (const match of index.matchAll(/import \* as (\w+) from "\.\/([^"]+)"/g)) {
    const alias = match[1]
    const fileName = match[2]
    if (!alias || !fileName) continue
    files.set(alias, `examples/${fileName}.tsx`)
  }
  demoLocations = new Map()
  for (const match of index.matchAll(
    /^\s{2}(?:"([^"]+)"|([A-Za-z0-9]+)):\s*(\w+)\.(\w+),?$/gm,
  )) {
    const alias = match[3]
    const fn = match[4]
    const name = match[1] ?? match[2]
    if (!alias || !fn || !name) continue
    const file = files.get(alias)
    if (!file) continue
    demoLocations.set(name, { file, fn })
  }
  return demoLocations
}

function readUsageExample(name: string) {
  const location = getDemoLocations().get(name)
  if (!location) throw new Error(`找不到 ${name} 的用法示例`)
  const source = fs.readFileSync(path.join(registrySrc(), location.file), "utf8")
  const fn = unwrapPreview(extractFunction(source, location.fn))
  const locals = includedLocals(source, fn)
  const example = [fn, ...locals.map((item) => item.code)].join("\n")
  const imports = renderImports(parseImports(source), usedNames(example))
  const parts = [
    needsClient(example) ? '"use client"' : "",
    imports,
    locals.map((item) => item.code).join("\n\n"),
    fn,
  ].filter((part) => part.length > 0)
  return `${parts.join("\n\n")}\n`
}

function includedLocals(source: string, fn: string) {
  const locals = findLocals(source).filter((item) => !previewTags.has(item.name))
  const picked = new Set<string>()
  let scan = fn
  let grew = true
  while (grew) {
    grew = false
    const names = usedNames(scan)
    for (const local of locals) {
      if (picked.has(local.name) || !names.has(local.name)) continue
      picked.add(local.name)
      scan = `${scan}\n${local.code}`
      grew = true
    }
  }
  return locals.filter((item) => picked.has(item.name))
}

function parseImports(source: string) {
  const records: ImportRecord[] = []
  const pattern = /^import[\s\S]*?from\s+["'][^"']+["']/gm
  for (const match of source.matchAll(pattern)) {
    const statement = match[0]
    const from = statement.match(/from\s+["']([^"']+)["']/)
    const imported = from?.[1]
    if (!imported) continue
    const head = statement
      .slice(statement.indexOf("import") + "import".length, statement.lastIndexOf(" from "))
      .trim()
    const typeOnly = head.startsWith("type ")
    const body = typeOnly ? head.slice("type ".length).trim() : head
    const record: ImportRecord = {
      typeOnly,
      specifiers: [],
      source: userImportSource(imported),
      order: match.index ?? 0,
    }
    if (body.startsWith("* as ")) {
      record.namespace = body.slice("* as ".length).trim()
    } else if (body.startsWith("{")) {
      record.specifiers = parseSpecifiers(body)
    } else {
      const brace = body.indexOf("{")
      if (brace === -1) {
        record.defaultName = body.replace(/,$/, "").trim()
      } else {
        record.defaultName = body.slice(0, brace).replace(/,$/, "").trim()
        record.specifiers = parseSpecifiers(body.slice(brace))
      }
    }
    records.push(record)
  }
  return records
}

function parseSpecifiers(body: string) {
  const inner = body.slice(body.indexOf("{") + 1, body.lastIndexOf("}"))
  return inner
    .split(",")
    .map((part) => part.trim())
    .filter((part) => part.length > 0)
    .map((part) => {
      const typeOnly = part.startsWith("type ")
      const name = (typeOnly ? part.slice("type ".length) : part).trim()
      const local = name.includes(" as ") ? name.slice(name.lastIndexOf(" as ") + 4).trim() : name
      return { local, typeOnly }
    })
}

function renderImports(records: ImportRecord[], names: Set<string>) {
  return records
    .map((record) => renderImport(record, names))
    .filter((line): line is string => line !== null)
    .join("\n")
}

function renderImport(record: ImportRecord, names: Set<string>) {
  const specifiers = record.specifiers.filter((item) => names.has(item.local))
  const defaultUsed = record.defaultName !== undefined && names.has(record.defaultName)
  const namespaceUsed = record.namespace !== undefined && names.has(record.namespace)
  if (!defaultUsed && !namespaceUsed && specifiers.length === 0) return null
  if (namespaceUsed && record.namespace) {
    return `import * as ${record.namespace} from "${record.source}"`
  }
  const rendered = specifiers.map((item) => (item.typeOnly && !record.typeOnly ? `type ${item.local}` : item.local))
  const named = rendered.length > 0 ? `{ ${rendered.join(", ")} }` : ""
  if (record.typeOnly) return `import type ${named} from "${record.source}"`
  if (defaultUsed && named) return `import ${record.defaultName}, ${named} from "${record.source}"`
  if (defaultUsed) return `import ${record.defaultName} from "${record.source}"`
  return `import ${named} from "${record.source}"`
}

function userImportSource(source: string) {
  if (
    source.startsWith("../ui/") ||
    source.startsWith("../effects/") ||
    source.startsWith("../sections/")
  ) {
    return `@/components/ui/${source.slice(source.lastIndexOf("/") + 1)}`
  }
  if (source.startsWith("../lib/")) return `@/lib/${source.slice("../lib/".length)}`
  if (source.startsWith("../hooks/")) return `@/hooks/${source.slice("../hooks/".length)}`
  return source
}

function extractFunction(source: string, name: string) {
  const marker = `export function ${name}`
  const start = source.indexOf(marker)
  if (start < 0) throw new Error(`示例里没有 ${name}`)
  const open = functionBodyStart(source, start)
  const end = endOfBlock(source, open)
  return source.slice(start, end).trim()
}

function findLocals(source: string) {
  const locals: LocalDecl[] = []
  const pattern = /^(?:function ([A-Za-z0-9_]+)|const ([A-Za-z0-9_]+)\b|interface ([A-Za-z0-9_]+)\b)/gm
  for (const match of source.matchAll(pattern)) {
    const name = match[1] ?? match[2] ?? match[3]
    const start = match.index ?? 0
    if (name === undefined || !atLineStart(source, start)) continue
    const end = match[1]
      ? endOfBlock(source, functionBodyStart(source, start))
      : match[3]
        ? endOfBlock(source, source.indexOf("{", start))
        : endOfStatement(source, start)
    locals.push({ name, code: source.slice(start, end).trim(), order: start })
  }
  return locals
}

function atLineStart(source: string, index: number) {
  return index === 0 || source[index - 1] === "\n"
}

function unwrapPreview(source: string) {
  return source.replace(
    /return \(\r?\n([ \t]*)<(PreviewFrame|Frame)\b[^>]*>\r?\n([\s\S]*?)\r?\n\1<\/\2>\r?\n([ \t]*)\)/g,
    (_all, indent: string, _tag: string, inner: string, closeIndent: string) => {
      const lines = inner.split("\n")
      const indents = lines
        .filter((line) => line.trim().length > 0)
        .map((line) => line.match(/^[ \t]*/)?.[0].length ?? 0)
      const min = indents.length > 0 ? Math.min(...indents) : 0
      const body = lines
        .map((line) => (line.trim().length === 0 ? "" : line.slice(min)))
        .join("\n")
        .trim()
      const content = singleElement(body)
        ? body
        : `<>\n${body
            .split("\n")
            .map((line) => (line.length === 0 ? "" : `  ${line}`))
            .join("\n")}\n</>`
      const padded = content
        .split("\n")
        .map((line) => (line.length === 0 ? "" : `${indent}${line}`))
        .join("\n")
      return `return (\n${padded}\n${closeIndent})`
    },
  )
}

function functionBodyStart(source: string, from: number) {
  let paren = 0
  let sawParen = false
  for (let index = from; index < source.length; index = skip(source, index)) {
    const char = source[index]
    if (char === "(") {
      paren += 1
      sawParen = true
    } else if (char === ")") {
      paren -= 1
    } else if (char === "{" && sawParen && paren === 0) {
      return index
    }
  }
  throw new Error("示例函数没有函数体")
}

function singleElement(body: string) {
  const start = body.search(/</)
  if (start < 0) return true
  return body.slice(endOfJsxElement(body, start)).trim().length === 0
}

function endOfJsxElement(source: string, openIndex: number) {
  if (source.startsWith("<>", openIndex)) return endOfFragment(source, openIndex + 2)
  const name = /^<[A-Za-z][\w.]*/.exec(source.slice(openIndex))?.[0].slice(1) ?? ""
  const openEnd = endOfOpenTag(source, openIndex)
  if (source[openEnd - 2] === "/") return openEnd
  return closeTagEnd(source, openEnd, name)
}

function endOfOpenTag(source: string, openIndex: number) {
  let brace = 0
  for (let index = openIndex; index < source.length; index = skip(source, index)) {
    const char = source[index]
    if (char === "{") brace += 1
    else if (char === "}") brace -= 1
    else if (brace === 0 && char === ">") return index + 1
  }
  return source.length
}

function endOfFragment(source: string, from: number) {
  let depth = 1
  for (let index = from; index < source.length; index = skip(source, index)) {
    if (source.startsWith("<>", index)) depth += 1
    if (source.startsWith("</>", index)) {
      depth -= 1
      if (depth === 0) return index + 3
    }
  }
  return source.length
}

function closeTagEnd(source: string, from: number, name: string) {
  let depth = 1
  for (let index = from; index < source.length; index = skip(source, index)) {
    if (isOpenTag(source, index, name)) {
      const openEnd = endOfOpenTag(source, index)
      if (source[openEnd - 2] !== "/") depth += 1
      index = openEnd - 1
      continue
    }
    if (source.startsWith(`</${name}>`, index) || source.startsWith(`</${name} `, index)) {
      const end = source.indexOf(">", index)
      depth -= 1
      if (depth === 0) return end + 1
      index = end
    }
  }
  return source.length
}

function isOpenTag(source: string, index: number, name: string) {
  if (!source.startsWith(`<${name}`, index)) return false
  const after = source[index + name.length + 1]
  return after === ">" || after === "/" || after === " " || after === "\n" || after === "\t"
}

function needsClient(code: string) {
  return /\buse[A-Z][A-Za-z0-9]*\b/.test(code) || /\bon[A-Z][A-Za-z0-9]*=/.test(code)
}

function usedNames(code: string) {
  const stripped = code
    .replace(/\/\*[\s\S]*?\*\//g, " ")
    .replace(/\/\/.*$/gm, " ")
    .replace(/`(?:\\.|[^`\\])*`/g, " ")
    .replace(/"(?:\\.|[^"\\])*"/g, " ")
    .replace(/'(?:\\.|[^'\\])*'/g, " ")
  return new Set([...stripped.matchAll(/\b[A-Za-z_$][\w$]*\b/g)].map((match) => match[0]))
}

function endOfBlock(source: string, open: number) {
  let depth = 0
  for (let index = open; index < source.length; index = skip(source, index)) {
    const char = source[index]
    if (char === "{") depth += 1
    if (char === "}") {
      depth -= 1
      if (depth === 0) return index + 1
    }
  }
  throw new Error("示例函数没有结束")
}

function endOfStatement(source: string, start: number) {
  let brace = 0
  let paren = 0
  let bracket = 0
  let seenEquals = false
  for (let index = start; index < source.length; index = skip(source, index)) {
    const char = source[index]
    if (char === "{") brace += 1
    else if (char === "}") brace -= 1
    else if (char === "(") paren += 1
    else if (char === ")") paren -= 1
    else if (char === "[") bracket += 1
    else if (char === "]") bracket -= 1
    else if (char === "=" && source[index + 1] !== ">" && source[index - 1] !== "=" && source[index + 1] !== "=") {
      seenEquals = true
    }
    const closed = brace === 0 && paren === 0 && bracket === 0
    if (seenEquals && closed && (char === "\n" || char === ";") && !continues(source, index)) {
      return char === ";" ? index + 1 : index
    }
  }
  return source.length
}

function continues(source: string, index: number) {
  let previous = index - 1
  while (previous >= 0 && /\s/.test(source[previous] ?? "")) previous -= 1
  const char = source[previous]
  return char === "+" || char === "?" || char === ":" || char === "." || char === "," || char === "&" || char === "|" || char === "=" || char === ">" || char === "(" || char === "[" || char === "{" || char === "!"
}

function skip(source: string, index: number) {
  const char = source[index]
  const next = source[index + 1]
  if (char === "/" && next === "/") return source.indexOf("\n", index + 2) + 1 || source.length
  if (char === "/" && next === "*") {
    const end = source.indexOf("*/", index + 2)
    return end === -1 ? source.length : end + 2
  }
  if (char === "'" || char === '"') return endOfQuote(source, index, char)
  if (char === "`") return endOfTemplate(source, index)
  return index + 1
}

function endOfQuote(source: string, start: number, quote: string) {
  for (let index = start + 1; index < source.length; index += 1) {
    if (source[index] === "\\") {
      index += 1
      continue
    }
    if (source[index] === quote) return index + 1
  }
  return source.length
}

function endOfTemplate(source: string, start: number) {
  for (let index = start + 1; index < source.length; index += 1) {
    if (source[index] === "\\") {
      index += 1
      continue
    }
    if (source[index] === "`") return index + 1
    if (source[index] === "$" && source[index + 1] === "{") {
      const end = endOfBlock(source, index + 1)
      index = end - 1
    }
  }
  return source.length
}

export { readUsageExample }
