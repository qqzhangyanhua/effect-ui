import type { ComponentMeta, PropDoc } from "./catalog"

/** 第 85 批调研，catalog batch 91。棱纹玻璃从这一批开始，原创，没有移植头。 */
const className: PropDoc = {
  name: "className",
  type: "string",
  description: "额外 Tailwind 类名，与主题变量兼容。",
}

function paneFiles(slug: string): NonNullable<ComponentMeta["files"]> {
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
    files: paneFiles("fluted-glass-pane"),
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
]
