"use client"

import type { ComponentType } from "react"

function ComponentPreview({ Demo }: { Demo: ComponentType }) {
  return (
    <div className="flex min-h-64 items-center justify-center rounded-xl border bg-[radial-gradient(circle_at_top,color-mix(in_oklab,var(--primary)_8%,transparent),transparent_46%)] p-8">
      <Demo />
    </div>
  )
}

export { ComponentPreview }
