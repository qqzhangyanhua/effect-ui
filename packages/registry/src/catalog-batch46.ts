import type { ComponentMeta, PropDoc } from "./catalog"

const ui: PropDoc[] = [{ name: "className", type: "string", description: "额外 Tailwind 类名，与主题变量兼容。" }]

export const batch46Components: ComponentMeta[] = [
  {
    name: "card-toss-stack",
    title: "Card Toss Stack",
    description:
      "原创实现。叠在上面的卡片可以拖拽，松手后按出手速度惯性飞出并移走。方向键也能甩出。拖得不够远会回到原位。减弱动效时直接拿走，不再飞。没有新增依赖。",
    category: "cards",
    source: "original",
    type: "registry:ui",
    file: "effects/card-toss-stack.tsx",
    target: "components/ui/card-toss-stack.tsx",
    props: [
      { name: "cards", type: "{ id: string; title: string; detail: string }[]", description: "初始卡片。省略时用内置三张。" },
      { name: "onToss", type: "(id: string) => void", description: "卡片飞出或被直接拿走后调用。" },
      { name: "color", type: "string", defaultValue: "var(--primary)", description: "卡片描边。不传则跟随主题。", control: { kind: "color" } },
      {
        name: "size",
        type: "number",
        defaultValue: "280",
        description: "卡片堆宽度，像素。",
        control: { kind: "range", value: 280, min: 200, max: 420, step: 4 },
      },
      {
        name: "duration",
        type: "number",
        defaultValue: "700",
        description: "飞出最长持续的毫秒数。越长，惯性衰减越慢。",
        control: { kind: "range", value: 700, min: 280, max: 1400, step: 20 },
      },
      { name: "fling", type: "number", defaultValue: "0.8", description: "判定甩出的速度，像素/毫秒。位移超过 72 像素时也会甩出。" },
      ...ui,
    ],
  },
  {
    name: "toss-to-trash",
    title: "Toss To Trash",
    description:
      "原创实现。把条目向下拖过一段距离，或拖到垃圾桶上，松手后沿抛物线落入并删除。Delete、Backspace 或向下方向键同样可以扔。减弱动效时直接删除。没有新增依赖。",
    category: "cards",
    source: "original",
    type: "registry:ui",
    file: "effects/toss-to-trash.tsx",
    target: "components/ui/toss-to-trash.tsx",
    props: [
      { name: "items", type: "{ id: string; label: string }[]", description: "初始条目。省略时用内置三条。" },
      { name: "onDelete", type: "(id: string) => void", description: "条目落入或被直接删除后调用。" },
      { name: "color", type: "string", defaultValue: "var(--destructive)", description: "垃圾桶和条目描边。不传则跟随主题。", control: { kind: "color" } },
      {
        name: "size",
        type: "number",
        defaultValue: "48",
        description: "条目高度，像素。",
        control: { kind: "range", value: 48, min: 36, max: 72, step: 2 },
      },
      {
        name: "duration",
        type: "number",
        defaultValue: "520",
        description: "抛物线落入的毫秒数。",
        control: { kind: "range", value: 520, min: 210, max: 1040, step: 10 },
      },
      {
        name: "arc",
        type: "number",
        defaultValue: "72",
        description: "抛物线拱起的高度，像素。",
        control: { kind: "range", value: 72, min: 28, max: 144, step: 2 },
      },
      ...ui,
    ],
  },
  {
    name: "sticky-note-board",
    title: "Sticky Note Board",
    description:
      "原创实现。便利贴可以拖动，松手后按出手速度继续滑一段，并随横向速度倾斜。方向键每次挪 24 像素。减弱动效时停在落点，不再滑、不再倾斜。没有新增依赖。",
    category: "cards",
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
      ...ui,
    ],
  },
]
