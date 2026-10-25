import type { Metadata } from "next"
import Link from "next/link"

import { getCatalogGroups } from "@effect-ui/registry/catalog"

export const metadata: Metadata = {
  title: "AI",
  description: "跨 Layer 的 AI 条目索引。打开某一项仍是它自己的文档页。",
}

function AiTopicPage() {
  const items =
    getCatalogGroups()
      .find((group) => group.key === "topics")
      ?.sections.find((section) => section.key === "ai")?.items ?? []

  return (
    <article className="mx-auto max-w-3xl space-y-8">
      <header className="space-y-3">
        <h1 className="font-display text-4xl tracking-tight">AI</h1>
        <p className="text-muted-foreground">
          这些条目服务同一个领域，分属不同 Layer。这里只做索引，打开某一项仍是它自己的文档页。
        </p>
      </header>
      <div className="flex flex-wrap gap-2">
        {items.map((item) => (
          <Link
            key={item.name}
            href={`/docs/${item.name}`}
            className="rounded-full border px-3 py-1 text-sm hover:bg-accent"
          >
            {item.title}
          </Link>
        ))}
      </div>
    </article>
  )
}

export default AiTopicPage
