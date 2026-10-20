import Link from "next/link"
import { notFound } from "next/navigation"

import { getDemo } from "@effect-ui/registry/examples/index"
import {
  categoryLabels,
  getComponent,
  getComponentsByCategory,
  sourceLibraryUrls,
  visibleComponents,
} from "@effect-ui/registry/catalog"
import { Badge } from "@effect-ui/registry/ui/badge"

import { CodeBlock } from "@/components/code-block"
import { ComponentPreview } from "@/components/component-preview"
import { PropsTable } from "@/components/props-table"
import { highlightCode, languageForFile } from "@/lib/highlight"
import { getRegistryBaseUrl, readRegistrySource } from "@/lib/source"
import { readUsageExample } from "@/lib/usage"

interface DocsPageProps {
  params: Promise<{ slug: string }>
}

export function generateStaticParams() {
  return visibleComponents.map((item) => ({ slug: item.name }))
}

export async function generateMetadata({ params }: DocsPageProps) {
  const { slug } = await params
  const item = getComponent(slug)
  if (!item) return {}
  return {
    title: item.title,
    description: item.description,
    openGraph: {
      title: item.title,
      description: item.description,
      url: `/docs/${item.name}`,
    },
  }
}

async function ComponentDocsPage({ params }: DocsPageProps) {
  const { slug } = await params
  const item = getComponent(slug)
  if (!item || item.name === "utils") notFound()

  const Demo = getDemo(item.name)
  if (!Demo) notFound()

  const files =
    item.files && item.files.length > 0
      ? item.files
      : [{ file: item.file, type: item.type, target: item.target }]
  const sources = files.map((file) => ({
    ...file,
    code: readRegistrySource(file.file),
  }))
  const usage = readUsageExample(item.name)
  const install = `npx shadcn@latest add ${getRegistryBaseUrl()}/r/${item.name}.json`
  const sourceUrl = sourceLibraryUrls[item.source]
  const ordered = getComponentsByCategory().flatMap((group) => group.items)
  const index = ordered.findIndex((entry) => entry.name === item.name)
  const previous = index > 0 ? ordered[index - 1] : undefined
  const next = index >= 0 ? ordered[index + 1] : undefined
  const template = item.category === "templates"
  const [sourceHtml, installHtml, usageHtml] = await Promise.all([
    Promise.all(sources.map((file) => highlightCode(file.code, languageForFile(file.file)))),
    highlightCode(install, "bash"),
    highlightCode(usage, "tsx"),
  ])

  return (
    <article className="mx-auto max-w-3xl space-y-8">
      <header className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          {sourceUrl ? (
            <Badge variant="secondary" asChild>
              <a href={sourceUrl} target="_blank" rel="noreferrer">
                {item.source}
              </a>
            </Badge>
          ) : (
            <Badge variant="secondary">{item.source}</Badge>
          )}
          <Badge variant="outline">{categoryLabels[item.category]}</Badge>
        </div>
        <h1 className="font-display text-4xl tracking-tight">{item.title}</h1>
        <p className="text-muted-foreground">{item.description}</p>
      </header>

      <section className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-xl font-medium">预览</h2>
          {template ? (
            <Link href={`/preview/${item.name}`} className="text-sm underline">
              全屏预览
            </Link>
          ) : null}
        </div>
        {template ? (
          <iframe
            title={`${item.title} 预览`}
            src={`/preview/${item.name}`}
            loading="lazy"
            className="h-[70vh] w-full rounded-xl border bg-background"
          />
        ) : (
          <ComponentPreview Demo={Demo} />
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-medium">用法</h2>
        <CodeBlock code={usage} html={usageHtml} filename="example.tsx" />
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-medium">安装</h2>
        <CodeBlock code={install} html={installHtml} />
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-medium">源码</h2>
        {sources.map((file, fileIndex) => (
          <CodeBlock
            key={file.file}
            code={file.code}
            html={sourceHtml[fileIndex] ?? ""}
            filename={file.target}
          />
        ))}
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-medium">Props</h2>
        <PropsTable props={item.props} />
      </section>

      {previous || next ? (
        <nav aria-label="组件导航" className="flex items-start justify-between gap-4 border-t pt-8">
          {previous ? (
            <Link href={`/docs/${previous.name}`} className="group min-w-0 space-y-1">
              <span className="block text-sm text-muted-foreground">上一个</span>
              <span className="block truncate font-medium group-hover:underline">{previous.title}</span>
            </Link>
          ) : null}
          {next ? (
            <Link href={`/docs/${next.name}`} className="group ml-auto min-w-0 space-y-1 text-right">
              <span className="block text-sm text-muted-foreground">下一个</span>
              <span className="block truncate font-medium group-hover:underline">{next.title}</span>
            </Link>
          ) : null}
        </nav>
      ) : null}
    </article>
  )
}

export default ComponentDocsPage
