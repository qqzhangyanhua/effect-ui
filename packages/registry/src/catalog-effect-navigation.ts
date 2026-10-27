import type { ComponentMeta, PropDoc } from "./catalog"
import { reactBitsCredit } from "./catalog-sources"

/** Effect，导航。 */
const ui2: PropDoc[] = [
  {
    name: "className",
    type: "string",
    description: "额外 Tailwind 类名，与主题变量兼容。",
  },
]
const ui48: PropDoc[] = [{ name: "className", type: "string", description: "额外 Tailwind 类名，与主题变量兼容。" }]

export const effectNavigationComponents: ComponentMeta[] = [
  {
      name: "floating-navbar",
      batch: 2,
      title: "Floating Navbar",
      description: "滚动时收起的浮动导航。",
      layer: "effect",
      effectCategory: "navigation",
      source: "original",
      type: "registry:ui",
      file: "effects/floating-navbar.tsx",
      target: "components/ui/floating-navbar.tsx",
      props: [
        { name: "duration", type: "number", description: "收起毫秒。250 与不传相同，仍是 0.25 秒。", control: { kind: "range", value: 250, min: 100, max: 500, step: 10 } },
        { name: "intensity", type: "number", description: "收起距离倍率。1 与不传相同，仍是 88 像素。", control: { kind: "range", value: 1, min: 0, max: 1, step: 0.05 } },
        ...ui2,
      ],
      presets: [
        { name: "floating-navbar-slow", label: "慢", values: { duration: 400, intensity: 0.6 } },
        { name: "floating-navbar-default", label: "默认", values: { duration: 250, intensity: 1 } },
        { name: "floating-navbar-fast", label: "快", values: { duration: 120, intensity: 1 } },
      ],
    },
  {
      name: "liquid-glass-tabbar",
      batch: 11,
      title: "Liquid Glass Tabbar",
      description: "灵感来自 iOS 26，原创实现。玻璃底栏和会融合的液态指示。",
      layer: "effect",
      effectCategory: "navigation",
      source: "original",
      type: "registry:ui",
      file: "ui/liquid-glass-tabbar.tsx",
      target: "components/ui/liquid-glass-tabbar.tsx",
      props: [
        { name: "tabs", type: "GlassTab[]", description: "页签。" },
        { name: "speed", type: "number", description: "弹簧速度倍率。1 与不传相同，指示仍是 0.6 秒、圆点仍是 0.7 秒。", control: { kind: "range", value: 1, min: 0.4, max: 2.5, step: 0.1 } },
        { name: "intensity", type: "number", description: "回弹倍率。1 与不传相同，仍是 0.32 与 0.45。", control: { kind: "range", value: 1, min: 0, max: 2, step: 0.1 } },
        { name: "scale", type: "number", description: "模糊倍率。1 与不传相同，仍是 stdDeviation 8。", control: { kind: "range", value: 1, min: 0.5, max: 2, step: 0.1 } },
        ...ui2,
      ],
      presets: [
        { name: "liquid-glass-tabbar-soft", label: "柔", values: { speed: 0.6, intensity: 0.5, scale: 0.7 } },
        { name: "liquid-glass-tabbar-default", label: "默认", values: { speed: 1, intensity: 1, scale: 1 } },
        { name: "liquid-glass-tabbar-lively", label: "活", values: { speed: 1.6, intensity: 1.4, scale: 1.4 } },
      ],
    },
  {
      name: "flowing-menu",
      batch: 13,
      title: "Flowing Menu",
      description: `${reactBitsCredit}通栏大字菜单，跑马灯从指针进入的那一侧滑入。`,
      layer: "effect",
      effectCategory: "navigation",
      source: "original",
      type: "registry:ui",
      file: "effects/flowing-menu.tsx",
      target: "components/ui/flowing-menu.tsx",
      props: [
        { name: "items", type: "FlowingMenuItem[]", description: "菜单项，每项含 label。" },
        { name: "duration", type: "number", description: "滑入毫秒。380 与不传相同，仍是 0.38 秒。", control: { kind: "range", value: 380, min: 150, max: 760, step: 10 } },
        { name: "speed", type: "number", description: "跑马灯倍率。1 与不传相同，仍是 9 秒。", control: { kind: "range", value: 1, min: 0.4, max: 2.5, step: 0.1 } },
        ...ui2,
      ],
      presets: [
        { name: "flowing-menu-slow", label: "慢", values: { duration: 560, speed: 0.6 } },
        { name: "flowing-menu-default", label: "默认", values: { duration: 380, speed: 1 } },
        { name: "flowing-menu-fast", label: "快", values: { duration: 200, speed: 1.8 } },
      ],
    },
  {
      name: "spring-drawer",
      batch: 48,
      title: "Spring Drawer",
      description:
        "原创实现。拉手拖动抽屉，松手后按出手速度惯性滑开或关上。甩得够快会直接弹到另一侧。方向键和回车也能开关。减弱动效时直接开合。没有新增依赖，也不使用 matter-js。",
      layer: "effect",
      effectCategory: "navigation",
      source: "original",
      type: "registry:ui",
      file: "effects/spring-drawer.tsx",
      target: "components/ui/spring-drawer.tsx",
      props: [
        { name: "title", type: "string", defaultValue: "快捷抽屉", description: "抽屉标题。" },
        { name: "onOpenChange", type: "(open: boolean) => void", description: "开合状态变化后调用。" },
        { name: "color", type: "string", defaultValue: "var(--primary)", description: "拉手和描边。不传则跟随主题。", control: { kind: "color" } },
        {
          name: "size",
          type: "number",
          defaultValue: "280",
          description: "抽屉宽度，像素。",
          control: { kind: "range", value: 280, min: 200, max: 420, step: 4 },
        },
        {
          name: "duration",
          type: "number",
          defaultValue: "560",
          description: "松手后滑到开或关的毫秒数。越长，惯性越久。",
          control: { kind: "range", value: 560, min: 224, max: 1120, step: 16 },
        },
        ...ui48,
      ],
    }
]

