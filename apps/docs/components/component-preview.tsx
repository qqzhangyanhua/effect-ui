"use client"

import type { ComponentType } from "react"

import { ControlledPreview, type ControlField } from "@/components/control-panel"
import { PreviewFrame } from "@/components/preview-frame"

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
    <PreviewFrame>
      <Demo />
    </PreviewFrame>
  )
}

export { ComponentPreview }
