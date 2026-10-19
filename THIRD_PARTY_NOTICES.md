# Third-Party Notices

effect-ui 在 MIT 许可下发布。下列组件从开源项目移植或二次开发。每个源项目的版权与许可声明仍然有效。

未使用 Aceternity UI（非标准许可）或 React Bits（MIT + Commons Clause，禁止再分发/移植组件本身）的代码。

## shadcn/ui

- 仓库：https://github.com/shadcn-ui/ui
- 许可：MIT
- 版权：Copyright (c) 2023 shadcn
- 衍生组件：`button`、`input`、`textarea`、`label`、`card`、`badge`、`separator`、`dialog`、`sheet`、`dropdown-menu`、`tabs`、`tooltip`、`sonner`、`switch`、`checkbox`、`select`、`accordion`、`popover`、`avatar`、`slider`、`utils`、`alert`、`alert-dialog`、`aspect-ratio`、`breadcrumb`、`calendar`、`carousel`、`chart`、`collapsible`、`command`、`context-menu`、`drawer`、`form`、`hover-card`、`input-otp`、`menubar`、`navigation-menu`、`pagination`、`progress`、`radio-group`、`resizable`、`scroll-area`、`sidebar`、`skeleton`、`table`、`toggle`、`toggle-group`、`data-table`

## Magic UI

- 仓库：https://github.com/magicuidesign/magicui
- 许可：MIT
- 版权：Copyright (c) Magic UI
- 衍生组件：`typing-text`、`gradient-text`、`shimmer-text`、`aurora-text`、`count-up`、`particles`、`grid-pattern`、`dot-pattern`、`meteors`、`ripples`、`flickering-grid`、`spotlight-card`、`shine-border`、`shimmer-button`、`pulse-button`、`progress-ring`、`blur-fade`、`scramble-text`、`word-rotate`、`morphing-text`、`rolling-number`、`text-reveal`、`light-beams`、`animated-grid`、`retro-grid`、`dock`、`marquee`、`orbiting-circles`、`animated-list`、`confetti-burst`、`sparkles`、`border-beam`、`bento-grid`、`rainbow-button`、`interactive-hover-button`、`animated-beam`、`scroll-progress`、`scroll-velocity`、`icon-cloud`、`animated-theme-toggler`、`device-mockups`

## Animata

- 仓库：https://github.com/codse/animata
- 许可：MIT
- 版权：Copyright (c) Animata
- 衍生组件：`highlight-text`、`flip-card`、`ripple-button`、`orbit-loader`、`dots-loader`

## Motion Primitives

- 仓库：https://github.com/ibelick/motion-primitives
- 许可：MIT
- 版权：Copyright (c) 2024 ibelick
- 衍生组件：`split-text`、`magnetic`、`tilt`、`fade-in`、`slide-in`、`stagger-list`、`animated-tabs`、`reveal-section`、`morphing-dialog`、`image-comparison`、`progressive-blur`

## Cult UI

- 仓库：https://github.com/nolly-studio/cult-ui
- 许可：MIT
- 版权：Copyright (c) 2023 Jordan-Gilliam
- 衍生组件：`glow-hover`、`hover-lift`、`expandable-card`、`dynamic-island`

## Fancy Components

- 仓库：https://github.com/danielpetho/fancy
- 许可：MIT
- 版权：Copyright (c) 2024 Daniel Petho
- 衍生组件：`variable-font-proximity`、`stacking-cards`、`image-trail`

## Kibo UI

- 仓库：https://github.com/shadcnblocks/kibo（原 haydenbleasel/kibo）
- 许可：MIT
- 版权：Copyright (c) 2023 — Present shadcnblocks
- 衍生组件：`dropzone`、`tag-input`、`color-picker`、`code-block`、`kanban`、`rich-text-editor`

## Origin UI（coss.com/origin）

- 仓库：https://github.com/cosscom/ui 的 `apps/origin/`（该目录为 MIT；仓库其余部分为 AGPL，未使用）
- 许可：MIT
- 版权：Copyright (c) 2025 coss.com / Originally Copyright (c) 2025 Origin UI
- 衍生组件：`date-range-picker`、`timeline`、`stepper`

## sersavan/shadcn-multi-select-component

- 仓库：https://github.com/sersavan/shadcn-multi-select-component
- 许可：MIT
- 版权：Copyright (c) 2024 sersavan
- 衍生组件：`multi-select`

## Paper Shaders（Apache-2.0）

- 仓库：https://github.com/paper-design/shaders
- 站点：https://shaders.paper.design
- 许可：Apache-2.0（**仅 0.0.77 及之后**；更早版本为 PolyForm Shield，未使用）
- npm：`@paper-design/shaders` / `@paper-design/shaders-react` 0.0.81
- LICENSE / NOTICE：`licenses/apache/paper-shaders/`
- NOTICE 原文：Powered by Paper Shaders: https://shaders.paper.design
- 衍生组件：`shader-backgrounds`
- **改动说明**：未修改上游着色器或 npm 包源码。本仓库只提供 React 封装，按 `variant` 选择 MeshGradient / GrainGradient / Dithering / Metaballs / Warp，并传入调色板与容器尺寸。

## Kokonut UI（免费 GitHub 组件）

- 仓库：https://github.com/kokonut-labs/kokonutui
- 许可：MIT（站点另有付费 Pro，**未使用 Pro 组件**）
- 版权：Copyright (c) kokonutlabs
- 衍生组件：`background-paths`、`glitch-text`（按免费文档中的 path-draw / RGB 错位效果重写，未拷贝 Pro 源码）

## Number Flow

- 仓库：https://github.com/barvian/number-flow
- 许可：MIT
- 版权：Copyright (c) Maxwell Barvian
- 衍生组件：`number-flow`（薄封装 `@number-flow/react`，重依赖单独成 registry 条目）

## liquid-glass-react

- 仓库：https://github.com/rdev/liquid-glass-react
- 许可：MIT
- 版权：Copyright (c) Max Rovensky
- 衍生组件：`liquid-glass`（动态加载依赖；不支持位移滤镜时回退到 backdrop-blur）

## prompt-kit

- 仓库：https://github.com/ibelick/prompt-kit
- 许可：MIT
- 版权：Copyright (c) 2024 ibelick
- 衍生组件：`prompt-input`、`chat-message`（流式 Markdown 用 `react-markdown`）。未移植 Vercel AI Elements（Apache，官方即将弃用），仅作交互参考。

## Tailark blocks（免费）

- 仓库：https://github.com/tailark/blocks
- 许可：MIT（付费区块未使用）
- 衍生组件：`marketing-blocks`（Hero / Pricing / Testimonial / Footer 各 3 个变体，组合本仓库 `aurora-background`、`glass-card`、`shimmer-button`）

## Eldora UI

- 仓库：https://github.com/karthikmudunuri/eldoraui
- 许可：MIT
- 版权：Copyright (c) Karthik Mudunuri
- 衍生组件：`terminal`

## Tiptap

- 仓库：https://github.com/ueberdosis/tiptap
- 许可：MIT
- 版权：Copyright (c) 2023 Tiptap
- 通过 `rich-text-editor` 使用 `@tiptap/react` / `@tiptap/starter-kit` / `@tiptap/extension-placeholder`，重依赖单独成 registry 条目。

## 本仓库原创实现

- `aurora-background`、`cursor-follow`、`glass-card`、`neon-button`、`spinner`、`parallax`、`starfield`、`wave-background`、`noise-gradient`、`globe-sphere`、`cursor-trail`、`perspective-card`、`gooey-button`、`floating-navbar`、`animated-sidebar`、`page-transition`、`tree-view`、`onboarding-tour`

完整 MIT / Apache-2.0 许可文本见各上游仓库的 LICENSE 文件、`licenses/apache/paper-shaders/`，以及本仓库 `LICENSE`。
