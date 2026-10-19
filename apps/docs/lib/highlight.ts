import { createHighlighter, type Highlighter } from "shiki"

const languages = ["tsx", "typescript", "bash"] as const

export type HighlightLanguage = (typeof languages)[number]

let highlighter: Promise<Highlighter> | undefined

function getHighlighter() {
  highlighter ??= createHighlighter({
    themes: ["github-dark"],
    langs: [...languages],
  })
  return highlighter
}

export function languageForFile(file: string): HighlightLanguage {
  if (file.endsWith(".ts")) return "typescript"
  return "tsx"
}

export async function highlightCode(code: string, lang: HighlightLanguage) {
  const instance = await getHighlighter()
  return instance.codeToHtml(code, {
    lang,
    theme: "github-dark",
  })
}
