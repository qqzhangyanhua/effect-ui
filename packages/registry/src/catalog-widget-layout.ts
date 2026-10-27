import type { ComponentMeta, PropDoc } from "./catalog"

/** Widget，布局。 */
const ui4: PropDoc[] = [
  {
    name: "className",
    type: "string",
    description: "额外 Tailwind 类名，与主题变量兼容。",
  },
]
const ui40: PropDoc[] = [{ name: "className", type: "string", description: "额外 Tailwind 类名，与主题变量兼容。" }]

export const widgetLayoutComponents: ComponentMeta[] = [
  {
      name: "curved-scrollbar",
      batch: 18,
      title: "Curved Scrollbar",
      description: "灵感来自 Codrops Custom curved corner scrollbars，原创实现。轨道沿圆角弯曲，滑块跟着滚动走。原生滚动保留，只隐藏原生条。",
      layer: "widget",
      purposeGroup: "layout",
      source: "original",
      type: "registry:ui",
      file: "effects/curved-scrollbar.tsx",
      target: "components/ui/curved-scrollbar.tsx",
      props: [
        {
          name: "radius",
          type: "number",
          defaultValue: "28",
          description: "轨道圆角半径。",
          control: { kind: "range", value: 28, min: 0, max: 64, step: 1 },
        },
        ...ui4,
      ],
    },
  {
      name: "sticky-note-board",
      batch: 46,
      title: "Sticky Note Board",
      description:
        "原创实现。便利贴可以拖动，松手后按出手速度继续滑一段，并随横向速度倾斜。方向键每次挪 24 像素。减弱动效时停在落点，不再滑、不再倾斜。没有新增依赖。",
      layer: "widget",
      purposeGroup: "layout",
      source: "original",
      type: "registry:ui",
      file: "effects/sticky-note-board.tsx",
      target: "components/ui/sticky-note-board.tsx",
      props: [
        { name: "notes", type: "{ id: string; text: string; x: number; y: number }[]", description: "初始便利贴。省略时用内置三张。" },
        { name: "onMove", type: "(id: string, x: number, y: number) => void", description: "便利贴停下后的位置回调。" },
        { name: "color", type: "string", defaultValue: "var(--card)", description: "便利贴纸色。不传则跟随主题。", control: { kind: "color" } },
        {
          name: "size",
          type: "number",
          defaultValue: "148",
          description: "便利贴宽度，像素。",
          control: { kind: "range", value: 148, min: 112, max: 220, step: 2 },
        },
        {
          name: "duration",
          type: "number",
          defaultValue: "640",
          description: "松手后惯性滑行的最长毫秒数。",
          control: { kind: "range", value: 640, min: 260, max: 1280, step: 20 },
        },
        {
          name: "tilt",
          type: "number",
          defaultValue: "12",
          description: "横向速度换成倾斜角的倍率，结果限制在 ±18 度。",
          control: { kind: "range", value: 12, min: 0, max: 24, step: 1 },
        },
        ...ui40,
      ],
    }
]

