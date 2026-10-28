import type { ComponentMeta, PropDoc } from "./catalog"

/** 第 62 批调研，catalog batch 68。六个原创交互，灵感来自 Mobbin，没有移植头。 */
const className: PropDoc = {
  name: "className",
  type: "string",
  description: "额外 Tailwind 类名，与主题变量兼容。",
}

export const batch68PageComponents: ComponentMeta[] = [
  {
    name: "blob-zoom-lens",
    batch: 68,
    title: "Blob Zoom Lens",
    description:
      "原创。同一张抽象色块叠成两层，上层放大，并用有机 blob 或锯齿遮罩裁出来跟着指针走。方向键微移中心，加减号改大小，触屏要按住拖。这不是 scrub-fog-clear 的擦雾，也不是 spotlight-focus-blur 的圆形聚光清字，更不是悬停叠层揭示。减弱动效改成居中的静止圆遮罩，不再跟随，也不再变形。离开视口后形变帧停止。",
    layer: "effect",
    effectCategory: "page",
    source: "original",
    type: "registry:ui",
    file: "effects/blob-zoom-lens.tsx",
    target: "components/ui/blob-zoom-lens.tsx",
    presets: [
      { name: "soft", label: "柔", values: { intensity: 0.35, radius: 56, pace: 0.6, jagged: 0.2 } },
      { name: "default", label: "默认", values: { intensity: 0.65, radius: 72, pace: 1, jagged: 0.55 } },
      { name: "jagged", label: "齿", values: { intensity: 1, radius: 96, pace: 1.6, jagged: 0.9 } },
    ],
    props: [
      { name: "intensity", type: "number", defaultValue: "0.65", description: "遮罩内的放大幅度。", control: { kind: "range", value: 0.65, min: 0, max: 1, step: 0.05 } },
      { name: "radius", type: "number", defaultValue: "72", description: "blob 的基准尺寸，单位像素。", control: { kind: "range", value: 72, min: 36, max: 120, step: 2 } },
      { name: "pace", type: "number", defaultValue: "1", description: "跟随和形变的速度倍数。", control: { kind: "range", value: 1, min: 0.4, max: 2, step: 0.1, group: "动画" } },
      { name: "jagged", type: "number", defaultValue: "0.55", description: "边缘锯齿的强度。0 时更接近圆。", control: { kind: "range", value: 0.55, min: 0, max: 1, step: 0.05 } },
      className,
    ],
  },
]

export const batch68ShowcaseComponents: ComponentMeta[] = [
  {
    name: "year-snap-rail",
    batch: 68,
    title: "Year Snap Rail",
    description:
      "原创。竖直年份轨吸附到中间那条参考线，选中的年份放大，旁边的标题和摘要跟着换。滚轮、拖动、点击年份和上下方向键都能换年。这不是 scroll-timeline-reveal 的滚动段落，也不是色阶横轨或作品集横卡。减弱动效会立刻换年，不再放大。没有循环动画帧。",
    layer: "effect",
    effectCategory: "showcase",
    source: "original",
    type: "registry:ui",
    file: "effects/year-snap-rail.tsx",
    target: "components/ui/year-snap-rail.tsx",
    presets: [
      { name: "calm", label: "缓", values: { pace: 0.6, intensity: 0.35, gap: 20, count: 4 } },
      { name: "default", label: "默认", values: { pace: 1, intensity: 0.7, gap: 12, count: 6 } },
      { name: "tight", label: "紧", values: { pace: 1.6, intensity: 1, gap: 4, count: 8 } },
    ],
    props: [
      { name: "pace", type: "number", defaultValue: "1", description: "吸附和文案淡入的速度倍数。", control: { kind: "range", value: 1, min: 0.4, max: 2, step: 0.1, group: "动画" } },
      { name: "intensity", type: "number", defaultValue: "0.7", description: "选中年份的放大幅度。", control: { kind: "range", value: 0.7, min: 0, max: 1, step: 0.05 } },
      { name: "gap", type: "number", defaultValue: "12", description: "相邻年份的额外间距，单位像素。", control: { kind: "range", value: 12, min: 0, max: 40, step: 2 } },
      { name: "count", type: "number", defaultValue: "6", description: "显示的年份数量，4 到 8。", control: { kind: "range", value: 6, min: 4, max: 8, step: 1 } },
      { name: "onIndexChange", type: "(index: number) => void", description: "换到另一年时调用，参数是新的序号，从 0 开始。" },
      className,
    ],
  },
  {
    name: "ruler-tick-scrub",
    batch: 68,
    title: "Ruler Tick Scrub",
    description:
      "原创。水平刻度尺有主刻度和次刻度，拖动后吸附到最近的里程碑，下面的日期和说明跟着换。左右方向键和两侧按钮也能步进。这不是 color-step-rail 的色采样，也不是 scan-rail-progress 的遮罩扫描。减弱动效只留按钮和方向键切换，拖动不再带动尺子。",
    layer: "effect",
    effectCategory: "showcase",
    source: "original",
    type: "registry:ui",
    file: "effects/ruler-tick-scrub.tsx",
    target: "components/ui/ruler-tick-scrub.tsx",
    presets: [
      { name: "fine", label: "细", values: { gap: 10, pace: 0.7, intensity: 0.3, majorEvery: 2 } },
      { name: "default", label: "默认", values: { gap: 14, pace: 1, intensity: 0.65, majorEvery: 4 } },
      { name: "bold", label: "粗", values: { gap: 22, pace: 1.5, intensity: 1, majorEvery: 6 } },
    ],
    props: [
      { name: "gap", type: "number", defaultValue: "14", description: "相邻刻度的间距，单位像素。", control: { kind: "range", value: 14, min: 8, max: 28, step: 1 } },
      { name: "pace", type: "number", defaultValue: "1", description: "吸附和说明切换的速度倍数。", control: { kind: "range", value: 1, min: 0.4, max: 2, step: 0.1, group: "动画" } },
      { name: "intensity", type: "number", defaultValue: "0.65", description: "主刻度和中线的强调程度。", control: { kind: "range", value: 0.65, min: 0, max: 1, step: 0.05 } },
      { name: "majorEvery", type: "number", defaultValue: "4", description: "每隔多少个刻度画一条主刻度。里程碑落在主刻度上。", control: { kind: "range", value: 4, min: 2, max: 6, step: 1 } },
      { name: "onIndexChange", type: "(index: number) => void", description: "换到另一里程碑时调用，参数是新的序号，从 0 开始。" },
      className,
    ],
  },
]

export const batch68CardsComponents: ComponentMeta[] = [
  {
    name: "peek-fan-stack",
    batch: 68,
    title: "Peek Fan Stack",
    description:
      "原创。每张作品卡里主图居中，左右两张背卡斜着露出一角。细指针悬停或键盘聚焦时扇角变大，触屏点一下切换。这不是 apple-cards-carousel 的封面流，也不是抛掷叠卡或文件夹。减弱动效保持静止的三层叠，焦点只留描边。",
    layer: "effect",
    effectCategory: "cards",
    source: "original",
    type: "registry:ui",
    file: "effects/peek-fan-stack.tsx",
    target: "components/ui/peek-fan-stack.tsx",
    presets: [
      { name: "quiet", label: "收", values: { intensity: 0.3, pace: 0.7, gap: 10, radius: 24 } },
      { name: "default", label: "默认", values: { intensity: 0.7, pace: 1, gap: 18, radius: 18 } },
      { name: "open", label: "张", values: { intensity: 1, pace: 1.6, gap: 28, radius: 8 } },
    ],
    props: [
      { name: "intensity", type: "number", defaultValue: "0.7", description: "扇角和错位的幅度。", control: { kind: "range", value: 0.7, min: 0, max: 1, step: 0.05 } },
      { name: "pace", type: "number", defaultValue: "1", description: "扇开和收回的速度倍数。", control: { kind: "range", value: 1, min: 0.4, max: 2, step: 0.1, group: "动画" } },
      { name: "gap", type: "number", defaultValue: "18", description: "背卡露出的距离，单位像素。", control: { kind: "range", value: 18, min: 0, max: 48, step: 2 } },
      { name: "radius", type: "number", defaultValue: "18", description: "卡片圆角，单位像素。", control: { kind: "range", value: 18, min: 0, max: 40, step: 2 } },
      { name: "onSelect", type: "(id: string) => void", description: "点按主图或在卡上按 Enter、Space 时调用，参数是卡片 id。" },
      className,
    ],
  },
]

export const batch68MicroComponents: ComponentMeta[] = [
  {
    name: "barrel-value-wheel",
    batch: 68,
    title: "Barrel Value Wheel",
    description:
      "原创。竖直滚筒选一个数值，正中间最大，上下按圆柱透视变淡变小，松手吸附。方向键和滚轮步进，快拖会带一点惯性。这不是 particle-dial-reveal 的粒子拨盘，也不是轨道动作环或翻牌字。减弱动效改成选择框和上下按钮，不再透视。离开视口后惯性帧停止。",
    layer: "effect",
    effectCategory: "micro",
    source: "original",
    type: "registry:ui",
    file: "effects/barrel-value-wheel.tsx",
    target: "components/ui/barrel-value-wheel.tsx",
    presets: [
      { name: "flat", label: "平", values: { pace: 0.7, intensity: 0.25, visible: 3 } },
      { name: "default", label: "默认", values: { pace: 1, intensity: 0.7, visible: 5 } },
      { name: "deep", label: "深", values: { pace: 1.6, intensity: 1, visible: 7 } },
    ],
    props: [
      { name: "pace", type: "number", defaultValue: "1", description: "吸附和惯性衰减的速度倍数。", control: { kind: "range", value: 1, min: 0.4, max: 2, step: 0.1, group: "动画" } },
      { name: "intensity", type: "number", defaultValue: "0.7", description: "圆柱透视的强度。", control: { kind: "range", value: 0.7, min: 0, max: 1, step: 0.05 } },
      { name: "visible", type: "number", defaultValue: "5", description: "同时可见的行数，3、5 或 7。", control: { kind: "range", value: 5, min: 3, max: 7, step: 2 } },
      { name: "onValueChange", type: "(value: number) => void", description: "选中值变化时调用。" },
      className,
    ],
  },
]

export const batch68TextComponents: ComponentMeta[] = [
  {
    name: "ink-stroke-draw",
    batch: 68,
    title: "Ink Stroke Draw",
    description:
      "原创。标题用两条自绘 SVG 路径按 stroke-dashoffset 描出来，画完可以填色，重播按钮再来一次。进入视口会自动画一遍，Enter 在重播上也能再画。这不是 kinetic-scramble-text 的乱码，也不是逐字生成。减弱动效直接显示描完的终态。离开视口后描边帧取消。读屏拿到终稿。",
    layer: "effect",
    effectCategory: "text",
    source: "original",
    type: "registry:ui",
    file: "effects/ink-stroke-draw.tsx",
    target: "components/ui/ink-stroke-draw.tsx",
    presets: [
      { name: "thin", label: "细", values: { pace: 0.6, intensity: 0.3, stagger: 0.15, fillAfter: false } },
      { name: "default", label: "默认", values: { pace: 1, intensity: 0.65, stagger: 0.35, fillAfter: true } },
      { name: "bold", label: "粗", values: { pace: 1.6, intensity: 1, stagger: 0.7, fillAfter: true } },
    ],
    props: [
      { name: "pace", type: "number", defaultValue: "1", description: "描完一遍的速度倍数。", control: { kind: "range", value: 1, min: 0.4, max: 2, step: 0.1, group: "动画" } },
      { name: "intensity", type: "number", defaultValue: "0.65", description: "描边粗细和发光。", control: { kind: "range", value: 0.65, min: 0, max: 1, step: 0.05 } },
      { name: "stagger", type: "number", defaultValue: "0.35", description: "第二条路径晚一点开始的比例。", control: { kind: "range", value: 0.35, min: 0, max: 1, step: 0.05, group: "动画" } },
      { name: "fillAfter", type: "boolean", defaultValue: "true", description: "画完后是否填上颜色。", control: { kind: "boolean", value: true, group: "动画" } },
      { name: "onComplete", type: "() => void", description: "一次描边完成时调用。重播完成后会再调用一次。" },
      className,
    ],
  },
]
