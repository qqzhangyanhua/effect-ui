import type { ComponentMeta, PropDoc } from "./catalog"
import { expansionFile, expansions } from "./catalog-sources"

/** Composite component，反馈。 */
const ui: PropDoc[] = [
  { name: "className", type: "string", description: "额外 Tailwind 类名，与主题变量兼容。" },
]

export const compositeFeedbackComponents: ComponentMeta[] = [
  {
    name: "progress-with-value",
    batch: 29,
    title: "Progress With Value",
    description: `${expansions} ${expansionFile("progress-with-value")} 带数值标签的进度条。position 可以贴在起点、终点、跟随条的末端，或放到条的外面。减弱动效时指示条没有宽度过渡。`,
    layer: "composite",
    purposeGroup: "feedback",
    source: "shadcn-ui-expansions",
    type: "registry:ui",
    file: "effects/progress-with-value.tsx",
    target: "components/ui/progress-with-value.tsx",
    props: [
      { name: "position", type: '"start" | "start-outside" | "follow" | "end" | "end-outside"', defaultValue: "end", description: "标签相对进度条的位置。" },
      { name: "label", type: "(value?: number | null) => ReactNode", description: "自定义标签。缺省时显示百分比。" },
      { name: "valueClassName", type: "string", description: "标签类名。" },
      ...ui,
    ],
  },
]

