# effect-ui

把 **shadcn/ui** 基础组件和多个 MIT 开源 React 特效库整合到同一套工具箱：组件多、特效多，用 shadcn registry / CLI **复制进项目**，而不是再装一个黑盒依赖。

## 它是什么

- **基础层**：基于 shadcn/ui（MIT）的 Button、Input、Dialog、Dropdown、Tabs、Card、Toast、Tooltip 等。
- **特效层**：从 Magic UI、Animata、Motion Primitives、Cult UI 移植并统一 API；同类效果如需补充则原创实现。
- **分发方式**：兼容 shadcn 的 `registry.json`，可用 `npx shadcn add <url>` 安装。
- **文档站**：Next.js App Router + Tailwind CSS v4 + Motion，每个组件都有实时预览、源码和 props 文档。

**不会**复制 Aceternity UI（非标准许可）或 React Bits（MIT + Commons Clause，禁止再分发组件本身）的代码。

许可：本仓库 [MIT](./LICENSE)。第三方来源、版权与组件对照见 [THIRD_PARTY_NOTICES.md](./THIRD_PARTY_NOTICES.md) / [CREDITS.md](./CREDITS.md)。

## 安装组件

文档站启动后，registry 位于 `/r/{name}.json`。

```bash
# 安装单个组件
npx shadcn@latest add http://localhost:3000/r/shimmer-button.json

# 或把仓库加为命名空间（写入 components.json）
npx shadcn@latest registry add @effect-ui=http://localhost:3000/r/{name}.json
npx shadcn@latest add @effect-ui/spotlight-card
```

根目录的 `registry.json` 也可被 shadcn CLI 直接读取（GitHub 公开仓库 registry 格式）。

目标项目需要：

- React 19
- Tailwind CSS v4
- 已有 `cn` 工具（`@/lib/utils`）与 CSS 变量主题（亮/暗色）

## 本地运行文档

```bash
pnpm install
pnpm dev
```

打开 http://localhost:3000 。

常用脚本：

```bash
pnpm lint
pnpm typecheck
pnpm build          # 先生成 registry，再构建文档站
pnpm registry:build
```

## 仓库结构

```
apps/docs              Next.js 文档 / 演示站
packages/registry      组件源码（ui、effects、sections、hooks、lib、examples）
scripts/build-registry.ts
registry.json          shadcn 兼容总表
```

## 组件列表

### 基础组件（shadcn/ui）

button · input · textarea · label · card · badge · separator · dialog · sheet · dropdown-menu · tabs · tooltip · sonner · switch · checkbox · select · accordion · popover · avatar · slider · alert · alert-dialog · aspect-ratio · breadcrumb · calendar · carousel · chart · collapsible · command · context-menu · drawer · form · hover-card · input-otp · menubar · navigation-menu · pagination · progress · radio-group · resizable · scroll-area · sidebar · skeleton · table · toggle · toggle-group · data-table · field · input-group · button-group · kbd · empty · item · native-select · combobox · date-picker · typography · direction

### Hooks

use-mobile · use-prefers-reduced-motion

### 文字动画

| 组件 | 来源 |
| --- | --- |
| typing-text | Magic UI |
| gradient-text | Magic UI |
| shimmer-text | Magic UI |
| aurora-text | Magic UI |
| split-text | Motion Primitives |
| highlight-text | Animata |
| count-up | Magic UI |
| scramble-text | Magic UI |
| word-rotate | Magic UI |
| morphing-text | Magic UI |
| rolling-number | Magic UI |
| text-reveal | Magic UI |
| variable-font-proximity | Fancy Components |
| number-flow | Number Flow（MIT） |
| glitch-text | Kokonut UI（免费 MIT） |
| spoiler-text | Kokonut UI（免费 MIT） |
| text-along-path | Fancy Components |
| scroll-typography | Codrops MIT（Motion 重写） |
| lamp-heading | 灵感来自 lamp heading，原创实现 |
| vfx-element | vfx-js MIT |
| rough-annotation | rough-notation MIT |

### 背景

| 组件 | 来源 |
| --- | --- |
| particles | Magic UI |
| grid-pattern | Magic UI |
| dot-pattern | Magic UI |
| meteors | Magic UI |
| aurora-background | 原创 |
| ripples | Magic UI |
| flickering-grid | Magic UI |
| light-beams | Magic UI |
| starfield | 原创 |
| wave-background | 原创 |
| noise-gradient | 原创 |
| animated-grid | Magic UI |
| retro-grid | Magic UI |
| shader-backgrounds | Paper Shaders（Apache-2.0，>=0.0.77） |
| background-paths | Kokonut UI（免费 MIT） |
| flow-field | Kokonut UI（免费 MIT） |
| halftone | Kokonut UI（免费 MIT） |
| shader-pack-2 | Paper Shaders（Apache-2.0） |
| gpgpu-particles | OGL GPGPU 示例（Unlicense） |
| letter-glitch-wall | 灵感来自 letter glitch wall，原创实现 |
| lightning | 原创 GLSL |
| iridescence | 原创噪声着色器 |
| silk | 原创噪声着色器 |

### 光标 / 悬停

| 组件 | 来源 |
| --- | --- |
| spotlight-card | Magic UI |
| magnetic | Motion Primitives |
| cursor-follow | 原创 |
| tilt | Motion Primitives |
| glow-hover | Cult UI |
| cursor-trail | 原创 |
| image-trail | Fancy Components |
| splash-cursor | PavelDoGreat WebGL-Fluid-Simulation MIT |
| mouse-flowmap | OGL flowmap 示例（Unlicense） |
| polyline-ribbon-cursor | OGL polylines 示例（Unlicense） |
| target-cursor | 灵感来自 target cursor，原创实现 |

### 展示 / 列表

| 组件 | 来源 |
| --- | --- |
| marquee | Magic UI |
| animated-list | Magic UI |
| orbiting-circles | Magic UI |
| globe-sphere | 原创 |
| icon-cloud | Magic UI |
| animated-beam | Magic UI |
| marquee-along-svg-path | Fancy Components |

### 装饰 / 庆祝

| 组件 | 来源 |
| --- | --- |
| confetti-burst | Magic UI |
| sparkles | Magic UI |
| burst-icons | 灵感来自 mo.js，Motion 重写 |

### 卡片 / 3D

| 组件 | 来源 |
| --- | --- |
| flip-card | Animata |
| glass-card | 原创 |
| shine-border | Magic UI |
| hover-lift | Cult UI |
| border-beam | Magic UI |
| bento-grid | Magic UI |
| perspective-card | 原创 |
| expandable-card | Cult UI |
| morphing-dialog | Motion Primitives |
| image-comparison | Motion Primitives |
| liquid-glass | liquid-glass-react |
| holographic-foil | Smooth UI |
| 3d-carousel | Cult UI |
| circular-gallery | 灵感来自 circular gallery，原创实现 |
| glowing-edge | 灵感来自 Linear，原创实现 |
| pixel-canvas-card | hexagoncircle/pixel-canvas MIT |
| atropos-card | Atropos MIT |
| evervault-card | 灵感来自 encrypted card，原创实现 |

### 按钮特效

| 组件 | 来源 |
| --- | --- |
| ripple-button | Animata |
| shimmer-button | Magic UI |
| pulse-button | Magic UI |
| neon-button | 原创 |
| rainbow-button | Magic UI |
| interactive-hover-button | Magic UI |
| gooey-button | 原创 |
| hold-button | Kokonut UI（免费 MIT） |
| particle-button | Kokonut UI（免费 MIT） |
| tear-button | Kokonut UI（免费 MIT） |

### 加载

| 组件 | 来源 |
| --- | --- |
| spinner | 原创 |
| orbit-loader | Animata |
| dots-loader | Animata |
| progress-ring | Magic UI |

### 滚动显现

| 组件 | 来源 |
| --- | --- |
| fade-in | Motion Primitives |
| slide-in | Motion Primitives |
| stagger-list | Motion Primitives |
| parallax | 原创 |
| blur-fade | Magic UI |
| progressive-blur | Motion Primitives |
| scroll-progress | Magic UI |
| scroll-velocity | Magic UI |
| stacking-cards | Fancy Components |
| tracing-beam | 灵感来自 tracing-beam，原创实现 |
| container-scroll-3d | 灵感来自 container-scroll，原创实现 |
| scroll-image-sequence | 灵感来自 Apple 产品页，原创实现 |

### 导航

| 组件 | 来源 |
| --- | --- |
| animated-tabs | Motion Primitives |
| floating-navbar | 原创 |
| animated-sidebar | 原创 |
| animated-theme-toggler | Magic UI |
| dock | Magic UI |
| dynamic-island | Cult UI |

### 页面 / 转场

| 组件 | 来源 |
| --- | --- |
| page-transition | 原创 |
| reveal-section | Motion Primitives |
| marketing-blocks | Tailark（免费 MIT） |
| device-mockups | Magic UI |
| terminal | Eldora UI |
| dashboard-blocks | 原创 |
| ecommerce-blocks | 原创 |
| pixel-transition | 灵感来自 pixel transition，原创实现 |
| canvas-reveal | 灵感来自 dot-matrix reveal，原创实现 |

### 落地页区块

| 组件 | 来源 |
| --- | --- |
| hero-shader | 原创（组合 silk / iridescence / lightning / shader-backgrounds） |
| hero-globe | cobe（MIT） |
| hero-product-mockup | 原创（组合 device-mockups / glow-hover / container-scroll-3d） |
| hero-kinetic-text | 原创（组合 split-text / word-rotate / rough-annotation） |
| hero-ai-prompt | 灵感来自 v0 / Lovable，原创实现 |
| hero-parallax-wall | 灵感来自 Aceternity，原创实现 |
| footer-curtain-reveal | Fancy Components（MIT） |
| footer-giant-wordmark | 灵感来自巨型字标光标描边，原创实现 |
| footer-interactive-wordmark | matter-js + variable-font-proximity |
| footer-shader-wordmark | Paper Shaders |
| nav-morphing | Kokonut UI（免费 MIT） |
| section-logo-cloud | 原创（组合 marquee / progressive-blur / timeline） |
| section-sticky-feature-scroll | Cult UI（MIT） |
| section-animated-bento | 原创（组合 bento-grid 与迷你动画） |
| section-pricing-flow | Number Flow |

### AI 对话

| 组件 | 来源 |
| --- | --- |
| prompt-input | prompt-kit |
| chat-message | prompt-kit |
| siri-orb | Smooth UI |

### 实用组件

| 组件 | 来源 |
| --- | --- |
| dropzone | Kibo UI |
| multi-select | sersavan / Kibo UI |
| tag-input | Kibo UI |
| date-range-picker | Origin UI（仅 `apps/origin/` MIT） |
| timeline | Origin UI |
| stepper | Origin UI |
| color-picker | Kibo UI |
| code-block | Kibo UI |
| kanban | Kibo UI |
| rich-text-editor | Kibo UI / Tiptap |
| tree-view | 原创 |
| onboarding-tour | 原创 |
| virtual-list | TanStack Virtual |
| infinite-scroll | 原创 |
| masonry-gallery | react-photo-album |
| lightbox | yet-another-react-lightbox |
| phone-input | react-phone-number-input |
| password-strength | 原创 |
| currency-input | 原创 |
| quantity-stepper | 原创 |
| floating-label-input | Smooth UI |
| emoji-picker | frimousse |
| video-player | Kibo UI（原生 video） |
| audio-waveform | wavesurfer.js（BSD-3） |
| toast-stack | Kokonut UI（免费 MIT） |
| notification-center | Kokonut UI（免费 MIT） |
| gravity | matter-js |
| ascii-render | Smooth UI |

## 新增组件

`date-picker` 和 `typography` 已有独立 registry JSON，和其它组件一样由 `pnpm registry:build` 生成。新增组件时改这些地方，漏了会被 `pnpm test` 的 registry 审计拦住：

1. **源码**放在 `packages/registry/src/ui/`、`effects/`、`sections/`、`lib/` 或 `hooks/`。registry 依赖只用 `@/components/ui/*`、`@/lib/*`、`@/hooks/*`；同目录组件用 `./组件名`。
2. **catalog** 在 `packages/registry/src/catalog.ts` 或对应的 `catalog-batch*.ts` 登记 `name`、`type`、`dependencies`、`registryDependencies`、`file`、`target`、`props`。
   - `type` 为 `registry:ui`、`registry:lib` 或 `registry:hook`。hook 的 `target` 在 `hooks/`，例如 `use-mobile` 安装到 `hooks/use-mobile.ts`。
   - `dependencies` 与源码 import 一致，包括 type-only import 和动态 `import()`。不要写 `react`、`react-dom`。
   - 上面的别名和同目录相对引用写入 `registryDependencies`。
   - 用到的 npm 包还要写进 `packages/registry/package.json` 的 `dependencies`。
3. **demo**：`registry:ui` 在 `packages/registry/src/examples/` 增加 Demo，并登记到 `examples/index.ts` 的 `demoMap`。`registry:lib` 和 `registry:hook` 不需要 demo 和 Props。
4. **README** 组件列表写上独立组件名。
5. **例外**：必须保留源码没有直接引用的依赖时（例如 `@tiptap/pm` 作为 peer），在 `packages/registry/src/audit-exceptions.ts` 写明组件、问题类型和原因。
6. 运行 `pnpm registry:build`，更新根目录 `registry.json` 和 `apps/docs/public/r/`。

---

## English

**effect-ui** is an open-source React UI + effects library. It re-implements shadcn/ui primitives and ports MIT-licensed motion/effect components into one **shadcn-compatible registry**. Install with `npx shadcn add <url>` — files are copied into your app.

- Docs site: Next.js App Router, Tailwind CSS v4, Motion.
- License: MIT. Attribution lives in `THIRD_PARTY_NOTICES.md`.
- Not copied: Aceternity UI and React Bits (incompatible redistribution terms).

```bash
pnpm install
pnpm dev
npx shadcn@latest add http://localhost:3000/r/button.json
```
