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
    name: "flow-field",
    title: "Flow Field",
    description: "流场线粒子背景。",
    category: "backgrounds",
    source: "Kokonut UI",
    type: "registry:ui",
    file: "effects/flow-field.tsx",
    target: "components/ui/flow-field.tsx",
    props: [
      {
        name: "density",
        type: "number",
        defaultValue: "70",
        description: "粒子数。",
        control: { kind: "range", value: 70, min: 20, max: 140, step: 5 },
      },
      {
        name: "speed",
        type: "number",
        defaultValue: "1",
        description: "推进速度倍率。",
        control: { kind: "range", value: 1, min: 0.25, max: 2.5, step: 0.1 },
      },
      {
        name: "color",
        type: "string",
        description: "线条颜色，不传则跟随主色。",
        control: { kind: "color" },
      },
      {
        name: "size",
        type: "number",
        defaultValue: "1",
        description: "线宽，单位像素。",
        control: { kind: "range", value: 1, min: 0.5, max: 3, step: 0.5 },
      },
      ...ui,
    ],
  },
  {
    name: "halftone",
    title: "Halftone",
    description: "半调网点，随鼠标放大。",
    category: "backgrounds",
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
