# Effect 参数词汇表

维护者约定，给 Effect 的可调 props 起名用。不写进 `CONTEXT.md`。

控件分组由 `packages/registry/src/prop-vocabulary.ts` 的 `implicitControlGroup` 决定，文档页 `apps/docs/lib/preview-controls.ts` 直接用它。省略 `group` 时，表里没有的名字归「外观」。`text` 和 `children` 不是表里的词，省略 `group` 时归「文字」，并且排在该组最前。「文字」排在「外观」之前。标成「文字」「动画」或「交互」的词会进对应分组。`scale` 和 `angle` 归外观，省略 `group` 就是对的。只要有控件落在「文字」，文档页就显示分组，不必凑满 7 个控件。

## 规则

- 新 prop 一律可选。不传时的渲染结果和升级前一致。
- 已有 prop 不改名、不删除、不改变含义。名字不在本表里也保持原样。本表的单位只约束新 prop。已经存在的 `duration` 有的是毫秒、有的是秒，保持各自现在的单位。新的 `delay` 用毫秒。已经存在的 `delay` 有的是秒（例如 `split-text`、`count-up`），保持各自现在的单位。
- 新增的指针交互遵守四条：尊重减弱动效偏好；在触屏（`pointer: coarse`）上不依赖悬停；不传交互相关 prop 时与升级前一致；渲染阶段不碰 `window`，服务端渲染安全。
- 新的 `color` / `colors` 不传时，继续用这个组件现在的着色。
  - 现在跟着主题 token 的，继续跟 token。控件的 Start value 省略，也就是「跟随主题」，demo 不收到这个 prop。
  - 现在写死了调色板的，默认值写成那组色值，不改成主题 token。不传和传这组默认值的结果相同。控件 Start value 用这组色值。
- 已发布控件的 Start value 保持不动。
- 布尔开关和新建的 `delay`：Start value 等于组件默认值。`delay` 默认 0，`interactive` 默认 false。`loop` 默认 false，除非这个组件原来就在循环（`gradient-text` 默认 true）。
- 排版滑杆（`fontSize`、`fontWeight`、`letterSpacing`）的组件默认是不传、样式继承。滑杆必须有数字，所以 Start value 是文档演示用的具体数字，打开文档页会带上这些 prop，复制配置也会带上。这和「不传则继承」不冲突：安装后不写这些 prop，渲染仍和升级前一样。
- 只有一个组件用到的概念，名字写在那个组件的清单上，不进本表。第二个组件要用同一个概念时再补一行。
- 已发布的 prop 如果名字在本表里、但类型或取值改了就会破坏调用，在该 prop 上写 `vocabularyExemption`（非空说明）。audit 会跳过这个 prop 的一致性检查，不改它的名字和类型。
- props 按本仓库组件自己的行为来定，不对照 React Bits 的 props 表。见 #40。
- 控件只有 `range`、`select`、`color`、`colors`、`boolean`、`text`。`colors` 的个数固定，等于 Start value 的长度。

## 词

| 词 | 类型 | 单位 | 取值范围 | 默认 | 分组 |
| --- | --- | --- | --- | --- | --- |
| `duration` | number | 毫秒 | 控件大约是现在时长的 0.4 倍到 2 倍。具体见组件清单 | 组件现在的时长 | 动画 |
| `interval` | number | 毫秒 | 大于 0。控件大约是现在间隔的 0.4 倍到 2 倍。具体见组件清单 | 组件现在的间隔 | 动画 |
| `speed` | number | 倍率 | 0.25–2.5，步长 0.1。清单另写的除外 | `1`。已有绝对速度滑杆时用滑杆现值 | 动画 |
| `color` | string | CSS 颜色 | 任意 CSS 颜色，含变量。没有数值范围 | 不传，或见上面的着色规则 | 外观 |
| `colors` | string[] | CSS 颜色 | 同上。控件个数固定 | 同上 | 外观 |
| `intensity` | number | 无 | 0–1 | 组件现在的值，不一定是 1 | 外观 |
| `size` | number | 像素 | 正数，必须包住默认值。具体见组件清单。别的单位要在清单写明 | 组件现在的尺寸 | 外观 |
| `count` | number | 个 | 正整数，必须包住默认值。具体见组件清单 | 组件现在的个数 | 外观 |
| `gap` | number | 像素 | 大于等于 0，必须包住默认值。具体见组件清单 | 组件现在的间距 | 外观 |
| `direction` | `"left" \| "right" \| "up" \| "down"` | 无 | 这四个值 | 组件现在的方向 | 动画 |
| `trigger` | `"mount" \| "hover" \| "inView"` | 无 | 这三个值 | 组件现在的触发 | 交互 |
| `scale` | number | 倍率 | 0.5–2，步长 0.1。清单另写的除外 | `1` | 外观 |
| `angle` | number | 度 | 0–360。清单可以把安全区间收窄 | 组件现在的角度 | 外观 |
| `fontSize` | number | 像素 | 正数，必须包住默认演示值。具体见组件清单 | 不传则继承 | 文字 |
| `fontWeight` | number | 无 | 100–900，步长 100 | 不传则继承 | 文字 |
| `letterSpacing` | number | em | -0.1–0.5，步长 0.01 | 不传则继承 | 文字 |
| `align` | `"left" \| "center" \| "right"` | 无 | 这三个值。组件可以用子集 | 不传则不设置对齐 | 文字 |
| `delay` | number | 毫秒 | 大于等于 0。具体见组件清单。已有的秒单位不改 | 不传则不等待。已有组件保持原默认值 | 动画 |
| `loop` | boolean | 无 | 真或假 | 不传则播放一次，或该组件现在的行为 | 动画 |
| `interactive` | boolean | 无 | 真或假 | 不传则没有额外的指针行为 | 交互 |

已经存在的滑杆沿用它现在的最小值、最大值和步长，不用上表的控件范围。
