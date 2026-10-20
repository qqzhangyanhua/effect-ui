import Link from "next/link"
import { notFound } from "next/navigation"
import type { ComponentType } from "react"

import { AgencyTemplate } from "@effect-ui/registry/templates/agency/page"
import { AiProductTemplate } from "@effect-ui/registry/templates/ai-product/page"
import { DevtoolTemplate } from "@effect-ui/registry/templates/devtool/page"
import { PortfolioTemplate } from "@effect-ui/registry/templates/portfolio/page"
import { SaasTemplate } from "@effect-ui/registry/templates/saas/page"

const templates: Record<string, ComponentType> = {
  "saas-template": SaasTemplate,
  "ai-product-template": AiProductTemplate,
  "devtool-template": DevtoolTemplate,
  "portfolio-template": PortfolioTemplate,
  "agency-template": AgencyTemplate,
}

interface PreviewPageProps {
  params: Promise<{ slug: string }>
}

export const dynamicParams = false

export function generateStaticParams() {
  return Object.keys(templates).map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: PreviewPageProps) {
  const { slug } = await params
  if (!templates[slug]) return {}
  return { title: slug }
}

async function TemplatePreviewPage({ params }: PreviewPageProps) {
  const { slug } = await params
  const Template = templates[slug]
  if (!Template) notFound()

  return (
    <div className="relative min-h-svh">
      <Link
        href={`/docs/${slug}`}
        className="fixed top-4 right-4 z-50 rounded-full border bg-background/80 px-3 py-1 text-xs backdrop-blur"
      >
        返回文档
      </Link>
      <Template />
    </div>
  )
}

export default TemplatePreviewPage
