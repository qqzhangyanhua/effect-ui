import type { ComponentMeta, PropDoc } from "./catalog"

const ui: PropDoc[] = [{ name: "className", type: "string", description: "额外 Tailwind 类名，与主题变量兼容。" }]

export const batch50Components: ComponentMeta[] = [
  {
    name: "upload-orbit",
    batch: 50,
    title: "Upload Orbit",
    description:
      "原创实现。上传时文件沿圆环公转，完成后收成一行。回车、空格或指针可以开始并完成。减弱动效时文件直接待在完成的一行，不再绕圈。没有新增依赖，也不使用 matter-js。",
    layer: "effect",
    effectCategory: "loaders",
    source: "original",
    type: "registry:ui",
    file: "effects/upload-orbit.tsx",
    target: "components/ui/upload-orbit.tsx",
    props: [
      { name: "files", type: "{ id: string; name: string }[]", description: "要上传的文件。省略时用内置三份。" },
      { name: "onComplete", type: "() => void", description: "文件排成一行后调用。减弱动效时在确认完成时立刻调用。" },
      { name: "color", type: "string", defaultValue: "var(--primary)", description: "文件描边。不传则跟随主题。", control: { kind: "color" } },
      {
        name: "size",
        type: "number",
        defaultValue: "320",
        description: "舞台宽度，像素。",
        control: { kind: "range", value: 320, min: 220, max: 480, step: 4 },
      },
      {
        name: "duration",
        type: "number",
        defaultValue: "1600",
        description: "绕一圈和归位各用的毫秒数。",
        control: { kind: "range", value: 1600, min: 640, max: 3200, step: 40 },
      },
      ...ui,
    ],
  },
  {
    name: "empty-state-scene",
    batch: 50,
    title: "Empty State Scene",
    description:
      "原创实现。空状态插画里的零件自己上下漂，指针或方向键可以把它们拨开，松手后慢慢漂回去。减弱动效时插画静止，拨动只改位置。没有新增依赖，也不使用 matter-js。",
    layer: "effect",
    effectCategory: "decor",
    source: "original",
    type: "registry:ui",
    file: "effects/empty-state-scene.tsx",
    target: "components/ui/empty-state-scene.tsx",
    props: [
      { name: "pieces", type: "{ id: string; label: string }[]", description: "插画零件。省略时用空盒子、纸飞机和放大镜。" },
      { name: "onNudge", type: "(id: string) => void", description: "零件被拨动后调用，参数是零件 id。" },
      { name: "color", type: "string", defaultValue: "var(--primary)", description: "零件描边。不传则跟随主题。", control: { kind: "color" } },
      {
        name: "size",
        type: "number",
        defaultValue: "320",
        description: "插画宽度，像素。",
        control: { kind: "range", value: 320, min: 220, max: 480, step: 4 },
      },
      {
        name: "duration",
        type: "number",
        defaultValue: "2400",
        description: "漂浮往返一圈的毫秒数。越长，拨开后回位越慢。",
        control: { kind: "range", value: 2400, min: 960, max: 4800, step: 40 },
      },
      ...ui,
    ],
  },
  {
    name: "reaction-tray",
    batch: 50,
    title: "Reaction Tray",
    description:
      "原创实现。选一个表情后它先弹起，再落回自己的计数。回车、空格或指针都可以选。减弱动效时不弹出，计数立刻加一。没有新增依赖，也不使用 matter-js。",
    layer: "effect",
    effectCategory: "micro",
    source: "original",
    type: "registry:ui",
    file: "effects/reaction-tray.tsx",
    target: "components/ui/reaction-tray.tsx",
    props: [
      {
        name: "reactions",
        type: "{ id: string; emoji: string; label: string; count: number }[]",
        description: "可选回应。省略时用赞、欢呼和灵感。",
      },
      { name: "onReact", type: "(id: string, count: number) => void", description: "计数落地后调用，带上新的数量。" },
      { name: "color", type: "string", defaultValue: "var(--primary)", description: "按钮描边和计数底色。不传则跟随主题。", control: { kind: "color" } },
      {
        name: "size",
        type: "number",
        defaultValue: "64",
        description: "回应按钮的最小宽度，像素。",
        control: { kind: "range", value: 64, min: 48, max: 96, step: 2 },
      },
      {
        name: "duration",
        type: "number",
        defaultValue: "480",
        description: "表情弹出再落回计数的毫秒数。",
        control: { kind: "range", value: 480, min: 192, max: 960, step: 16 },
      },
      ...ui,
    ],
  },
]
