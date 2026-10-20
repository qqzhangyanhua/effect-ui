"use client"

import { Maximize2 } from "lucide-react"
import Link from "next/link"
import type { ReactNode } from "react"

import { Button } from "@effect-ui/registry/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@effect-ui/registry/ui/tabs"

import { CodeBlock } from "@/components/code-block"

interface CodePane {
  code: string
  html: string
  filename?: string
}

interface SourcePane extends CodePane {
  id: string
  label: string
}

function ComponentTabs({
  preview,
  fullScreenHref,
  usage,
  install,
  sources,
}: {
  preview: ReactNode
  fullScreenHref: string
  usage: CodePane
  install: CodePane
  sources: readonly SourcePane[]
}) {
  const firstSource = sources[0]

  return (
    <Tabs defaultValue="preview" className="gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <TabsList aria-label="文档视图">
          <TabsTrigger value="preview">Preview</TabsTrigger>
          <TabsTrigger value="code">Code</TabsTrigger>
        </TabsList>
        <Button variant="outline" size="sm" asChild>
          <Link href={fullScreenHref}>
            <Maximize2 className="size-3.5" />
            全屏预览
          </Link>
        </Button>
      </div>

      <TabsContent value="preview">{preview}</TabsContent>

      <TabsContent value="code">
        <Tabs defaultValue="usage" className="gap-4">
          <TabsList aria-label="代码" className="max-w-full justify-start overflow-x-auto">
            <TabsTrigger value="usage">用法</TabsTrigger>
            <TabsTrigger value="install">安装</TabsTrigger>
            <TabsTrigger value="source">源码</TabsTrigger>
          </TabsList>
          <TabsContent value="usage">
            <CodeBlock code={usage.code} html={usage.html} filename={usage.filename} />
          </TabsContent>
          <TabsContent value="install">
            <CodeBlock code={install.code} html={install.html} filename={install.filename} />
          </TabsContent>
          <TabsContent value="source">
            {sources.length > 1 && firstSource ? (
              <Tabs defaultValue={firstSource.id} className="gap-4">
                <TabsList aria-label="源码文件" className="max-w-full justify-start overflow-x-auto">
                  {sources.map((file) => (
                    <TabsTrigger key={file.id} value={file.id}>
                      {file.label}
                    </TabsTrigger>
                  ))}
                </TabsList>
                {sources.map((file) => (
                  <TabsContent key={file.id} value={file.id}>
                    <CodeBlock code={file.code} html={file.html} filename={file.filename} />
                  </TabsContent>
                ))}
              </Tabs>
            ) : firstSource ? (
              <CodeBlock code={firstSource.code} html={firstSource.html} filename={firstSource.filename} />
            ) : null}
          </TabsContent>
        </Tabs>
      </TabsContent>
    </Tabs>
  )
}

export { ComponentTabs }
