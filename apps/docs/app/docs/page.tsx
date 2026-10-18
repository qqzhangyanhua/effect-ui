import Link from "next/link"

import { getComponentsByCategory } from "@effect-ui/registry/catalog"
import { Badge } from "@effect-ui/registry/ui/badge"

function DocsIndexPage() {
  const groups = getComponentsByCategory()

  return (
    <article className="mx-auto max-w-3xl space-y-8">
      <div className="space-y-3">
        <Badge variant="outline">Introduction</Badge>
        <h1 className="font-display text-4xl tracking-tight">开始使用 effect-ui</h1>
        <p className="text-muted-foreground">
          这是一个 shadcn 风格的组件注册表：组件源码复制进你的仓库，由你持有、改主题、改实现。
          文档站展示每个组件的预览、源码和 props。
        </p>
      </div>
      <section className="space-y-3">
        <h2 className="text-xl font-medium">安装</h2>
        <ol className="list-decimal space-y-2 pl-5 text-sm leading-7 text-muted-foreground">
          <li>准备一个已配置 Tailwind CSS v4 和 shadcn/ui 的 React / Next.js 项目。</li>
          <li>
            直接用组件 JSON：
            <code className="mx-1 rounded bg-muted px-1.5 py-0.5 font-mono text-foreground">
              npx shadcn@latest add https://&lt;docs-host&gt;/r/shimmer-button.json
            </code>
          </li>
          <li>
            或把本仓库加为命名空间：
            <code className="mx-1 rounded bg-muted px-1.5 py-0.5 font-mono text-foreground">
              {`{ "registries": { "@effect-ui": "https://<docs-host>/r/{name}.json" } }`}
            </code>
          </li>
        </ol>
      </section>
      <section className="space-y-4">
        <h2 className="text-xl font-medium">组件索引</h2>
        {groups.map((group) => (
          <div key={group.category}>
            <h3 className="mb-2 text-sm font-medium text-muted-foreground">{group.label}</h3>
            <div className="flex flex-wrap gap-2">
              {group.items.map((item) => (
                <Link
                  key={item.name}
                  href={`/docs/${item.name}`}
                  className="rounded-full border px-3 py-1 text-sm hover:bg-accent"
                >
                  {item.title}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </section>
    </article>
  )
}

export default DocsIndexPage
