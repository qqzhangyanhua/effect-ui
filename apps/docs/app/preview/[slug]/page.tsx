import Link from "next/link"
import { notFound } from "next/navigation"
import type { ComponentType } from "react"

import { getComponent, visibleComponents } from "@effect-ui/registry/catalog"
import { getDemo } from "@effect-ui/registry/examples/index"
import { AgencyTemplate } from "@effect-ui/registry/templates/agency/page"
import { AiProductTemplate } from "@effect-ui/registry/templates/ai-product/page"
import { DevtoolTemplate } from "@effect-ui/registry/templates/devtool/page"
import { PortfolioTemplate } from "@effect-ui/registry/templates/portfolio/page"
import { SaasTemplate } from "@effect-ui/registry/templates/saas/page"

const templateComponents: Record<string, ComponentType> = {
  "saas-template": SaasTemplate,
  "ai-product-template": AiProductTemplate,
  "devtool-template": DevtoolTemplate,
  "portfolio-template": PortfolioTemplate,
  "agency-template": AgencyTemplate,
}

interface PreviewPageProps {
  params: Promise<{ slug: string }>
}

function FullScreenDemo({ Demo }: { Demo: ComponentType }) {
  return (
    <div className="flex min-h-svh w-full flex-col">
      <div className="m-auto flex w-full justify-center">
        <Demo />
      </div>
    </div>
  )
}

export const dynamicParams = false

export function generateStaticParams() {
  return visibleComponents
    .filter((item) => getDemo(item.name))
    .map((item) => ({ slug: item.name }))
}

export async function generateMetadata({ params }: PreviewPageProps) {
  const { slug } = await params
  const item = getComponent(slug)
  if (!item || !getDemo(item.name)) return {}
  return { title: item.title }
}

async function PreviewPage({ params }: PreviewPageProps) {
  const { slug } = await params
  const item = getComponent(slug)
  const Demo = item ? getDemo(item.name) : undefined
  if (!item || !Demo) notFound()

  const Template = item.category === "templates" ? templateComponents[slug] : undefined

  return (
    <div className="relative min-h-svh">
      <Link
        href={`/docs/${slug}`}
        className="fixed top-4 right-4 z-50 rounded-full border bg-background/80 px-3 py-1 text-xs backdrop-blur"
      >
        返回文档
      </Link>
      {Template ? <Template /> : <FullScreenDemo Demo={Demo} />}
    </div>
  )
}

export default PreviewPage
