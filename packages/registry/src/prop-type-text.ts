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

function skipGeneric(source: string, index: number) {
  if (source[index] !== "<") return index
  let depth = 0
  let quote: string | null = null
  for (let cursor = index; cursor < source.length; cursor += 1) {
    const char = source[cursor]
    if (quote) {
      if (char === "\\") {
        cursor += 1
        continue
      }
      if (char === quote) quote = null
      continue
    }
    if (char === '"' || char === "'") {
      quote = char
      continue
    }
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
  let quote: string | null = null
  for (let cursor = openIndex; cursor < source.length; cursor += 1) {
    const char = source[cursor]
    if (quote) {
      if (char === "\\") {
        cursor += 1
        continue
      }
      if (char === quote) quote = null
      continue
    }
    if (char === '"' || char === "'" || char === "`") {
      quote = char
      continue
    }
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
  let quote: string | null = null
  for (let cursor = openIndex; cursor < source.length; cursor += 1) {
    const char = source[cursor]
    if (quote) {
      if (char === "\\") {
        cursor += 1
        continue
      }
      if (char === quote) quote = null
      continue
    }
    if (char === '"' || char === "'" || char === "`") {
      quote = char
      continue
    }
    if (char === "/" && source[cursor + 1] === "/") {
      while (cursor < source.length && source[cursor] !== "\n") cursor += 1
      continue
    }
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
  let quote: string | null = null
  for (let cursor = equalsIndex + 1; cursor < source.length; cursor += 1) {
    const char = source[cursor]
    if (quote) {
      if (char === "\\") {
        cursor += 1
        continue
      }
      if (char === quote) quote = null
      continue
    }
    if (char === '"' || char === "'" || char === "`") {
      quote = char
      continue
    }
    if (char === "/" && source[cursor + 1] === "/") {
      while (cursor < source.length && source[cursor] !== "\n") cursor += 1
      continue
    }
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
