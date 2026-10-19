import type { MetadataRoute } from "next"

import { visibleComponents } from "@effect-ui/registry/catalog"

import { getRegistryBaseUrl } from "@/lib/source"

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = getRegistryBaseUrl()
  return [
    { url: baseUrl },
    { url: `${baseUrl}/docs` },
    ...visibleComponents.map((item) => ({
      url: `${baseUrl}/docs/${item.name}`,
    })),
  ]
}
