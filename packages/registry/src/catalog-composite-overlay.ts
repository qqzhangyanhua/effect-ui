import type { ComponentMeta, PropDoc } from "./catalog"

/** Composite component，浮层。 */
const ui11: PropDoc[] = [
  {
    name: "className",
    type: "string",
    description: "额外 Tailwind 类名，与主题变量兼容。",
  },
]

export const compositeOverlayComponents: ComponentMeta[] = [
  {
      name: "anchor-popover",
      batch: 11,
      title: "Anchor Popover",
      description: "原创。CSS anchor 定位加 Popover API，position-try 翻转；不支持时用坐标回退。",
      layer: "composite",
      purposeGroup: "overlay",
      source: "original",
      type: "registry:ui",
      file: "ui/anchor-popover.tsx",
      target: "components/ui/anchor-popover.tsx",
      props: [
        { name: "label", type: "string", defaultValue: '"打开说明"', description: "触发按钮文案。" },
        { name: "content", type: "string", defaultValue: '"优先用 CSS anchor 定位，不够放就翻到另一侧。"', description: "浮层内容。" },
        ...ui11,
      ],
    }
]

