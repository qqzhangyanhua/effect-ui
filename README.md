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

use-mobile · use-prefers-reduced-motion · use-animation-active · use-click-outside · use-measure · use-controllable-state · use-dimensions · use-mouse-position · use-mouse-position-ref · use-elastic-line-events · use-debounced-dimensions · use-dismiss · use-hover-gesture · use-tap-gesture

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
| animated-subscribe-button | Magic UI |
| copy-button | Cult UI |
| pull-cord | Kokonut UI（免费 MIT） |
| undo-button | Kokonut UI（免费 MIT） |
| attract-button | Kokonut UI（免费 MIT） |
| loading-button | shadcn-ui-expansions |
| star-wars-button | SyntaxUI |
| hover-attention-button | SyntaxUI |
| eco-mode-button | SyntaxUI |
| rotating-complete-button | SyntaxUI |
| stitches-button | SyntaxUI（原作者 Saud） |
| heartbeat-button | SyntaxUI |
| neubrutalism-button | SyntaxUI |
| 3d-button | SyntaxUI |
| heart-like-button | Uiverse galaxy（作者 LilaRest） |
| download-size-button | Uiverse galaxy（作者 satyamchaudharydev） |
| lift-gradient-border-button | Uiverse galaxy（作者 SelfMadeSystem） |
| async-morph-button | Spectrum UI（Apache-2.0） |
| follow-button | Spectrum UI（Apache-2.0） |
| share-button | Spectrum UI（Apache-2.0） |
| jelly-button | 原创 |

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
| mic-search-input | Uiverse galaxy（作者 vinodjangid07） |
| newsletter-input | Uiverse galaxy（作者 deepak16375） |
| pin-display-input | Uiverse galaxy（作者 barisdogansutcu） |
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
| elastic-slider | 灵感来自 React Bits，原创实现 |
| reaction-bar | 原创 |
| reaction-tray | 原创 |

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

登记在 `catalog-batch17.ts`（`catalog-batch16.ts` 已用于织物、海面与协作清单）。未打开这些来源的源码，未移植其组件。未使用 GSAP 或 tldraw，没有新增依赖。WebGL 一律懒加载已有的 OGL，失败或减弱动效时用 CSS 画面。`signature-pad` 只用画布，不引入签名库。

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
| signature-pad | 灵感来自 DocuSign，原创实现 |
| poll-vote | 灵感来自 X 与 Slack，原创实现 |
| reaction-bar | 原创 |

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
| timezone-clock | 原创 |

### 光管、频谱与组织图

登记在 `catalog-batch19.ts`。未打开 Codrops 源码，未移植其组件。未使用 GSAP 或 tldraw，没有新增依赖。WebGL 懒加载已有的 OGL。离开视口时暂停动画帧。减弱动效时光管不渲染，液体幻灯改为交叉淡入，波场和黑洞停在静帧，3D 卡片改为横向滚动，翻页文字直接显示，滚动字母只变色，频谱改为静态条，卡面不翻转。

| 组件 | 来源 |
| --- | --- |
| tubes-cursor | 灵感来自 Codrops Tubes Cursor，原创实现 |
| liquid-morph-slideshow | 灵感来自 Codrops Liquid Morphology Slideshow，原创实现 |
| wavefield-neon | 灵感来自 Codrops Wavefield Shader，原创实现 |
| gradient-carousel-3d | 灵感来自 Codrops Infinite 3D Gradient Carousel，原创实现 |
| text-3d-scroll | 灵感来自 Codrops 3D Text Scroll Animations，原创实现 |
| rolling-text-hover | 灵感来自 Codrops Rolling text，原创实现 |
| audio-spectrum | 灵感来自 Spotify visualiser，原创实现。实时频谱 |
| singularity | 灵感来自 Codrops Singularity，原创实现 |
| credit-card-form | 原创 |
| gantt-timeline | 原创 |
| org-chart | 原创 |

### 光栅、状态页与帮助中心

登记在 `catalog-batch20.ts`。上一批光管组件已占用 `catalog-batch19.ts`。未打开 Codrops、Linear、Better Stack、Eventbrite、Vercel、ClickUp、Mintlify、fal、v0 或 Notion 的源码，未移植其组件。未使用 GSAP 或 tldraw，没有新增依赖。WebGL 只懒加载已有的 OGL。离开视口时暂停动画帧。减弱动效时光栅改为点击切换，光束直接显示成品，回声不复制，超空间文字交叉淡入，旋涡改为静态图标，雨面停在静帧，钥匙孔改为普通图片序列，橡皮筋松手后不再振荡。

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
| help-center-index | 灵感来自 Notion 帮助中心，原创实现 |

### 字符点阵、视频对话框与会话

登记在 `catalog-batch21.ts`。上一批光栅组件已占用 `catalog-batch20.ts`。动效与两个交互组件移植自 Magic UI（MIT，Copyright (c) Magic UI），并改成 effect-ui 的 props 与 Tailwind v4 主题变量。其余一项为原创实现，版式参考 Mobbin 里的产品界面，没有复制文案或标志。未使用 GSAP 或 tldraw，没有新增依赖。离开视口时暂停动画帧。减弱动效时点阵、透视网格和粒子停在静帧，文字立刻显示，视频暂停并露出封面，光标恢复系统样式，斜纹不再漂移。

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
| active-sessions-list | 灵感来自 Railway 与 Replit（经由 Mobbin），原创实现 |

### 扭转入场与指针眩光

登记在 `catalog-batch62.ts`。图标动作、波载与剪切已占用 `catalog-batch61.ts`。六项全部原创，运动参考 Mobbin 上的产品卡片，没有复制代码或素材，也没有移植头。`twist-in-card` 是单卡的缩放、绕 Z 轴旋转和下移一起到位。`stagger-card-grid` 是二维卡片网格，按行和列错开，不是 `stagger-list` 的纵向列表。`hover-lift-glow` 在可调抬起之外有主题色光环，粗指针改为按下缩放，和 `hover-lift`、`glow-hover` 不是同一个组件。`flip-reveal-card` 用点击和键盘翻转，不是 `flip-card` 的悬停翻转。`hover-overlay-reveal` 在媒体上压暗并浮出行动按钮，触屏第一次点开遮罩，第二次跟随链接或收起。`pointer-tilt-glare` 在倾斜上加跟随指针的眩光，粗指针和减弱动效关掉倾斜和眩光，和 `tilt`、`glare-hover` 不是同一个组件。没有新增依赖，没有使用 GSAP、tldraw 或 WebGL。减弱动效停在终态。入场只在进入视口后播放，离开视口时暂停。

| 组件 | 来源 |
| --- | --- |
| twist-in-card | 原创，灵感来自 Mobbin |
| stagger-card-grid | 原创，灵感来自 Mobbin |
| hover-lift-glow | 原创，灵感来自 Mobbin |
| flip-reveal-card | 原创，灵感来自 Mobbin |
| hover-overlay-reveal | 原创，灵感来自 Mobbin |
| pointer-tilt-glare | 原创，灵感来自 Mobbin |

### 图标动作、波载与剪切

登记在 `catalog-batch61.ts`。细线、卷轴与购买已占用 `catalog-batch60.ts`。`icon-moves`、`list-cut`、`load-cut`、`state-cut` 移植自 Keyframery（MIT，Copyright (c) 2026 Briyan Hingrajiya），提交 `9ab2430`。`wave-physics-loader`、`use-web-haptics` 移植自 Amicro（MIT，Copyright (c) 2026 SYED SUBHAN UDDIN），提交 `dc2a183`。`load-cut` 保留：它是等待、骨架、溶解三态，和已有的 `skeleton-reveal` 脉冲模糊交叉淡化不是同一个组件。Keyframery 的辅助函数只把用到的部分内联进各自组件，没有新的共享库，也没有 `data-kf` 总开关。`icon-moves` 的监听挂在组件根上。列表新项从下方升起，没有接入按压引擎。`use-web-haptics` 在没有 `navigator.vibrate` 时返回 false，不读 localStorage，也不合成音效。`framer-motion` 改为 `motion/react`。颜色改成主题变量。减弱动效用共享的 `usePrefersReducedMotion`，离开视口用 `useAnimationActive`。没有新增依赖，没有使用 GSAP、tldraw 或 WebGL。减弱动效停在终态。离开视口时连续动画暂停，回到视口再继续。

| 组件 | 来源 |
| --- | --- |
| icon-moves | Keyframery，MIT |
| wave-physics-loader | Amicro，MIT |
| list-cut | Keyframery，MIT |
| load-cut | Keyframery，MIT |
| state-cut | Keyframery，MIT |
| use-web-haptics | Amicro，MIT |

### 细线、卷轴与购买

登记在 `catalog-batch60.ts`。奖状、日记与补全已占用 `catalog-batch59.ts`。`wavy-threads-background`、`rolling-letters-animation`、`arc-cards`、`tilt-image-carousel`、`section-navigator` 移植自 MosaicUI（MIT，Copyright (c) 2026 Darshan Sunil Rajadhyaksha），提交 `2baca92`。`hover-glide-cards`、`progress-ring-check`、`cursor-edge-glow-button`、`secure-purchase-button`、`blur-glide-menu`、`spotlight-indicator`、`preview-hover-toolbar` 移植自 MicroKit（MIT，Copyright (c) 2026 Henrique Barone），提交 `fd993e8`。`waving-dots-background` 和已有的 `dot-field` 重合，没有移植。`section-navigator` 的列表跟在触发器旁边，没有使用传送门。远程图片改成主题色面板。颜色改成主题变量。悬停项同时响应按下和聚焦。减弱动效用共享的 `usePrefersReducedMotion`，离开视口用 `useAnimationActive`。没有新增依赖，没有使用 GSAP、tldraw 或 WebGL。减弱动效停在终态。离开视口时连续动画暂停，回到视口再继续。

| 组件 | 来源 |
| --- | --- |
| wavy-threads-background | MosaicUI，MIT |
| rolling-letters-animation | MosaicUI，MIT |
| arc-cards | MosaicUI，MIT |
| tilt-image-carousel | MosaicUI，MIT |
| hover-glide-cards | MicroKit，MIT |
| progress-ring-check | MicroKit，MIT |
| cursor-edge-glow-button | MicroKit，MIT |
| secure-purchase-button | MicroKit，MIT |
| blur-glide-menu | MicroKit，MIT |
| spotlight-indicator | MicroKit，MIT |
| section-navigator | MosaicUI，MIT |
| preview-hover-toolbar | MicroKit，MIT |

### 奖状、日记与补全

登记在 `catalog-batch59.ts`。折页、液团与徽章已占用 `catalog-batch58.ts`。`inline-action`、`emoji-spree-choice-chips`、`award`、`journal-navigation`、`tooltip-navbar`、`carousel-navigator`、`labeled-progress-indicator`、`frequency-selector`、`status-picker`、`quick-paste`、`contextual-ai-bar`、`predictive-text`、`feature-tour`、`budget-card` 移植自 Watermelon UI（MIT，Copyright (c) 2025-present Watermelon Contributors），提交 `86052b8`。竖向提示条并进 `tooltip-navbar` 的 `direction`。`gauge` 的接口和配色与 Animate UI 的仪表盘重合，没有移植。液态按钮、涟漪按钮、图标按钮和径向开场同样没有移植。远程图片改成主题色占位，没有请求 `assets.watermelon.sh`。颜色改成主题变量。减弱动效用共享的 `usePrefersReducedMotion`，离开视口用 `useAnimationActive`。没有新增依赖，没有使用 GSAP、tldraw 或 WebGL。减弱动效停在终态。离开视口时连续动画暂停，回到视口再继续。

| 组件 | 来源 |
| --- | --- |
| inline-action | Watermelon UI，MIT |
| emoji-spree-choice-chips | Watermelon UI，MIT |
| award | Watermelon UI，MIT |
| journal-navigation | Watermelon UI，MIT |
| tooltip-navbar | Watermelon UI，MIT |
| carousel-navigator | Watermelon UI，MIT |
| labeled-progress-indicator | Watermelon UI，MIT |
| frequency-selector | Watermelon UI，MIT |
| status-picker | Watermelon UI，MIT |
| quick-paste | Watermelon UI，MIT |
| contextual-ai-bar | Watermelon UI，MIT |
| predictive-text | Watermelon UI，MIT |
| feature-tour | Watermelon UI，MIT |
| budget-card | Watermelon UI，MIT |

### 折页、液团与徽章

登记在 `catalog-batch58.ts`。火漆、货车与案头已占用 `catalog-batch57.ts`。`progress-fold-button`、`magic-tab`、`magic-input`、`blueprint-grid`、`liquid-metaballs`、`spin-viewer`、`progressive-card-reveal`、`inertia-gallery`、`agent-timeline`、`agent-flow`、`comment-pin`、`presence-facepile`、`stack-badge`、`store-badge` 移植自 GodUI（MIT，Copyright (c) 2026 Lucas Bassetti），提交 `1f632a7`。`framer-motion` 改成 `motion/react`。减弱动效用共享的 `usePrefersReducedMotion`，离开视口用 `useAnimationActive`。主题色改成主题变量。弹簧参数写在组件里。图标用 `lucide-react`。评论钉和头像墙各自内联了姓名哈希，没有新建 presence 模块。旋转查看器的示例帧是内联 SVG，没有图片文件。商店徽章去掉了二维码，没有加入 `uqr`。液团位置按序号播种。没有新增依赖，没有使用 GSAP、tldraw 或 WebGL。减弱动效停在终态。离开视口时连续动画暂停，回到视口再继续。

| 组件 | 来源 |
| --- | --- |
| progress-fold-button | GodUI，MIT |
| magic-tab | GodUI，MIT |
| magic-input | GodUI，MIT |
| blueprint-grid | GodUI，MIT |
| liquid-metaballs | GodUI，MIT |
| spin-viewer | GodUI，MIT |
| progressive-card-reveal | GodUI，MIT |
| inertia-gallery | GodUI，MIT |
| agent-timeline | GodUI，MIT |
| agent-flow | GodUI，MIT |
| comment-pin | GodUI，MIT |
| presence-facepile | GodUI，MIT |
| stack-badge | GodUI，MIT |
| store-badge | GodUI，MIT |

### 火漆、货车与案头

登记在 `catalog-batch57.ts`。车道、铜版与胶片已占用 `catalog-batch56.ts`。`wax-seal-button`、`dispatch-truck-button`、`googly-gaze-button`、`weather-vane-toggle`、`ink-bleed-text`、`charm-text`、`book-spine-shelf`、`cook-loading`、`usage-quota-meter`、`inset-settings-list`、`compass-rail`、`availability-badge`、`smart-widget-stack`、`goal-progress-card`、`mini-desktop-os` 移植自 Framekit UI（MIT，Copyright (c) 2026 Framekit UI contributors）。`@/lib/cn` 改成 `cn`。`@/lib/use-reduced-motion` 改成共享的 `usePrefersReducedMotion`。`@/lib/use-resolved-theme` 改成主题变量。`@/lib/roving`、`toggle`、`widget-kit`、`portfolio-art` 需要的部分写在组件里。货车保留源码的阶段顺序：拉路、装货、等待下单、开走；失败不自动复位。厨师等待态没有嵌入约 322KB 的精灵图，改用主题色 SVG，暂停只冻住手臂和蒸汽，不改进度。书架是选书，和 `drill-down-spines` 不同。没有新增依赖，没有使用 GSAP、tldraw 或 WebGL。减弱动效停在终态。离开视口时连续动画暂停，回到视口再继续。

| 组件 | 来源 |
| --- | --- |
| wax-seal-button | Framekit UI，MIT |
| dispatch-truck-button | Framekit UI，MIT |
| googly-gaze-button | Framekit UI，MIT |
| weather-vane-toggle | Framekit UI，MIT |
| ink-bleed-text | Framekit UI，MIT |
| charm-text | Framekit UI，MIT |
| book-spine-shelf | Framekit UI，MIT |
| cook-loading | Framekit UI，MIT |
| usage-quota-meter | Framekit UI，MIT |
| inset-settings-list | Framekit UI，MIT |
| compass-rail | Framekit UI，MIT |
| availability-badge | Framekit UI，MIT |
| smart-widget-stack | Framekit UI，MIT |
| goal-progress-card | Framekit UI，MIT |
| mini-desktop-os | Framekit UI，MIT |

### 车道、铜版与胶片

登记在 `catalog-batch56.ts`。键入爆炸已占用 `catalog-batch55.ts`。`queue-pulse-lanes`、`event-propagation-matrix`、`copperplate-hatch`、`core-strata`、`kinetic-emphasis`、`liquid-fill-headline`、`velocity-skew-feed`、`filmstrip-scrub`、`deployment-pipeline`、`live-log-stream`、`environment-switcher`、`data-refresh-state`、`api-request-inspector`、`product-variant-selector`、`cart-item-transition` 移植自 Motiq（MIT，Copyright (c) 2026 Mahammad Rustamov）。`@/lib/motiq` 没有带进来：减弱动效用共享的 `usePrefersReducedMotion`，离开视口用 `useAnimationActive`。`@/lib/utils` 改成 `cn`。环境菜单用 `react-dom` 的 `createPortal`。事件矩阵是格子上的传播波，和字符点阵 `glyph-matrix` 不同。铜版是三向交叉线被光波点亮，和 `sketch-hatch-image`、`hatch-divider` 不同。速度剪切跟着滚动速度回弹，和恒定斜切的 `skewed-infinite-scroll` 不同。颜色控件使用主题变量。没有新增依赖，没有使用 GSAP、tldraw 或 WebGL。减弱动效停在终态。离开视口时连续动画暂停，回到视口再继续。

| 组件 | 来源 |
| --- | --- |
| queue-pulse-lanes | Motiq，MIT |
| event-propagation-matrix | Motiq，MIT |
| copperplate-hatch | Motiq，MIT |
| core-strata | Motiq，MIT |
| kinetic-emphasis | Motiq，MIT |
| liquid-fill-headline | Motiq，MIT |
| velocity-skew-feed | Motiq，MIT |
| filmstrip-scrub | Motiq，MIT |
| deployment-pipeline | Motiq，MIT |
| live-log-stream | Motiq，MIT |
| environment-switcher | Motiq，MIT |
| data-refresh-state | Motiq，MIT |
| api-request-inspector | Motiq，MIT |
| product-variant-selector | Motiq，MIT |
| cart-item-transition | Motiq，MIT |

### 键入爆炸、色带与持键

登记在 `catalog-batch55.ts`。摇杆已占用 `catalog-batch54.ts`。`exploding-input`、`flow-button`、`logos-carousel`、`bars-spinner`、`band-wave-text`、`fallback-avatar` 移植自 Spell UI（MIT，Copyright (c) 2025 Spell UI）。`glow-divider`、`noise-text`、`verify-badge`、`gift-card`、`network-graph` 移植自 Sera UI（MIT，Copyright (c) 2025 Sera UI）。`invalid-shake`、`safe-triangle`、`held-keys`、`delayed-loading` 移植自 HextaUI（MIT，Copyright (c) 2026 Preet Suthar）。`framer-motion` 改成 `motion/react` 的写法没有引入运行时，连线用 CSS。`@tabler/icons-react` 没有使用。`clsx` 与 `twMerge` 改成 `cn`。HextaUI 的动效判断改成共享的 `usePrefersReducedMotion`。`fallback-avatar` 不用 WebGL，按名字画 CSS 渐变。`gift-card` 去掉了来源里的品牌名称和标志。键入爆炸是输入框光标处的粒子，和消息气泡 `text-explode` 不同。标志轮换按组纵向交错，和 `section-logo-cloud` 不同。色带从文字底部扫过，和 `gradient-text`、`text-shimmer-wave` 不同。发光分隔线是一条线，和 `glowing-edge`、`glow-effect` 不同。颜色控件使用主题变量。没有新增依赖，没有使用 GSAP、tldraw、three 或 WebGL。减弱动效停在终态。离开视口时连续动画暂停，回到视口再继续。

| 组件 | 来源 |
| --- | --- |
| exploding-input | Spell UI，MIT |
| flow-button | Spell UI，MIT |
| logos-carousel | Spell UI，MIT |
| bars-spinner | Spell UI，MIT |
| band-wave-text | Spell UI，MIT |
| glow-divider | Sera UI，MIT |
| noise-text | Sera UI，MIT |
| invalid-shake | HextaUI，MIT |
| fallback-avatar | Spell UI，MIT |
| verify-badge | Sera UI，MIT |
| gift-card | Sera UI，MIT |
| safe-triangle | HextaUI，MIT |
| held-keys | HextaUI，MIT |
| delayed-loading | HextaUI，MIT |
| network-graph | Sera UI，MIT |

### 摇杆、碎纸与液桥

登记在 `catalog-batch54.ts`。下压已占用 `catalog-batch53.ts`。`analog-stick`、`paper-shred-button`、`scan-document`、`dynamic-grid-gallery`、`photo-albums`、`gooey-navbar`、`overlapping-slider`、`get-in-touch`、`client-card`、`corner-video`、`create-menu`、`day-picker`、`stacked-list`、`discover-search-pill`、`tactile-rocker` 移植自 uselayouts（MIT，Copyright (c) 2025 Urvish Mali）。`discover-search-pill` 来自 `discover-button`，`tactile-rocker` 来自 `tactile-button`，并做成保持倾斜的开关。`get-in-touch` 内联了同目录的按钮外壳。`@hugeicons` 改成 `lucide-react`，`framer-motion` 改成 `motion/react`，`next/image` 和 `next/link` 改成 `img` 与 `a`。碎纸按钮抽出文件再剪成纸条，和打印机图标按钮不同。液桥导航是一整条导航，和单个黏液按钮不同。颜色控件使用主题变量。示例图片用内联图形。没有新增依赖，没有使用 GSAP、tldraw 或 WebGL。减弱动效停在终态。离开视口时连续动画暂停，回到视口再继续。

| 组件 | 来源 |
| --- | --- |
| analog-stick | uselayouts，MIT |
| paper-shred-button | uselayouts，MIT |
| scan-document | uselayouts，MIT |
| dynamic-grid-gallery | uselayouts，MIT |
| photo-albums | uselayouts，MIT |
| gooey-navbar | uselayouts，MIT |
| overlapping-slider | uselayouts，MIT |
| get-in-touch | uselayouts，MIT |
| client-card | uselayouts，MIT |
| corner-video | uselayouts，MIT |
| create-menu | uselayouts，MIT |
| day-picker | uselayouts，MIT |
| stacked-list | uselayouts，MIT |
| discover-search-pill | uselayouts，MIT |
| tactile-rocker | uselayouts，MIT |

### 下压、色带与弧选

登记在 `catalog-batch53.ts`。百叶已占用 `catalog-batch52.ts`。`press-depth`、`value-flash`、`blur-up-image`、`typing-indicator`、`new-items-pill` 移植自 interior（MIT，Copyright (c) 2026 ozzy）。`chromatic-text-reveal`、`action-swap`、`pull-to-refresh`、`arc-picker`、`knockout-bracket`、`ruler-slider`、`overflow-actions`、`preview-rail`、`wallet-card` 移植自 beUI（MIT，Copyright (c) 2026 Saurabh Chauhan）。`action-swap` 用 `variant` 收拢模糊、滚动、逐字三种换法。`ruler-slider` 对应源文件 `range-slider-ruler`。钱包的换字复用 `action-swap`。颜色控件使用主题变量。没有新增依赖，没有使用 GSAP、tldraw 或 WebGL。减弱动效停在终态。离开视口时连续动画暂停，回到视口再继续。

| 组件 | 来源 |
| --- | --- |
| press-depth | interior，MIT |
| value-flash | interior，MIT |
| blur-up-image | interior，MIT |
| chromatic-text-reveal | beUI，MIT |
| action-swap | beUI，MIT |
| pull-to-refresh | beUI，MIT |
| arc-picker | beUI，MIT |
| new-items-pill | interior，MIT |
| typing-indicator | interior，MIT |
| knockout-bracket | beUI，MIT |
| ruler-slider | beUI，MIT |
| overflow-actions | beUI，MIT |
| preview-rail | beUI，MIT |
| wallet-card | beUI，MIT |

### 百叶、斜纹与翻页

登记在 `catalog-batch52.ts`。抛掷已占用 `catalog-batch46.ts`，ns-ui 已占用 `catalog-batch51.ts`。`blind-pull-toggle`、`danger-stripes`、`flip-calendar`、`slice-type`、`stack-tower`、`taga-toggle`、`diamond-grid`、`wild-morph`、`mood-tracker`、`voice-chat-pill`、`job-listing-cards`、`new-project-modal`、`music-player-card`、`label-cards` 移植自 AI Canvas（MIT，Copyright (c) 2026 AI Canvas）。`framer-motion` 改成 `motion/react`，Phosphor 图标改成 `lucide-react`，字体改成 `--font-sans`。颜色控件使用主题变量。职位品牌标志只放在示例里。音乐卡不打包音频。没有新增依赖。减弱动效停在终态。离开视口时连续动画暂停，回到视口再继续。

| 组件 | 来源 |
| --- | --- |
| blind-pull-toggle | AI Canvas，MIT |
| danger-stripes | AI Canvas，MIT |
| flip-calendar | AI Canvas，MIT |
| slice-type | AI Canvas，MIT |
| stack-tower | AI Canvas，MIT |
| taga-toggle | AI Canvas，MIT |
| diamond-grid | AI Canvas，MIT |
| wild-morph | AI Canvas，MIT |
| mood-tracker | AI Canvas，MIT |
| voice-chat-pill | AI Canvas，MIT |
| job-listing-cards | AI Canvas，MIT |
| new-project-modal | AI Canvas，MIT |
| music-player-card | AI Canvas，MIT |
| label-cards | AI Canvas，MIT |

### 铅锤、棘轮与书脊

登记在 `catalog-batch51.ts`。抛掷已占用 `catalog-batch46.ts`。`success-plumb-bob`、`checkbox-domino-run`、`autosave-ratchet`、`button-retry-backoff`、`craze-rule`、`banner-tear-stub`、`feed-escapement`、`cruet-settle`、`undo-ghost-row`、`container-box-drawing`、`transfer-list-siphon`、`drill-down-spines`、`due-slip`、`contra-strike`、`galley-bracket` 移植自 ns-ui（MIT，Copyright (c) 2026 Nikolas Sapalidis）。ns-ui 的颜色变量映射到 effect-ui 主题变量，能写成 Tailwind 的静态样式不再内联。没有新增依赖。状态变化仍走 aria-live。减弱动效保持原来的终态或离散步进。离开视口时动画帧和 CSS 动画暂停，回到视口再继续。

| 组件 | 来源 |
| --- | --- |
| success-plumb-bob | ns-ui，MIT |
| checkbox-domino-run | ns-ui，MIT |
| autosave-ratchet | ns-ui，MIT |
| button-retry-backoff | ns-ui，MIT |
| craze-rule | ns-ui，MIT |
| banner-tear-stub | ns-ui，MIT |
| feed-escapement | ns-ui，MIT |
| cruet-settle | ns-ui，MIT |
| undo-ghost-row | ns-ui，MIT |
| container-box-drawing | ns-ui，MIT |
| transfer-list-siphon | ns-ui，MIT |
| drill-down-spines | ns-ui，MIT |
| due-slip | ns-ui，MIT |
| contra-strike | ns-ui，MIT |
| galley-bracket | ns-ui，MIT |

### 主题切换、图表与账号菜单

登记在 `catalog-batch45.ts`。上一批点阵光晕已占用 `catalog-batch44.ts`。`theme-switch-transitions`、`floating-button-group`、`morph-select`、`streamgraph`、`waffle-chart`、`treemap`、`slope-chart`、`ridgeline`、`split-button`、`shortcut-recorder`、`inline-edit`、`expandable-text`、`brush-chart`、`user-menu`、`password-field` 移植自 Arc Library（MIT，Copyright (c) 2026 Elia Kuratli）。CSS module 改成组件内样式，Arc 颜色变量映射到 effect-ui 主题变量，`motion` 换成 `motion/react`。图标用已有的 lucide-react，菜单和提示用已有的 Radix dropdown-menu、popover、tooltip、dialog。没有新增依赖。图表保留 `<title>` 和屏幕阅读摘要。减弱动效或离开视口时旋转、滑动、弹簧高度和描线停住，直接显示终态。

| 组件 | 来源 |
| --- | --- |
| theme-switch-transitions | Arc Library，MIT |
| floating-button-group | Arc Library，MIT |
| morph-select | Arc Library，MIT |
| streamgraph | Arc Library，MIT |
| waffle-chart | Arc Library，MIT |
| treemap | Arc Library，MIT |
| slope-chart | Arc Library，MIT |
| ridgeline | Arc Library，MIT |
| split-button | Arc Library，MIT |
| shortcut-recorder | Arc Library，MIT |
| inline-edit | Arc Library，MIT |
| expandable-text | Arc Library，MIT |
| brush-chart | Arc Library，MIT |
| user-menu | Arc Library，MIT |
| password-field | Arc Library，MIT |

### 点阵光晕、星环与分步加载

登记在 `catalog-batch44.ts`。上一批灯板已占用 `catalog-batch43.ts`。`dotted-glow-background`、`sticky-banner`、`multi-step-loader`、`stateful-button`、`tweet-card` 移植自 Velora UI（MIT，Copyright (c) 2026 Aigars Silkalns）。`star-ring-orbit`、`neo-star-shapes`、`caption-image-card` 移植自 Neobrutalism components（MIT，Copyright (c) 2023 Samuel Breznjak）。没有移植 Velora 里和 Aceternity 概念重合的组件。品牌渐变改成主题色，示例色放在 demo。关键帧写在组件内部。没有新增依赖。减弱动效时点阵停在当前帧，星环停转，公告直接收起，分步加载不再转圈，异步按钮不再缩成圆形。

| 组件 | 来源 |
| --- | --- |
| dotted-glow-background | Velora UI，MIT |
| star-ring-orbit | Neobrutalism components，MIT |
| sticky-banner | Velora UI，MIT |
| multi-step-loader | Velora UI，MIT |
| stateful-button | Velora UI，MIT |
| tweet-card | Velora UI，MIT |
| neo-star-shapes | Neobrutalism components，MIT |
| caption-image-card | Neobrutalism components，MIT |

### 灯板、光环与折页卡片

登记在 `catalog-batch43.ts`。上一批 UNO 卡已占用 `catalog-batch42.ts`。`lightboard`、`cosmic-button`、`glow-track-button`、`halo-badge`、`halo-switch`、`shift-card`、`squiggle-arrow`、`security-checkpoint`、`speech-bubble`、`folded-card`、`side-panel`、`collab-avatar`、`elapsed-timer`、`neumorph-button`、`texture-card` 移植自 Cult UI（MIT，Copyright (c) 2023 Jordan-Gilliam）。`next/link` 改成 `a`，`clsx` 改成 `cn`。侧栏高度用 ResizeObserver，没有加入 react-use-measure。关键帧写在组件内部。示例色、文案和链接放在 demo。没有新增依赖。减弱动效时灯板停在当前帧，星环和光斑停住，徽章光圈和开关弹簧停住，班次卡片直接展开，安检线和计时图标停住，气泡光标不再呼吸，拟态按钮不再缩放。

| 组件 | 来源 |
| --- | --- |
| lightboard | Cult UI，MIT |
| cosmic-button | Cult UI，MIT |
| glow-track-button | Cult UI，MIT |
| halo-badge | Cult UI，MIT |
| halo-switch | Cult UI，MIT |
| shift-card | Cult UI，MIT |
| squiggle-arrow | Cult UI，MIT |
| security-checkpoint | Cult UI，MIT |
| speech-bubble | Cult UI，MIT |
| folded-card | Cult UI，MIT |
| side-panel | Cult UI，MIT |
| collab-avatar | Cult UI，MIT |
| elapsed-timer | Cult UI，MIT |
| neumorph-button | Cult UI，MIT |
| texture-card | Cult UI，MIT |

### UNO 卡、会议控制与分类搜索

登记在 `catalog-batch42.ts`。上一批吃豆加载已占用 `catalog-batch41.ts`。`uno-card`（作者 nanda248）、`transaction-card`（作者 Admin12121）、`printer-icon-button`（作者 Admin12121）、`pendulum-social-card`（作者 SouravBandyopadhyay）、`tilt-sweep-button`（作者 EddyBel）、`focus-line-input`（作者 TechByElijah）、`word-wheel-card`（作者 NotReal22）、`fly-around-button`（作者 Bastiennnn）移植自 Uiverse galaxy（MIT，Copyright (c) 2023 Uiverse.io）。`bottom-navigation`、`meeting-control-bar`、`list-group`、`time-range-picker`、`blockquote`、`featured-gallery`、`category-search-input` 移植自 Flowbite（MIT，Copyright (c) 2023 Bergside Inc.）。Tailwind HTML 改成 React 状态，图标用已有的 lucide-react。示例色、图片、文案和链接放在 demo。没有新增依赖。减弱动效时光带、进纸、摆锤、扫光、下划线放大、词盘、飞图标停住，交易卡和 POS 并排静止，图库直接换图，导航和会议条不再做颜色过渡。

| 组件 | 来源 |
| --- | --- |
| uno-card | Uiverse galaxy，MIT，作者 nanda248 |
| transaction-card | Uiverse galaxy，MIT，作者 Admin12121 |
| printer-icon-button | Uiverse galaxy，MIT，作者 Admin12121 |
| pendulum-social-card | Uiverse galaxy，MIT，作者 SouravBandyopadhyay |
| tilt-sweep-button | Uiverse galaxy，MIT，作者 EddyBel |
| focus-line-input | Uiverse galaxy，MIT，作者 TechByElijah |
| word-wheel-card | Uiverse galaxy，MIT，作者 NotReal22 |
| fly-around-button | Uiverse galaxy，MIT，作者 Bastiennnn |
| bottom-navigation | Flowbite，MIT，Copyright (c) 2023 Bergside Inc. |
| meeting-control-bar | Flowbite，MIT，Copyright (c) 2023 Bergside Inc. |
| list-group | Flowbite，MIT，Copyright (c) 2023 Bergside Inc. |
| time-range-picker | Flowbite，MIT，Copyright (c) 2023 Bergside Inc. |
| blockquote | Flowbite，MIT，Copyright (c) 2023 Bergside Inc. |
| featured-gallery | Flowbite，MIT，Copyright (c) 2023 Bergside Inc. |
| category-search-input | Flowbite，MIT，Copyright (c) 2023 Bergside Inc. |

### 吃豆加载、形状遮罩与页脚

登记在 `catalog-batch41.ts`。上一批书签爆发已占用 `catalog-batch40.ts`。`pacman-loader`（作者 andrew-demchenk0）、`battery-loader`（作者 JaydipPrajapati1910）、`ringed-planet-loader`（作者 Admin12121）、`pixel-bird-loader`（作者 Subaashbala）、`phone-ring-loader`（作者 bociKond）、`glass-clock-loader`（作者 Subaashbala）移植自 Uiverse galaxy（MIT，Copyright (c) 2023 Uiverse.io）。`hover-gallery`、`icon-swap`、`shape-mask`、`form-validator`、`corner-indicator`、`filter-chips`、`file-input`、`tick-range` 移植自 daisyUI（MIT，Copyright (c) 2020 Pouya Saadeghi）。`site-footer` 移植自 Meraki UI（MIT，Copyright (c) 2021 Khatab Wedaa）。CSS 改成 React 与 Tailwind v4，主题色用现有 token。示例色、图片、文案和链接放在 demo。没有新增依赖。减弱动效时吃豆嘴保持张开、电池停在半格或给定电量、星球环停在倾斜角度、像素鸟停在扇翅中段、电话不再摇晃、时钟指针停住、画廊切换不再过渡、图标交换不再旋转过渡、筛选不再缩放、页脚链接不再做颜色过渡。`mask-image` 不可用时形状遮罩退回圆角，`:user-invalid` 不可用时表单在失焦时用 `checkValidity`。

| 组件 | 来源 |
| --- | --- |
| pacman-loader | Uiverse galaxy，MIT，作者 andrew-demchenk0 |
| battery-loader | Uiverse galaxy，MIT，作者 JaydipPrajapati1910 |
| ringed-planet-loader | Uiverse galaxy，MIT，作者 Admin12121 |
| pixel-bird-loader | Uiverse galaxy，MIT，作者 Subaashbala |
| phone-ring-loader | Uiverse galaxy，MIT，作者 bociKond |
| glass-clock-loader | Uiverse galaxy，MIT，作者 Subaashbala |
| hover-gallery | daisyUI，MIT，Copyright (c) 2020 Pouya Saadeghi |
| icon-swap | daisyUI，MIT，Copyright (c) 2020 Pouya Saadeghi |
| shape-mask | daisyUI，MIT，Copyright (c) 2020 Pouya Saadeghi |
| form-validator | daisyUI，MIT，Copyright (c) 2020 Pouya Saadeghi |
| corner-indicator | daisyUI，MIT，Copyright (c) 2020 Pouya Saadeghi |
| filter-chips | daisyUI，MIT，Copyright (c) 2020 Pouya Saadeghi |
| file-input | daisyUI，MIT，Copyright (c) 2020 Pouya Saadeghi |
| tick-range | daisyUI，MIT，Copyright (c) 2020 Pouya Saadeghi |
| site-footer | Meraki UI，MIT，Copyright (c) 2021 Khatab Wedaa |

### 书签爆发、注册分页与作品筛选

登记在 `catalog-batch40.ts`。上一批故障切片已占用 `catalog-batch39.ts`。`bookmark-burst-toggle`（作者 Galahhad）、`lock-toggle`（作者 mobinkakei）、`circular-text-button`（作者 Creatlydev）、`flower-burst-button`（作者 yaroslavas2001）、`scroll-cue-button`（作者 ArturCodeCraft）、`flicker-reflect-button`（作者 John-CFO）、`glow-search-input`（作者 siraj-ha）、`propeller-orb`（作者 Lakshay-art）移植自 Uiverse galaxy（MIT，Copyright (c) 2023 Uiverse.io）。`not-found-page`、`multi-level-dropdown`、`file-manager-table`、`email-template`、`signup-split-page`、`step-modal`、`portfolio-filter-grid` 移植自 Meraki UI（MIT，Copyright (c) 2021 Khatab Wedaa）。Alpine 改成 React 状态，过渡用已有的 `motion/react`。示例图片、文案和链接放在 demo。邮件模板用表格和内联样式。没有新增依赖。减弱动效时书签不再爆发、锁扣不再画线、环形文字停止旋转、花朵不再自转、滚动箭头停住、霓虹不再闪、搜索光晕不再对调、螺旋桨停住、404 按钮和注册按钮不再做颜色过渡、菜单直接出现、文件行按钮不再过渡、步骤遮罩直接出现、作品过滤立即完成。

| 组件 | 来源 |
| --- | --- |
| bookmark-burst-toggle | Uiverse galaxy，MIT，作者 Galahhad |
| lock-toggle | Uiverse galaxy，MIT，作者 mobinkakei |
| circular-text-button | Uiverse galaxy，MIT，作者 Creatlydev |
| flower-burst-button | Uiverse galaxy，MIT，作者 yaroslavas2001 |
| scroll-cue-button | Uiverse galaxy，MIT，作者 ArturCodeCraft |
| flicker-reflect-button | Uiverse galaxy，MIT，作者 John-CFO |
| glow-search-input | Uiverse galaxy，MIT，作者 siraj-ha |
| propeller-orb | Uiverse galaxy，MIT，作者 Lakshay-art |
| not-found-page | Meraki UI，MIT，Copyright (c) 2021 Khatab Wedaa |
| multi-level-dropdown | Meraki UI，MIT，Copyright (c) 2021 Khatab Wedaa |
| file-manager-table | Meraki UI，MIT，Copyright (c) 2021 Khatab Wedaa |
| email-template | Meraki UI，MIT，Copyright (c) 2021 Khatab Wedaa |
| signup-split-page | Meraki UI，MIT，Copyright (c) 2021 Khatab Wedaa |
| step-modal | Meraki UI，MIT，Copyright (c) 2021 Khatab Wedaa |
| portfolio-filter-grid | Meraki UI，MIT，Copyright (c) 2021 Khatab Wedaa |

### 故障切片、粗野套件与营销区块

登记在 `catalog-batch39.ts`。上一批布局模糊已占用 `catalog-batch38.ts`。`glitch-slice-button`（作者 namecho）、`send-arrow-button`（作者 andrew-demchenk0）、`trash-delete-button`（作者 boryanakrasteva）、`neon-hold-card`（作者 htwarriors108）、`pin-toggle`（作者 vinodjangid07）、`blur-unveil-card`（作者 Javierrocadev）、`glow-wander-card`（作者 codebykay101）、`star-favorite-toggle`（作者 andrew-demchenk0）移植自 Uiverse galaxy（MIT，Copyright (c) 2023 Uiverse.io）。`details-list`、`blog-card`、`neo-brutal-kit`、`contact-form`、`team-section`、`stat-trend-cards`、`collapsible-side-menu` 移植自 HyperUI（MIT，Copyright (c) Mark Mead）。亮色和暗色 HTML 合并成主题色加 `dark:` 变体。示例图片、文案和链接放在 demo。`neo-brutal-kit` 一个条目导出 NeoCard、Alert、Badge、Input、Select、Textarea、Checkbox、Progress、Tabs。没有新增依赖。减弱动效时切片不再错位、发送光晕停住、删除提示直接出现、霓虹卡片放平、图钉和星星不再缩放、模糊色块保持清晰、游走光点停住、详情列表和统计卡保持原样、博客阴影不再过渡、粗野控件没有过渡、联系按钮没有颜色过渡、成员链接不再改变透明度、侧栏箭头没有旋转过渡。

| 组件 | 来源 |
| --- | --- |
| glitch-slice-button | Uiverse galaxy，MIT，作者 namecho |
| send-arrow-button | Uiverse galaxy，MIT，作者 andrew-demchenk0 |
| trash-delete-button | Uiverse galaxy，MIT，作者 boryanakrasteva |
| neon-hold-card | Uiverse galaxy，MIT，作者 htwarriors108 |
| pin-toggle | Uiverse galaxy，MIT，作者 vinodjangid07 |
| blur-unveil-card | Uiverse galaxy，MIT，作者 Javierrocadev |
| glow-wander-card | Uiverse galaxy，MIT，作者 codebykay101 |
| star-favorite-toggle | Uiverse galaxy，MIT，作者 andrew-demchenk0 |
| details-list | HyperUI，MIT，Copyright (c) Mark Mead |
| blog-card | HyperUI，MIT，Copyright (c) Mark Mead |
| neo-brutal-kit | HyperUI，MIT，Copyright (c) Mark Mead |
| contact-form | HyperUI，MIT，Copyright (c) Mark Mead |
| team-section | HyperUI，MIT，Copyright (c) Mark Mead |
| stat-trend-cards | HyperUI，MIT，Copyright (c) Mark Mead |
| collapsible-side-menu | HyperUI，MIT，Copyright (c) Mark Mead |

### 布局模糊、液态按钮与对话壳

登记在 `catalog-batch38.ts`。上一批提示词套件已占用 `catalog-batch37.ts`。`blur-vignette`、`liquid-gradient-button`、`hover-blocks-grid`、`char-shimmer-loader`、`spotlight-group`、`timeline-reveal`、`scroll-blur-text`、`hatch-divider`、`image-tabs`、`progressive-carousel`、`agent-intro-sequence`、`hover-image-reveal` 与钩子 `use-media-query` 移植自 UI Layouts（MIT，Copyright (c) 2024 UI LAYOUT）。`expandable-chat`、`chat-message-list`、`message-loading` 移植自 shadcn-chat（MIT，Copyright (c) 2024 Jakob Hoeg Mørk）。`useAutoScroll` 内联在 `chat-message-list`。`next/image` 改为 `img`。示例链接、色板和图片放在 demo。`agent-intro-sequence` 的序列由 props 传入。原创组件已占用 `hover-image-list`，这次的图片行登记为 `hover-image-reveal`。没有新增依赖。减弱动效时暗角不再模糊、液态色块停住、方块没有颜色过渡、字符条直接显示最后一句、聚光不再跟随指针、时间线和滚动文字立即清晰、斜线分隔保持原样、对话壳没有展开过渡、消息列表不平滑滚动、标签没有颜色过渡、轮播停止自动播放、介绍序列一次显示并结束、窄屏或减弱动效时图片停在行内、输入点停住。

| 组件 | 来源 |
| --- | --- |
| use-media-query | UI Layouts，MIT，Copyright (c) 2024 UI LAYOUT |
| blur-vignette | UI Layouts，MIT，Copyright (c) 2024 UI LAYOUT |
| liquid-gradient-button | UI Layouts，MIT，Copyright (c) 2024 UI LAYOUT |
| hover-blocks-grid | UI Layouts，MIT，Copyright (c) 2024 UI LAYOUT |
| char-shimmer-loader | UI Layouts，MIT，Copyright (c) 2024 UI LAYOUT |
| spotlight-group | UI Layouts，MIT，Copyright (c) 2024 UI LAYOUT |
| timeline-reveal | UI Layouts，MIT，Copyright (c) 2024 UI LAYOUT |
| scroll-blur-text | UI Layouts，MIT，Copyright (c) 2024 UI LAYOUT |
| hatch-divider | UI Layouts，MIT，Copyright (c) 2024 UI LAYOUT |
| expandable-chat | shadcn-chat，MIT，Copyright (c) 2024 Jakob Hoeg Mørk |
| chat-message-list | shadcn-chat，MIT，Copyright (c) 2024 Jakob Hoeg Mørk |
| image-tabs | UI Layouts，MIT，Copyright (c) 2024 UI LAYOUT |
| progressive-carousel | UI Layouts，MIT，Copyright (c) 2024 UI LAYOUT |
| agent-intro-sequence | UI Layouts，MIT，Copyright (c) 2024 UI LAYOUT |
| hover-image-reveal | UI Layouts，MIT，Copyright (c) 2024 UI LAYOUT |
| message-loading | shadcn-chat，MIT，Copyright (c) 2024 Jakob Hoeg Mørk |

### 提示词套件与加载指示

登记在 `catalog-batch37.ts`。上一批可变字体已占用 `catalog-batch36.ts`。`ai-loader`、`response-stream`、`thinking-bar`、`chain-of-thought`、`reasoning`、`source`、`tool`、`system-message`、`feedback-bar`、`prompt-suggestion`、`generated-image` 移植自 prompt-kit（许可文件 `LICENCE.md`，MIT，Copyright (c) 2025 Julien Thibeaut）。`@/components/ui/*` 换成已有组件。`reasoning` 渲染 children。`source` 默认不显示图标，也不请求 Google favicon。`generated-image` 由 `image` 改名。`book-page-loader`（作者 vinodjangid07）、`map-pin-loader`（作者 vikramsinghnegi）、`glow-corner-loader`（作者 NlghtM4re）、`retro-press-button`（作者 TanimMahbub）移植自 Uiverse galaxy（MIT，Copyright (c) 2023 Uiverse.io）。没有新增依赖。减弱动效时加载指示停住、文字流立即显示全文、思考条不再扫光、书页合上、地图钉停住、发光方块停在四角、复古按钮按下没有过渡、思维链和工具卡不再播放折叠动画、推理区直接展开、来源悬停不再延迟、反馈和提示词按钮没有过渡、生成图占位不脉冲。

| 组件 | 来源 |
| --- | --- |
| ai-loader | prompt-kit，MIT，Copyright (c) 2025 Julien Thibeaut |
| response-stream | prompt-kit，MIT，Copyright (c) 2025 Julien Thibeaut |
| thinking-bar | prompt-kit，MIT，Copyright (c) 2025 Julien Thibeaut |
| book-page-loader | Uiverse galaxy，MIT，作者 vinodjangid07 |
| map-pin-loader | Uiverse galaxy，MIT，作者 vikramsinghnegi |
| glow-corner-loader | Uiverse galaxy，MIT，作者 NlghtM4re |
| retro-press-button | Uiverse galaxy，MIT，作者 TanimMahbub |
| chain-of-thought | prompt-kit，MIT，Copyright (c) 2025 Julien Thibeaut |
| reasoning | prompt-kit，MIT，Copyright (c) 2025 Julien Thibeaut |
| source | prompt-kit，MIT，Copyright (c) 2025 Julien Thibeaut |
| tool | prompt-kit，MIT，Copyright (c) 2025 Julien Thibeaut |
| system-message | prompt-kit，MIT，Copyright (c) 2025 Julien Thibeaut |
| feedback-bar | prompt-kit，MIT，Copyright (c) 2025 Julien Thibeaut |
| prompt-suggestion | prompt-kit，MIT，Copyright (c) 2025 Julien Thibeaut |
| generated-image | prompt-kit，MIT，Copyright (c) 2025 Julien Thibeaut |

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

### 文件夹便签

登记在 `catalog-batch35.ts`。上一批色相波浪已占用 `catalog-batch34.ts`。原创实现，不是移植。依赖已有的 `matter-js`（MIT），没有新增依赖。减弱动效时不启动物理，便签只淡入。

| 组件 | 来源 |
| --- | --- |
| folder-float | 原创 |

### 抛掷

登记在 `catalog-batch46.ts`。origin 的新批次已占用 `catalog-batch36.ts` 到 `catalog-batch45.ts`。`card-toss-stack`、`toss-to-trash`、`sticky-note-board` 是原创实现，不是移植。每个组件自己算拖拽惯性，没有抽共享 hook，也没有新增依赖。减弱动效时卡片直接拿走、条目直接删除、便利贴停在落点并且不再倾斜。

| 组件 | 来源 |
| --- | --- |
| card-toss-stack | 原创 |
| toss-to-trash | 原创 |
| sticky-note-board | 原创 |

### 罐子与球池

登记在 `catalog-batch47.ts`。上一批抛掷已占用 `catalog-batch46.ts`。`tag-jar`、`coin-jar`、`ball-pit` 是原创实现，不是移植。标签落入玻璃罐并堆起，拖动罐子会把它们摇散；打赏硬币落入罐中叠成一柱；头像球会被指针拨开。`matter-js` 已经是依赖，没有新增 npm 依赖。减弱动效时不启动物理引擎，也不申请动画帧，只留下静止的一叠。

| 组件 | 来源 |
| --- | --- |
| tag-jar | 原创 |
| coin-jar | 原创 |
| ball-pit | 原创 |

### 挂绳弹簧

登记在 `catalog-batch48.ts`。上一批罐子与球池已占用 `catalog-batch47.ts`。`lanyard-badge`、`jelly-button`、`spring-drawer` 是原创实现，不是移植。各自用 Verlet 和弹簧积分，配合 `requestAnimationFrame`，没有新增依赖，也没有使用 matter-js。减弱动效时不跑积分循环：工牌竖直挂着，按钮不压扁，抽屉直接开合。

| 组件 | 来源 |
| --- | --- |
| lanyard-badge | 原创 |
| jelly-button | 原创 |
| spring-drawer | 原创 |

### 吸附芯片、文件夹扇形与落点

登记在 `catalog-batch49.ts`。上一批挂绳弹簧已占用 `catalog-batch48.ts`。`magnet-chips`、`folder-stack`、`physics-dropzone` 是原创实现，不是移植。没有新增依赖。`physics-dropzone` 使用仓库里已经安装的 `matter-js`。`magnet-chips` 和 `folder-stack` 只用自己的指针和动画帧。减弱动效时芯片立刻对齐、文件夹不播放扇形动画、文件直接出现在堆里，并且不启动物理引擎、不申请动画帧。

| 组件 | 来源 |
| --- | --- |
| magnet-chips | 原创 |
| folder-stack | 原创 |
| physics-dropzone | 原创 |

### 上传与回应

登记在 `catalog-batch50.ts`。上一批吸附芯片已占用 `catalog-batch49.ts`。`upload-orbit`、`empty-state-scene`、`reaction-tray` 是原创实现，不是移植。没有新增依赖。减弱动效时文件停在完成的一行、插画保持静止、表情计数立刻更新，不再绕圈、漂浮或弹出。

| 组件 | 来源 |
| --- | --- |
| upload-orbit | 原创 |
| empty-state-scene | 原创 |
| reaction-tray | 原创 |

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

登记在 `catalog-batch26.ts`。上一批收据、液面与裁切已占用 `catalog-batch25.ts`。十四项都移植自 SmoothUI（MIT，Copyright (c) 2024 Eduardo Calvo），源文件在 https://github.com/educlopez/smoothui/blob/main/packages/smoothui/components/ 。没有新增依赖。`aurora-curtain`、`liquid-metal`、`sdf-blob-transition` 保留原来的着色器，绘制改用已经在仓库里的 `ogl`。离开视口后停止动画帧和指示灯。减弱动效时极光、星场和液态金属停住，SDF 过渡直接换内容，环境光只取一帧，勒索信不再晃动，时长数字不再滚动。

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
| switchboard-card | SmoothUI，MIT |
| time-machine-stack | SmoothUI，MIT |
| interactive-image-selector | SmoothUI，MIT |

### 收据、液面与裁切

登记在 `catalog-batch25.ts`。上一批地形、摇篮字与转录已占用 `catalog-batch24.ts`。十四项都移植自 kokonutUI（MIT，Copyright (c) 2025 kokonutUI），源文件在 https://github.com/kokonut-labs/kokonutui/blob/main/components/kokonutui/ 。没有新增依赖。`clip-trimmer` 用 `<img>` 替换 `next/image`。离开视口后停止动画帧、逐词计时和汇款步骤。减弱动效时液面和支出环直接落到目标，点阵静止，加载短句不再波动，录音音柱停住，头像不再眨眼，时区表盘不再滑动，裁切播放头直接跳到选区起点。

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
| virtual-list | TanStack Virtual |
| infinite-scroll | 原创 |
| masonry-gallery | react-photo-album |
| lightbox | yet-another-react-lightbox |
| password-strength | 原创 |
| quantity-stepper | 原创 |
| emoji-picker | frimousse |
| video-player | Kibo UI（原生 video） |
| notification-center | Kokonut UI（免费 MIT） |
| gravity | matter-js |
| ascii-render | Smooth UI |

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
