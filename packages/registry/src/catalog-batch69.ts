import type { ComponentMeta, PropDoc } from "./catalog"

/** 第 63 批调研，catalog batch 69。六个原创交互，灵感来自 Mobbin，没有移植头。 */
const className: PropDoc = {
  name: "className",
  type: "string",
  description: "额外 Tailwind 类名，与主题变量兼容。",
}

export const batch69ShowcaseComponents: ComponentMeta[] = [
  {
    name: "strip-step-expand",
    batch: 69,
    title: "Strip Step Expand",
    description:
      "原创。水平并排的编号条。折叠时窄，标题竖排，编号很大；点开或按左右方向键后，这一条占掉主要宽度，标题横过来，并露出摘要和色块。同一时刻只有一条展开。这不是 shared-layout-expand 的共享布局放大卡，也不是 sticky-stack-cards 或 case-study-carousel。减弱动效会瞬时换条，不再做宽度弹簧。没有循环帧。",
    layer: "effect",
    effectCategory: "showcase",
    source: "original",
    type: "registry:ui",
    file: "effects/strip-step-expand.tsx",
    target: "components/ui/strip-step-expand.tsx",
    presets: [
      { name: "quiet", label: "收", values: { pace: 0.6, intensity: 0.35, count: 3, gap: 4 } },
      { name: "default", label: "默认", values: { pace: 1, intensity: 0.7, count: 3, gap: 8 } },
      { name: "wide", label: "宽", values: { pace: 1.6, intensity: 1, count: 5, gap: 16 } },
    ],
    props: [
      { name: "pace", type: "number", defaultValue: "1", description: "展开和收窄的速度倍数。", control: { kind: "range", value: 1, min: 0.4, max: 2, step: 0.1, group: "动画" } },
      { name: "intensity", type: "number", defaultValue: "0.7", description: "展开宽度和圆角的幅度。", control: { kind: "range", value: 0.7, min: 0, max: 1, step: 0.05 } },
      { name: "count", type: "number", defaultValue: "3", description: "编号条数量，3 到 5。", control: { kind: "range", value: 3, min: 3, max: 5, step: 1 } },
      { name: "gap", type: "number", defaultValue: "8", description: "相邻条的间距，单位像素。", control: { kind: "range", value: 8, min: 0, max: 24, step: 1 } },
      { name: "onIndexChange", type: "(index: number) => void", description: "换到另一条时调用，参数是新的序号，从 0 开始。" },
      className,
    ],
  },
  {
    name: "tab-media-swap",
    batch: 69,
    title: "Tab Media Swap",
    description:
      "原创。左边是特性列表，选中项的底色会滑过去；右边的色块和说明跟着交叉换上。上下方向键、Home、End 和点选都能换，右侧也可以横滑。pace 控制自动轮播的间隔，指针放上来会暂停。这不是 shared-layout-expand 的单卡展开，也不是 before-after-wipe 或 case-study-carousel。减弱动效瞬时切换，并关掉自动播放。离开视口后轮播帧停止。",
    layer: "effect",
    effectCategory: "showcase",
    source: "original",
    type: "registry:ui",
    file: "effects/tab-media-swap.tsx",
    target: "components/ui/tab-media-swap.tsx",
    presets: [
      { name: "quiet", label: "静", values: { pace: 0.6, intensity: 0.3, autoplay: false, count: 3 } },
      { name: "default", label: "默认", values: { pace: 1, intensity: 0.6, autoplay: true, count: 4 } },
      { name: "brisk", label: "快", values: { pace: 1.6, intensity: 1, autoplay: true, count: 5 } },
    ],
    props: [
      { name: "pace", type: "number", defaultValue: "1", description: "切换和自动轮播的速度倍数。", control: { kind: "range", value: 1, min: 0.4, max: 2, step: 0.1, group: "动画" } },
      { name: "intensity", type: "number", defaultValue: "0.6", description: "媒体区位移的幅度。", control: { kind: "range", value: 0.6, min: 0, max: 1, step: 0.05 } },
      { name: "autoplay", type: "boolean", defaultValue: "true", description: "是否自动轮播。指针悬停或离开视口时暂停。减弱动效时关闭。", control: { kind: "boolean", value: true, group: "交互" } },
      { name: "count", type: "number", defaultValue: "4", description: "特性数量，3 到 5。", control: { kind: "range", value: 4, min: 3, max: 5, step: 1 } },
      { name: "onIndexChange", type: "(index: number) => void", description: "换到另一项时调用，参数是新的序号，从 0 开始。" },
      className,
    ],
  },
]

export const batch69MicroComponents: ComponentMeta[] = [
  {
    name: "seed-slot-drop",
    batch: 69,
    title: "Seed Slot Drop",
    description:
      "原创。下方的词块可以拖进上方的虚线空槽，靠近时高亮最近的空槽，松手后吸进去。也可以先点词块再点空槽。方向键先选槽，回车放进去。放错了可以拖回，或点取出。全部填满时有一记短脉冲。这不是 physics-dropzone 的自由物理落区，也不是 sortable-list。减弱动效改为点选，不再弹簧。离开视口后脉冲帧停止。",
    layer: "effect",
    effectCategory: "micro",
    source: "original",
    type: "registry:ui",
    file: "effects/seed-slot-drop.tsx",
    target: "components/ui/seed-slot-drop.tsx",
    presets: [
      { name: "soft", label: "近", values: { pace: 0.6, intensity: 0.3, slots: 2, gap: 8 } },
      { name: "default", label: "默认", values: { pace: 1, intensity: 0.65, slots: 3, gap: 12 } },
      { name: "wide", label: "远", values: { pace: 1.6, intensity: 1, slots: 4, gap: 20 } },
    ],
    props: [
      { name: "pace", type: "number", defaultValue: "1", description: "吸附和成功脉冲的速度倍数。", control: { kind: "range", value: 1, min: 0.4, max: 2, step: 0.1, group: "动画" } },
      { name: "intensity", type: "number", defaultValue: "0.65", description: "磁吸半径和成功脉冲的强度。", control: { kind: "range", value: 0.65, min: 0, max: 1, step: 0.05 } },
      { name: "slots", type: "number", defaultValue: "3", description: "空槽数量，2 到 4。", control: { kind: "range", value: 3, min: 2, max: 4, step: 1 } },
      { name: "gap", type: "number", defaultValue: "12", description: "槽和词块的间距，单位像素。", control: { kind: "range", value: 12, min: 0, max: 32, step: 1 } },
      { name: "onPlace", type: "(id: string, slot: number | null) => void", description: "放入空槽时调用，slot 从 0 开始。回到词池时 slot 为 null。" },
      className,
    ],
  },
  {
    name: "oscillation-arc-dial",
    batch: 69,
    title: "Oscillation Arc Dial",
    description:
      "原创。半圆刻度上拖拇指改强度，松手后弹簧振荡一两下，再吸到最近的刻度。左右方向键按步进增减。这不是 particle-dial-reveal 的粒子环，也不是 barrel-value-wheel 的纵滚筒，更不是 ruler-tick-scrub 的水平尺。减弱动效松手就吸住，不再振荡，并多出加减按钮。离开视口后振荡帧停止。",
    layer: "effect",
    effectCategory: "micro",
    source: "original",
    type: "registry:ui",
    file: "effects/oscillation-arc-dial.tsx",
    target: "components/ui/oscillation-arc-dial.tsx",
    presets: [
      { name: "slow", label: "缓", values: { pace: 0.6, intensity: 0.3, step: 1, span: 140 } },
      { name: "default", label: "默认", values: { pace: 1, intensity: 0.65, step: 1, span: 180 } },
      { name: "wide", label: "宽", values: { pace: 1.6, intensity: 1, step: 5, span: 220 } },
    ],
    props: [
      { name: "pace", type: "number", defaultValue: "1", description: "松手振荡的速度倍数。", control: { kind: "range", value: 1, min: 0.4, max: 2, step: 0.1, group: "动画" } },
      { name: "intensity", type: "number", defaultValue: "0.65", description: "振荡幅度和弧线粗细。", control: { kind: "range", value: 0.65, min: 0, max: 1, step: 0.05 } },
      { name: "step", type: "number", defaultValue: "1", description: "吸附和方向键使用的刻度步进。", control: { kind: "range", value: 1, min: 1, max: 10, step: 1 } },
      { name: "span", type: "number", defaultValue: "180", description: "弧轨张开的角度。", control: { kind: "range", value: 180, min: 120, max: 240, step: 10 } },
      { name: "onValueChange", type: "(value: number) => void", description: "数值落定或按方向键改变时调用。" },
      className,
    ],
  },
  {
    name: "puzzle-slide-fit",
    batch: 69,
    title: "Puzzle Slide Fit",
    description:
      "原创。底滑块带动一块几何拼图水平移动，对准虚线缺口后松手会吸住并亮起成功。没对准就弹回起点。方向键微调，回车再试一次。重排会换一个可复现的目标位置。这不是 before-after-wipe 的前后擦除，也不是 hold-fill-commit 的长按。减弱动效改成一键对齐，不再拖动。离开视口后回弹帧停止。",
    layer: "effect",
    effectCategory: "micro",
    source: "original",
    type: "registry:ui",
    file: "effects/puzzle-slide-fit.tsx",
    target: "components/ui/puzzle-slide-fit.tsx",
    presets: [
      { name: "loose", label: "松", values: { pace: 0.6, intensity: 0.2, target: 0.3, jagged: 0.1 } },
      { name: "default", label: "默认", values: { pace: 1, intensity: 0.55, target: 0.62, jagged: 0.45 } },
      { name: "tight", label: "紧", values: { pace: 1.6, intensity: 0.9, target: 0.74, jagged: 0.8 } },
    ],
    props: [
      { name: "pace", type: "number", defaultValue: "1", description: "吸附和回弹的速度倍数。", control: { kind: "range", value: 1, min: 0.4, max: 2, step: 0.1, group: "动画" } },
      { name: "intensity", type: "number", defaultValue: "0.55", description: "对齐容差和拼图块尺寸。数值越大，容差越紧、块越大。", control: { kind: "range", value: 0.55, min: 0, max: 1, step: 0.05 } },
      { name: "target", type: "number", defaultValue: "0.62", description: "缺口在轨道上的相对位置。", control: { kind: "range", value: 0.62, min: 0.2, max: 0.8, step: 0.01 } },
      { name: "jagged", type: "number", defaultValue: "0.45", description: "缺口边缘的起伏程度。", control: { kind: "range", value: 0.45, min: 0, max: 1, step: 0.05 } },
      { name: "onSuccess", type: "() => void", description: "拼图对齐成功时调用。" },
      className,
    ],
  },
]

export const batch69CardsComponents: ComponentMeta[] = [
  {
    name: "scatter-photo-drag",
    batch: 69,
    title: "Scatter Photo Drag",
    description:
      "原创。几张倾斜的色块照片散在画布上，可以拖起来放到最前，松手后按速度轻轻滑一段再停住。Tab 选中后，方向键微移，方括号旋转。双击或重散会换一版可复现的散落。这不是 peek-fan-stack 的扇叠，也不是 card-toss-stack、folder-stack 或 sticky-note-board。减弱动效仍可拖动，但松手不再惯性。离开视口后惯性帧停止。",
    layer: "effect",
    effectCategory: "cards",
    source: "original",
    type: "registry:ui",
    file: "effects/scatter-photo-drag.tsx",
    target: "components/ui/scatter-photo-drag.tsx",
    presets: [
      { name: "calm", label: "拢", values: { intensity: 0.3, pace: 0.6, count: 6, gap: 4 } },
      { name: "default", label: "默认", values: { intensity: 0.7, pace: 1, count: 6, gap: 12 } },
      { name: "wide", label: "散", values: { intensity: 1, pace: 1.6, count: 8, gap: 28 } },
    ],
    props: [
      { name: "intensity", type: "number", defaultValue: "0.7", description: "初始散落的角度和位移范围。", control: { kind: "range", value: 0.7, min: 0, max: 1, step: 0.05 } },
      { name: "pace", type: "number", defaultValue: "1", description: "松手惯性的衰减速度倍数。", control: { kind: "range", value: 1, min: 0.4, max: 2, step: 0.1, group: "动画" } },
      { name: "count", type: "number", defaultValue: "6", description: "照片数量，6 到 8。", control: { kind: "range", value: 6, min: 6, max: 8, step: 1 } },
      { name: "gap", type: "number", defaultValue: "12", description: "初始散开时额外拉开的距离，单位像素。拖动时不吸附网格。", control: { kind: "range", value: 12, min: 0, max: 40, step: 1 } },
      { name: "onMove", type: "(id: string) => void", description: "开始拖动或用键盘挪动一张照片时调用。" },
      className,
    ],
  },
]
