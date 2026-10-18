import { NextResponse } from "next/server"

import { components, getComponent } from "@effect-ui/registry/catalog"

import { readRegistrySource } from "@/lib/source"

interface RouteContext {
  params: Promise<{ name: string }>
}

function toItemJson(name: string) {
  const item = getComponent(name)
  if (!item) return null
  const content = readRegistrySource(item.file)
  return {
    $schema: "https://ui.shadcn.com/schema/registry-item.json",
    name: item.name,
    type: item.type,
    title: item.title,
    description: item.description,
    dependencies: item.dependencies,
    registryDependencies: item.registryDependencies,
    files: [
      {
        path: `registry/${item.file}`,
        type: item.type,
        target: item.target,
        content,
      },
    ],
  }
}

export async function GET(_request: Request, context: RouteContext) {
  const { name } = await context.params
  const itemName = name.endsWith(".json") ? name.slice(0, -5) : name

  if (itemName === "registry") {
    return NextResponse.json({
      $schema: "https://ui.shadcn.com/schema/registry.json",
      name: "effect-ui",
      homepage: "https://github.com/qqzhangyanhua/effect-ui",
      items: components.map((item) => ({
        name: item.name,
        type: item.type,
        title: item.title,
        description: item.description,
        dependencies: item.dependencies,
        registryDependencies: item.registryDependencies,
        files: [
          {
            path: `registry/${item.file}`,
            type: item.type,
            target: item.target,
          },
        ],
      })),
    })
  }

  const item = toItemJson(itemName)
  if (!item) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  return NextResponse.json(item)
}
