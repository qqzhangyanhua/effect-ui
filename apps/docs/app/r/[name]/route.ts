import { NextResponse } from "next/server"

import { components, getComponent } from "@effect-ui/registry/catalog"
import {
  buildRegistry,
  buildRegistryItem,
} from "@effect-ui/registry/registry-item"

import { readRegistrySource } from "@/lib/source"

interface RouteContext {
  params: Promise<{ name: string }>
}

export function generateStaticParams() {
  return [
    { name: "registry.json" },
    ...components.map((item) => ({ name: `${item.name}.json` })),
    ...components.map((item) => ({ name: item.name })),
  ]
}

export async function GET(_request: Request, context: RouteContext) {
  const { name } = await context.params
  const itemName = name.endsWith(".json") ? name.slice(0, -5) : name

  if (itemName === "registry") {
    return NextResponse.json(buildRegistry(components))
  }

  const item = getComponent(itemName)
  if (!item) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  return NextResponse.json(
    buildRegistryItem(item, readRegistrySource(item.file)),
  )
}
