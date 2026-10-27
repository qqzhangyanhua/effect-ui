import type { ComponentMeta, PropDoc } from "./catalog"
import { smoothuiFile as file } from "./catalog-sources"

/** Effect，页面 / 转场。 */
const ui6: PropDoc[] = [
  {
    name: "className",
    type: "string",
    description: "额外 Tailwind 类名，与主题变量兼容。",
  },
]

export const effectPageComponents: ComponentMeta[] = [
  {
      name: "pixel-transition",
      batch: 6,
      title: "Pixel Transition",
      description: "灵感来自 pixel transition，原创实现：像素格淡出切换画面。",
      layer: "effect",
      effectCategory: "page",
      source: "original",
      type: "registry:ui",
      file: "effects/pixel-transition.tsx",
      target: "components/ui/pixel-transition.tsx",
      props: [
        { name: "from", type: "string", description: "起始图。" },
        { name: "to", type: "string", description: "目标图。" },
        { name: "count", type: "number", description: "像素格数。48 与不传相同。", control: { kind: "range", value: 48, min: 16, max: 80, step: 4 } },
        { name: "duration", type: "number", description: "淡出毫秒。500 与不传相同，仍是 duration-500。", control: { kind: "range", value: 500, min: 200, max: 1000, step: 10 } },
        { name: "delay", type: "number", description: "错开毫秒。28 与不传相同。", control: { kind: "range", value: 28, min: 0, max: 56, step: 2 } },
        ...ui6,
      ],
      presets: [
        { name: "pixel-transition-slow", label: "慢", values: { count: 32, duration: 800, delay: 48 } },
        { name: "pixel-transition-default", label: "默认", values: { count: 48, duration: 500, delay: 28 } },
        { name: "pixel-transition-fast", label: "快", values: { count: 64, duration: 240, delay: 8 } },
      ],
    },
  {
      name: "view-transition-gallery",
      batch: 11,
      title: "View Transition Gallery",
      description: "灵感来自 Apple，原创实现。缩略图到详情用 View Transitions API 共享元素，不支持时回退 Motion layoutId。",
      layer: "effect",
      effectCategory: "page",
      source: "original",
      type: "registry:ui",
      file: "ui/view-transition-gallery.tsx",
      target: "components/ui/view-transition-gallery.tsx",
      props: [
        { name: "shots", type: "GalleryShot[]", description: "画廊条目。" },
        { name: "gap", type: "number", description: "缩略图间距（像素）。12 与不传相同，仍是 gap-3。", control: { kind: "range", value: 12, min: 0, max: 32, step: 1 } },
        { name: "size", type: "number", description: "缩略图高度（像素）。112 与不传相同，仍是 h-28。", control: { kind: "range", value: 112, min: 64, max: 200, step: 4 } },
        ...ui6,
      ],
      presets: [
        { name: "view-transition-gallery-tight", label: "紧", values: { gap: 8, size: 80 } },
        { name: "view-transition-gallery-default", label: "默认", values: { gap: 12, size: 112 } },
        { name: "view-transition-gallery-loose", label: "疏", values: { gap: 20, size: 160 } },
      ],
    }
]

