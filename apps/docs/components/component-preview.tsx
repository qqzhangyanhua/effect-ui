"use client"

import type { ComponentType } from "react"

import { ControlledPreview, PreviewShell, type ControlField } from "@/components/control-panel"

function ComponentPreview({
  Demo,
  componentName,
  controls,
}: {
  Demo: ComponentType
  componentName?: string
  controls?: readonly ControlField[]
}) {
  if (componentName && controls && controls.length > 0) {
    return <ControlledPreview Demo={Demo} componentName={componentName} controls={controls} />
  }
  return (
    <PreviewShell>
      <Demo />
    </PreviewShell>
  )
}

export { ComponentPreview }
