# Effect 参数词汇表

维护者约定，给 Effect 的可调 props 起名用。不写进 `CONTEXT.md`。

控件分组的代码在 `apps/docs/lib/preview-controls.ts` 的 `namedGroups`。省略 `group` 时，表里没有的名字归「外观」。标成「动画」或「交互」的词必须在 `namedGroups` 里，否则会错进外观。`scale` 和 `angle` 归外观，省略 `group` 就是对的。

## 规则

- 新 prop 一律可选。不传时的渲染结果和升级前一致。
- 已有 prop 不改名、不删除、不改变含义。名字不在本表里也保持原样。
- 新的 `color` / `colors` 不传时，继续用这个组件现在的着色。
  - 现在跟着主题 token 的，继续跟 token。控件的 Start value 省略，也就是「跟随主题」，demo 不收到这个 prop。
  - 现在写死了调色板的，默认值写成那组色值，不改成主题 token。不传和传这组默认值的结果相同。控件 Start value 用这组色值。
- 已发布控件的 Start value 保持不动。其余控件的 Start value 等于默认值，打开文档页就是不传 prop 的样子。
- 只有一个组件用到的概念，名字写在那个组件的清单上，不进本表。第二个组件要用同一个概念时再补一行。
- props 按本仓库组件自己的行为来定，不对照 React Bits 的 props 表。见 #40。
- 控件只有 `range`、`select`、`color`、`colors`、`boolean`、`text`。`colors` 的个数固定，等于 Start value 的长度。

## 词

| 词 | 类型 | 单位 | 取值范围 | 默认 | 分组 |
| --- | --- | --- | --- | --- | --- |
| `duration` | number | 毫秒 | 控件大约是现在时长的 0.4 倍到 2 倍。具体见组件清单 | 组件现在的时长 | 动画 |
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

已经存在的滑杆沿用它现在的最小值、最大值和步长，不用上表的控件范围。
