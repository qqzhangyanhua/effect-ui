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
pnpm test           # 单元测试 + registry 审计
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
| text-rotate | 原创 |
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
| text-morph | Motion Primitives |

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
| orbiting-items-3d | Animata |

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
| coverflow-carousel | Smooth UI |
| book-flip | Smooth UI |
| folder-reveal | Smooth UI |
| box-carousel | Fancy Components |
| apple-activity-card | Kokonut UI（免费 MIT） |
| apple-cards-carousel | 灵感来自 Aceternity，原创实现 |

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

### 微交互

| 组件 | 来源 |
| --- | --- |
| squish-switch | 灵感来自 React Bits，原创实现，未打开源码 |
| jelly-radio | 灵感来自 React Bits，原创实现，未打开源码 |
| spring-check | 灵感来自 React Bits，原创实现，未打开源码 |
| peek-rating | 灵感来自 React Bits，原创实现，未打开源码 |
| slide-to-confirm | 灵感来自 React Bits，原创实现，未打开源码 |
| swipe-row | 灵感来自 React Bits，原创实现，未打开源码 |
| fuse-button | 灵感来自 React Bits，原创实现，未打开源码 |
| pulse-heart | 灵感来自 React Bits，原创实现，未打开源码 |
| lattice-loader | 灵感来自 React Bits，原创实现，未打开源码 |
| warm-tooltip | 灵感来自 React Bits，原创实现，未打开源码 |

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
| reveal | 原创 |
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
| family-drawer | Cult UI |

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
| hero-annotated-showcase | Inspired by ToDesktop (via Mobbin), original implementation |
| hero-wave-mask-gallery | Inspired by Kajabi (via Mobbin), original implementation |
| hero-inline-mascot | Inspired by Phantom (via Mobbin), original implementation |
| hero-orbit-nodes | Inspired by Air (via Mobbin), original implementation |
| hero-swirl-avatars | Inspired by Wizz (via Mobbin), original implementation |
| footer-dot-matrix-wordmark | Inspired by Fuser (via Mobbin), original implementation |
| footer-social-marquee | Inspired by BAGGU (via Mobbin), original implementation |
| section-pricing-perspective-grid | Inspired by Dovetail (via Mobbin), original implementation |
| section-pricing-product-tabs | Inspired by Better Stack (via Mobbin), original implementation |
| section-pattern-cards | Inspired by Loom (via Mobbin), original implementation |
| section-stats-cornered | Inspired by Spade (via Mobbin), original implementation |
| section-stats-blob | Inspired by Oyster (via Mobbin), original implementation |
| section-dotted-feature-tabs | Inspired by Maze (via Mobbin), original implementation |
| cta-ribbon-swoosh | Inspired by The Leap (via Mobbin), original implementation |
| section-testimonial-split | Inspired by Paraform (via Mobbin), original implementation |

### 2025-26 动效

| 组件 | 来源 |
| --- | --- |
| view-transition-gallery | 灵感来自 Apple，原创实现 |
| scroll-timeline-reveal | 原创（view()，回退 Motion） |
| smooth-scroll-provider | Lenis（MIT） |
| hero-scroll-zoom | 灵感来自 Apple，原创实现 |
| section-horizontal-scroll | 灵感来自 Apple，原创实现 |
| intro-preloader | 灵感来自 Linear，原创实现 |
| hero-3d-model | three / React Three Fiber / drei（MIT），灵感来自 Apple，原创实现 |
| keycap-3d | 灵感来自 Raycast，原创实现 |
| infinite-canvas-gallery | 灵感来自无限画布，原创实现 |
| hover-image-list | 灵感来自作品列表，原创实现 |
| text-variable-scroll | 灵感来自 Linear，原创实现 |
| liquid-glass-tabbar | 灵感来自 iOS 26，原创实现 |
| dither-gradient | 原创 Bayer 抖动着色器 |
| anchor-popover | 原创（CSS anchor + Popover API） |
| css-accordion-auto | 原创（interpolate-size） |

### React Bits 灵感动效

未打开 React Bits 源码。每项均为原创实现，登记为「灵感来自 React Bits，原创实现」。`curved-loop` 复用 `marquee-along-svg-path`。`light-rays` 是从单点射出的体积光锥，和 `light-beams` 的平行细光束不同。`hyperspeed` 是夜路灯轨，按住加速。重 WebGL 通过动态 `import("ogl")` 懒加载。

| 组件 | 来源 |
| --- | --- |
| text-pressure | 灵感来自 React Bits，原创实现 |
| true-focus | 灵感来自 React Bits，原创实现 |
| split-flap-text | 灵感来自 React Bits，原创实现 |
| curved-loop | 灵感来自 React Bits，原创实现 |
| fuzzy-text | 灵感来自 React Bits，原创实现 |
| electric-border | 灵感来自 React Bits，原创实现 |
| sticker-peel | 灵感来自 React Bits，原创实现 |
| click-spark | 灵感来自 React Bits，原创实现 |
| glare-hover | 灵感来自 React Bits，原创实现 |
| card-swap | 灵感来自 React Bits，原创实现 |
| flowing-menu | 灵感来自 React Bits，原创实现 |
| dome-gallery | 灵感来自 React Bits，原创实现 |
| elastic-slider | 灵感来自 React Bits，原创实现 |
| light-rays | 灵感来自 React Bits，原创实现 |
| hyperspeed | 灵感来自 React Bits，原创实现 |

### 原创动效与实用组件

登记在 `catalog-batch14.ts`（`catalog-batch13.ts` 已用于 React Bits 灵感动效）。未打开 Aceternity、Hover.dev、Stripe、Linear、Vercel、Apple、GitHub 的源码。`vortex-background` 是向心辉光漩涡，和 `flow-field` 的开放拖尾不是同一个效果。`simplex-noise` 与 `diff` 按需动态加载。

| 组件 | 来源 |
| --- | --- |
| lens-zoom | 灵感来自 Hover.dev，原创实现 |
| world-map-arcs | 灵感来自 Aceternity，原创实现 |
| vortex-background | 灵感来自 Aceternity，原创实现 |
| beams-collision | 灵感来自 Aceternity，原创实现 |
| placeholder-vanish-input | 灵感来自 Aceternity，原创实现 |
| link-preview | 灵感来自 Hover.dev，原创实现 |
| avatar-group-tooltip | 灵感来自 Hover.dev，原创实现 |
| shuffle-grid-hero | 灵感来自 Aceternity，原创实现 |
| toc-scrollspy | 灵感来自 Stripe，原创实现 |
| sortable-list | 灵感来自 Linear，原创实现 |
| kpi-sparkline-card | 灵感来自 Vercel，原创实现 |
| cookie-consent | 灵感来自 Stripe，原创实现 |
| countdown-timer | 灵感来自 Apple，原创实现 |
| image-cropper | 灵感来自 Apple，原创实现 |
| diff-viewer | 灵感来自 GitHub，原创实现 |

### 滚动透镜与检索组件

登记在 `catalog-batch15.ts`（`catalog-batch14.ts` 已用于上一批原创动效）。未打开 Codrops、Aceternity、Coda、Maze、Linear、Webflow、Retool、Vercel 的源码，未移植其组件。未使用 GSAP。`square-lens-distortion` 懒加载已有的 OGL。`resource-search-hero` 按需加载 `fuse.js`（Apache-2.0）。`macbook-scroll` 是通用笔记本，没有品牌标志。

| 组件 | 来源 |
| --- | --- |
| ghost-trail-text | 灵感来自 Codrops，原创实现 |
| gravity-image-trail | 灵感来自 Codrops，原创实现 |
| square-lens-distortion | 灵感来自 Codrops，原创实现 |
| dual-wave-text-list | 灵感来自 Codrops，原创实现 |
| clip-reveal-menu | 灵感来自 Codrops，原创实现 |
| sticky-grid-scroll | 灵感来自 Codrops，原创实现 |
| svg-mask-scroll-transition | 灵感来自 Codrops，原创实现 |
| macbook-scroll | 灵感来自 Aceternity，原创实现 |
| faceted-filter-bar | 灵感来自 Linear，原创实现 |
| json-viewer | 灵感来自 Retool，原创实现 |
| heatmap-calendar | 灵感来自 GitHub，原创实现 |
| grouped-checklist | 灵感来自 Coda，原创实现 |
| text-generate | 灵感来自 Vercel，原创实现 |
| column-config-panel | 灵感来自 Retool，原创实现 |
| resource-search-hero | 灵感来自 Maze，原创实现 |

### 织物、海面与协作清单

登记在 `catalog-batch16.ts`（`catalog-batch15.ts` 已用于滚动透镜与检索）。未打开 Codrops、Dropbox、Linear、Framer、Figma、Maze、Vanta、Stripe、Claude、BL/S 的源码，未移植其组件。未使用 GSAP，没有新增依赖。WebGL 一律懒加载已有的 OGL，失败或减弱动效时用 CSS 画面。`setup-guide` 的纸屑沿用 `confetti-burst` 的配色，不嵌套其按钮。

| 组件 | 来源 |
| --- | --- |
| datamosh-transition | 灵感来自 Codrops，原创实现 |
| loom-threads-marquee | 灵感来自 Codrops，原创实现 |
| hologram-card | 灵感来自 BL/S，原创实现 |
| sketch-hatch-image | 灵感来自 Codrops，原创实现 |
| scroll-3d-image-rotate | 灵感来自 Codrops，原创实现 |
| thumbnail-flow-path | 灵感来自 Codrops，原创实现 |
| shader-grid-wide | 灵感来自 Codrops，原创实现 |
| sea-waves-background | 灵感来自 Vanta，原创实现 |
| cinema-seat-picker | 灵感来自 Framer，原创实现 |
| publication-filter-list | 灵感来自 Maze，原创实现 |
| activity-feed | 灵感来自 Dropbox，原创实现 |
| project-update-card | 灵感来自 Linear，原创实现 |
| share-invite-panel | 灵感来自 Figma，原创实现 |
| changelog-feed | 灵感来自 Stripe，原创实现 |
| setup-guide | 灵感来自 Claude，原创实现 |

### 星系、布料与协作表单

登记在 `catalog-batch17.ts`（`catalog-batch16.ts` 已用于织物、海面与协作清单）。未打开这些来源的源码，未移植其组件。未使用 GSAP 或 tldraw，没有新增依赖。WebGL 一律懒加载已有的 OGL，失败或减弱动效时用 CSS 画面。`signature-pad` 只用画布，不引入签名库。`reaction-bar` 由帖子和评论共用。Cal.com 为 AGPL，只借鉴交互。

| 组件 | 来源 |
| --- | --- |
| galaxy-spiral | 灵感来自 Codrops Galaxy Configurator，原创实现 |
| proximity-scale-grid | 灵感来自 Codrops Proximity Scale Grid，原创实现 |
| polaroid-scroll-stack | 灵感来自 Codrops Scroll-Driven Polaroid，原创实现 |
| scroll-svg-graph | 灵感来自 Codrops Scroll-Driven SVG Graph，原创实现 |
| cloth-wind-banner | 灵感来自 Codrops Old Cloth with Wind，原创实现 |
| xray-fluid-reveal | 灵感来自 Codrops Skeleton Fluid Reveal，原创实现 |
| petal-dissolve-text | 灵感来自 Codrops Clair Obscur Gommage，原创实现 |
| data-tunnel | 灵感来自 Codrops Data Tunnel，原创实现 |
| file-upload-queue | 灵感来自 Dropbox 与 Google Drive，原创实现 |
| embed-code-generator | 灵感来自 Readymag，原创实现 |
| social-post-feed | 灵感来自 Campsite，原创实现 |
| comment-thread | 灵感来自 GitHub、Linear 与 Figma，原创实现 |
| signature-pad | 灵感来自 DocuSign，原创实现 |
| poll-vote | 灵感来自 X 与 Slack，原创实现 |
| schedule-slot-picker | 灵感来自 Calendly 与 Cal.com，原创实现 |
| reaction-bar | 原创，帖子与评论共用 |

### 整页模板

每个模板是多文件 registry 条目（`page.tsx` + `content.ts` + `theme.ts`），由现有区块组合。文档页提供 `/preview/{name}` 全屏预览；重 WebGL 懒加载，`prefers-reduced-motion` 时不挂载这些模块。

| 组件 | 来源 |
| --- | --- |
| saas-template | 原创（组合 nav-morphing / hero-shader / 落地页区块 / footer-curtain-reveal） |
| ai-product-template | 原创（组合 hero-ai-prompt / iridescence / chat-message / siri-orb / shimmer-text） |
| devtool-template | 原创（组合 terminal / code-block / flickering-grid / timeline / footer-shader-wordmark） |
| portfolio-template | Magic UI portfolio（MIT） |
| agency-template | 灵感来自 Awwwards，原创实现 |

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
| select-plus | 原创 |
| button-plus | 原创 |
| input-plus | 原创 |
| switch-plus | 原创 |
| checkbox-plus | 原创 |
| radio-plus | 原创 |
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
| detent-dial | Kokonut UI（免费 MIT） |

## 新增组件

`date-picker` 和 `typography` 已有独立 registry JSON，和其它组件一样由 `pnpm registry:build` 生成。新增组件时改这些地方，漏了会被 `pnpm test` 的 registry 审计拦住：

1. **源码**放在 `packages/registry/src/ui/`、`effects/`、`sections/`、`templates/`、`lib/` 或 `hooks/`。registry 依赖只用 `@/components/ui/*`、`@/lib/*`、`@/hooks/*`；同目录组件用 `./组件名`。模板的文案和主题用同目录 `./content`、`./theme`，不要写成会被当成 registry 依赖的 `./theme.css`。
2. **catalog** 在 `packages/registry/src/catalog.ts` 或对应的 `catalog-batch*.ts` 登记 `name`、`type`、`file`、`target`、`props`。多文件条目再写 `files`（页面、文案、主题）。
   - `type` 为 `registry:ui`、`registry:lib`、`registry:hook` 或 `registry:block`。hook 的 `target` 在 `hooks/`，例如 `use-mobile` 安装到 `hooks/use-mobile.ts`。模板用 `registry:block`。
   - 不用写 `dependencies` 和 `registryDependencies`：构建时从源码 import 推导（包括 type-only import 和动态 `import()`），按字母排序，忽略 `react`、`react-dom`。上面的别名和同目录相对引用算 registry 依赖。
   - 源码没有 import、但安装时必须一起装的 npm 包（例如 `@tiptap/pm` 作为 peer）写进 `extraDependencies`。
   - 用到的 npm 包还要写进 `packages/registry/package.json` 的 `dependencies`；按惯例同时加到 `apps/docs/package.json`（审计不检查这一项）。
3. **demo**：`registry:ui` 和 `registry:block` 在 `packages/registry/src/examples/` 增加 Demo，并登记到 `examples/index.ts` 的 `demoMap`。`registry:lib` 和 `registry:hook` 不需要 demo 和 Props。模板的文档预览走 `/preview/{name}`。
   - 要在文档页上让读者改 props，把 `control` 写在 catalog 该 prop 上（`range` / `select` / `color` / `boolean` / `text`）。`control.value` 是 demo 起始值，`defaultValue` 仍是组件自己的默认值。Demo 写成带解构默认值的函数，默认值等于 `control.value`，例如 `export function XDemo({ speed = 1.2 }: { speed?: number } = {})`。没有 `control` 的 demo 保持无参函数。全屏页不放控件，直接渲染这个函数的默认值。
4. **README** 组件列表写上独立组件名。
5. 运行 `pnpm registry:build`，更新根目录 `registry.json` 和 `apps/docs/public/r/`。

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
