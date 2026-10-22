# Agent Plan: Effect 审计规则与豁免名单

相关规格：GitHub #94，实现票 #99、#100、#101。术语见 `CONTEXT.md`（Effect、Catalog entry、Control、Registry item、Batch）。本计划只描述审计改动，不实现。

## Goal

在现有 registry 审计上增加三条规则，并用一份独立的豁免名单让现存缺口先保持审计为绿。新组件不能靠名单过关。名单不进 Catalog，也不进安装产物。

三条规则：

| 规则 | 判定 | 边界 |
| --- | --- | --- |
| 控件不足 | Effect 的 catalog entry 上带 Control 的 prop 少于 3 个 | 只作用于 `packages/registry/src/prop-vocabulary.ts` 里的 `effectCategories`（十二个分类）。`ui`、`utility`、`sections` 等基础组件不报。2 个 Control 报错，3 个不报。 |
| 缺减弱动效 | 源码有动画特征，但没有减弱动效特征 | 动画特征与减弱动效特征各一份集中列表，用源码文本匹配，不做语义分析。无动画特征的静态组件不报。有 `usePrefersReducedMotion`、`motion-reduce:` 或 `prefers-reduced-motion` 之一即不报。 |
| 缺测试 | 没有任何测试文件导入该组件源码 | Effect 与基础组件都适用。按 import 文本判断，不执行测试。 |

动画特征至少包括：`keyframes`、`transition` / `animate` 类、`requestAnimationFrame`、`matter-js`、motion 库。列表集中定义，方便以后加减，不散落在规则里。

## 豁免名单

新模块，独立于 catalog。建议路径 `packages/registry/src/audit-exemptions.ts`（或同级数据文件），由审计读取，不由 `buildRegistryItem` 读取。

每条记录：

- 组件名（必须是 catalog 里的名字）
- 缺失项：`控件不足`、`缺减弱动效`、`缺测试`，可多选
- 原因：非空字符串

四种报错：

1. **过期豁免**：某个缺失项已经达标，条目仍列出该项。
2. **未知名字**：名单里的名字不在 catalog 中。
3. **新组件进名单**：Batch 34 及以后新增的组件出现在名单里。Batch 34 的起点以该批第一次进入 catalog 的组件为准；名单生成脚本落地时记下这个分界，之后新增的名字一律不许出现。
4. **结构不合法**：缺失项为空、原因空白，或缺失项不是上面三个值。这种条目不能当成豁免。

名单里的组件，只在列出的缺失项上不报错。没列出的项仍然报错。

不进 catalog，不进 Registry item，不进 Registry index。`/r/[name]` 的响应形状、组件名、`target` 都不变。安装接口零变化。

## 首次落地

用一次性脚本扫描当前仓库，按上面三条规则的同一口径写出全部现存缺口，每条带原因（例如「落地前已有缺口」；确认为静态的组件原因写「无动画」）。脚本只负责生成名单，不改组件。审计和名单同一批提交，提交之后 `pnpm test` 为绿。

## Files Likely Involved

- `packages/registry/src/audit.ts`：三条规则与四种名单报错。
- `packages/registry/src/audit.test.ts`：构造 catalog entry 和源码文本，断言问题类型和组件名。
- `packages/registry/src/audit.repo.test.ts`：真实仓库在豁免之外零问题。
- 新文件：豁免名单，以及生成它的脚本（脚本放 `scripts/`，名单放 registry 源码，不放 catalog）。
- 新文档：组件标准（必须项、加分项、约束、豁免规则），以 `folder-float` 为范例。属 #99，不在本计划里改组件。
- 不改：`registry-item.ts`、`registry.json`、`apps/docs/public/r/`、`.github/workflows/ci.yml`、组件源码。

## Risks

- CI：不改 workflow。规则通过现有的 `pnpm test` 生效，CI 会因此变红或保持绿。名单和规则必须一起提交，否则全仓库审计变红。
- Generated files：本改动不重生 registry。若有人顺手改 catalog，才需要 `pnpm registry:build`。
- Public install surface：明确不改。名单泄漏进 Registry item 就是事故。
- 误报：静态组件若被动画特征列表命中，会大量报「缺减弱动效」。特征列表要先用当前仓库跑一遍，静态组件进名单并写「无动画」，或收紧特征。
- 新组件分界认错会把 Batch 34 放进名单，或把旧组件挡在名单外。分界写死在生成结果里，并有一条单测锁住。

已核对、本计划不涉及：许可记录、共享 alias、新的 Npm dependency。

## Plan

1. 写组件标准文档，范围只含必须项、加分项、约束、豁免规则。
2. 加名单模块和四种报错的单测（先红后绿）。
3. 加「缺测试」规则单测，再实现。#100、#101 再分别加控件与减弱动效规则。
4. 跑生成脚本，把现存缺口写入名单。
5. 仓库审计测试全绿后停。不在这一步补组件。

#98 在本文件写完并得到维护者评论批准之前，不开始 #99。

## Validation

- `./scripts/check.sh`（审计单测在 `pnpm test` 里，不必为了本计划跑 `--full`）。
- 手工：抽一条名单内组件确认对应项不报；改掉它的缺口后确认报过期豁免；确认 `apps/docs/public/r/` 与改动前一致。

## Rollback

规则和名单在同一提交里。回退就是还原该提交。还原后 `pnpm test` 回到旧审计，CI 不需要改 workflow。不要只删名单而留下规则，那会让 CI 变红。名单文件本身没有运行时入口，删掉它不会改变安装 JSON。
