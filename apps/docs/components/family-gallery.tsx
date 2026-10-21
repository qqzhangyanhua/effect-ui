import type { ComponentType } from "react"

import { categoryLabels, getCatalogGroups, type ComponentMeta } from "@effect-ui/registry/catalog"
import { getDemo } from "@effect-ui/registry/examples/index"
import { Badge } from "@effect-ui/registry/ui/badge"

import { ComponentPreview } from "@/components/component-preview"
import { FamilyIndex, type FamilyIndexItem } from "@/components/family-index"
import { PropsTable } from "@/components/props-table"
import type { FamilyCluster } from "@/lib/family-path"
import { getRegistryBaseUrl, readRegistrySource } from "@/lib/source"

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

function previewOf(item: ComponentMeta) {
  const Demo = getDemo(item.name)
  if (!Demo) return null
  const source = readRegistrySource(item.file)
  const controls = item.props.flatMap((prop) =>
    prop.control ? [{ name: prop.name, defaultValue: prop.defaultValue, control: prop.control }] : [],
  )
  return { Demo: Demo as ComponentType, componentName: componentExportName(source), controls }
}

function FamilyGallery({ cluster, title, description }: { cluster: FamilyCluster; title: string; description: string }) {
  const group = getCatalogGroups().find((entry) => entry.key === cluster)
  const items = group?.items ?? []
  const indexItems: FamilyIndexItem[] = items.flatMap((item) => {
    const section = group?.sections.find((entry) => entry.items.some((member) => member.name === item.name))
    return [{ name: item.name, title: item.title, section: section?.label ?? title }]
  })
  const installBase = getRegistryBaseUrl()

  return (
    <article className="mx-auto max-w-5xl space-y-8">
      <header className="space-y-3">
        <h1 className="font-display text-4xl tracking-tight">{title}</h1>
        <p className="text-muted-foreground">{description}</p>
      </header>
      <FamilyIndex items={indexItems} />
      {items.map((item) => {
        const preview = previewOf(item)
        return (
          <section
            key={item.name}
            id={item.name}
            className="scroll-mt-20 space-y-4 border-t pt-8"
          >
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-2xl font-medium tracking-tight">{item.title}</h2>
                <Badge variant="outline">{categoryLabels[item.category]}</Badge>
              </div>
              <p className="text-sm text-muted-foreground">{item.description}</p>
              <code className="block overflow-x-auto rounded-lg bg-muted px-3 py-2 font-mono text-xs">
                npx shadcn@latest add {installBase}/r/{item.name}.json
              </code>
            </div>
            {preview ? (
              <ComponentPreview
                Demo={preview.Demo}
                componentName={preview.componentName}
                controls={preview.controls}
                presets={item.presets}
              />
            ) : null}
            <PropsTable props={[...item.props]} />
          </section>
        )
      })}
    </article>
  )
}

export { FamilyGallery }
