# 组件标准

Effect 和基础组件按这份标准验收。术语见 `CONTEXT.md`。`folder-float` 是 Effect 的范例：catalog 上有 Control，默认色用主题 token，减弱动效用 `usePrefersReducedMotion` 和 `motion-reduce:`，测试在 `packages/registry/src/effects/folder-float.test.tsx`。触屏上悬停不展开，点击才切换。

## 必须项

Effect（`effectCategories` 里的十二个分类）：

1. Catalog entry 写全导出的 prop。至少 3 个 Control。Demo 用带默认值的参数接收 Control，默认值等于 Start value。
2. 颜色、尺寸、时长可以通过 props 或 CSS 变量调节。颜色 prop 不传时使用主题 token。
3. 减弱动效用共享的 `usePrefersReducedMotion`，再加上 `motion-reduce:`。`requestAnimationFrame` 和 matter-js 在 JS 侧停下。
4. 有 jsdom 行为测试。测试要导入组件源码。
5. 触屏不依赖 hover。

Primitive、Composite component、Widget、Section、Hook、Lib 要有测试，并且 props 写全。不要求 Control，也不要求减弱动效。Template 不要求测试。

## 加分项

物理效果或拖拽手感。有手感档位时，catalog 上放 2 到 3 组 Preset。Preset 不是必须项，也不进审计。

## 约束

- 已发布组件只增不改。新 prop 可选，不传时渲染不变。不改名、不改用途、不改组件名，不改 Registry item 的形状。
- 新组件是 Original implementation。可以写「灵感来自」，不复制 Aceternity UI 或 React Bits 的代码。
- 不新增 Npm dependency，除非维护者事先同意。刚体碰撞用已有的 matter-js。
- 豁免名单不进 catalog，不进 Registry item，也不进安装接口。

## 豁免

旧组件的缺口写在 `packages/registry/src/audit-exemptions.ts`。每条有组件名、缺失项（`控件不足`、`缺减弱动效`、`缺测试`，可多选）和非空原因。名单里的组件只在列出的缺失项上不报错。

审计会报四种名单问题：

- 过期豁免：该项已经达标，条目还在。
- 未知名字：名字不在 catalog 里。
- Batch 34 及以后的组件出现在名单里。分界读条目上的 Batch 编号：34，以及 46 往后。36 到 45 在这道分界之前已经落地，仍允许豁免。
- 结构不合法：没有组件名、没有原因、没有缺失项，或缺失项不是上面三个值。

这四种条目都不能拿来压掉规则。Batch 34 以及 46 往后的组件必须直接达标，不能进名单。36 到 45 仍可以登记豁免。

补齐一个组件，就从名单删掉对应的缺失项。名单空了也不要删掉这个机制。
