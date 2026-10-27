import type { ComponentMeta, PropDoc } from "./catalog"

/** 第 58 批调研，catalog batch 64。六个原创交互，灵感来自 Mobbin，没有移植头。 */
const className: PropDoc = {
  name: "className",
  type: "string",
  description: "额外 Tailwind 类名，与主题变量兼容。",
}

export const batch64PageComponents: ComponentMeta[] = [
  {
    name: "space-jump-hero",
    batch: 64,
    title: "Space Jump Hero",
    description:
      "原创。聚焦这块首屏后按空格或回车，角色按弹簧曲线跳起再落地；旁边的按钮给指针和触屏。重力改变起跳和回落的时间分配，高度是跳起的像素。这不是滚动入场。减弱动效时人已经站在地上，按键不再位移。",
    layer: "effect",
    effectCategory: "page",
    source: "original",
    type: "registry:ui",
    file: "effects/space-jump-hero.tsx",
    target: "components/ui/space-jump-hero.tsx",
    presets: [
      { name: "light", label: "轻跳", values: { pace: 0.7, height: 64, gravity: 0.6 } },
      { name: "default", label: "默认", values: { pace: 1, height: 104, gravity: 1 } },
      { name: "high", label: "高弹", values: { pace: 1.5, height: 156, gravity: 1.7 } },
    ],
    props: [
      { name: "pace", type: "number", defaultValue: "1", description: "跳跃速度倍数。", control: { kind: "range", value: 1, min: 0.4, max: 2, step: 0.1, group: "动画" } },
      { name: "height", type: "number", defaultValue: "104", description: "跳起高度，单位像素。", control: { kind: "range", value: 104, min: 48, max: 180, step: 4, group: "动画" } },
      { name: "gravity", type: "number", defaultValue: "1", description: "回落有多快。越大，顶点越早。", control: { kind: "range", value: 1, min: 0.5, max: 2, step: 0.1, group: "动画" } },
      { name: "label", type: "string", defaultValue: '"跳跃"', description: "按钮文字。" },
      { name: "onJump", type: "() => void", description: "每次起跳时调用。减弱动效时仍会调用，但没有位移。" },
      className,
    ],
  },
]

export const batch64ScrollComponents: ComponentMeta[] = [
  {
    name: "scroll-split-reveal",
    batch: 64,
    title: "Scroll Split Reveal",
    description:
      "原创。封面沿一条横缝分成上下两半，滚动时向两侧让开，露出底下的正文。接缝位置和张开幅度都可以调。这是裂开，不是 scroll-parallax-layers 的多层视差。减弱动效时封面直接让开。离开视口后不再听滚动。",
    layer: "effect",
    effectCategory: "scroll",
    source: "original",
    type: "registry:ui",
    file: "effects/scroll-split-reveal.tsx",
    target: "components/ui/scroll-split-reveal.tsx",
    props: [
      { name: "intensity", type: "number", defaultValue: "0.75", description: "两半让开的幅度。", control: { kind: "range", value: 0.75, min: 0, max: 1, step: 0.05 } },
      { name: "seam", type: "number", defaultValue: "50", description: "横缝在封面高度上的百分比。", control: { kind: "range", value: 50, min: 24, max: 76, step: 1, group: "外观" } },
      { name: "pace", type: "number", defaultValue: "1", description: "滚动多少距离就完全裂开。越大越快。", control: { kind: "range", value: 1, min: 0.4, max: 2, step: 0.1, group: "动画" } },
      className,
    ],
  },
]

export const batch64TextComponents: ComponentMeta[] = [
  {
    name: "slice-shift-text",
    batch: 64,
    title: "Slice Shift Text",
    description:
      "原创。标题被切成竖条，相邻两条先上下错开，进入视口后再对齐。这不是 hero-text-stagger 的按词出现，也不是整块卡片的扭转。减弱动效时直接显示对齐的标题，不渲染错开的切片。",
    layer: "effect",
    effectCategory: "text",
    source: "original",
    type: "registry:ui",
    file: "effects/slice-shift-text.tsx",
    target: "components/ui/slice-shift-text.tsx",
    props: [
      { name: "text", type: "string", defaultValue: '"竖着切开，再对齐"', description: "被切开的那一句。" },
      { name: "slices", type: "number", defaultValue: "8", description: "竖条数量。", control: { kind: "range", value: 8, min: 4, max: 14, step: 1, group: "外观" } },
      { name: "intensity", type: "number", defaultValue: "0.7", description: "错开的幅度。", control: { kind: "range", value: 0.7, min: 0, max: 1, step: 0.05 } },
      { name: "pace", type: "number", defaultValue: "1", description: "对齐速度倍数。", control: { kind: "range", value: 1, min: 0.4, max: 2, step: 0.1, group: "动画" } },
      className,
    ],
  },
  {
    name: "spotlight-focus-blur",
    batch: 64,
    title: "Spotlight Focus Blur",
    description:
      "原创。同一句文字叠成两层，底层保持模糊，聚光扫过的地方才清晰。细指针可以拖着光走，触屏仍看自动扫过，不靠悬停才读得到字。这不是 mesh-glow-bg 的背景色块，也不是 entrance-presets 的入场。减弱动效时整句清晰，不再模糊。离开视口时扫光停下。",
    layer: "effect",
    effectCategory: "text",
    source: "original",
    type: "registry:ui",
    file: "effects/spotlight-focus-blur.tsx",
    target: "components/ui/spotlight-focus-blur.tsx",
    props: [
      { name: "text", type: "string", defaultValue: '"聚光停住的地方，这句话才清楚。"', description: "被聚光读清楚的句子。" },
      { name: "blur", type: "number", defaultValue: "8", description: "聚光以外的模糊半径，单位像素。", control: { kind: "range", value: 8, min: 0, max: 16, step: 1, group: "外观" } },
      { name: "glow", type: "number", defaultValue: "0.65", description: "光斑有多实。越大，清晰的核心越大。", control: { kind: "range", value: 0.65, min: 0, max: 1, step: 0.05, group: "外观" } },
      { name: "pace", type: "number", defaultValue: "1", description: "自动扫过的速度倍数。", control: { kind: "range", value: 1, min: 0.4, max: 2, step: 0.1, group: "动画" } },
      className,
    ],
  },
]

export const batch64ShowcaseComponents: ComponentMeta[] = [
  {
    name: "radial-hotspot-labels",
    batch: 64,
    title: "Radial Hotspot Labels",
    description:
      "原创。中心焦点周围摆着标签，放射线把它们连回去。点一下或按回车展开说明，再按一次或 Esc 收起。方向键在标签之间移动。触屏同样要点，悬停不会展开。减弱动效时展开没有过渡。",
    layer: "effect",
    effectCategory: "showcase",
    source: "original",
    type: "registry:ui",
    file: "effects/radial-hotspot-labels.tsx",
    target: "components/ui/radial-hotspot-labels.tsx",
    props: [
      { name: "spread", type: "number", defaultValue: "1", description: "标签离中心的倍数。", control: { kind: "range", value: 1, min: 0.7, max: 1.3, step: 0.05, group: "外观" } },
      { name: "duration", type: "number", defaultValue: "420", description: "连线和说明的过渡时长，单位毫秒。", control: { kind: "range", value: 420, min: 160, max: 900, step: 20 } },
      { name: "lineOpacity", type: "number", defaultValue: "0.55", description: "未展开时连线的不透明度。", control: { kind: "range", value: 0.55, min: 0.1, max: 1, step: 0.05, group: "外观" } },
      { name: "hotspots", type: "readonly RadialHotspot[]", description: "标签。每项含 id、title、detail。省略时用五条内置说明。" },
      { name: "onOpenChange", type: "(id: string | null) => void", description: "展开或收起时调用。收起为 null。" },
      className,
    ],
  },
]

export const batch64MicroComponents: ComponentMeta[] = [
  {
    name: "drag-rate-tiles",
    batch: 64,
    title: "Drag Rate Tiles",
    description:
      "原创。把卡片拖过左右的「不爱 / 爱」落区后弹出并记分。没过阈值时按 snap 弹回，snap 为 0 则停在松手的地方。左方向键不爱，右方向键喜欢。这不是 rubber-band-drag 的橡皮筋，也不是 sortable-list 的重排。减弱动效时立刻记分，卡片不再飞出。",
    layer: "effect",
    effectCategory: "micro",
    source: "original",
    type: "registry:ui",
    file: "effects/drag-rate-tiles.tsx",
    target: "components/ui/drag-rate-tiles.tsx",
    presets: [
      { name: "loose", label: "宽松", values: { threshold: 0.5, snap: 0.35, pace: 0.7 } },
      { name: "default", label: "默认", values: { threshold: 0.34, snap: 0.8, pace: 1 } },
      { name: "crisp", label: "干脆", values: { threshold: 0.2, snap: 1, pace: 1.6 } },
    ],
    props: [
      { name: "threshold", type: "number", defaultValue: "0.34", description: "记分所需的拖动距离，占卡片宽度的比例。", control: { kind: "range", value: 0.34, min: 0.16, max: 0.62, step: 0.02, group: "交互" } },
      { name: "snap", type: "number", defaultValue: "0.8", description: "没过阈值时弹回的力度。0 停在松手处。", control: { kind: "range", value: 0.8, min: 0, max: 1, step: 0.05, group: "交互" } },
      { name: "pace", type: "number", defaultValue: "1", description: "弹出和弹回的速度倍数。", control: { kind: "range", value: 1, min: 0.4, max: 2, step: 0.1, group: "动画" } },
      { name: "tiles", type: "readonly DragRateTile[]", description: "卡片。每项含 id、title、note。省略时用四张内置卡片。" },
      { name: "onRate", type: "(id: string, value: DragRateValue) => void", description: "记成 love 或 skip 时调用。" },
      className,
    ],
  },
]
