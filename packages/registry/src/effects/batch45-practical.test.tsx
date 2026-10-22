// @vitest-environment jsdom

import { afterEach, expect, test, vi } from "vitest"
import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import "@testing-library/jest-dom/vitest"

import { BrushChart } from "./brush-chart"
import { FloatingButtonGroup } from "./floating-button-group"
import { InlineEdit } from "./inline-edit"
import { MorphSelect } from "./morph-select"
import { PasswordField } from "./password-field"
import { Ridgeline } from "./ridgeline"
import { ShortcutRecorder } from "./shortcut-recorder"
import { SlopeChart } from "./slope-chart"
import { SplitButton } from "./split-button"
import { Streamgraph } from "./streamgraph"
import { ThemeSwitch } from "./theme-switch-transitions"
import { Treemap } from "./treemap"
import { UserMenu } from "./user-menu"
import { WaffleChart } from "./waffle-chart"

let reduceMotion = false

afterEach(() => {
  cleanup()
  reduceMotion = false
})

class IntersectingObserver {
  private readonly callback: IntersectionObserverCallback

  constructor(callback: IntersectionObserverCallback) {
    this.callback = callback
  }

  observe(target: Element) {
    this.callback(
      [{ isIntersecting: true, intersectionRatio: 1, target } as IntersectionObserverEntry],
      this as unknown as IntersectionObserver,
    )
  }

  unobserve() {}
  disconnect() {}
  takeRecords() {
    return []
  }
}

class SizeObserver {
  constructor(private readonly callback: ResizeObserverCallback) {}

  observe(target: Element) {
    const box = target.getBoundingClientRect()
    this.callback(
      [{ target, contentRect: { x: box.x, y: box.y, width: box.width, height: box.height, top: box.top, left: box.left, bottom: box.bottom, right: box.right, toJSON() { return {} } } } as ResizeObserverEntry],
      this as unknown as ResizeObserver,
    )
  }

  unobserve() {}
  disconnect() {}
}

vi.stubGlobal("IntersectionObserver", IntersectingObserver)
vi.stubGlobal("ResizeObserver", SizeObserver)
vi.stubGlobal("matchMedia", (query: string) => ({
  matches: query.includes("prefers-reduced-motion") ? reduceMotion : false,
  media: query,
  addEventListener() {},
  removeEventListener() {},
  addListener() {},
  removeListener() {},
  dispatchEvent() {
    return false
  },
}))

const days = [
  { key: "d1", label: "第一天", axisLabel: "1", values: { mail: 8, chat: 4 } },
  { key: "d2", label: "第二天", axisLabel: "2", values: { mail: 5, chat: 9 } },
]

test("减弱动效时图表和控件保持可读", () => {
  reduceMotion = true
  const { container } = render(
    <div>
      <ThemeSwitch iconOnly label="切换主题" theme="light" onThemeChange={() => undefined} />
      <Streamgraph
        label="工单来源"
        data={days}
        series={[
          { key: "mail", label: "邮件" },
          { key: "chat", label: "会话" },
        ]}
      />
      <WaffleChart
        label="发电构成"
        data={[
          { key: "water", label: "水电", value: 3 },
          { key: "wind", label: "风电", value: 1 },
        ]}
      />
      <Treemap
        label="营收"
        data={{
          id: "all",
          label: "全部",
          children: [
            { id: "east", label: "华东", value: 4 },
            { id: "south", label: "华南", value: 2 },
          ],
        }}
      />
      <SlopeChart
        label="转化率"
        startLabel="一季度"
        endLabel="二季度"
        data={[{ key: "search", label: "搜索", start: 1, end: 2 }]}
      />
      <Ridgeline label="每日气温" series={[{ id: "jan", label: "一月", values: [1, 2, 3, 2] }]} />
      <BrushChart
        label="日活"
        data={[
          { date: Date.UTC(2024, 0, 1), value: 2 },
          { date: Date.UTC(2024, 0, 8), value: 5 },
        ]}
      />
      <PasswordField label="密码" defaultValue="secret" />
    </div>,
  )
  for (const slot of [
    "theme-switch-transitions",
    "streamgraph",
    "waffle-chart",
    "treemap",
    "slope-chart",
    "ridgeline",
    "brush-chart",
    "password-field",
  ]) {
    expect(container.querySelector(`[data-slot=${slot}]`)).toHaveAttribute("data-reduced", "true")
  }
  const titles = [...container.querySelectorAll("title")].map((node) => node.textContent)
  expect(titles).toEqual(expect.arrayContaining(["工单来源", "发电构成", "营收", "每日气温", "日活"]))
  expect(screen.getByText(/转化率, 一季度 to 二季度/)).toBeInTheDocument()
  expect(screen.getByRole("button", { name: "切换主题" })).toHaveAttribute("aria-pressed", "false")
  expect(screen.getByLabelText("密码")).toHaveAttribute("type", "password")
})

test("主题、选择、拆分按钮和密码可以操作", () => {
  const onThemeChange = vi.fn()
  const onValueChange = vi.fn()
  const onClick = vi.fn()
  const onSelect = vi.fn()
  const onAction = vi.fn()
  render(
    <div>
      <ThemeSwitch label="切换主题" theme="light" onThemeChange={onThemeChange} />
      <MorphSelect
        label="城市"
        items={[
          { value: "song", label: "上海" },
          { value: "guang", label: "广州" },
        ]}
        onValueChange={onValueChange}
      />
      <SplitButton label="发送" actions={[{ label: "丢弃草稿", onSelect }]} onClick={onClick} />
      <FloatingButtonGroup
        label="编辑"
        items={[{ id: "bold", label: "加粗" }]}
        onAction={onAction}
      />
      <PasswordField label="密码" defaultValue="secret" />
    </div>,
  )
  fireEvent.click(screen.getByRole("button", { name: "切换主题" }))
  expect(onThemeChange).toHaveBeenCalledWith("dark", "reveal", expect.any(HTMLElement))
  fireEvent.click(screen.getByRole("combobox", { name: "城市" }))
  fireEvent.click(screen.getByRole("option", { name: "广州" }))
  expect(onValueChange).toHaveBeenCalledWith("guang", expect.objectContaining({ label: "广州" }))
  fireEvent.click(screen.getByRole("button", { name: "发送" }))
  expect(onClick).toHaveBeenCalled()
  fireEvent.click(screen.getByRole("button", { name: "加粗" }))
  expect(onAction).toHaveBeenCalledWith("bold")
  fireEvent.click(screen.getByRole("button", { name: "Show password" }))
  expect(screen.getByLabelText("密码")).toHaveAttribute("type", "text")
})

test("快捷键、就地编辑和账号菜单会报告变化", async () => {
  const user = userEvent.setup()
  const onValueChange = vi.fn()
  const onSave = vi.fn()
  const onSignOut = vi.fn()
  render(
    <div>
      <ShortcutRecorder label="打开命令" platform="other" value={null} onValueChange={onValueChange} />
      <InlineEdit label="项目名称" value="北窗" onSave={onSave} />
      <UserMenu
        portal={false}
        user={{ name: "林夏", email: "lin@example.com" }}
        items={[{ label: "账户设置" }]}
        onSignOut={onSignOut}
      />
    </div>,
  )
  const recorder = screen.getByRole("button", { name: /打开命令/ })
  await user.click(recorder)
  await user.keyboard("{Control>}k{/Control}")
  expect(onValueChange).toHaveBeenCalled()
  await user.click(screen.getByRole("button", { name: "项目名称: 北窗" }))
  const field = screen.getByRole("textbox", { name: "项目名称" })
  await user.clear(field)
  await user.type(field, "南窗{Enter}")
  expect(onSave).toHaveBeenCalledWith("南窗")
  await user.click(screen.getByRole("button", { name: /Account menu, 林夏/ }))
  await user.click(screen.getByRole("menuitem", { name: "Sign out" }))
  expect(onSignOut).toHaveBeenCalled()
})
