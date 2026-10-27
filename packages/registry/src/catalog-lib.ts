import type { ComponentMeta } from "./catalog"

/** Lib。 */
export const libComponents: ComponentMeta[] = [
  {
    name: "cn",
    batch: 1,
    title: "cn",
    description: "合并 class 名。条件交给 clsx，冲突的 Tailwind 类交给 tailwind-merge。",
    layer: "lib",
    source: "original",
    type: "registry:lib",
    file: "lib/cn.ts",
    target: "lib/cn.ts",
    props: [],
  },
  {
      name: "text-style",
      batch: 1,
      title: "Text Style",
      description: "把字号、字重、字距和对齐写成内联样式。不传则不写样式。",
      layer: "lib",
      source: "original",
      type: "registry:lib",
      file: "lib/text-style.ts",
      target: "lib/text-style.ts",
      props: [
        { name: "style", type: "CSSProperties | undefined", description: "已有的内联样式。不传则从空对象开始。" },
        { name: "fontSize", type: "number", description: "字号，像素。不传则不写。" },
        { name: "fontWeight", type: "number", description: "字重。不传则不写。" },
        { name: "letterSpacing", type: "number", description: "字距，em。不传则不写。" },
        { name: "align", type: '"left" | "center" | "right"', description: "对齐。不传则不写。" },
      ],
    }
]

