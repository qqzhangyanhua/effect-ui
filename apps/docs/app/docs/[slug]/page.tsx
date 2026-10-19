import { notFound } from "next/navigation"

import { getDemo } from "@effect-ui/registry/examples/index"
import { getComponent, visibleComponents } from "@effect-ui/registry/catalog"
import { Badge } from "@effect-ui/registry/ui/badge"

import { CodeBlock } from "@/components/code-block"
import { ComponentPreview } from "@/components/component-preview"
import { PropsTable } from "@/components/props-table"
import { highlightCode, languageForFile } from "@/lib/highlight"
import { readRegistrySource } from "@/lib/source"

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
  }
}

async function ComponentDocsPage({ params }: DocsPageProps) {
  const { slug } = await params
  const item = getComponent(slug)
  if (!item || item.name === "utils") notFound()

  const Demo = getDemo(item.name)
  if (!Demo) notFound()

  const source = readRegistrySource(item.file)
  const install = `npx shadcn@latest add /r/${item.name}.json`
  const [sourceHtml, installHtml] = await Promise.all([
    highlightCode(source, languageForFile(item.file)),
    highlightCode(install, "bash"),
  ])

  return (
    <article className="mx-auto max-w-3xl space-y-8">
      <header className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary">{item.source}</Badge>
          <Badge variant="outline">{item.category}</Badge>
        </div>
        <h1 className="font-display text-4xl tracking-tight">{item.title}</h1>
        <p className="text-muted-foreground">{item.description}</p>
      </header>

      <section className="space-y-3">
        <h2 className="text-xl font-medium">预览</h2>
        <ComponentPreview Demo={Demo} />
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-medium">安装</h2>
        <CodeBlock code={install} html={installHtml} />
        <p className="text-sm text-muted-foreground">
          文档站运行后，也可使用{" "}
          <code className="rounded bg-muted px-1.5 py-0.5 font-mono">
            npx shadcn@latest add http://localhost:3000/r/{item.name}.json
          </code>
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-medium">源码</h2>
        <CodeBlock code={source} html={sourceHtml} filename={item.target} />
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-medium">Props</h2>
        <PropsTable props={item.props} />
      </section>
    </article>
  )
}

export default ComponentDocsPage
