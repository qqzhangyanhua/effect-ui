import type { ComponentMeta, PropDoc } from "./catalog"

/** 第 85 批调研，catalog batch 91。棱纹玻璃、深度照片、字符滤镜、速度画廊和液态金属，原创，没有移植头。 */
const className: PropDoc = {
  name: "className",
  type: "string",
  description: "额外 Tailwind 类名，与主题变量兼容。",
}

function glFiles(slug: string): NonNullable<ComponentMeta["files"]> {
  return [
    { file: `effects/${slug}.tsx`, type: "registry:ui", target: `components/ui/${slug}.tsx` },
    { file: "effects/gl/gl-loop.tsx", type: "registry:file", target: "components/ui/gl/gl-loop.tsx" },
  ]
}

export const batch91CardsComponents: ComponentMeta[] = [
  {
    name: "fluted-glass-pane",
    batch: 91,
    title: "Fluted Glass Pane",
    description:
      "原创。把一张图折成一条条棱，不移动指针也看得见。count 是棱的条数，angle 是棱的角度，intensity 是折射强度。interactive 默认关闭，不是控件；打开后指针只推动棱的相位。src 是图片地址，不是控件。不传或加载失败都留在程序化图上，不抛。程序化图读取组件根上的 --background、--primary、--chart-2、--chart-4，不读 documentElement。这不是 glass-card，也不是 lenticular-card。没有新依赖。减弱动效不挂 canvas。没有 WebGL 时停在同一张静帧。离开视口或页面隐藏时停止绘制，卸载时释放 context。设备像素比上限 1.5。",
    layer: "effect",
    effectCategory: "cards",
    source: "original",
    type: "registry:ui",
    file: "effects/fluted-glass-pane.tsx",
    target: "components/ui/fluted-glass-pane.tsx",
    files: glFiles("fluted-glass-pane"),
    presets: [
      { name: "quiet", label: "疏", values: { count: 8, angle: 90, intensity: 0.2 } },
      { name: "default", label: "默认", values: { count: 18, angle: 90, intensity: 0.45 } },
      { name: "steep", label: "密", values: { count: 36, angle: 24, intensity: 0.9 } },
    ],
    props: [
      {
        name: "count",
        type: "number",
        defaultValue: "18",
        description: "棱的条数。18 与不传相同。",
        control: { kind: "range", value: 18, min: 4, max: 48, step: 1 },
      },
      {
        name: "angle",
        type: "number",
        defaultValue: "90",
        description: "棱的方向，单位度。90 与不传相同，棱竖直。",
        control: { kind: "range", value: 90, min: 0, max: 360, step: 1 },
      },
      {
        name: "intensity",
        type: "number",
        defaultValue: "0.45",
        description: "折射强度。0.45 与不传相同。0 时棱仍在，只是不再错开采样。",
        control: { kind: "range", value: 0.45, min: 0, max: 1, step: 0.05 },
      },
      {
        name: "interactive",
        type: "boolean",
        defaultValue: "false",
        description: "默认关闭。打开后指针只推动棱的相位，不另加变形。",
      },
      {
        name: "src",
        type: "string",
        description: "图片地址。不是控件。不传或加载失败时用程序化图。",
      },
      className,
    ],
  },
  {
    name: "depth-parallax-photo",
    batch: 91,
    title: "Depth Parallax Photo",
    description:
      "原创。照片跟着指针或手指按深度错开，不使用设备方向。intensity 是错开强度，size 是贴边时的最大位移（像素），speed 是跟上指针的速度。src 是照片地址，depthSrc 是深度图地址，都不是控件。没有深度图时用亮度；照片和深度图都没有，或加载失败，就画程序化的一对图，不抛。程序化图读取组件根上的 --background、--primary、--chart-2、--chart-4，不读 documentElement。没有新依赖。减弱动效不挂 canvas。没有 WebGL 时停在同一张静帧。离开视口或页面隐藏时停止绘制，卸载时释放 context。设备像素比上限 1.5。",
    layer: "effect",
    effectCategory: "cards",
    source: "original",
    type: "registry:ui",
    file: "effects/depth-parallax-photo.tsx",
    target: "components/ui/depth-parallax-photo.tsx",
    files: glFiles("depth-parallax-photo"),
    presets: [
      { name: "quiet", label: "静", values: { intensity: 0.2, size: 12, speed: 0.6 } },
      { name: "default", label: "默认", values: { intensity: 0.5, size: 24, speed: 1 } },
      { name: "near", label: "近", values: { intensity: 0.9, size: 48, speed: 1.6 } },
    ],
    props: [
      {
        name: "intensity",
        type: "number",
        defaultValue: "0.5",
        description: "深度错开的强度。0.5 与不传相同。0 时图层不再错开。",
        control: { kind: "range", value: 0.5, min: 0, max: 1, step: 0.05, group: "外观" },
      },
      {
        name: "size",
        type: "number",
        defaultValue: "24",
        description: "指针贴边、深度为 1、强度为 1 时的最大位移，单位像素。24 与不传相同。",
        control: { kind: "range", value: 24, min: 8, max: 64, step: 1, group: "外观" },
      },
      {
        name: "speed",
        type: "number",
        defaultValue: "1",
        description: "跟上指针的速度倍数。1 与不传相同。",
        control: { kind: "range", value: 1, min: 0.25, max: 2.5, step: 0.1, group: "动画" },
      },
      {
        name: "src",
        type: "string",
        description: "照片地址。不是控件。不传或加载失败时用程序化图。",
      },
      {
        name: "depthSrc",
        type: "string",
        description: "深度图地址。不是控件。不传或加载失败时，有照片就用亮度，否则用画好的深度。",
      },
      className,
    ],
  },
  {
    name: "ascii-halftone-filter",
    batch: 91,
    title: "ASCII Halftone Filter",
    description:
      "原创。把一张图做成 ASCII，或做成半调网点。mode 只有 ascii 和 halftone，默认 ascii。size 是格子边长，单位像素。intensity 是对比，0 是一片中间调，1 是拉开。src 是图片地址，不是控件。不传或加载失败都留在程序化图上，不抛。程序化图读取组件根上的 --background、--foreground、--chart-2、--chart-4，不读 documentElement。没有新依赖。减弱动效不挂 canvas。没有 WebGL 时停在同一张静帧。离开视口或页面隐藏时停止绘制，卸载时释放 context。设备像素比上限 1.5。",
    layer: "effect",
    effectCategory: "cards",
    source: "original",
    type: "registry:ui",
    file: "effects/ascii-halftone-filter.tsx",
    target: "components/ui/ascii-halftone-filter.tsx",
    files: glFiles("ascii-halftone-filter"),
    presets: [
      { name: "quiet", label: "疏", values: { mode: "ascii", size: 16, intensity: 0.4 } },
      { name: "default", label: "默认", values: { mode: "ascii", size: 8, intensity: 0.8 } },
      { name: "dots", label: "网点", values: { mode: "halftone", size: 12, intensity: 1 } },
    ],
    props: [
      {
        name: "mode",
        type: '"ascii" | "halftone"',
        defaultValue: '"ascii"',
        description: "ascii 是字符，halftone 是网点。ascii 与不传相同。",
        control: { kind: "select", value: "ascii", options: ["ascii", "halftone"] },
      },
      {
        name: "size",
        type: "number",
        defaultValue: "8",
        description: "格子边长，单位像素。8 与不传相同。",
        control: { kind: "range", value: 8, min: 4, max: 32, step: 1 },
      },
      {
        name: "intensity",
        type: "number",
        defaultValue: "0.8",
        description: "对比。0 是一片中间调，1 是拉开。0.8 与不传相同。",
        control: { kind: "range", value: 0.8, min: 0, max: 1, step: 0.05 },
      },
      {
        name: "src",
        type: "string",
        description: "图片地址。不是控件。不传或加载失败时用程序化图。",
      },
      className,
    ],
  },
]

export const batch91ScrollComponents: ComponentMeta[] = [
  {
    name: "velocity-bend-gallery",
    batch: 91,
    title: "Velocity Bend Gallery",
    description:
      "原创。画廊在组件自己的滚动区域里，滚得越快，卡片弯得越厉害，色差也越明显。不听窗口滚动，也不使用平滑滚动库。speed 是速度倍数，intensity 是弯曲幅度，gap 是卡片间距，单位像素。images 是图片地址列表，不是控件。不传或某一张加载失败时，该卡片留在程序化图上，不抛。程序化卡片读取组件根上的 --background、--foreground、--primary、--chart-2、--chart-4，不读 documentElement。这不是 image-tube-scroll，也不是 scroll-image-sequence。没有新依赖。减弱动效不挂 canvas，卡片不弯，仍然可以滚动。没有 WebGL 时同样停在可滚动的静帧。离开视口或页面隐藏时停止绘制，卸载时释放 context。设备像素比上限 1.5。",
    layer: "effect",
    effectCategory: "scroll",
    source: "original",
    type: "registry:ui",
    file: "effects/velocity-bend-gallery.tsx",
    target: "components/ui/velocity-bend-gallery.tsx",
    files: glFiles("velocity-bend-gallery"),
    presets: [
      { name: "quiet", label: "疏", values: { speed: 0.6, intensity: 0.2, gap: 24 } },
      { name: "default", label: "默认", values: { speed: 1, intensity: 0.6, gap: 16 } },
      { name: "fast", label: "快", values: { speed: 1.8, intensity: 0.9, gap: 8 } },
    ],
    props: [
      {
        name: "speed",
        type: "number",
        defaultValue: "1",
        description: "滚动速度换成弯曲的倍数。1 与不传相同。",
        control: { kind: "range", value: 1, min: 0.25, max: 2.5, step: 0.1 },
      },
      {
        name: "intensity",
        type: "number",
        defaultValue: "0.6",
        description: "弯曲和色差的幅度。0.6 与不传相同。0 时再快也不弯。",
        control: { kind: "range", value: 0.6, min: 0, max: 1, step: 0.05 },
      },
      {
        name: "gap",
        type: "number",
        defaultValue: "16",
        description: "卡片间距，单位像素。16 与不传相同。",
        control: { kind: "range", value: 16, min: 0, max: 48, step: 1 },
      },
      {
        name: "images",
        type: "string[]",
        description: "图片地址列表。不是控件。不传或加载失败时用程序化卡片。",
      },
      className,
    ],
  },
]

export const batch91DecorComponents: ComponentMeta[] = [
  {
    name: "liquid-metal-mark",
    batch: 91,
    title: "Liquid Metal Mark",
    description:
      "原创。把短词画成流动的液态金属。text 默认 Metal，不是控件。src 是图片遮罩，不是控件；传了就代替文字，文字不再作为标记。遮罩加载失败回到文字，不抛。speed 是高光流速，intensity 是高光对比。colors 不传时读取组件根上的 --foreground、--primary、--chart-2，不读 documentElement。这不是 fluted-glass-pane。没有新依赖。减弱动效不挂 canvas。没有 WebGL 时停在同一张静帧。离开视口或页面隐藏时停止绘制，卸载时释放 context。设备像素比上限 1.5。",
    layer: "effect",
    effectCategory: "decor",
    source: "original",
    type: "registry:ui",
    file: "effects/liquid-metal-mark.tsx",
    target: "components/ui/liquid-metal-mark.tsx",
    files: glFiles("liquid-metal-mark"),
    presets: [
      { name: "quiet", label: "静", values: { speed: 0.5, intensity: 0.2 } },
      { name: "default", label: "默认", values: { speed: 1, intensity: 0.6 } },
      {
        name: "bright",
        label: "亮",
        values: { speed: 1.8, intensity: 0.9, colors: ["#0f172a", "#64748b", "#e2e8f0"] },
      },
    ],
    props: [
      {
        name: "speed",
        type: "number",
        defaultValue: "1",
        description: "高光流动的速度倍数。1 与不传相同。",
        control: { kind: "range", value: 1, min: 0.25, max: 2.5, step: 0.1 },
      },
      {
        name: "intensity",
        type: "number",
        defaultValue: "0.6",
        description: "高光对比。0.6 与不传相同。0 时金属仍在，只是没有亮带。",
        control: { kind: "range", value: 0.6, min: 0, max: 1, step: 0.05 },
      },
      {
        name: "colors",
        type: "string[]",
        description: "三色金属：暗部、中段、高光。不传则读取组件根上的主题 token。",
        control: { kind: "colors", value: ["#0f172a", "#64748b", "#e2e8f0"], follow: true },
      },
      {
        name: "text",
        type: "string",
        defaultValue: "Metal",
        description: "标记上的短词。不传是 Metal。不是控件。传入 src 后不再作为标记。",
      },
      {
        name: "src",
        type: "string",
        description: "图片遮罩地址。不是控件。传了就代替文字。加载失败回到文字，不抛。",
      },
      className,
    ],
  },
]
