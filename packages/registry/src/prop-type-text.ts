const htmlAttributeNames = new Set([
  "className",
  "children",
  "style",
  "id",
  "title",
  "role",
  "tabIndex",
  "hidden",
  "lang",
  "dir",
  "slot",
  "dangerouslySetInnerHTML",
  "defaultChecked",
  "defaultValue",
  "checked",
  "value",
  "disabled",
  "readOnly",
  "required",
  "placeholder",
  "autoFocus",
  "name",
  "type",
  "htmlFor",
  "form",
  "src",
  "alt",
  "href",
  "target",
  "rel",
  "width",
  "height",
  "rows",
  "cols",
  "maxLength",
  "minLength",
  "max",
  "min",
  "step",
  "pattern",
  "multiple",
  "accept",
  "wrap",
  "open",
  "contentEditable",
  "draggable",
  "spellCheck",
  "autoComplete",
  "inputMode",
  "color",
  "label",
  "nonce",
  "translate",
  "accessKey",
  "content",
  "suppressHydrationWarning",
  "suppressContentEditableWarning",
  "onClick",
  "onChange",
  "onSubmit",
  "onBlur",
  "onFocus",
  "onInput",
  "onInvalid",
  "onKeyDown",
  "onKeyUp",
  "onKeyPress",
  "onMouseDown",
  "onMouseUp",
  "onMouseEnter",
  "onMouseLeave",
  "onMouseMove",
  "onDoubleClick",
  "onContextMenu",
  "onPointerDown",
  "onPointerUp",
  "onPointerMove",
  "onScroll",
  "onTouchStart",
  "onTouchEnd",
  "onAnimationEnd",
  "onTransitionEnd",
])

const htmlInheritPattern =
  /HTMLAttributes|SVGAttributes|HTMLMotionProps|AriaAttributes|ComponentProps|HTMLProps|Attributes<|MotionProps/

function isHtmlAttribute(name: string) {
  if (htmlAttributeNames.has(name)) return true
  return name.startsWith("aria-") || name.startsWith("data-")
}

function hasIdentifier(text: string, name: string) {
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
  return new RegExp(`\\b${escaped}\\b`).test(text)
}

function skipSpace(source: string, index: number) {
  let next = index
  while (next < source.length && /\s/.test(source[next] ?? "")) next += 1
  return next
}

function readQuoted(source: string, index: number) {
  const quote = source[index]
  let value = ""
  let cursor = index + 1
  while (cursor < source.length) {
    const char = source[cursor]
    if (char === "\\") {
      value += source[cursor + 1] ?? ""
      cursor += 2
      continue
    }
    if (char === quote) return { text: value, end: cursor + 1 }
    value += char ?? ""
    cursor += 1
  }
  return { text: value, end: source.length }
}

function skipQuoteOrComment(source: string, index: number) {
  const char = source[index]
  if (char === '"' || char === "'" || char === "`") return readQuoted(source, index).end
  if (char !== "/") return undefined
  if (source[index + 1] === "/") {
    let cursor = index + 2
    while (cursor < source.length && source[cursor] !== "\n") cursor += 1
    return cursor
  }
  if (source[index + 1] !== "*") return undefined
  const end = source.indexOf("*/", index + 2)
  return end < 0 ? source.length : end + 2
}

function skipGeneric(source: string, index: number) {
  if (source[index] !== "<") return index
  let depth = 0
  for (let cursor = index; cursor < source.length; cursor += 1) {
    const skipped = skipQuoteOrComment(source, cursor)
    if (skipped !== undefined) {
      cursor = skipped - 1
      continue
    }
    const char = source[cursor]
    if (char === "<") depth += 1
    else if (char === ">") {
      depth -= 1
      if (depth === 0) return cursor + 1
    }
  }
  return source.length
}

function endOfBrace(source: string, openIndex: number) {
  let depth = 0
  for (let cursor = openIndex; cursor < source.length; cursor += 1) {
    const skipped = skipQuoteOrComment(source, cursor)
    if (skipped !== undefined) {
      cursor = skipped - 1
      continue
    }
    const char = source[cursor]
    if (char === "{") depth += 1
    else if (char === "}") {
      depth -= 1
      if (depth === 0) return cursor + 1
    }
  }
  return source.length
}

function endOfParen(source: string, openIndex: number) {
  let depth = 0
  for (let cursor = openIndex; cursor < source.length; cursor += 1) {
    const skipped = skipQuoteOrComment(source, cursor)
    if (skipped !== undefined) {
      cursor = skipped - 1
      continue
    }
    const char = source[cursor]
    if (char === "(") depth += 1
    else if (char === ")") {
      depth -= 1
      if (depth === 0) return cursor + 1
    }
  }
  return source.length
}

function endOfTypeAlias(source: string, equalsIndex: number) {
  let angle = 0
  let paren = 0
  let brace = 0
  let bracket = 0
  for (let cursor = equalsIndex + 1; cursor < source.length; cursor += 1) {
    const skipped = skipQuoteOrComment(source, cursor)
    if (skipped !== undefined) {
      cursor = skipped - 1
      continue
    }
    const char = source[cursor]
    if (char === "<") angle += 1
    else if (char === ">") {
      if (angle > 0) angle -= 1
    } else if (char === "(") paren += 1
    else if (char === ")") paren -= 1
    else if (char === "{") brace += 1
    else if (char === "}") brace -= 1
    else if (char === "[") bracket += 1
    else if (char === "]") bracket -= 1
    else if (char === "=" && source[cursor + 1] === ">") {
      cursor += 1
    } else if ((char === ";" || char === "\n") && angle === 0 && paren === 0 && brace === 0 && bracket === 0) {
      if (char === "\n" && /[&|]\s*$/.test(source.slice(equalsIndex, cursor))) continue
      return char === ";" ? cursor + 1 : cursor
    }
  }
  return source.length
}

function collectPropsText(source: string) {
  const parts: string[] = []

  for (const match of source.matchAll(/(^|\n)\s*(?:export\s+)?interface\s+[A-Za-z0-9_]+\b/g)) {
    if (match.index === undefined) continue
    const start = match.index + (match[1]?.length ?? 0)
    const brace = source.indexOf("{", start)
    if (brace < 0) continue
    parts.push(source.slice(start, endOfBrace(source, brace)))
  }

  for (const match of source.matchAll(/(^|\n)\s*(?:export\s+)?type\s+[A-Za-z0-9_]+\b/g)) {
    if (match.index === undefined) continue
    const keyword = match[0].search(/\btype\b/)
    const start = match.index + keyword
    const lineEnd = source.indexOf("\n", start)
    const equals = source.indexOf("=", start)
    if (equals < 0 || (lineEnd >= 0 && equals > lineEnd)) continue
    parts.push(source.slice(start, endOfTypeAlias(source, equals)))
  }

  for (const match of source.matchAll(/\bfunction\s+[A-Za-z0-9_]+\b/g)) {
    if (match.index === undefined) continue
    let cursor = skipSpace(source, match.index + match[0].length)
    cursor = skipGeneric(source, cursor)
    cursor = skipSpace(source, cursor)
    if (source[cursor] !== "(") continue
    const params = source.slice(cursor, endOfParen(source, cursor))
    if (params !== "()" && params !== "( )") parts.push(params)
  }

  return parts.join("\n")
}

export function missingPropNames(source: string, names: readonly string[]) {
  const propsText = collectPropsText(source)
  const inheritsHtml = htmlInheritPattern.test(propsText.length > 0 ? propsText : source)
  const missing: string[] = []
  for (const name of names) {
    if (propsText.length > 0 && hasIdentifier(propsText, name)) continue
    if (propsText.length === 0 && hasIdentifier(source, name)) continue
    if (inheritsHtml && isHtmlAttribute(name)) continue
    // className 这类 DOM 属性经常只写在 JSX 里，类型靠继承带上。
    if (isHtmlAttribute(name) && hasIdentifier(source, name)) continue
    missing.push(name)
  }
  return missing
}

function skipTrivia(source: string, index: number) {
  let cursor = index
  while (cursor < source.length) {
    const char = source[cursor]
    if (char !== undefined && /\s/.test(char)) {
      cursor += 1
      continue
    }
    if (char !== "/" || (source[cursor + 1] !== "/" && source[cursor + 1] !== "*")) break
    const skipped = skipQuoteOrComment(source, cursor)
    if (skipped === undefined) break
    cursor = skipped
  }
  return cursor
}

function readIdent(source: string, index: number) {
  let end = index + 1
  while (end < source.length && /[A-Za-z0-9_$]/.test(source[end] ?? "")) end += 1
  return { text: source.slice(index, end), end }
}

function skipPropertyType(source: string, index: number, limit: number) {
  let angle = 0
  let paren = 0
  let brace = 0
  let bracket = 0
  for (let cursor = index; cursor < limit; cursor += 1) {
    const skipped = skipQuoteOrComment(source, cursor)
    if (skipped !== undefined) {
      cursor = Math.min(skipped, limit) - 1
      continue
    }
    const char = source[cursor]
    if (char === "<") angle += 1
    else if (char === ">" && angle > 0) angle -= 1
    else if (char === "(") paren += 1
    else if (char === ")") paren -= 1
    else if (char === "{") brace += 1
    else if (char === "}") {
      if (brace === 0 && angle === 0 && paren === 0 && bracket === 0) return cursor
      brace -= 1
    } else if (char === "[") bracket += 1
    else if (char === "]") bracket -= 1
    else if ((char === "," || char === ";") && angle === 0 && paren === 0 && brace === 0 && bracket === 0) {
      return cursor
    } else if (char === "\n" && angle === 0 && paren === 0 && brace === 0 && bracket === 0) {
      let next = cursor + 1
      while (next < limit && /[ \t\r]/.test(source[next] ?? "")) next += 1
      const ahead = source[next]
      if (ahead === "|" || ahead === "&" || ahead === "?" || ahead === ":") continue
      if (/[&|?:]\s*$/.test(source.slice(index, cursor))) continue
      return cursor
    }
  }
  return limit
}

function objectTypeKeys(source: string, openIndex: number) {
  const keys: string[] = []
  const end = endOfBrace(source, openIndex)
  let cursor = openIndex + 1
  while (cursor < end - 1) {
    cursor = skipTrivia(source, cursor)
    if (cursor >= end - 1) break
    const char = source[cursor]
    if (char === "," || char === ";") {
      cursor += 1
      continue
    }
    if (char === "[") {
      let bracket = 0
      while (cursor < end) {
        if (source[cursor] === "[") bracket += 1
        else if (source[cursor] === "]") {
          bracket -= 1
          if (bracket === 0) {
            cursor += 1
            break
          }
        }
        cursor += 1
      }
      cursor = skipTrivia(source, cursor)
      if (source[cursor] === "?") cursor += 1
      cursor = skipTrivia(source, cursor)
      if (source[cursor] === ":") cursor = skipPropertyType(source, cursor + 1, end)
      continue
    }
    let key: string | undefined
    if (char === '"' || char === "'") {
      const quoted = readQuoted(source, cursor)
      key = quoted.text
      cursor = quoted.end
    } else if (char !== undefined && /[A-Za-z_$]/.test(char)) {
      const ident = readIdent(source, cursor)
      cursor = ident.end
      if (ident.text === "readonly") continue
      key = ident.text
    } else {
      cursor += 1
      continue
    }
    cursor = skipTrivia(source, cursor)
    if (source[cursor] === "?") {
      cursor += 1
      cursor = skipTrivia(source, cursor)
    }
    if (source[cursor] === "(") {
      cursor = endOfParen(source, cursor)
      cursor = skipTrivia(source, cursor)
      if (source[cursor] === ":") cursor = skipPropertyType(source, cursor + 1, end)
    } else if (source[cursor] === ":") {
      cursor = skipPropertyType(source, cursor + 1, end)
    }
    if (key !== undefined) keys.push(key)
  }
  return keys
}

export function propsMissingFromCatalog(source: string, catalogNames: readonly string[]) {
  const keys: string[] = []
  for (const match of source.matchAll(/(^|\n)\s*export\s+(interface|type)\s+[A-Za-z0-9_]*Props\b/g)) {
    if (match.index === undefined) continue
    const nameEnd = match.index + match[0].length
    if (match[2] === "interface") {
      let angle = 0
      let open = -1
      for (let cursor = nameEnd; cursor < source.length; cursor += 1) {
        const skipped = skipQuoteOrComment(source, cursor)
        if (skipped !== undefined) {
          cursor = skipped - 1
          continue
        }
        const char = source[cursor]
        if (char === "<") angle += 1
        else if (char === ">" && angle > 0) angle -= 1
        else if (char === "{" && angle === 0) {
          open = cursor
          break
        } else if ((char === ";" || char === "=") && angle === 0) break
      }
      if (open >= 0) keys.push(...objectTypeKeys(source, open))
      continue
    }
    let cursor = skipTrivia(source, nameEnd)
    cursor = skipGeneric(source, cursor)
    cursor = skipTrivia(source, cursor)
    if (source[cursor] !== "=") continue
    const aliasEnd = endOfTypeAlias(source, cursor)
    let angle = 0
    let bracket = 0
    for (let typeCursor = cursor + 1; typeCursor < aliasEnd; typeCursor += 1) {
      const skipped = skipQuoteOrComment(source, typeCursor)
      if (skipped !== undefined) {
        typeCursor = skipped - 1
        continue
      }
      const char = source[typeCursor]
      if (char === "<") angle += 1
      else if (char === ">" && angle > 0) angle -= 1
      else if (char === "[") bracket += 1
      else if (char === "]" && bracket > 0) bracket -= 1
      else if (char === "{" && angle === 0 && bracket === 0) {
        keys.push(...objectTypeKeys(source, typeCursor))
        typeCursor = endOfBrace(source, typeCursor) - 1
      }
    }
  }
  const present = new Set(catalogNames)
  const seen = new Set<string>()
  const missing: string[] = []
  for (const name of keys) {
    if (seen.has(name) || present.has(name)) continue
    seen.add(name)
    if (isHtmlAttribute(name) || /^on[A-Z]/.test(name)) continue
    missing.push(name)
  }
  return missing
}

function skipUntilComma(source: string, index: number) {
  let brace = 0
  let paren = 0
  let bracket = 0
  for (let cursor = index; cursor < source.length; cursor += 1) {
    const skipped = skipQuoteOrComment(source, cursor)
    if (skipped !== undefined) {
      cursor = skipped - 1
      continue
    }
    const char = source[cursor]
    if (char === "{") brace += 1
    else if (char === "}") {
      if (brace === 0 && paren === 0 && bracket === 0) return cursor
      brace -= 1
    } else if (char === "(") paren += 1
    else if (char === ")") paren -= 1
    else if (char === "[") bracket += 1
    else if (char === "]") bracket -= 1
    else if (char === "," && brace === 0 && paren === 0 && bracket === 0) return cursor
  }
  return source.length
}

function bindingNames(inner: string) {
  const names: string[] = []
  let cursor = 0
  while (cursor < inner.length) {
    cursor = skipTrivia(inner, cursor)
    if (cursor >= inner.length) break
    if (inner[cursor] === ",") {
      cursor += 1
      continue
    }
    if (inner.startsWith("...", cursor)) {
      cursor = skipUntilComma(inner, cursor + 3)
      continue
    }
    if (inner[cursor] === '"' || inner[cursor] === "'") {
      const quoted = readQuoted(inner, cursor)
      names.push(quoted.text)
      cursor = skipUntilComma(inner, quoted.end)
      continue
    }
    if (/[A-Za-z_$]/.test(inner[cursor] ?? "")) {
      const ident = readIdent(inner, cursor)
      names.push(ident.text)
      cursor = skipUntilComma(inner, ident.end)
      continue
    }
    cursor += 1
  }
  return names
}

function jsxOpen(source: string, index: number) {
  if (source[index] !== "<" || source[index + 1] === "/") return false
  if (!/[A-Za-z]/.test(source[index + 1] ?? "")) return false
  let cursor = index - 1
  while (cursor >= 0 && /\s/.test(source[cursor] ?? "")) cursor -= 1
  if (cursor < 0) return true
  const char = source[cursor]
  if (char !== undefined && "({}[,;=:?!&|+-*>".includes(char)) return true
  if (char === undefined || !/[A-Za-z0-9_$]/.test(char)) return false
  let start = cursor
  while (start > 0 && /[A-Za-z0-9_$]/.test(source[start - 1] ?? "")) start -= 1
  const word = source.slice(start, cursor + 1)
  return word === "return" || word === "throw" || word === "yield"
}

function passedNames(body: string) {
  const names = new Set<string>()
  walkJs(body, 0, body.length)
  return names

  function walkJs(source: string, start: number, end: number) {
    let cursor = start
    while (cursor < end) {
      const skipped = skipQuoteOrComment(source, cursor)
      if (skipped !== undefined) {
        cursor = skipped > end ? end : skipped
        continue
      }
      const char = source[cursor]
      if (char !== undefined && /\s/.test(char)) {
        cursor += 1
        continue
      }
      if (char === "<" && jsxOpen(source, cursor)) {
        cursor = readElement(source, cursor, end)
        continue
      }
      if (char === "{") {
        const close = endOfBrace(source, cursor)
        walkJs(source, cursor + 1, Math.min(close - 1, end))
        cursor = Math.min(close, end)
        continue
      }
      cursor += 1
    }
  }

  function readElement(source: string, index: number, limit: number) {
    let cursor = index + 1
    const nameStart = cursor
    while (cursor < limit && /[A-Za-z0-9.]/.test(source[cursor] ?? "")) cursor += 1
    const tag = source.slice(nameStart, cursor)
    while (cursor < limit) {
      const trivia = skipTrivia(source, cursor)
      cursor = trivia > limit ? limit : trivia
      if (cursor >= limit) return limit
      if (source[cursor] === ">") return readChildren(source, cursor + 1, limit, tag)
      if (source[cursor] === "/" && source[cursor + 1] === ">") return Math.min(cursor + 2, limit)
      if (source[cursor] === "{") {
        const close = endOfBrace(source, cursor)
        walkJs(source, cursor + 1, Math.min(close - 1, limit))
        cursor = Math.min(close, limit)
        continue
      }
      if (!/[A-Za-z_]/.test(source[cursor] ?? "")) {
        cursor += 1
        continue
      }
      const attrStart = cursor
      cursor += 1
      while (cursor < limit && /[A-Za-z0-9_-]/.test(source[cursor] ?? "")) cursor += 1
      names.add(source.slice(attrStart, cursor))
      const afterName = skipTrivia(source, cursor)
      cursor = afterName > limit ? limit : afterName
      if (source[cursor] !== "=") continue
      const afterEq = skipTrivia(source, cursor + 1)
      cursor = afterEq > limit ? limit : afterEq
      if (source[cursor] === "{") {
        const close = endOfBrace(source, cursor)
        walkJs(source, cursor + 1, Math.min(close - 1, limit))
        cursor = Math.min(close, limit)
      } else if (source[cursor] === '"' || source[cursor] === "'" || source[cursor] === "`") {
        cursor = Math.min(readQuoted(source, cursor).end, limit)
      } else if (cursor < limit) cursor += 1
    }
    return cursor
  }

  function readChildren(source: string, index: number, limit: number, tag: string) {
    let cursor = index
    while (cursor < limit) {
      if (source[cursor] === "<" && source[cursor + 1] === "/") {
        const nameStart = cursor + 2
        let nameEnd = nameStart
        while (nameEnd < limit && /[A-Za-z0-9.]/.test(source[nameEnd] ?? "")) nameEnd += 1
        let after = nameEnd
        while (after < limit && /\s/.test(source[after] ?? "")) after += 1
        if (source[after] === ">") after += 1
        if (source.slice(nameStart, nameEnd) === tag) return Math.min(after, limit)
        cursor = Math.min(after, limit)
        continue
      }
      if (source[cursor] === "<" && /[A-Za-z]/.test(source[cursor + 1] ?? "")) {
        cursor = readElement(source, cursor, limit)
        continue
      }
      if (source[cursor] === "{") {
        const close = endOfBrace(source, cursor)
        const innerEnd = Math.min(close - 1, limit)
        const expr = source.slice(cursor + 1, innerEnd).trim()
        if (/^[A-Za-z_$][A-Za-z0-9_$]*$/.test(expr)) names.add(expr)
        walkJs(source, cursor + 1, innerEnd)
        cursor = Math.min(close, limit)
        continue
      }
      const skipped = skipQuoteOrComment(source, cursor)
      if (skipped !== undefined) {
        cursor = skipped > limit ? limit : skipped
        continue
      }
      cursor += 1
    }
    return cursor
  }
}

export interface DemoBinding {
  params: ReadonlySet<string>
  passed: ReadonlySet<string>
}

export function readDemoBindings(source: string) {
  const map = new Map<string, DemoBinding>()
  const duplicated = new Set<string>()
  let cursor = 0
  while (cursor < source.length) {
    const skipped = skipQuoteOrComment(source, cursor)
    if (skipped !== undefined) {
      cursor = skipped
      continue
    }
    if (cursor > 0 && /[A-Za-z0-9_$]/.test(source[cursor - 1] ?? "")) {
      cursor += 1
      continue
    }
    if (!source.startsWith("export", cursor) || /[A-Za-z0-9_$]/.test(source[cursor + "export".length] ?? "")) {
      cursor += 1
      continue
    }
    let nameAt = skipTrivia(source, cursor + "export".length)
    if (!source.startsWith("function", nameAt) || /[A-Za-z0-9_$]/.test(source[nameAt + "function".length] ?? "")) {
      cursor += 1
      continue
    }
    nameAt = skipTrivia(source, nameAt + "function".length)
    if (!/[A-Za-z_$]/.test(source[nameAt] ?? "")) {
      cursor += 1
      continue
    }
    const ident = readIdent(source, nameAt)
    if (!ident.text.endsWith("Demo")) {
      cursor = ident.end
      continue
    }
    let header = skipTrivia(source, ident.end)
    header = skipGeneric(source, header)
    header = skipTrivia(source, header)
    if (source[header] !== "(") {
      cursor = ident.end
      continue
    }
    const paramsEnd = endOfParen(source, header)
    const paramsText = source.slice(header + 1, paramsEnd - 1)
    const braceAt = skipTrivia(paramsText, 0)
    const params = new Set<string>()
    if (paramsText[braceAt] === "{") {
      const braceEnd = endOfBrace(paramsText, braceAt)
      for (const name of bindingNames(paramsText.slice(braceAt + 1, braceEnd - 1))) params.add(name)
    }
    let bodyAt = skipTrivia(source, paramsEnd)
    if (source[bodyAt] === ":") {
      let angle = 0
      let paren = 0
      let brace = 0
      let bracket = 0
      for (let typeCursor = bodyAt + 1; typeCursor < source.length; typeCursor += 1) {
        const typeSkipped = skipQuoteOrComment(source, typeCursor)
        if (typeSkipped !== undefined) {
          typeCursor = typeSkipped - 1
          continue
        }
        const char = source[typeCursor]
        if (char === "<") angle += 1
        else if (char === ">" && angle > 0) angle -= 1
        else if (char === "(") paren += 1
        else if (char === ")") paren -= 1
        else if (char === "[") bracket += 1
        else if (char === "]") bracket -= 1
        else if (char === "{") {
          if (angle === 0 && paren === 0 && brace === 0 && bracket === 0) {
            bodyAt = typeCursor
            break
          }
          brace += 1
        } else if (char === "}" && brace > 0) brace -= 1
      }
    }
    const passed = new Set<string>()
    if (source[bodyAt] === "{") {
      const bodyEnd = endOfBrace(source, bodyAt)
      for (const name of passedNames(source.slice(bodyAt + 1, bodyEnd - 1))) passed.add(name)
      cursor = bodyEnd
    } else {
      cursor = paramsEnd
    }
    if (duplicated.has(ident.text) || map.has(ident.text)) {
      map.delete(ident.text)
      duplicated.add(ident.text)
      continue
    }
    map.set(ident.text, { params, passed })
  }
  return map
}

export function catalogDemoNames(source: string) {
  const names = new Map<string, string>()
  const marker = source.indexOf("const demoMap")
  if (marker < 0) return names
  const open = source.indexOf("{", marker)
  if (open < 0) return names
  const close = endOfBrace(source, open)
  const body = source.slice(open + 1, close - 1)
  for (const match of body.matchAll(/(?:"([^"]+)"|([A-Za-z0-9-]+))\s*:\s*[A-Za-z0-9_]+\.([A-Za-z0-9_]*Demo)\b/g)) {
    const catalogName = match[1] ?? match[2]
    const fn = match[3]
    if (catalogName && fn) names.set(catalogName, fn)
  }
  return names
}
