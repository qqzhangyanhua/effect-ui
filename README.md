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

复选、开关、单选、选择、多行文本、滑块各自收成一个文档入口，已有的增强和动效跟基础组件在同一页里向下滚动查看。路径是 `/docs/checkboxes`、`/docs/switches`、`/docs/radios`、`/docs/selects`、`/docs/textareas`、`/docs/sliders`。

button · input · textarea · label · card · badge · separator · dialog · sheet · dropdown-menu · tabs · tooltip · sonner · switch · checkbox · select · accordion · popover · avatar · slider · alert · alert-dialog · aspect-ratio · breadcrumb · calendar · carousel · chart · collapsible · command · context-menu · drawer · form · hover-card · input-otp · menubar · navigation-menu · pagination · progress · radio-group · resizable · scroll-area · sidebar · skeleton · table · toggle · toggle-group · data-table · field · input-group · button-group · kbd · empty · item · native-select · combobox · date-picker · typography · direction

### Hooks

use-mobile · use-prefers-reduced-motion · use-animation-active

### 库

text-style

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

### 按钮

文档侧栏只有一个「按钮」入口，全部按钮在 `/docs/buttons` 同一页里向下滚动查看。

| 组件 | 来源 |
| --- | --- |
| button | shadcn/ui |
| button-group | shadcn/ui |
| button-plus | 原创 |
| fuse-button | 灵感来自 React Bits，原创实现，未打开源码 |
| hold-button | Kokonut UI（免费 MIT） |
| ripple-button | Animata |
| shimmer-button | Magic UI |
| pulse-button | Magic UI |
| neon-button | 原创 |
| rainbow-button | Magic UI |
| interactive-hover-button | Magic UI |
| gooey-button | 原创 |
| particle-button | Kokonut UI（免费 MIT） |
| tear-button | Kokonut UI（免费 MIT） |

### 输入

文档侧栏只有一个「输入」入口，全部输入在 `/docs/inputs` 同一页里向下滚动查看。

| 组件 | 来源 |
| --- | --- |
| input | shadcn/ui |
| input-group | shadcn/ui |
| input-otp | shadcn/ui |
| input-plus | 原创 |
| floating-label-input | Smooth UI |
| tag-input | Kibo UI |
| phone-input | react-phone-number-input |
| currency-input | 原创 |
| coupon-input | 原创 |
| prompt-input | prompt-kit |
| placeholder-vanish-input | 灵感来自 Aceternity，原创实现 |

### 微交互

| 组件 | 来源 |
| --- | --- |
| squish-switch | 灵感来自 React Bits，原创实现，未打开源码 |
| jelly-radio | 灵感来自 React Bits，原创实现，未打开源码 |
| spring-check | 灵感来自 React Bits，原创实现，未打开源码 |
| peek-rating | 灵感来自 React Bits，原创实现，未打开源码 |
| slide-to-confirm | 灵感来自 React Bits，原创实现，未打开源码 |
| swipe-row | 灵感来自 React Bits，原创实现，未打开源码 |
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

### 管道、沙漏与收件箱

登记在 `catalog-batch18.ts`。未打开 Codrops 源码，未移植其组件。未使用 GSAP 或 tldraw，没有新增依赖。WebGL 懒加载已有的 OGL。减弱动效时烟花不渲染，沙漏改成进度条，图片管道和乐高像素改成静态画面。

| 组件 | 来源 |
| --- | --- |
| image-tube-scroll | 灵感来自 Codrops Scroll-Driven 3D Image Tube，原创实现 |
| depth-fog-gallery | 灵感来自 Codrops Atmospheric Depth Gallery，原创实现 |
| fireworks-show | 灵感来自 Codrops Fireworks 2026，原创实现 |
| wobble-line-cursor | 灵感来自 Codrops Cursor Line Wobble，原创实现 |
| lego-pixelate | 灵感来自 Codrops Lego pixellation，原创实现 |
| telescope-zoom-scroll | 灵感来自 Codrops Telescope Zoom，原创实现 |
| curved-scrollbar | 灵感来自 Codrops Custom curved corner scrollbars，原创实现 |
| particle-hourglass | 灵感来自 Codrops Sands of Time，原创实现 |
| invoice-preview | 原创 |
| shortcuts-dialog | 原创 |
| pricing-calculator | 原创 |
| plan-compare-table | 原创 |
| mention-textarea | 原创 |
| inbox-split-view | 原创 |
| timezone-clock | 原创 |

### 光管、频谱与组织图

登记在 `catalog-batch19.ts`。未打开 Codrops 源码，未移植其组件。未使用 GSAP 或 tldraw，没有新增依赖。WebGL 懒加载已有的 OGL。离开视口时暂停动画帧。减弱动效时光管不渲染，液体幻灯改为交叉淡入，波场和黑洞停在静帧，3D 卡片改为横向滚动，翻页文字直接显示，滚动字母只变色，频谱改为静态条，仪表指针直接到位，卡面不翻转。

| 组件 | 来源 |
| --- | --- |
| tubes-cursor | 灵感来自 Codrops Tubes Cursor，原创实现 |
| liquid-morph-slideshow | 灵感来自 Codrops Liquid Morphology Slideshow，原创实现 |
| wavefield-neon | 灵感来自 Codrops Wavefield Shader，原创实现 |
| gradient-carousel-3d | 灵感来自 Codrops Infinite 3D Gradient Carousel，原创实现 |
| text-3d-scroll | 灵感来自 Codrops 3D Text Scroll Animations，原创实现 |
| rolling-text-hover | 灵感来自 Codrops Rolling text，原创实现 |
| audio-spectrum | 灵感来自 Spotify visualiser，原创实现。实时频谱，和静态 audio-waveform 不同 |
| singularity | 灵感来自 Codrops Singularity，原创实现 |
| credit-card-form | 原创 |
| cart-drawer | 原创 |
| radial-gauge | 原创 |
| gantt-timeline | 原创 |
| org-chart | 原创 |

### 光栅、状态页与帮助中心

登记在 `catalog-batch20.ts`。上一批光管组件已占用 `catalog-batch19.ts`。未打开 Codrops、Linear、Better Stack、Eventbrite、Vercel、ClickUp、Mintlify、fal、v0、Sprig、Supabase、Browserbase 或 Notion 的源码，未移植其组件。未使用 GSAP 或 tldraw，没有新增依赖。WebGL 只懒加载已有的 OGL。离开视口时暂停动画帧。减弱动效时光栅改为点击切换，光束直接显示成品，回声不复制，超空间文字交叉淡入，旋涡改为静态图标，雨面停在静帧，钥匙孔改为普通图片序列，橡皮筋松手后不再振荡。

| 组件 | 来源 |
| --- | --- |
| lenticular-card | 灵感来自 Codrops R3F Lenticular Material，原创实现 |
| card-beam-scanner | 灵感来自 Codrops Card Beam Animation，原创实现 |
| repetition-image-hover | 灵感来自 Codrops Repetition Image Animation，原创实现 |
| hyperspace-text | 灵感来自 Codrops Hyperspace Text，原创实现 |
| tiled-swirl-loader | 灵感来自 Codrops Tiled Swirl，原创实现 |
| rain-puddle | 灵感来自 Codrops Puddle in rain，原创实现 |
| keyhole-scroll-reveal | 灵感来自 Codrops Scroll-Synced Slideshow with Keyhole Effect，原创实现 |
| rubber-band-drag | 灵感来自 Liam Egan Rubber banding，原创实现 |
| uptime-bars | 灵感来自 Linear 状态页与 Better Stack，原创实现 |
| status-page | 灵感来自 Eventbrite 与 Linear 状态页，原创实现 |
| integrations-directory | 灵感来自 Vercel 与 ClickUp，原创实现 |
| api-key-manager | 灵感来自 Mintlify、fal 与 v0，原创实现 |
| usage-meter | 灵感来自 Sprig，原创实现 |
| team-members-table | 灵感来自 Supabase 与 Browserbase，原创实现 |
| help-center-index | 灵感来自 Notion 帮助中心，原创实现 |

### 字符点阵、视频对话框与会话

登记在 `catalog-batch21.ts`。上一批光栅组件已占用 `catalog-batch20.ts`。动效与两个交互组件移植自 Magic UI（MIT，Copyright (c) Magic UI），并改成 effect-ui 的 props 与 Tailwind v4 主题变量。其余五项为原创实现，版式参考 Mobbin 里的产品界面，没有复制文案或标志。未使用 GSAP 或 tldraw，没有新增依赖。离开视口时暂停动画帧。减弱动效时点阵、透视网格和粒子停在静帧，文字立刻显示，视频暂停并露出封面，光标恢复系统样式，斜纹不再漂移。

| 组件 | 来源 |
| --- | --- |
| glyph-matrix | Magic UI，MIT |
| dia-text-reveal | Magic UI，MIT |
| warp-background | Magic UI，MIT |
| backlight | Magic UI，MIT |
| floating-3d-particles | Magic UI，MIT |
| video-text | Magic UI，MIT |
| smooth-cursor | Magic UI，MIT |
| line-shadow-text | Magic UI，MIT |
| hero-video-dialog | Magic UI，MIT |
| animated-subscribe-button | Magic UI，MIT |
| audit-log-table | 灵感来自 Gumloop 与 Base44（经由 Mobbin），原创实现 |
| notification-preferences | 灵感来自 Unify 与 SoundCloud（经由 Mobbin），原创实现 |
| data-export-dialog | 灵感来自 Klaviyo 与 Square（经由 Mobbin），原创实现 |
| two-factor-setup | 灵感来自 Basecamp 与 Dropbox Dash（经由 Mobbin），原创实现 |
| active-sessions-list | 灵感来自 Railway 与 Replit（经由 Mobbin），原创实现 |

### 可变字体、开关与资料卡

登记在 `catalog-batch36.ts`。上一批全息文字已占用 `catalog-batch35.ts`。`variable-font-hover-by-letter`、`letter-swap-pingpong`、`random-letter-swap`、`underline-hover-link`、`element-along-svg-path`、`float` 移植自 Fancy Components（MIT，Copyright (c) 2024 Daniel Petho）。`lodash` 的 debounce 改成组件内手写，`clsx` 改成 `cn`。`check-cross-switch`（作者 misaraadel）、`plus-share-burst`（作者 neerajbaniwal）移植自 Uiverse galaxy（MIT，Copyright (c) 2023 Uiverse.io）。`star-rating`、`account-access-card`、`ai-chat-card`、`login-card`、`transfer-funds-card`、`http-status-lookup`、`github-profile-card` 移植自 Spectrum UI（Apache-2.0，(c) Spectrum UI / arihantcodes）。`use-typewriter` 移植到 `hooks/`。`framer-motion` 已换成 `motion/react`。示例凭据、提示词、社交入口、转账数字和 GitHub 用户放在 demo。资料卡默认不发请求。没有新增依赖。减弱动效时可变字体保持起始字重、字母不交换、下划线不再过渡、路径元素停在起点、漂浮回到原位、开关直接到位、分享菜单直接出现、星星不缩放、账号卡和对话卡直接显示第一组文案、登录卡直接出现、转账按钮不再缩放。

| 组件 | 来源 |
| --- | --- |
| variable-font-hover-by-letter | Fancy Components，MIT，Copyright (c) 2024 Daniel Petho |
| letter-swap-pingpong | Fancy Components，MIT，Copyright (c) 2024 Daniel Petho |
| random-letter-swap | Fancy Components，MIT，Copyright (c) 2024 Daniel Petho |
| underline-hover-link | Fancy Components，MIT，Copyright (c) 2024 Daniel Petho |
| element-along-svg-path | Fancy Components，MIT，Copyright (c) 2024 Daniel Petho |
| float | Fancy Components，MIT，Copyright (c) 2024 Daniel Petho |
| check-cross-switch | Uiverse galaxy，MIT，作者 misaraadel |
| plus-share-burst | Uiverse galaxy，MIT，作者 neerajbaniwal |
| star-rating | Spectrum UI，Apache-2.0，(c) Spectrum UI / arihantcodes |
| account-access-card | Spectrum UI，Apache-2.0，(c) Spectrum UI / arihantcodes |
| ai-chat-card | Spectrum UI，Apache-2.0，(c) Spectrum UI / arihantcodes |
| login-card | Spectrum UI，Apache-2.0，(c) Spectrum UI / arihantcodes |
| transfer-funds-card | Spectrum UI，Apache-2.0，(c) Spectrum UI / arihantcodes |
| http-status-lookup | Spectrum UI，Apache-2.0，(c) Spectrum UI / arihantcodes |
| github-profile-card | Spectrum UI，Apache-2.0，(c) Spectrum UI / arihantcodes |
| use-typewriter | Spectrum UI，Apache-2.0，(c) Spectrum UI / arihantcodes |

### 全息文字、刮刮卡与评分

登记在 `catalog-batch35.ts`。上一批色相波浪已占用 `catalog-batch34.ts`。`hologram-text`、`ink-morph`、`orbital-text`、`scratch-card`、`skeleton-reveal`、`text-states`、`notification-bell`、`async-morph-button`、`face-rating`、`follow-button`、`share-button`、`task-checkbox`、`expandable-action-bar`、`faq-tabs-card`、`nav-list-card` 移植自 Spectrum UI（Apache-2.0，Made by Arihant）。`use-dismiss`、`use-hover-gesture`、`use-tap-gesture` 一并移植到 `hooks/`。`framer-motion` 已换成 `motion/react`，去掉了 `next-themes`。`faq-tabs-card` 的示例文案由 `tabs` 传入，`nav-list-card` 的示例数据在 demo。每个移植文件都标明 Modified。没有新增依赖。减弱动效时全息文字停止闪烁并保持可见、墨迹直接落到终点、轨道字符直接落位、刮刮卡不生成粉尘、骨架不脉冲、状态文字直接替换、铃铛不摆动、异步按钮的加载旋转停止、表情不弹跳、关注按钮不形变、分享菜单只淡入、任务勾选不爆开、动作条标签直接显隐、常见问题直接切换、导航行不再位移。

| 组件 | 来源 |
| --- | --- |
| hologram-text | Spectrum UI，Apache-2.0，Made by Arihant |
| ink-morph | Spectrum UI，Apache-2.0，Made by Arihant |
| orbital-text | Spectrum UI，Apache-2.0，Made by Arihant |
| scratch-card | Spectrum UI，Apache-2.0，Made by Arihant |
| skeleton-reveal | Spectrum UI，Apache-2.0，Made by Arihant |
| text-states | Spectrum UI，Apache-2.0，Made by Arihant |
| notification-bell | Spectrum UI，Apache-2.0，Made by Arihant |
| async-morph-button | Spectrum UI，Apache-2.0，Made by Arihant |
| face-rating | Spectrum UI，Apache-2.0，Made by Arihant |
| follow-button | Spectrum UI，Apache-2.0，Made by Arihant |
| share-button | Spectrum UI，Apache-2.0，Made by Arihant |
| task-checkbox | Spectrum UI，Apache-2.0，Made by Arihant |
| expandable-action-bar | Spectrum UI，Apache-2.0，Made by Arihant |
| faq-tabs-card | Spectrum UI，Apache-2.0，Made by Arihant |
| nav-list-card | Spectrum UI，Apache-2.0，Made by Arihant |
| use-dismiss | Spectrum UI，Apache-2.0，Made by Arihant |
| use-hover-gesture | Spectrum UI，Apache-2.0，Made by Arihant |
| use-tap-gesture | Spectrum UI，Apache-2.0，Made by Arihant |

### 色相波浪、杠杆开关与验证码

登记在 `catalog-batch34.ts`。上一批倾斜卡片已占用 `catalog-batch33.ts`。`hue-wave-loader`、`lift-gradient-border-button`、`lever-switch`、`neon-3d-radio`、`star-ribbon-notification`、`moon-sun-switch`、`glow-light-switch`、`hamburger-morph`、`mic-search-input`、`social-follow-tooltip`、`copy-field`、`newsletter-input`、`pin-display-input` 移植自 Uiverse galaxy（MIT，Copyright (c) 2023 Uiverse.io），同时署文件作者。HTML/CSS 已改成 React 和 Tailwind v4。`neubrutalism-toggle`、`minimal-accordion` 移植自 SyntaxUI（MIT，Copyright (c) 2024 SyntaxUI）。`neubrutalism-toggle` 额外署 Ethan Pollack。`minimal-accordion` 的 `framer-motion` 已换成 `motion/react`。没有新增依赖。减弱动效时色相波浪和绶带停住、渐变按钮不上抬、杠杆与日月与灯光与粗野开关直接到位、单选不旋转、汉堡立刻变成叉、手风琴直接展开、麦克风按钮不过渡、关注提示直接出现、复制状态直接切换、订阅按钮不过渡、验证码格子保持静止。

| 组件 | 来源 |
| --- | --- |
| hue-wave-loader | Uiverse galaxy，MIT，作者 SmookyDev |
| lift-gradient-border-button | Uiverse galaxy，MIT，作者 SelfMadeSystem |
| lever-switch | Uiverse galaxy，MIT，作者 Praashoo7 |
| neon-3d-radio | Uiverse galaxy，MIT，作者 Saiyed-Tanvir |
| star-ribbon-notification | Uiverse galaxy，MIT，作者 andrew-demchenk0 |
| moon-sun-switch | Uiverse galaxy，MIT，作者 satyamchaudharydev |
| glow-light-switch | Uiverse galaxy，MIT，作者 elijahgummer |
| hamburger-morph | Uiverse galaxy，MIT，作者 elijahgummer |
| neubrutalism-toggle | SyntaxUI，MIT，作者 Ethan Pollack |
| minimal-accordion | SyntaxUI，MIT |
| mic-search-input | Uiverse galaxy，MIT，作者 vinodjangid07 |
| social-follow-tooltip | Uiverse galaxy，MIT，作者 vinodjangid07 |
| copy-field | Uiverse galaxy，MIT，作者 omriluz |
| newsletter-input | Uiverse galaxy，MIT，作者 deepak16375 |
| pin-display-input | Uiverse galaxy，MIT，作者 barisdogansutcu |

### 倾斜卡片、图案背景与环形进度

登记在 `catalog-batch33.ts`。上一批注意力按钮已占用 `catalog-batch32.ts`。`grid-tilt-card`、`layered-glass-card`、`eye-blink-loader`、`css-pattern-background`、`heart-like-button`、`download-size-button`、`achievement-toast` 移植自 Uiverse galaxy（MIT，Copyright (c) 2023 Uiverse.io），同时署文件作者。HTML/CSS 已改成 React 和 Tailwind v4，并去掉 Uiverse 标志。`heartbeat-button`、`neubrutalism-button`、`3d-button`、`image-fade`、`expanding-icon-tabs`、`slide-toggle` 移植自 SyntaxUI（MIT，Copyright (c) 2024 SyntaxUI）。`framer-motion` 已换成 `motion/react`，`buttonheartbeat` 关键帧从 `tailwind.config.ts` 迁出。`progress-circle`、`callout` 移植自 Tremor Raw（Apache-2.0，Copyright 2025 Tremor），源文件保留版权声明并注明已修改，`tv` 改成 `cva`。没有新增依赖。减弱动效时倾斜和分层不再动、眼睛和图案停住、心跳不跳、粗野按钮不位移、立体圆不扩散、图片去掉遮罩、弧长直接到位、标签文字直接出现、开关旋钮直接到位、喜欢不心跳、下载切换不过渡、成就条直接展开。

| 组件 | 来源 |
| --- | --- |
| grid-tilt-card | Uiverse galaxy，MIT，作者 kennyotsu |
| layered-glass-card | Uiverse galaxy，MIT，作者 Smit-Prajapati |
| eye-blink-loader | Uiverse galaxy，MIT，作者 mobinkakei |
| css-pattern-background | Uiverse galaxy，MIT，作者 jeremyssocial、elijahgummer、mobinkakei |
| heartbeat-button | SyntaxUI，MIT |
| neubrutalism-button | SyntaxUI，MIT |
| 3d-button | SyntaxUI，MIT |
| image-fade | SyntaxUI，MIT |
| progress-circle | Tremor Raw，Apache-2.0 |
| callout | Tremor Raw，Apache-2.0 |
| expanding-icon-tabs | SyntaxUI，MIT |
| slide-toggle | SyntaxUI，MIT |
| heart-like-button | Uiverse galaxy，MIT，作者 LilaRest |
| download-size-button | Uiverse galaxy，MIT，作者 satyamchaudharydev |
| achievement-toast | Uiverse galaxy，MIT，作者 WittyHydra |

### 注意力按钮、附件气泡与分段条

登记在 `catalog-batch32.ts`。上一批斜切滚动已占用 `catalog-batch31.ts`。八个动效移植自 SyntaxUI（MIT，Copyright (c) 2024 SyntaxUI）。`stitches-button` 在 SyntaxUI 的 credits.md 里归于 Saud。`framer-motion` 已换成 `motion/react`，`hover-spring-features` 用 `<img>` 代替 `next/image`。四个实用组件移植自 ReUI（MIT，Copyright (c) 2025 Keenthemes Inc.）。`category-bar`、`bar-list`、`tab-navigation` 移植自 Tremor Raw（Apache-2.0，Copyright 2025 Tremor），源文件保留版权声明并注明已修改。没有新增依赖。没有使用 Hero Patterns。减弱动效时注意力动画不播放、叶子不摇、完成按钮直接完成、色块和霓虹与涟漪停住、功能卡不上移、追踪标题不闪。

| 组件 | 来源 |
| --- | --- |
| hover-attention-button | SyntaxUI，MIT |
| eco-mode-button | SyntaxUI，MIT |
| rotating-complete-button | SyntaxUI，MIT |
| morphing-shapes-loader | SyntaxUI，MIT |
| neon-glow-loader | SyntaxUI，MIT |
| ripple-wave-loader | SyntaxUI，MIT |
| hover-spring-features | SyntaxUI，MIT |
| stitches-button | SyntaxUI，MIT，原作者 Saud |
| attachment | ReUI，MIT |
| bubble | ReUI，MIT |
| marker | ReUI，MIT |
| trace | ReUI，MIT |
| category-bar | Tremor Raw，Apache-2.0 |
| bar-list | Tremor Raw，Apache-2.0 |
| tab-navigation | Tremor Raw，Apache-2.0 |

### 斜切滚动、星座加载与短视频

登记在 `catalog-batch31.ts`。上一批立方体已占用 `catalog-batch30.ts`。八个动效和 `labeled-toggle` 移植自 SyntaxUI（MIT，Copyright (c) 2024 SyntaxUI），源文件在 https://github.com/SyntaxUI/syntaxui/blob/main/src/showcase/ 。原文件的 `framer-motion` 已换成 `motion/react`。六个实用组件移植自 Kibo UI 的 MIT 仓库 https://github.com/shadcnblocks/kibo （Copyright (c) 2023 — Present shadcnblocks）。没有新增依赖。`mini-calendar` 用已安装的 `@radix-ui/react-slot` 代替 `radix-ui` 伞包。减弱动效时斜切滚动停住、星座和漩涡静止、粒子收成圆点、方块停转、emoji 只弹出一个、跃迁按钮只变色、落字直接显示、状态点不闪、故事卡片不缩放、短视频不自动播放、开关旋钮直接到位。

| 组件 | 来源 |
| --- | --- |
| skewed-infinite-scroll | SyntaxUI，MIT |
| constellation-loader | SyntaxUI，MIT |
| particle-swarm-loader | SyntaxUI，MIT |
| spinning-cube-loader | SyntaxUI，MIT |
| whirlpool-loader | SyntaxUI，MIT |
| emoji-confetti | SyntaxUI，MIT |
| star-wars-button | SyntaxUI，MIT |
| text-drop | SyntaxUI，MIT |
| labeled-toggle | SyntaxUI，MIT |
| snippet | Kibo UI，MIT |
| status | Kibo UI，MIT |
| stories | Kibo UI，MIT |
| mini-calendar | Kibo UI，MIT |
| reel | Kibo UI，MIT |
| cursor | Kibo UI，MIT |

### 立方体、粘连滤镜与堆叠对话框

登记在 `catalog-batch30.ts`。上一批像素拖尾已占用 `catalog-batch29.ts`。八个动效移植自 Fancy Components（MIT，Copyright (c) 2024 Daniel Petho），源文件在 https://github.com/danielpetho/fancy/blob/main/src/fancy/components/ 。`use-debounced-dimensions` 来自同一仓库的 `src/hooks`。`parallax-floating` 复用已有的 `use-mouse-position-ref`。七个实用组件移植自 Kibo UI 的 MIT 仓库 https://github.com/shadcnblocks/kibo （Copyright (c) 2023 — Present shadcnblocks），不是 shadcnblocks 的付费区块。没有新增依赖。`dialog-stack` 用 `createPortal` 代替 `radix-ui` 伞包。减弱动效时盒子直接转向、拖拽没有惯性、滚动字保持静态、下划线立刻铺开、指针漂浮停住、像素化和粘连演示不再动画、渐变色块静止、状态点不闪、堆叠对话框不做过渡。

| 组件 | 来源 |
| --- | --- |
| css-box | Fancy Components，MIT |
| drag-elements | Fancy Components，MIT |
| scroll-and-swap-text | Fancy Components，MIT |
| underline-to-background | Fancy Components，MIT |
| parallax-floating | Fancy Components，MIT |
| pixelate-svg-filter | Fancy Components，MIT |
| gooey-svg-filter | Fancy Components，MIT |
| animated-gradient-with-svg | Fancy Components，MIT |
| announcement | Kibo UI，MIT |
| banner | Kibo UI，MIT |
| pill | Kibo UI，MIT |
| relative-time | Kibo UI，MIT |
| ticker | Kibo UI，MIT |
| dialog-stack | Kibo UI，MIT |
| choicebox | Kibo UI，MIT |
| use-debounced-dimensions | Fancy Components，MIT |

### 像素拖尾、弹性线与高亮

登记在 `catalog-batch29.ts`。上一批透视字已占用 `catalog-batch28.ts`。九个动效移植自 Fancy Components（MIT，Copyright (c) 2024 Daniel Petho），源文件在 https://github.com/danielpetho/fancy/blob/main/src/fancy/components/ 。配套 hook `use-dimensions`、`use-mouse-position`、`use-mouse-position-ref`、`use-elastic-line-events` 来自同一仓库的 `src/hooks`。六个实用组件移植自 shadcn-ui-expansions（MIT，Copyright (c) 2024 shadcnui-expansions），源文件在 https://github.com/hsuanyi-chou/shadcn-ui-expansions/blob/main/components/ui/ 。没有新增依赖。`pixel-trail` 用 `useId` 代替 `uuid`。`heading-with-anchor` 用 `<a>` 代替 `next/link`。`responsive-modal` 继续使用仓库里已有的 `tw-animate-css`。离开视口后暂停屏保、弹性线和靠近指针的插值。减弱动效时不留拖尾、屏保停在起点、字母不翻转、裁切文字直接显示、荧光笔直接铺满、加载图标不旋转。

| 组件 | 来源 |
| --- | --- |
| pixel-trail | Fancy Components，MIT |
| screensaver | Fancy Components，MIT |
| media-between-text | Fancy Components，MIT |
| letter-3d-swap | Fancy Components，MIT |
| vertical-cut-reveal | Fancy Components，MIT |
| text-cursor-proximity | Fancy Components，MIT |
| elastic-line | Fancy Components，MIT |
| breathing-text | Fancy Components，MIT |
| text-highlighter | Fancy Components，MIT |
| autosize-textarea | shadcn-ui-expansions，MIT |
| loading-button | shadcn-ui-expansions，MIT |
| progress-with-value | shadcn-ui-expansions，MIT |
| dual-range-slider | shadcn-ui-expansions，MIT |
| heading-with-anchor | shadcn-ui-expansions，MIT |
| responsive-modal | shadcn-ui-expansions，MIT |
| use-dimensions | Fancy Components，MIT |
| use-mouse-position | Fancy Components，MIT |
| use-mouse-position-ref | Fancy Components，MIT |
| use-elastic-line-events | Fancy Components，MIT |

### 透视字、棱镜与水花

登记在 `catalog-batch28.ts`。上一批色波、点阵与置顶已占用 `catalog-batch27.ts`。十四项移植自 SmoothUI（MIT，Copyright (c) 2024 Eduardo Calvo），源文件在 https://github.com/educlopez/smoothui/blob/main/packages/smoothui/components/ 。`splash-mask` 移植自 UI Layouts（MIT，Copyright (c) 2024 UI LAYOUT），源文件 https://github.com/ui-layouts/uilayouts/blob/main/apps/ui-layout/registry/components/clip-path/clip-path-water-splash.tsx 。没有新增依赖。`prism-sweep-transition` 与 `orb` 保留原来的着色器，绘制用已经在仓库里的 `ogl`。离开视口后停止绘制、变形、数字滚动和自动播放。减弱动效时透视字改成普通段落，棱镜直接换内容，球体停在相位 0，星标数字直接跳到终值。没有传入 `apiEndpoint` 时，星标组件不请求网络。

| 组件 | 来源 |
| --- | --- |
| perspective-text-3d | SmoothUI，MIT |
| scroll-image-reveal | SmoothUI，MIT |
| svg-clip-mask | SmoothUI，MIT |
| depth-parallax-words | SmoothUI，MIT |
| prism-sweep-transition | SmoothUI，MIT |
| orb | SmoothUI，MIT |
| splash-mask | UI Layouts，MIT |
| morph-icon | SmoothUI，MIT |
| hover-expand | SmoothUI，MIT |
| inline-testimonials | SmoothUI，MIT |
| count-badge | SmoothUI，MIT |
| social-selector | SmoothUI，MIT |
| github-stars-animation | SmoothUI，MIT |
| expandable-navbar | SmoothUI，MIT |
| reviews-carousel | SmoothUI，MIT |

### 色波、点阵与置顶

登记在 `catalog-batch27.ts`。上一批极光、液态金属与时长已占用 `catalog-batch26.ts`。`novatrix-background` 移植自 Eldora UI（MIT，Copyright Mudunuri Bhaskara Karthikeya Varma），源文件 https://github.com/karthikmudunuri/eldoraui/blob/main/apps/www/registry/eldoraui/novatrix-background.tsx 。其余十四项移植自 SmoothUI（MIT，Copyright (c) 2024 Eduardo Calvo），源文件在 https://github.com/educlopez/smoothui/blob/main/packages/smoothui/components/ 。没有新增依赖。`novatrix-background` 保留原来的着色器，绘制用已经在仓库里的 `ogl`。离开视口后停止动画帧、衰减、自动旋转和扫描倒计时。减弱动效时色波停住，手绘不挂画布，色差过渡直接换内容，点阵直接显示，滚动字停在峰值字重。

| 组件 | 来源 |
| --- | --- |
| novatrix-background | Eldora UI，MIT |
| drawing-cursor | SmoothUI，MIT |
| emboss-surface | SmoothUI，MIT |
| chroma-blur-transition | SmoothUI，MIT |
| arcade-pixel | SmoothUI，MIT |
| kinetic-type-scroll | SmoothUI，MIT |
| orbital-image-wheel | SmoothUI，MIT |
| dither-chart | SmoothUI，MIT |
| card-swipe-deck | SmoothUI，MIT |
| pinned-list | SmoothUI，MIT |
| grid-loader | SmoothUI，MIT |
| squircle | SmoothUI，MIT |
| vector-editor-toolbar | SmoothUI，MIT |
| unlock-face-id | SmoothUI，MIT |
| music-toggle | SmoothUI，MIT |

### 极光、液态金属与时长

登记在 `catalog-batch26.ts`。上一批收据、液面与裁切已占用 `catalog-batch25.ts`。十五项都移植自 SmoothUI（MIT，Copyright (c) 2024 Eduardo Calvo），源文件在 https://github.com/educlopez/smoothui/blob/main/packages/smoothui/components/ 。没有新增依赖。`aurora-curtain`、`liquid-metal`、`sdf-blob-transition` 保留原来的着色器，绘制改用已经在仓库里的 `ogl`。离开视口后停止动画帧和指示灯。减弱动效时极光、星场和液态金属停住，SDF 过渡直接换内容，环境光只取一帧，勒索信不再晃动，时长数字不再滚动。

| 组件 | 来源 |
| --- | --- |
| aurora-curtain | SmoothUI，MIT |
| gravity-stars | SmoothUI，MIT |
| magnetic-field | SmoothUI，MIT |
| ransom-note | SmoothUI，MIT |
| liquid-metal | SmoothUI，MIT |
| sdf-blob-transition | SmoothUI，MIT |
| video-ambient | SmoothUI，MIT |
| pixel-brush-canvas | SmoothUI，MIT |
| duration-picker | SmoothUI，MIT |
| exposure-slider | SmoothUI，MIT |
| scrubber | SmoothUI，MIT |
| breakpoint-indicator | SmoothUI，MIT |
| switchboard-card | SmoothUI，MIT |
| time-machine-stack | SmoothUI，MIT |
| interactive-image-selector | SmoothUI，MIT |

### 收据、液面与裁切

登记在 `catalog-batch25.ts`。上一批地形、摇篮字与转录已占用 `catalog-batch24.ts`。十五项都移植自 kokonutUI（MIT，Copyright (c) 2025 kokonutUI），源文件在 https://github.com/kokonut-labs/kokonutui/blob/main/components/kokonutui/ 。没有新增依赖。`clip-trimmer` 用 `<img>` 替换 `next/image`。离开视口后停止动画帧、逐词计时和汇款步骤。减弱动效时液面和支出环直接落到目标，点阵静止，加载短句不再波动，录音音柱停住，头像不再眨眼，时区表盘不再滑动，裁切播放头直接跳到选区起点。

| 组件 | 来源 |
| --- | --- |
| receipt-printer | kokonutUI，MIT |
| liquid-gauge | kokonutUI，MIT |
| liquid-slider | kokonutUI，MIT |
| attract-button | kokonutUI，MIT |
| dot-field | kokonutUI，MIT |
| ai-text-loading | kokonutUI，MIT |
| ai-voice | kokonutUI，MIT |
| avatar-picker | kokonutUI，MIT |
| spending-ring | kokonutUI，MIT |
| ai-citations | kokonutUI，MIT |
| ai-token-alternatives | kokonutUI，MIT |
| ai-branches | kokonutUI，MIT |
| timezone-planner | kokonutUI，MIT |
| currency-transfer | kokonutUI，MIT |
| clip-trimmer | kokonutUI，MIT |

### 地形、摇篮字与转录

登记在 `catalog-batch24.ts`。上一批鸟群、流星与投票已占用 `catalog-batch23.ts`。十五项都移植自 kokonutUI（MIT，Copyright (c) 2025 kokonutUI），源文件在 https://github.com/kokonut-labs/kokonutui/blob/main/components/kokonutui/ 。没有新增依赖。`focal-point-picker` 用 `<img>` 替换 `next/image`。离开视口或切到后台时停止动画帧。减弱动效时地形、布帘、等高线、挤出字和形状堆停住，摇篮字和拨弦不再被带动，拉绳松手后直接回位，滚轮立刻停在一格，撤销倒计时的过渡被拿掉，转录滚动不再平滑。拉绳可以用键盘聚焦开关。

| 组件 | 来源 |
| --- | --- |
| activity-terrain | kokonutUI，MIT |
| cradle-text | kokonutUI，MIT |
| drape-background | kokonutUI，MIT |
| plucked-text | kokonutUI，MIT |
| swoosh-text | kokonutUI，MIT |
| topo-background | kokonutUI，MIT |
| shape-hero | kokonutUI，MIT |
| pull-cord | kokonutUI，MIT |
| ai-context-meter | kokonutUI，MIT |
| ai-tool-approval | kokonutUI，MIT |
| marking-menu | kokonutUI，MIT |
| wheel-picker | kokonutUI，MIT |
| undo-button | kokonutUI，MIT |
| focal-point-picker | kokonutUI，MIT |
| synced-transcript | kokonutUI，MIT |

### 鸟群、流星与投票

登记在 `catalog-batch23.ts`。上一批漫画字已占用 `catalog-batch22.ts`。`boids-ecosystem`、`shooting-stars`、`fibonacci-lines`、`aperture-reveal`、`text-explode`、`speed-dial`、`flower-menu`、`sibling-focus-nav` 移植自 Animata（MIT，Copyright (c) Animata）。`distorted-glass`、`merging-bubbles`、`svg-bands`、`popover-form`、`floating-panel`、`copy-button`、`feature-voting` 移植自 Cult UI（MIT，Copyright (c) 2023 Jordan-Gilliam）。`use-controllable-state` 是原创钩子，给投票列表做受控状态，没有加入 `@radix-ui/react-use-controllable-state`。未使用 GSAP 或 tldraw，没有新增依赖。离开视口时停止动画帧和循环。减弱动效时鸟群和流星静止，斐波那契线同时出现，光圈按阅读顺序排开，文字不炸开，气泡和色带不动，速度旋钮和花朵菜单直接打开，导航只变暗，表单和面板改为淡入，复制图标直接切换，投票列表不播放重排。

| 组件 | 来源 |
| --- | --- |
| use-controllable-state | 原创 |
| boids-ecosystem | Animata，MIT |
| shooting-stars | Animata，MIT |
| fibonacci-lines | Animata，MIT |
| aperture-reveal | Animata，MIT |
| text-explode | Animata，MIT |
| distorted-glass | Cult UI，MIT |
| merging-bubbles | Cult UI，MIT |
| svg-bands | Cult UI，MIT |
| speed-dial | Animata，MIT |
| flower-menu | Animata，MIT |
| sibling-focus-nav | Animata，MIT |
| popover-form | Cult UI，MIT |
| floating-panel | Cult UI，MIT |
| copy-button | Cult UI，MIT |
| feature-voting | Cult UI，MIT |

### 漫画字、霓虹边框与反馈

登记在 `catalog-batch22.ts`。上一批字符点阵已占用 `catalog-batch21.ts`。`comic-text`、`neon-gradient-card`、`cool-mode`、`pixel-image`、`geo-patterns` 移植自 Magic UI（MIT，Copyright (c) Magic UI）。`border-trail`、`glow-effect`、`text-shimmer-wave`、`morphing-popover`、`toolbar-dynamic`、`toolbar-expandable`、`transition-panel`、`animated-background`、`disclosure` 移植自 Motion Primitives（MIT，Copyright (c) 2024 ibelick，Julien Thibeaut）。`use-click-outside` 与 `use-measure` 是原创钩子，后者用 ResizeObserver 测量尺寸。`feedback-widget` 灵感来自常见 SaaS 反馈组件，原创实现。未使用 GSAP 或 tldraw，没有新增依赖。离开视口时停止动画帧。减弱动效时漫画字不弹跳，霓虹和辉光静止，粒子不出现，像素图直接上色，边框圆点停住，文字只变色，弹层改为淡入，工具栏宽度和高度立即切换，高亮直接跳转，折叠立即展开。

| 组件 | 来源 |
| --- | --- |
| use-click-outside | 原创 |
| use-measure | 原创 |
| comic-text | Magic UI，MIT |
| neon-gradient-card | Magic UI，MIT |
| cool-mode | Magic UI，MIT |
| pixel-image | Magic UI，MIT |
| geo-patterns | Magic UI，MIT |
| border-trail | Motion Primitives，MIT |
| glow-effect | Motion Primitives，MIT |
| text-shimmer-wave | Motion Primitives，MIT |
| morphing-popover | Motion Primitives，MIT |
| toolbar-dynamic | Motion Primitives，MIT |
| toolbar-expandable | Motion Primitives，MIT |
| transition-panel | Motion Primitives，MIT |
| animated-background | Motion Primitives，MIT |
| disclosure | Motion Primitives，MIT |
| feedback-widget | 灵感来自常见 SaaS 反馈组件，原创实现 |

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

`prompt-input` 在上方「输入」。

| 组件 | 来源 |
| --- | --- |
| chat-message | prompt-kit |
| siri-orb | Smooth UI |

### 实用组件

| 组件 | 来源 |
| --- | --- |
| dropzone | Kibo UI |
| select-plus | 原创 |
| switch-plus | 原创 |
| checkbox-plus | 原创 |
| radio-plus | 原创 |
| multi-select | sersavan / Kibo UI |
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
| password-strength | 原创 |
| quantity-stepper | 原创 |
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
4. **README** 组件列表写上独立组件名。名字是 `button`、`button-*`、`*-button`、`input`、`input-*` 或 `*-input` 的，写进 README 的「按钮」或「输入」表，并加到 `packages/registry/src/catalog.ts` 里对应分组。漏了分组，测试会失败。
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
