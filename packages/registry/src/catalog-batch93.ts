import type { ComponentMeta, PropDoc } from "./catalog"

/** 第 87 批调研，catalog batch 93。页面效果从这一批开始，原创，没有移植头。 */
const className: PropDoc = {
  name: "className",
  type: "string",
  description: "额外 Tailwind 类名，与主题变量兼容。",
}

export const batch93PageComponents: ComponentMeta[] = [
  {
    name: "theme-reveal-toggle",
    batch: 93,
    title: "Theme Reveal Toggle",
    description:
      "原创。在自己的表面上从按钮位置做圆形揭示，切换明暗。dark class 写在这块表面的根上，不写文档根，也不使用文档站的主题包。亮色 token 写在表面节点上，宿主页面是暗色时摘掉 class 仍然是亮的。揭示用名为 theme-reveal 的 view transition。没有 View Transitions，或用户偏好减弱动效时，class 立刻切换。这不是 pixel-transition 的像素格，也不是 view-transition-gallery 的共享元素。没有 WebGL。",
    layer: "effect",
    effectCategory: "page",
    source: "original",
    type: "registry:ui",
    file: "effects/theme-reveal-toggle.tsx",
    target: "components/ui/theme-reveal-toggle.tsx",
    presets: [
      { name: "quiet", label: "静", values: { duration: 320, size: 32 } },
      { name: "default", label: "默认", values: { duration: 640, size: 44 } },
      { name: "broad", label: "宽", values: { duration: 1100, size: 64, color: "#5b4bdb" } },
    ],
    props: [
      {
        name: "duration",
        type: "number",
        defaultValue: "640",
        description: "圆形揭示的毫秒。640 与不传相同。",
        control: { kind: "range", value: 640, min: 240, max: 1400, step: 20, group: "动画" },
      },
      {
        name: "size",
        type: "number",
        defaultValue: "44",
        description: "按钮直径（像素）。44 与不传相同。",
        control: { kind: "range", value: 44, min: 28, max: 72, step: 2, group: "外观" },
      },
      {
        name: "color",
        type: "string",
        description: "按钮颜色。不传则跟随表面的主题 token。",
        control: { kind: "color" },
      },
      className,
    ],
  },
]
