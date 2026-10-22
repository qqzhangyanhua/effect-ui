import Link from "next/link"
import { notFound, redirect } from "next/navigation"

import { getDemo } from "@effect-ui/registry/examples/index"
import {
  categoryLabels,
  componentCluster,
  getCatalogGroups,
  getComponent,
  sourceLibraryUrls,
  visibleComponents,
} from "@effect-ui/registry/catalog"
import { Badge } from "@effect-ui/registry/ui/badge"

import { ComponentPreview } from "@/components/component-preview"
import { ComponentTabs } from "@/components/component-tabs"
import { PropsTable } from "@/components/props-table"
import { familyPath } from "@/lib/family-path"
import { highlightCode, languageForFile } from "@/lib/highlight"
import { getRegistryBaseUrl, readRegistrySource } from "@/lib/source"
import { readUsageExample } from "@/lib/usage"

interface DocsPageProps {
  params: Promise<{ slug: string }>
}

function componentExportName(source: string, slug = "") {
  const match = source.match(/export\s*\{([^}]+)\}/)
  const body = match?.[1]
  if (body) {
    for (const part of body.split(",")) {
      const name = part.trim()
      if (name.length === 0 || name.startsWith("type ")) continue
      return name.split(/\s+as\s+/)[0]?.trim() ?? ""
    }
  }
  const expected = slug
    .split("-")
    .filter((part) => part.length > 0)
    .map((part) => part.slice(0, 1).toUpperCase() + part.slice(1))
    .join("")
  if (expected.length > 0 && new RegExp(`export\\s+function\\s+${expected}\\b`).test(source)) return expected
  return ""
}

function fileName(target: string) {
  return target.split("/").pop() ?? target
}

function sourceTabLabel(target: string, targets: readonly string[]) {
  const name = fileName(target)
  const shared = targets.filter((item) => fileName(item) === name).length > 1
  return shared ? target : name
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
  const cluster = componentCluster(slug)
  if (cluster) redirect(`${familyPath(cluster)}#${slug}`)
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
  const ordered = getCatalogGroups().flatMap((group) => group.items)
  const index = ordered.findIndex((entry) => entry.name === item.name)
  const previous = index > 0 ? ordered[index - 1] : undefined
  const next = index >= 0 ? ordered[index + 1] : undefined
  const template = item.category === "templates"
  const [sourceHtml, installHtml, usageHtml] = await Promise.all([
    Promise.all(sources.map((file) => highlightCode(file.code, languageForFile(file.file)))),
    highlightCode(install, "bash"),
    highlightCode(usage, "tsx"),
  ])

  const targets = sources.map((file) => file.target)
  const primary = sources.find((file) => file.file === item.file) ?? sources[0]
  const controls = item.props.flatMap((prop) =>
    prop.control ? [{ name: prop.name, defaultValue: prop.defaultValue, control: prop.control }] : [],
  )

  return (
    <article className="mx-auto max-w-5xl space-y-8">
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

      <ComponentTabs
        fullScreenHref={`/preview/${item.name}`}
        preview={
          template ? (
            <iframe
              title={`${item.title} 预览`}
              src={`/preview/${item.name}`}
              loading="lazy"
              className="h-[70vh] w-full rounded-xl border bg-background"
            />
          ) : (
            <ComponentPreview
              Demo={Demo}
              componentName={primary ? componentExportName(primary.code, item.name) : ""}
              controls={controls}
              presets={item.presets}
            />
          )
        }
        usage={{ code: usage, html: usageHtml, filename: "example.tsx" }}
        install={{ code: install, html: installHtml }}
        sources={sources.map((file, fileIndex) => ({
          id: file.file,
          label: sourceTabLabel(file.target, targets),
          code: file.code,
          html: sourceHtml[fileIndex] ?? "",
          filename: file.target,
        }))}
      />

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
