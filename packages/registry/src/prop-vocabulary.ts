export type VocabularyGroup = "文字" | "外观" | "动画" | "交互"

export type VocabularyKind = "range" | "select" | "color" | "colors" | "boolean" | "text"

export interface VocabularyWord {
  name: string
  /** 没有 options 时，PropDoc.type 必须与此完全一致。有 options 时，type 必须是这些值的引号联合，可以用子集。 */
  type: "number" | "string" | "string[]" | "boolean"
  options?: readonly string[]
  kind: VocabularyKind
  group: VocabularyGroup
}

export const effectCategories: ReadonlySet<string> = new Set([
  "text",
  "backgrounds",
  "cursor",
  "decor",
  "cards",
  "buttons",
  "micro",
  "loaders",
  "scroll",
  "showcase",
  "page",
])

export const propVocabulary: readonly VocabularyWord[] = [
  { name: "duration", type: "number", kind: "range", group: "动画" },
  { name: "interval", type: "number", kind: "range", group: "动画" },
  { name: "speed", type: "number", kind: "range", group: "动画" },
  { name: "color", type: "string", kind: "color", group: "外观" },
  { name: "colors", type: "string[]", kind: "colors", group: "外观" },
  { name: "intensity", type: "number", kind: "range", group: "外观" },
  { name: "size", type: "number", kind: "range", group: "外观" },
  { name: "count", type: "number", kind: "range", group: "外观" },
  { name: "gap", type: "number", kind: "range", group: "外观" },
  {
    name: "direction",
    type: "string",
    options: ["left", "right", "up", "down"],
    kind: "select",
    group: "动画",
  },
  {
    name: "trigger",
    type: "string",
    options: ["mount", "hover", "inView"],
    kind: "select",
    group: "交互",
  },
  { name: "scale", type: "number", kind: "range", group: "外观" },
  { name: "angle", type: "number", kind: "range", group: "外观" },
  { name: "fontSize", type: "number", kind: "range", group: "文字" },
  { name: "fontWeight", type: "number", kind: "range", group: "文字" },
  { name: "letterSpacing", type: "number", kind: "range", group: "文字" },
  {
    name: "align",
    type: "string",
    options: ["left", "center", "right"],
    kind: "select",
    group: "文字",
  },
  { name: "delay", type: "number", kind: "range", group: "动画" },
  { name: "loop", type: "boolean", kind: "boolean", group: "动画" },
  { name: "interactive", type: "boolean", kind: "boolean", group: "交互" },
]

const vocabularyByName = new Map(propVocabulary.map((word) => [word.name, word]))

export function vocabularyWord(name: string): VocabularyWord | undefined {
  return vocabularyByName.get(name)
}

/** 文档页省略 group 时用的分组。名字不在词汇表里时返回 undefined，调用方再归到「外观」。 */
export function implicitControlGroup(name: string): VocabularyGroup | undefined {
  return vocabularyByName.get(name)?.group
}
