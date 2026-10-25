import type { ComponentMeta, PropDoc } from "./catalog"

const ui: PropDoc[] = [
  {
    name: "className",
    type: "string",
    description: "额外 Tailwind 类名，与主题变量兼容。",
  },
]

export const batch5Backgrounds: ComponentMeta[] = [
  {
    name: "halftone",
    title: "Halftone",
    description: "半调网点，随鼠标放大。",
    category: "backgrounds",
    layer: "effect",
    effectCategory: "backgrounds",
    source: "Kokonut UI",
    type: "registry:ui",
    file: "effects/halftone.tsx",
    target: "components/ui/halftone.tsx",
    props: [
      {
        name: "gap",
        type: "number",
        defaultValue: "14",
        description: "网点间距。",
        control: { kind: "range", value: 14, min: 8, max: 28, step: 1 },
      },
      {
        name: "color",
        type: "string",
        description: "网点颜色，不传则跟随前景色。",
        control: { kind: "color" },
      },
      {
        name: "intensity",
        type: "number",
        defaultValue: "0.55",
        description: "网点不透明度。",
        control: { kind: "range", value: 0.55, min: 0.2, max: 0.9, step: 0.05 },
      },
      {
        name: "size",
        type: "number",
        defaultValue: "180",
        description: "指针影响半径，单位像素。",
        control: { kind: "range", value: 180, min: 80, max: 320, step: 10 },
      },
      ...ui,
    ],
  },
]
