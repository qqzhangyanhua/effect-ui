import type { ComponentMeta, PropDoc } from "./catalog"

/** 第 86 批调研，catalog batch 92。材质效果从这一张玻璃体开始，原创，没有移植头。 */
const className: PropDoc = {
  name: "className",
  type: "string",
  description: "额外 Tailwind 类名，与主题变量兼容。",
}

function glassFiles(slug: string): NonNullable<ComponentMeta["files"]> {
  return [
    { file: `effects/${slug}.tsx`, type: "registry:ui", target: `components/ui/${slug}.tsx` },
    { file: "effects/gl/gl-loop.tsx", type: "registry:file", target: "components/ui/gl/gl-loop.tsx" },
  ]
}

export const batch92PageComponents: ComponentMeta[] = [
  {
    name: "glass-refract-hero",
    batch: 92,
    title: "Glass Refract Hero",
    description:
      "原创。一块玻璃体折射后面的程序化后景，并带色散。src 不传或加载失败时仍画程序化后景，不抛错。children 叠在画布上面。组件不包含标题、副标题或按钮。这不是 hero-shader，也不改它。颜色读取组件根上的 --background、--primary、--chart-2，不读 documentElement。没有新依赖。减弱动效不挂 canvas。没有 WebGL 时停在同一张静帧。离开视口或页面隐藏时停止绘制，卸载时释放 context。设备像素比上限 1.5。",
    layer: "effect",
    effectCategory: "page",
    source: "original",
    type: "registry:ui",
    file: "effects/glass-refract-hero.tsx",
    target: "components/ui/glass-refract-hero.tsx",
    files: glassFiles("glass-refract-hero"),
    presets: [
      { name: "quiet", label: "静", values: { speed: 0.6, intensity: 0.2, size: 120 } },
      { name: "default", label: "默认", values: { speed: 1, intensity: 0.45, size: 180 } },
      { name: "wide", label: "大", values: { speed: 1.6, intensity: 0.85, size: 280 } },
    ],
    props: [
      {
        name: "speed",
        type: "number",
        defaultValue: "1",
        description: "玻璃漂移的速度倍数。1 与不传相同。",
        control: { kind: "range", value: 1, min: 0.25, max: 2.5, step: 0.1, group: "动画" },
      },
      {
        name: "intensity",
        type: "number",
        defaultValue: "0.45",
        description: "折射和色散的强度。0 是不弯，1 是最开。0.45 与不传相同。",
        control: { kind: "range", value: 0.45, min: 0, max: 1, step: 0.05, group: "外观" },
      },
      {
        name: "size",
        type: "number",
        defaultValue: "180",
        description: "玻璃体直径（像素）。180 与不传相同。",
        control: { kind: "range", value: 180, min: 72, max: 320, step: 4, group: "外观" },
      },
      {
        name: "src",
        type: "string",
        description: "后景图片地址。不传或加载失败时画程序化后景。不是控件。",
      },
      {
        name: "children",
        type: "ReactNode",
        description: "叠在画布上的内容。组件不提供标题、副标题或按钮。",
      },
      className,
    ],
  },
]

export const batch92MicroComponents: ComponentMeta[] = [
  {
    name: "voice-orb",
    batch: 92,
    title: "Voice Orb",
    description:
      "原创。SVG 状态球表示待机、聆听、思考和播报。volume 由调用方传入，只在 speak 时推动幅度，不是控件。不打开麦克风，不建立音频上下文，也不播放声音。颜色用组件上的 --primary 与 --foreground，不读 documentElement。减弱动效时球停在静帧。没有新依赖。",
    layer: "effect",
    effectCategory: "micro",
    source: "original",
    type: "registry:ui",
    file: "effects/voice-orb.tsx",
    target: "components/ui/voice-orb.tsx",
    presets: [
      { name: "quiet", label: "静", values: { speed: 0.6, intensity: 0.2, state: "idle" } },
      { name: "default", label: "默认", values: { speed: 1, intensity: 0.5, state: "idle" } },
      { name: "speak", label: "播报", values: { speed: 1.6, intensity: 0.85, state: "speak" } },
    ],
    props: [
      {
        name: "speed",
        type: "number",
        defaultValue: "1",
        description: "描边和轨道的速度倍数。1 与不传相同。",
        control: { kind: "range", value: 1, min: 0.25, max: 2.5, step: 0.1, group: "动画" },
      },
      {
        name: "intensity",
        type: "number",
        defaultValue: "0.5",
        description: "静止幅度，以及播报时音量能再推开的程度。0.5 与不传相同。",
        control: { kind: "range", value: 0.5, min: 0, max: 1, step: 0.05, group: "外观" },
      },
      {
        name: "state",
        type: '"idle" | "listen" | "think" | "speak"',
        defaultValue: '"idle"',
        description: "待机、聆听、思考或播报。idle 与不传相同。",
        control: { kind: "select", value: "idle", options: ["idle", "listen", "think", "speak"], group: "外观" },
      },
      {
        name: "volume",
        type: "number",
        defaultValue: "0",
        description: "调用方传入的音量，0 到 1。只在 speak 时推动幅度。不是控件。不打开麦克风。",
      },
      className,
    ],
  },
]
