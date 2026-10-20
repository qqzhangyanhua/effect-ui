function rewriteControlledDemo(fn: string) {
  const openParen = fn.indexOf("(")
  if (openParen < 0) return fn
  const closeParen = matchingCloser(fn, openParen, "(", ")")
  if (closeParen < 0) return fn
  const defaults = destructuredDefaults(fn.slice(openParen + 1, closeParen))
  if (!defaults) return fn
  const bodyOpen = fn.indexOf("{", closeParen)
  if (bodyOpen < 0) return fn
  const consts = defaults.map((item) => `  const ${item.name} = ${item.literal}`).join("\n")
  return `${fn.slice(0, openParen)}() {\n${consts}${fn.slice(bodyOpen + 1)}`
}

function destructuredDefaults(params: string) {
  let index = 0
  while (index < params.length && /\s/.test(params[index] ?? "")) index += 1
  if (params[index] !== "{") return null
  const close = matchingCloser(params, index, "{", "}")
  if (close < 0) return null
  const defaults: { name: string; literal: string }[] = []
  for (const part of splitTopLevel(params.slice(index + 1, close))) {
    const piece = part.trim()
    if (piece.length === 0) continue
    const eq = separatorEquals(piece)
    if (eq < 0) return null
    const name = piece.slice(0, eq).trim()
    const literal = piece.slice(eq + 1).trim()
    if (!/^[A-Za-z_$][\w$]*$/.test(name) || literal.length === 0) return null
    defaults.push({ name, literal })
  }
  return defaults.length > 0 ? defaults : null
}

function matchingCloser(source: string, openIndex: number, open: string, close: string) {
  let depth = 0
  for (let index = openIndex; index < source.length; ) {
    const char = source[index]
    if (char === open) depth += 1
    else if (char === close) {
      depth -= 1
      if (depth === 0) return index
    }
    index = advance(source, index)
  }
  return -1
}

function splitTopLevel(source: string) {
  const parts: string[] = []
  let start = 0
  let brace = 0
  let paren = 0
  let bracket = 0
  for (let index = 0; index < source.length; ) {
    const char = source[index]
    if ((char === "'" || char === '"' || char === "`" || char === "/") && isLiteralStart(source, index)) {
      index = advance(source, index)
      continue
    }
    if (char === "," && brace === 0 && paren === 0 && bracket === 0) {
      parts.push(source.slice(start, index))
      start = index + 1
      index += 1
      continue
    }
    if (char === "{") brace += 1
    else if (char === "}") brace -= 1
    else if (char === "(") paren += 1
    else if (char === ")") paren -= 1
    else if (char === "[") bracket += 1
    else if (char === "]") bracket -= 1
    index += 1
  }
  parts.push(source.slice(start))
  return parts
}

function separatorEquals(source: string) {
  for (let index = 0; index < source.length; ) {
    if (isLiteralStart(source, index)) {
      index = advance(source, index)
      continue
    }
    const char = source[index]
    if (char === "=" && source[index + 1] !== "=" && source[index - 1] !== "=" && source[index + 1] !== ">") {
      return index
    }
    index += 1
  }
  return -1
}

function isLiteralStart(source: string, index: number) {
  const char = source[index]
  const next = source[index + 1]
  return char === "'" || char === '"' || char === "`" || (char === "/" && (next === "/" || next === "*"))
}

function advance(source: string, index: number) {
  const next = skip(source, index)
  return next > index ? next : index + 1
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

export { endOfBlock, rewriteControlledDemo, skip }
