import type { ComponentType } from "react"

import { getCatalogGroups, layerBadges, type ComponentMeta } from "@effect-ui/registry/catalog"
import { getDemo } from "@effect-ui/registry/examples/index"

import { ComponentPreview } from "@/components/component-preview"
import { ComponentTabs } from "@/components/component-tabs"
import { FamilyIndex, type FamilyIndexItem } from "@/components/family-index"
import { PropsTable } from "@/components/props-table"
import type { FamilyCluster } from "@/lib/family-path"
import { highlightCode, languageForFile } from "@/lib/highlight"
import { getRegistryBaseUrl, readRegistrySource } from "@/lib/source"
import { readUsageExample } from "@/lib/usage"

function componentExportName(source: string) {
  const match = source.match(/export\s*\{([^}]+)\}/)
  const body = match?.[1]
  if (!body) return ""
  for (const part of body.split(",")) {
    const name = part.trim()
    if (name.length === 0 || name.startsWith("type ")) continue
    return name.split(/\s+as\s+/)[0]?.trim() ?? ""
  }
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

function previewOf(item: ComponentMeta) {
  const Demo = getDemo(item.name)
  if (!Demo) return null
  const controls = item.props.flatMap((prop) =>
    prop.control ? [{ name: prop.name, defaultValue: prop.defaultValue, control: prop.control }] : [],
  )
  return { Demo: Demo as ComponentType, controls }
}

async function componentDocs(item: ComponentMeta, installBase: string) {
  const files =
    item.files && item.files.length > 0
      ? item.files
      : [{ file: item.file, type: item.type, target: item.target }]
  const sources = files.map((file) => ({
    ...file,
    code: readRegistrySource(file.file),
  }))
  const usage = readUsageExample(item.name)
  const install = `npx shadcn@latest add ${installBase}/r/${item.name}.json`
  const [sourceHtml, installHtml, usageHtml] = await Promise.all([
    Promise.all(sources.map((file) => highlightCode(file.code, languageForFile(file.file)))),
    highlightCode(install, "bash"),
    highlightCode(usage, "tsx"),
  ])
  const targets = sources.map((file) => file.target)
  const primary = sources.find((file) => file.file === item.file) ?? sources[0]
  return {
    componentName: primary ? componentExportName(primary.code) : "",
    usage: { code: usage, html: usageHtml, filename: "example.tsx" },
    install: { code: install, html: installHtml },
    sources: sources.map((file, fileIndex) => ({
      id: file.file,
      label: sourceTabLabel(file.target, targets),
      code: file.code,
      html: sourceHtml[fileIndex] ?? "",
      filename: file.target,
    })),
  }
}

async function FamilyGallery({
  cluster,
  title,
  description,
}: {
  cluster: FamilyCluster
  title: string
  description: string
}) {
  const group = getCatalogGroups().find((entry) => entry.key === cluster)
  const items = group?.items ?? []
  const indexItems: FamilyIndexItem[] = items.flatMap((item) => {
    const section = group?.sections.find((entry) => entry.items.some((member) => member.name === item.name))
    return [{ name: item.name, title: item.title, section: section?.label ?? title }]
  })
  const installBase = getRegistryBaseUrl()
  const documented = await Promise.all(
    items.map(async (item) => {
      const preview = previewOf(item)
      const docs = preview ? await componentDocs(item, installBase) : null
      return { item, preview, docs }
    }),
  )

  return (
    <article className="mx-auto max-w-5xl space-y-8">
      <header className="space-y-3">
        <h1 className="font-display text-4xl tracking-tight">{title}</h1>
        <p className="text-muted-foreground">{description}</p>
      </header>
      <FamilyIndex items={indexItems} />
      {documented.map(({ item, preview, docs }) => (
        <section key={item.name} id={item.name} className="scroll-mt-20 space-y-4 border-t pt-8">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-2xl font-medium tracking-tight">{item.title}</h2>
              {layerBadges(item).map((label) => (
                <span
                  key={label}
                  className="inline-flex w-fit items-center rounded-md border px-2 py-0.5 text-xs font-medium"
                >
                  {label}
                </span>
              ))}
            </div>
            <p className="text-sm text-muted-foreground">{item.description}</p>
          </div>
          {preview && docs ? (
            <ComponentTabs
              fullScreenHref={`/preview/${item.name}`}
              preview={
                <ComponentPreview
                  Demo={preview.Demo}
                  componentName={docs.componentName}
                  controls={preview.controls}
                  presets={item.presets}
                />
              }
              usage={docs.usage}
              install={docs.install}
              sources={docs.sources}
            />
          ) : (
            <code className="block overflow-x-auto rounded-lg bg-muted px-3 py-2 font-mono text-xs">
              npx shadcn@latest add {installBase}/r/{item.name}.json
            </code>
          )}
          <PropsTable props={[...item.props]} />
        </section>
      ))}
    </article>
  )
}

export { FamilyGallery }
