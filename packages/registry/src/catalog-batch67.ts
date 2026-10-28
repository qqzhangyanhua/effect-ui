import type { ComponentMeta, PropDoc } from "./catalog"

/** 第 61 批调研，catalog batch 67。六个原创交互，灵感来自 Mobbin，没有移植头。 */
const className: PropDoc = {
  name: "className",
  type: "string",
  description: "额外 Tailwind 类名，与主题变量兼容。",
}

export const batch67CardsComponents: ComponentMeta[] = [
  {
    name: "bento-asymmetric-grid",
    batch: 67,
    title: "Bento Asymmetric Grid",
    description:
      "原创。不等分的功能格：其中一格跨两列。悬停、聚焦或触屏点选时它放大并抬到上层，旁边的格子变暗收一点。键盘可以 Tab 逐格走过。这不是 sticky-grid-scroll 的滚动错位，也不是洗牌入场或近距缩放，更不是固定三列的玻璃卡。减弱动效只留静止网格和焦点环，不再缩放压暗。",
    layer: "effect",
    effectCategory: "cards",
    source: "original",
    type: "registry:ui",
    file: "effects/bento-asymmetric-grid.tsx",
    target: "components/ui/bento-asymmetric-grid.tsx",
    presets: [
      { name: "airy", label: "疏", values: { gap: 20, intensity: 0.4, pace: 0.7, radius: 28 } },
      { name: "default", label: "默认", values: { gap: 12, intensity: 0.65, pace: 1, radius: 20 } },
      { name: "tight", label: "紧", values: { gap: 6, intensity: 0.9, pace: 1.6, radius: 10 } },
    ],
    props: [
      { name: "gap", type: "number", defaultValue: "12", description: "格子间距，单位像素。", control: { kind: "range", value: 12, min: 0, max: 32, step: 2 } },
      { name: "intensity", type: "number", defaultValue: "0.65", description: "放大和压暗的幅度。", control: { kind: "range", value: 0.65, min: 0, max: 1, step: 0.05 } },
      { name: "pace", type: "number", defaultValue: "1", description: "缩放回落的速度倍数。", control: { kind: "range", value: 1, min: 0.4, max: 2, step: 0.1, group: "动画" } },
      { name: "radius", type: "number", defaultValue: "20", description: "格子圆角，单位像素。", control: { kind: "range", value: 20, min: 0, max: 40, step: 2 } },
      { name: "cells", type: "readonly BentoCell[]", description: "格子。每项含 id、title、body。省略时用五格内置文案，第一格跨两列。" },
      className,
    ],
  },
]

export const batch67ShowcaseComponents: ComponentMeta[] = [
  {
    name: "case-study-carousel",
    batch: 67,
    title: "Case Study Carousel",
    description:
      "原创。横向作品集：当前这张最大，左右露出邻卡一角，下面是标题和摘要。上一则、下一则、方向键和横向拖动都能换卡。这不是 apple-cards-carousel 的三维封面流，也不是缩略图路径或抛掷叠卡。减弱动效会立刻换卡，邻卡不再缩小。离开视口后不再排动画帧。",
    layer: "effect",
    effectCategory: "showcase",
    source: "original",
    type: "registry:ui",
    file: "effects/case-study-carousel.tsx",
    target: "components/ui/case-study-carousel.tsx",
    presets: [
      { name: "calm", label: "缓", values: { pace: 0.7, peek: 0.16, intensity: 0.4, gap: 8 } },
      { name: "default", label: "默认", values: { pace: 1, peek: 0.22, intensity: 0.7, gap: 12 } },
      { name: "tight", label: "紧", values: { pace: 1.6, peek: 0.32, intensity: 1, gap: 4 } },
    ],
    props: [
      { name: "pace", type: "number", defaultValue: "1", description: "换卡速度倍数。", control: { kind: "range", value: 1, min: 0.4, max: 2, step: 0.1, group: "动画" } },
      { name: "peek", type: "number", defaultValue: "0.22", description: "邻卡露出的比例。", control: { kind: "range", value: 0.22, min: 0.08, max: 0.4, step: 0.02 } },
      { name: "intensity", type: "number", defaultValue: "0.7", description: "主卡和邻卡的缩放落差。", control: { kind: "range", value: 0.7, min: 0, max: 1, step: 0.05 } },
      { name: "gap", type: "number", defaultValue: "12", description: "卡片间距，单位像素。", control: { kind: "range", value: 12, min: 0, max: 40, step: 2 } },
      { name: "studies", type: "readonly CaseStudy[]", description: "作品。每项含 id、title、summary。省略时用五则内置文案。" },
      { name: "onIndexChange", type: "(index: number) => void", description: "换到另一张时调用，参数是新的序号，从 0 开始。" },
      className,
    ],
  },
  {
    name: "before-after-wipe",
    batch: 67,
    title: "Before After Wipe",
    description:
      "原创。同一张画幅里拖竖向或横向手柄，擦出之前和之后两层。左右方向键按 pace 微调，横向手柄也可以用上下方向键。这不是滚动时裂开的横缝，也不是撕角、三维翻转或卷页。减弱动效改成两个按钮，在全部之前和全部之后之间切换。拖动手柄不使用动画帧。",
    layer: "effect",
    effectCategory: "showcase",
    source: "original",
    type: "registry:ui",
    file: "effects/before-after-wipe.tsx",
    target: "components/ui/before-after-wipe.tsx",
    presets: [
      { name: "center", label: "居中", values: { orientation: "vertical-handle", pace: 0.8, intensity: 0.4, initial: 0.5 } },
      { name: "default", label: "默认", values: { orientation: "vertical-handle", pace: 1, intensity: 0.6, initial: 0.5 } },
      { name: "horizontal", label: "横向", values: { orientation: "horizontal-handle", pace: 1.4, intensity: 0.9, initial: 0.35 } },
    ],
    props: [
      {
        name: "orientation",
        type: '"vertical-handle" | "horizontal-handle"',
        defaultValue: '"vertical-handle"',
        description: "vertical-handle 是竖线左右擦，horizontal-handle 是横线上下擦。",
        control: { kind: "select", value: "vertical-handle", options: ["vertical-handle", "horizontal-handle"], group: "交互" },
      },
      { name: "pace", type: "number", defaultValue: "1", description: "方向键步进的速度倍数。", control: { kind: "range", value: 1, min: 0.4, max: 2, step: 0.1, group: "动画" } },
      { name: "intensity", type: "number", defaultValue: "0.6", description: "手柄尺寸和阴影。", control: { kind: "range", value: 0.6, min: 0, max: 1, step: 0.05 } },
      { name: "initial", type: "number", defaultValue: "0.5", description: "手柄起始位置。0 在起点，1 在终点，0.5 居中。左侧或上侧是 Before。", control: { kind: "range", value: 0.5, min: 0, max: 1, step: 0.05, group: "交互" } },
      { name: "onChange", type: "(ratio: number) => void", description: "比例变化时调用。0 是起点，1 是终点。" },
      className,
    ],
  },
]

export const batch67MicroComponents: ComponentMeta[] = [
  {
    name: "hold-fill-commit",
    batch: 67,
    title: "Hold Fill Commit",
    description:
      "原创。按住中心按钮，圆环或底条才会涨；松手没到阈值就回落。涨满时 onCommit 只调用一次，然后可以 Reset。空格和 Enter 按住同样有效。这不是 scan-rail-progress 的遮罩扫描轨，也不是侧滑动作或开屏预载。减弱动效改成点一次就提交。离开视口后累计和动画帧都会停。",
    layer: "effect",
    effectCategory: "micro",
    source: "original",
    type: "registry:ui",
    file: "effects/hold-fill-commit.tsx",
    target: "components/ui/hold-fill-commit.tsx",
    presets: [
      { name: "slow", label: "慢", values: { pace: 0.6, intensity: 0.4, threshold: 1, mode: "ring" } },
      { name: "default", label: "默认", values: { pace: 1, intensity: 0.7, threshold: 1, mode: "ring" } },
      { name: "bar", label: "底条", values: { pace: 1.4, intensity: 0.9, threshold: 0.8, mode: "bar" } },
    ],
    props: [
      { name: "pace", type: "number", defaultValue: "1", description: "填满速度倍数。1 时大约一秒填满。", control: { kind: "range", value: 1, min: 0.4, max: 2, step: 0.1, group: "动画" } },
      { name: "intensity", type: "number", defaultValue: "0.7", description: "环的粗细或底条的高度，以及亮度。", control: { kind: "range", value: 0.7, min: 0, max: 1, step: 0.05 } },
      { name: "threshold", type: "number", defaultValue: "1", description: "提交阈值。1 表示要完全填满。", control: { kind: "range", value: 1, min: 0.5, max: 1, step: 0.05, group: "交互" } },
      { name: "mode", type: '"ring" | "bar"', defaultValue: '"ring"', description: "ring 是外圈，bar 是底条。", control: { kind: "select", value: "ring", options: ["ring", "bar"], group: "交互" } },
      { name: "onCommit", type: "() => void", description: "进度达到阈值时调用一次。Reset 之后可以再提交一次。" },
      className,
    ],
  },
  {
    name: "drag-lock-escape",
    batch: 67,
    title: "Drag Lock Escape",
    description:
      "原创。把锁从虚线安全圆里拖出去才解锁，没拖出就弹回圆心。方向键可以把锁移出圆，Enter 在圆外确认，Esc 复位。这不是单行侧滑，也不是靶心光标或磁吸芯片。减弱动效用 Unlock 一次完成。离开视口后回弹帧暂停。",
    layer: "effect",
    effectCategory: "micro",
    source: "original",
    type: "registry:ui",
    file: "effects/drag-lock-escape.tsx",
    target: "components/ui/drag-lock-escape.tsx",
    presets: [
      { name: "near", label: "近", values: { radius: 64, threshold: 0.8, pace: 0.7, intensity: 0.35 } },
      { name: "default", label: "默认", values: { radius: 88, threshold: 1, pace: 1, intensity: 0.6 } },
      { name: "wide", label: "宽", values: { radius: 120, threshold: 1.2, pace: 1.5, intensity: 0.9 } },
    ],
    props: [
      { name: "radius", type: "number", defaultValue: "88", description: "安全圆半径，单位像素。", control: { kind: "range", value: 88, min: 56, max: 140, step: 2 } },
      { name: "threshold", type: "number", defaultValue: "1", description: "出界比例。1 表示要拖到圆周上。", control: { kind: "range", value: 1, min: 0.6, max: 1.4, step: 0.05, group: "交互" } },
      { name: "pace", type: "number", defaultValue: "1", description: "松手回弹的速度倍数。", control: { kind: "range", value: 1, min: 0.4, max: 2, step: 0.1, group: "动画" } },
      { name: "intensity", type: "number", defaultValue: "0.6", description: "安全圆的光晕强度。", control: { kind: "range", value: 0.6, min: 0, max: 1, step: 0.05 } },
      { name: "onUnlock", type: "() => void", description: "解锁时调用一次。复位之后可以再解锁一次。" },
      className,
    ],
  },
]

export const batch67TextComponents: ComponentMeta[] = [
  {
    name: "kinetic-scramble-text",
    batch: 67,
    title: "Kinetic Scramble Text",
    description:
      "原创。悬停、聚焦或点按后，这句话逐字乱码，再从左到右落定，可以再来一次。触屏不靠悬停，点一下就会跑。这不是满屏的 letter-glitch-wall，也不是流式生成、压力形变或轮换词。减弱动效直接显示终稿，不再乱码。离开视口后乱码帧取消。读屏始终拿到终稿。",
    layer: "effect",
    effectCategory: "text",
    source: "original",
    type: "registry:ui",
    file: "effects/kinetic-scramble-text.tsx",
    target: "components/ui/kinetic-scramble-text.tsx",
    presets: [
      { name: "soft", label: "柔", values: { pace: 0.6, intensity: 0.35, charset: "alpha" } },
      { name: "default", label: "默认", values: { pace: 1, intensity: 0.7, charset: "mixed" } },
      { name: "digits", label: "数字", values: { pace: 1.6, intensity: 1, charset: "digits" } },
    ],
    props: [
      { name: "pace", type: "number", defaultValue: "1", description: "落定速度倍数。", control: { kind: "range", value: 1, min: 0.4, max: 2, step: 0.1, group: "动画" } },
      { name: "intensity", type: "number", defaultValue: "0.7", description: "乱码持续得更久一点。越大，落定前的帧数越多。", control: { kind: "range", value: 0.7, min: 0, max: 1, step: 0.05 } },
      {
        name: "charset",
        type: '"digits" | "alpha" | "symbols" | "mixed"',
        defaultValue: '"mixed"',
        description: "乱码时使用的字符集。",
        control: { kind: "select", value: "mixed", options: ["digits", "alpha", "symbols", "mixed"], group: "文字" },
      },
      { name: "text", type: "string", defaultValue: '"落定这句文案"', description: "最终落定的句子。省略时用内置短句。" },
      { name: "onSettle", type: "() => void", description: "一次乱码落定后调用。再次触发会再调用一次。" },
      className,
    ],
  },
]
