"use client"

import type { ComponentType } from "react"

import type { ControlPreset } from "@effect-ui/registry/catalog"

import { ControlledPreview, type ControlField } from "@/components/control-panel"
import { PreviewFrame } from "@/components/preview-frame"

function ComponentPreview({
  Demo,
  componentName,
  controls,
  presets,
}: {
  Demo: ComponentType
  componentName?: string
  controls?: readonly ControlField[]
  presets?: readonly ControlPreset[]
}) {
  if (componentName && controls && controls.length > 0) {
    return <ControlledPreview Demo={Demo} componentName={componentName} controls={controls} presets={presets} />
  }
  return (
    <PreviewFrame>
      <Demo />
    </PreviewFrame>
  )
}

export { ComponentPreview }
