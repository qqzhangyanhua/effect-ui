import type { ComponentMeta, PropDoc } from "./catalog"

/** 第 67 批调研，catalog batch 73。六个原创交互，灵感来自 Mobbin，没有移植头。 */
const className: PropDoc = {
  name: "className",
  type: "string",
  description: "额外 Tailwind 类名，与主题变量兼容。",
}

export const batch73ShowcaseComponents: ComponentMeta[] = [
  {
    name: "filmstrip-frame-pick",
    batch: 73,
    title: "Filmstrip Frame Pick",
    description:
      "原创。上方大预览，下方横向胶片条带齿孔。拖动、滚轮或点选一帧时，当前帧吸到中线，大预览同步换成这一帧。左右方向键步进。这是胶片帧条加大预览，不是 year-snap-rail 的年份轨，也不是 ruler-tick-scrub 的刻度尺，也不是 before-after-wipe 的对比擦除。减弱动效瞬时切帧和预览。离开视口后吸附帧停止。",
    layer: "effect",
    effectCategory: "showcase",
    source: "original",
    type: "registry:ui",
    file: "effects/filmstrip-frame-pick.tsx",
    target: "components/ui/filmstrip-frame-pick.tsx",
    presets: [
      { name: "short", label: "短", values: { pace: 0.6, intensity: 0.3, count: 8, snap: true } },
      { name: "default", label: "默认", values: { pace: 1, intensity: 0.65, count: 10, snap: true } },
      { name: "free", label: "不吸附", values: { pace: 1.6, intensity: 1, count: 12, snap: false } },
    ],
    props: [
      { name: "pace", type: "number", defaultValue: "1", description: "吸附和预览过渡的速度倍数。", control: { kind: "range", value: 1, min: 0.4, max: 2, step: 0.1, group: "动画" } },
      { name: "intensity", type: "number", defaultValue: "0.65", description: "邻帧缩放差和齿孔对比。", control: { kind: "range", value: 0.65, min: 0, max: 1, step: 0.05 } },
      { name: "count", type: "number", defaultValue: "10", description: "胶片帧数量，8 到 12。", control: { kind: "range", value: 10, min: 8, max: 12, step: 1 } },
      { name: "snap", type: "boolean", defaultValue: "true", description: "松手时播放吸附过渡。", control: { kind: "boolean", value: true, group: "交互" } },
      { name: "onIndexChange", type: "(index: number) => void", description: "当前帧变化时调用，参数从 0 开始。" },
      className,
    ],
  },
  {
    name: "arc-film-carousel",
    batch: 73,
    title: "Arc Film Carousel",
    description:
      "原创。预览帧贴在向下弯曲的胶片带上，拖动或点左右箭头让焦点帧滑到弧顶并略放大，两侧递降。左右方向键步进。这是开弧胶片带，不是 curve-focus-rail 的平面标签加侧栏媒体，也不是 circular-gallery 的闭环圆，也不是 peek-fan-stack 的扇形叠卡。减弱动效瞬时换焦点。离开视口后滑动帧停止。",
    layer: "effect",
    effectCategory: "showcase",
    source: "original",
    type: "registry:ui",
    file: "effects/arc-film-carousel.tsx",
    target: "components/ui/arc-film-carousel.tsx",
    presets: [
      { name: "shallow", label: "浅", values: { pace: 0.6, intensity: 0.3, count: 5, depth: 0.3 } },
      { name: "default", label: "默认", values: { pace: 1, intensity: 0.65, count: 7, depth: 0.55 } },
      { name: "deep", label: "深", values: { pace: 1.6, intensity: 1, count: 9, depth: 1 } },
    ],
    props: [
      { name: "pace", type: "number", defaultValue: "1", description: "沿弧滑动的速度倍数。", control: { kind: "range", value: 1, min: 0.4, max: 2, step: 0.1, group: "动画" } },
      { name: "intensity", type: "number", defaultValue: "0.65", description: "弧的曲率和侧卡缩小比。", control: { kind: "range", value: 0.65, min: 0, max: 1, step: 0.05 } },
      { name: "count", type: "number", defaultValue: "7", description: "同时排上弧带的帧数，5 到 9。", control: { kind: "range", value: 7, min: 5, max: 9, step: 1 } },
      { name: "depth", type: "number", defaultValue: "0.55", description: "透视强度。", control: { kind: "range", value: 0.55, min: 0, max: 1, step: 0.05 } },
      { name: "onIndexChange", type: "(index: number) => void", description: "焦点帧变化时调用，参数从 0 开始。" },
      className,
    ],
  },
  {
    name: "vinyl-clip-window",
    batch: 73,
    title: "Vinyl Clip Window",
    description:
      "原创。中性标签的黑胶在播放时旋转，下方波形条上有可拖的剪辑窗，拖窗平移，两端手柄改起止。播放和暂停切换旋转。这是黑胶加可拖剪辑窗，不是 audio-spectrum 的纯频谱，也不是 solar-orbit-scrub 的轨道时间。减弱动效黑胶不转，选区改成起止滑块。离开视口后旋转停止。",
    layer: "effect",
    effectCategory: "showcase",
    source: "original",
    type: "registry:ui",
    file: "effects/vinyl-clip-window.tsx",
    target: "components/ui/vinyl-clip-window.tsx",
    presets: [
      { name: "still", label: "静止", values: { pace: 0.6, intensity: 0.3, spin: false, window: 0.2 } },
      { name: "default", label: "默认", values: { pace: 1, intensity: 0.65, spin: true, window: 0.35 } },
      { name: "wide", label: "宽窗", values: { pace: 1.6, intensity: 1, spin: true, window: 0.6 } },
    ],
    props: [
      { name: "pace", type: "number", defaultValue: "1", description: "黑胶转速的速度倍数。", control: { kind: "range", value: 1, min: 0.4, max: 2, step: 0.1, group: "动画" } },
      { name: "intensity", type: "number", defaultValue: "0.65", description: "波形振幅和选区对比。", control: { kind: "range", value: 0.65, min: 0, max: 1, step: 0.05 } },
      { name: "spin", type: "boolean", defaultValue: "true", description: "进入时是否开始旋转。", control: { kind: "boolean", value: true, group: "动画" } },
      { name: "window", type: "number", defaultValue: "0.35", description: "初始选区占整段的比例。", control: { kind: "range", value: 0.35, min: 0.15, max: 0.7, step: 0.05, group: "交互" } },
      { name: "onRangeChange", type: "(start: number, end: number) => void", description: "选区变化时调用，起止都在 0 到 1 之间。" },
      className,
    ],
  },
]

export const batch73MicroComponents: ComponentMeta[] = [
  {
    name: "knurl-scrub-dial",
    batch: 73,
    title: "Knurl Scrub Dial",
    description:
      "原创。短圆柱表面有滚花齿纹，沿表面拖动时齿纹滚动，数值跟着变。松手可以停住，连续模式下会带着惯性。方向键微调。这是滚花圆柱跟手，不是 barrel-value-wheel 的纵列数字筒，也不是 oscillation-arc-dial 的弧角刻度，也不是 ruler-tick-scrub 的平面尺。减弱动效改成滑块和按钮，圆柱不再滚动。离开视口后惯性帧停止。",
    layer: "effect",
    effectCategory: "micro",
    source: "original",
    type: "registry:ui",
    file: "effects/knurl-scrub-dial.tsx",
    target: "components/ui/knurl-scrub-dial.tsx",
    presets: [
      { name: "fine", label: "细", values: { pace: 0.6, intensity: 0.3, step: 1, axis: "x" } },
      { name: "default", label: "默认", values: { pace: 1, intensity: 0.7, step: 1, axis: "x" } },
      { name: "vertical", label: "纵向", values: { pace: 1.6, intensity: 1, step: 5, axis: "y" } },
    ],
    props: [
      { name: "pace", type: "number", defaultValue: "1", description: "惯性和齿纹跟随的速度倍数。", control: { kind: "range", value: 1, min: 0.4, max: 2, step: 0.1, group: "动画" } },
      { name: "intensity", type: "number", defaultValue: "0.7", description: "滚花对比和每像素灵敏度。", control: { kind: "range", value: 0.7, min: 0, max: 1, step: 0.05 } },
      { name: "step", type: "number", defaultValue: "1", description: "步进大小。0 为连续，单位与数值相同。", control: { kind: "range", value: 1, min: 0, max: 10, step: 1, group: "交互" } },
      { name: "axis", type: '"x" | "y"', defaultValue: '"x"', description: "拖动轴向。", control: { kind: "select", value: "x", options: ["x", "y"], group: "交互" } },
      { name: "onValueChange", type: "(value: number) => void", description: "数值变化时调用，范围 0 到 100。" },
      className,
    ],
  },
]

export const batch73TextComponents: ComponentMeta[] = [
  {
    name: "depth-blur-line",
    batch: 73,
    title: "Depth Blur Line",
    description:
      "原创。多行大号短句竖排，焦点行保持锐利，上下行按距离加重模糊。滚轮、拖动、点选或上下方向键换行。这是按行索引的景深，不是 spotlight-focus-blur 的指针聚光，也不是 title-year-list 的标题加年份上标，也不是 kinetic-scramble-text。减弱动效瞬时换焦点，邻行只降透明度，不再模糊。没有循环帧。",
    layer: "effect",
    effectCategory: "text",
    source: "original",
    type: "registry:ui",
    file: "effects/depth-blur-line.tsx",
    target: "components/ui/depth-blur-line.tsx",
    presets: [
      { name: "soft", label: "轻", values: { pace: 0.6, intensity: 0.3, lines: 4, falloff: "linear" } },
      { name: "default", label: "默认", values: { pace: 1, intensity: 0.65, lines: 5, falloff: "linear" } },
      { name: "deep", label: "深", values: { pace: 1.6, intensity: 1, lines: 7, falloff: "quadratic" } },
    ],
    props: [
      { name: "pace", type: "number", defaultValue: "1", description: "换焦过渡的速度倍数。", control: { kind: "range", value: 1, min: 0.4, max: 2, step: 0.1, group: "动画" } },
      { name: "intensity", type: "number", defaultValue: "0.65", description: "每行模糊步长和最大模糊。", control: { kind: "range", value: 0.65, min: 0, max: 1, step: 0.05 } },
      { name: "lines", type: "number", defaultValue: "5", description: "行数，4 到 7。", control: { kind: "range", value: 5, min: 4, max: 7, step: 1 } },
      { name: "falloff", type: '"linear" | "quadratic"', defaultValue: '"linear"', description: "模糊随距离的衰减。", control: { kind: "select", value: "linear", options: ["linear", "quadratic"] } },
      { name: "onIndexChange", type: "(index: number) => void", description: "焦点行变化时调用，参数从 0 开始。" },
      className,
    ],
  },
]

export const batch73CardsComponents: ComponentMeta[] = [
  {
    name: "border-focus-strip",
    batch: 73,
    title: "Border Focus Strip",
    description:
      "原创。横向海报条，焦点卡用主题色粗描边并轻微放大，邻卡降低透明度。拖动、滚轮、点选或左右方向键改焦点。这是海报条加描边焦点，不是 logo-focus-dim 的标志云，也不是 apple-cards-carousel 的堆叠透视，也不是 sticky-stack-cards。减弱动效瞬时切边和透明度，不再放大。离开视口后惯性帧停止。",
    layer: "effect",
    effectCategory: "cards",
    source: "original",
    type: "registry:ui",
    file: "effects/border-focus-strip.tsx",
    target: "components/ui/border-focus-strip.tsx",
    presets: [
      { name: "short", label: "短", values: { pace: 0.6, intensity: 0.3, count: 6, snap: true } },
      { name: "default", label: "默认", values: { pace: 1, intensity: 0.7, count: 8, snap: true } },
      { name: "free", label: "不吸附", values: { pace: 1.6, intensity: 1, count: 10, snap: false } },
    ],
    props: [
      { name: "pace", type: "number", defaultValue: "1", description: "描边和缩放过渡的速度倍数。", control: { kind: "range", value: 1, min: 0.4, max: 2, step: 0.1, group: "动画" } },
      { name: "intensity", type: "number", defaultValue: "0.7", description: "描边宽度和邻卡最低透明度。", control: { kind: "range", value: 0.7, min: 0, max: 1, step: 0.05 } },
      { name: "count", type: "number", defaultValue: "8", description: "海报数量，6 到 10。", control: { kind: "range", value: 8, min: 6, max: 10, step: 1 } },
      { name: "snap", type: "boolean", defaultValue: "true", description: "松手时播放吸附过渡。", control: { kind: "boolean", value: true, group: "交互" } },
      { name: "onIndexChange", type: "(index: number) => void", description: "焦点海报变化时调用，参数从 0 开始。" },
      className,
    ],
  },
]
