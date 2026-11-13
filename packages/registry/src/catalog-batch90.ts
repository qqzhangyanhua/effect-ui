import type { ComponentMeta, PropDoc } from "./catalog"

/** 第 84 批调研，catalog batch 90。容器内流体墨迹，原创，没有移植头。 */
const className: PropDoc = {
  name: "className",
  type: "string",
  description: "额外 Tailwind 类名，与主题变量兼容。",
}

function inkFiles(slug: string): NonNullable<ComponentMeta["files"]> {
  return [
    { file: `effects/${slug}.tsx`, type: "registry:ui", target: `components/ui/${slug}.tsx` },
    { file: "effects/gl/gl-loop.tsx", type: "registry:file", target: "components/ui/gl/gl-loop.tsx" },
    { file: "effects/fluid-ink-shaders.ts", type: "registry:file", target: "components/ui/fluid-ink-shaders.ts" },
  ]
}

export const batch90CursorComponents: ComponentMeta[] = [
  {
    name: "fluid-ink-cursor",
    batch: 90,
    title: "Fluid Ink Cursor",
    description:
      "原创。在组件自己的矩形里用多 pass 流体画墨迹。指针按下并移动，或触屏拖动，都会注入速度和颜色；松开或离开后墨迹消退。不盖住视口，也不替换系统光标。colors 不传时读取组件根上的 --primary、--chart-2、--chart-4，不读 documentElement。这不是 cursor-follow，也不是 cursor-trail 或 brim-flick-ink。没有新依赖。减弱动效不挂 canvas。没有 WebGL 时停在同一张静帧。离开视口或页面隐藏时停止绘制，卸载时释放 context。设备像素比上限 1.5。",
    layer: "effect",
    effectCategory: "cursor",
    source: "original",
    type: "registry:ui",
    file: "effects/fluid-ink-cursor.tsx",
    target: "components/ui/fluid-ink-cursor.tsx",
    files: inkFiles("fluid-ink-cursor"),
    presets: [
      { name: "quiet", label: "静", values: { speed: 0.7, intensity: 0.25 } },
      { name: "default", label: "默认", values: { speed: 1, intensity: 0.55 } },
      {
        name: "vivid",
        label: "浓",
        values: { speed: 1.5, intensity: 0.9, colors: ["#1d4ed8", "#0f766e", "#b45309"] },
      },
    ],
    props: [
      {
        name: "speed",
        type: "number",
        defaultValue: "1",
        description: "平流和消退的速度倍数。",
        control: { kind: "range", value: 1, min: 0.25, max: 2.5, step: 0.1 },
      },
      {
        name: "intensity",
        type: "number",
        defaultValue: "0.55",
        description: "搅动半径和注入强度。",
        control: { kind: "range", value: 0.55, min: 0, max: 1, step: 0.05 },
      },
      {
        name: "colors",
        type: "string[]",
        description: "三色墨。不传则读取组件根上的主题 token。",
        control: { kind: "colors", value: ["#1d4ed8", "#0f766e", "#b45309"], follow: true },
      },
      className,
    ],
  },
]

function rippleFiles(slug: string): NonNullable<ComponentMeta["files"]> {
  return [
    { file: `effects/${slug}.tsx`, type: "registry:ui", target: `components/ui/${slug}.tsx` },
    { file: "effects/gl/gl-loop.tsx", type: "registry:file", target: "components/ui/gl/gl-loop.tsx" },
  ]
}

function fieldFiles(slug: string): NonNullable<ComponentMeta["files"]> {
  return [
    { file: `effects/${slug}.tsx`, type: "registry:ui", target: `components/ui/${slug}.tsx` },
    { file: "effects/gl/gl-loop.tsx", type: "registry:file", target: "components/ui/gl/gl-loop.tsx" },
    {
      file: "effects/reaction-diffusion-shaders.ts",
      type: "registry:file",
      target: "components/ui/reaction-diffusion-shaders.ts",
    },
  ]
}

export const batch90BackgroundComponents: ComponentMeta[] = [
  {
    name: "ripple-refract-surface",
    batch: 90,
    title: "Ripple Refract Surface",
    description:
      "原创。指针移动和点击都会在这块表面上激起涟漪，并折射底下的图片。不传 src，或图片加载失败时，用程序化渐变，不抛错。子节点叠在画布上面。没有 interactive 开关。color 不传时读取组件根上的 --primary，不读 documentElement。没有新依赖。减弱动效不挂 canvas。没有 WebGL 时停在同一张静帧。离开视口或页面隐藏时停止绘制，卸载时释放 context。设备像素比上限 1.5。",
    layer: "effect",
    effectCategory: "backgrounds",
    source: "original",
    type: "registry:ui",
    file: "effects/ripple-refract-surface.tsx",
    target: "components/ui/ripple-refract-surface.tsx",
    files: rippleFiles("ripple-refract-surface"),
    presets: [
      { name: "quiet", label: "静", values: { speed: 0.6, intensity: 0.2 } },
      { name: "default", label: "默认", values: { speed: 1, intensity: 0.5 } },
      { name: "swell", label: "涌", values: { speed: 1.8, intensity: 0.9, color: "#0f766e" } },
    ],
    props: [
      {
        name: "speed",
        type: "number",
        defaultValue: "1",
        description: "波纹推进的速度倍数。",
        control: { kind: "range", value: 1, min: 0.25, max: 2.5, step: 0.1 },
      },
      {
        name: "intensity",
        type: "number",
        defaultValue: "0.5",
        description: "落点和折射的强度。0.5 与不传相同。",
        control: { kind: "range", value: 0.5, min: 0, max: 1, step: 0.05 },
      },
      {
        name: "color",
        type: "string",
        description: "涟漪高光。不传则读取组件根上的主题 token。",
        control: { kind: "color" },
      },
      {
        name: "src",
        type: "string",
        description: "底下的图片地址。不传或加载失败时改用程序化渐变，不抛错。",
      },
      className,
    ],
  },
  {
    name: "reaction-diffusion-field",
    batch: 90,
    title: "Reaction Diffusion Field",
    description:
      "原创。用 Gray-Scott 反应扩散从内置图案长出纹理。pattern 为 spots、print 或 coral，默认斑点；不接收文字、遮罩或图片。colors 不传时读取组件根上的 --primary、--chart-2、--chart-4，不读 documentElement。没有新依赖。减弱动效不挂 canvas。没有 WebGL 时停在同一张静帧。离开视口或页面隐藏时停止绘制，卸载时释放 context。设备像素比上限 1.5。",
    layer: "effect",
    effectCategory: "backgrounds",
    source: "original",
    type: "registry:ui",
    file: "effects/reaction-diffusion-field.tsx",
    target: "components/ui/reaction-diffusion-field.tsx",
    files: fieldFiles("reaction-diffusion-field"),
    presets: [
      { name: "quiet", label: "静", values: { pattern: "print", speed: 0.5, intensity: 0.3 } },
      { name: "default", label: "默认", values: { pattern: "spots", speed: 1, intensity: 0.75 } },
      {
        name: "vivid",
        label: "盛",
        values: { pattern: "coral", speed: 1.8, intensity: 1, colors: ["#1d4ed8", "#0f766e", "#b45309"] },
      },
    ],
    props: [
      {
        name: "pattern",
        type: '"spots" | "print" | "coral"',
        defaultValue: '"spots"',
        description: "内置图案。斑点、指纹或珊瑚。不接收文字或遮罩。",
        control: { kind: "select", value: "spots", options: ["spots", "print", "coral"] },
      },
      {
        name: "speed",
        type: "number",
        defaultValue: "1",
        description: "每帧反应步数的倍数。",
        control: { kind: "range", value: 1, min: 0.25, max: 2.5, step: 0.1 },
      },
      {
        name: "intensity",
        type: "number",
        defaultValue: "0.75",
        description: "反应强度，并决定着色有多实。",
        control: { kind: "range", value: 0.75, min: 0, max: 1, step: 0.05 },
      },
      {
        name: "colors",
        type: "string[]",
        description: "三色。不传则读取组件根上的主题 token。",
        control: { kind: "colors", value: ["#1d4ed8", "#0f766e", "#b45309"], follow: true },
      },
      className,
    ],
  },
]
