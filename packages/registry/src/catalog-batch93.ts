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

export const batch93NavigationComponents: ComponentMeta[] = [
  {
    name: "morph-mega-menu",
    batch: 93,
    title: "Morph Mega Menu",
    description:
      "原创。导航项之间切换时，同一块面板从旧位置移到新位置。点击展开，不靠悬停，所以触屏可用。方向键在项之间移动，Escape 关闭，外部点击走 useClickOutside。减弱动效时面板瞬时切换。不使用浮层原语库，也没有 WebGL。",
    layer: "effect",
    effectCategory: "navigation",
    source: "original",
    type: "registry:ui",
    file: "effects/morph-mega-menu.tsx",
    target: "components/ui/morph-mega-menu.tsx",
    presets: [
      { name: "quiet", label: "静", values: { duration: 200, intensity: 0.2, size: 200 } },
      { name: "default", label: "默认", values: { duration: 400, intensity: 0.55, size: 280 } },
      { name: "wide", label: "宽", values: { duration: 720, intensity: 1, size: 400 } },
    ],
    props: [
      {
        name: "items",
        type: "readonly MorphMegaMenuItem[]",
        description: "导航项。不传则是 Product、Docs、Studio。",
      },
      {
        name: "duration",
        type: "number",
        defaultValue: "400",
        description: "面板从旧位置移到新位置的毫秒。400 与不传相同。",
        control: { kind: "range", value: 400, min: 160, max: 800, step: 10, group: "动画" },
      },
      {
        name: "intensity",
        type: "number",
        defaultValue: "0.55",
        description: "移动中段面板加宽的幅度。0.55 与不传相同。",
        control: { kind: "range", value: 0.55, min: 0, max: 1, step: 0.05, group: "外观" },
      },
      {
        name: "size",
        type: "number",
        defaultValue: "280",
        description: "面板宽度（像素）。280 与不传相同。",
        control: { kind: "range", value: 280, min: 160, max: 440, step: 4, group: "外观" },
      },
      className,
    ],
  },
]
