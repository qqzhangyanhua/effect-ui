import type { ComponentMeta } from "./catalog"

/** Hook。 */
export const hookComponents: ComponentMeta[] = [
  {
      name: "use-prefers-reduced-motion",
      batch: 1,
      title: "Use Prefers Reduced Motion",
      description: "系统开启减弱动态效果时返回 true，并在偏好变化时更新。",
      layer: "hook",
      source: "original",
      type: "registry:hook",
      file: "hooks/use-prefers-reduced-motion.ts",
      target: "hooks/use-prefers-reduced-motion.ts",
      props: [],
    },
  {
      name: "use-animation-active",
      batch: 1,
      title: "Use Animation Active",
      description: "目标处于视口内，并且标签页可见时返回 true。",
      layer: "hook",
      source: "original",
      type: "registry:hook",
      file: "hooks/use-animation-active.ts",
      target: "hooks/use-animation-active.ts",
      props: [],
    },
  {
      name: "use-click-outside",
      batch: 22,
      title: "Use Click Outside",
      description: "指针点在元素外时调用回调。供变形弹层和工具栏收起使用。",
      layer: "hook",
      source: "original",
      type: "registry:hook",
      file: "hooks/use-click-outside.ts",
      target: "hooks/use-click-outside.ts",
      props: [
        { name: "ref", type: "RefObject<HTMLElement | null>", description: "监听的元素。" },
        { name: "onOutside", type: "() => void", description: "点在元素外时调用。" },
      ],
    },
  {
      name: "use-measure",
      batch: 22,
      title: "Use Measure",
      description: "用 ResizeObserver 测量元素宽高。不依赖 react-use-measure。",
      layer: "hook",
      source: "original",
      type: "registry:hook",
      file: "hooks/use-measure.ts",
      target: "hooks/use-measure.ts",
      props: [],
    },
  {
      name: "use-controllable-state",
      batch: 23,
      title: "Use Controllable State",
      description: "受控或非受控状态。传入 value 时由外部控制，否则使用 defaultValue。不依赖 @radix-ui/react-use-controllable-state。",
      layer: "hook",
      source: "original",
      type: "registry:hook",
      file: "hooks/use-controllable-state.ts",
      target: "hooks/use-controllable-state.ts",
      props: [
        { name: "value", type: "T", description: "受控值。传入后不再使用内部状态。" },
        { name: "defaultValue", type: "T", description: "非受控时的初始值。" },
        { name: "onChange", type: "(next: T) => void", description: "值变化时调用。" },
      ],
    }
]

