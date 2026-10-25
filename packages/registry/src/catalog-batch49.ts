import type { ComponentMeta, PropDoc } from "./catalog"

const ui: PropDoc[] = [{ name: "className", type: "string", description: "额外 Tailwind 类名，与主题变量兼容。" }]

export const batch49Components: ComponentMeta[] = [
  {
    name: "magnet-chips",
    title: "Magnet Chips",
    description:
      "原创实现。筛选芯片拖进对齐区后，沿动画帧吸到同一行。方向键或回车也能放进去。减弱动效时立刻对齐，不申请动画帧。只用组件自己的指针和动画帧，不使用 matter-js，没有新增依赖。",
    category: "micro",
    layer: "widget",
    purposeGroup: "form",
    source: "original",
    type: "registry:ui",
    file: "effects/magnet-chips.tsx",
    target: "components/ui/magnet-chips.tsx",
    props: [
      { name: "chips", type: "{ id: string; label: string }[]", description: "初始芯片。省略时用内置三枚。" },
      { name: "onSnap", type: "(id: string) => void", description: "芯片对齐到位后调用。" },
      { name: "color", type: "string", defaultValue: "var(--primary)", description: "芯片描边。不传则跟随主题。", control: { kind: "color" } },
      {
        name: "size",
        type: "number",
        defaultValue: "36",
        description: "芯片高度，像素。",
        control: { kind: "range", value: 36, min: 28, max: 56, step: 2 },
      },
      {
        name: "duration",
        type: "number",
        defaultValue: "420",
        description: "吸附到位的毫秒数。",
        control: { kind: "range", value: 420, min: 168, max: 840, step: 10 },
      },
      ...ui,
    ],
  },
  {
    name: "folder-stack",
    title: "Folder Stack",
    description:
      "原创实现。叠放的纸质文件夹。细指针悬停时扇形展开，离开后收回。触屏或粗指针悬停不展开，点击才切换。文件夹可以拖出去。减弱动效时不播放扇形动画，拖出后直接拿走，不申请动画帧。不使用 matter-js，没有新增依赖。",
    category: "cards",
    source: "original",
    type: "registry:ui",
    file: "effects/folder-stack.tsx",
    target: "components/ui/folder-stack.tsx",
    props: [
      { name: "folders", type: "{ id: string; title: string; detail: string }[]", description: "初始文件夹。省略时用内置三本。" },
      { name: "onExtract", type: "(id: string) => void", description: "文件夹被拖出并离开后调用。" },
      { name: "onOpenChange", type: "(open: boolean) => void", description: "扇形展开或收回后调用。" },
      { name: "color", type: "string", defaultValue: "var(--primary)", description: "文件夹描边和标签。不传则跟随主题。", control: { kind: "color" } },
      {
        name: "size",
        type: "number",
        defaultValue: "176",
        description: "文件夹宽度，像素。",
        control: { kind: "range", value: 176, min: 128, max: 280, step: 4 },
      },
      {
        name: "duration",
        type: "number",
        defaultValue: "480",
        description: "扇形展开和拖出离开的毫秒数。",
        control: { kind: "range", value: 480, min: 192, max: 960, step: 10 },
      },
      ...ui,
    ],
  },
  {
    name: "physics-dropzone",
    title: "Physics Dropzone",
    description:
      "原创实现。文件图标拖进落点后，由已安装的 matter-js 落到一堆，并显示进度。方向键或回车也能放进去。减弱动效时不创建物理引擎、不申请动画帧，文件直接出现在堆里并且进度已满。没有新增依赖。",
    category: "cards",
    layer: "widget",
    purposeGroup: "form",
    source: "original",
    type: "registry:ui",
    file: "effects/physics-dropzone.tsx",
    target: "components/ui/physics-dropzone.tsx",
    props: [
      { name: "files", type: "{ id: string; name: string }[]", description: "初始文件。省略时用内置三个。" },
      { name: "onDrop", type: "(id: string) => void", description: "文件落入并完成进度后调用。减弱动效时立刻调用。" },
      { name: "color", type: "string", defaultValue: "var(--primary)", description: "文件描边和进度。不传则跟随主题。", control: { kind: "color" } },
      {
        name: "size",
        type: "number",
        defaultValue: "280",
        description: "落点宽度，像素。",
        control: { kind: "range", value: 280, min: 200, max: 420, step: 4 },
      },
      {
        name: "duration",
        type: "number",
        defaultValue: "560",
        description: "进度走满的毫秒数。",
        control: { kind: "range", value: 560, min: 224, max: 1120, step: 20 },
      },
      ...ui,
    ],
  },
]
