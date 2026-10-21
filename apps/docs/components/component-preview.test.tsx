// @vitest-environment jsdom

import { useState } from "react"
import { afterEach, beforeAll, beforeEach, expect, test } from "vitest"
import { cleanup, render, screen, waitFor, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import "@testing-library/jest-dom/vitest"

import type { ControlGroup } from "@effect-ui/registry/catalog"

import { ComponentPreview } from "./component-preview"
import type { ControlField } from "./control-panel"

beforeAll(() => {
  class ResizeObserverStub {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
  globalThis.ResizeObserver = ResizeObserverStub
  Element.prototype.scrollIntoView = () => {}
  if (!Element.prototype.hasPointerCapture) Element.prototype.hasPointerCapture = () => false
  if (!Element.prototype.setPointerCapture) Element.prototype.setPointerCapture = () => {}
  if (!Element.prototype.releasePointerCapture) Element.prototype.releasePointerCapture = () => {}
})

let mounts = 0

function Demo(props: Record<string, unknown>) {
  const mount = useState(() => {
    mounts += 1
    return mounts
  })[0]
  const shown = Object.fromEntries(Object.entries(props).filter(([, value]) => value !== undefined))
  return (
    <>
      <output aria-label="挂载">{mount}</output>
      <output aria-label="参数">{JSON.stringify(shown)}</output>
    </>
  )
}

beforeEach(() => {
  mounts = 0
})

afterEach(() => {
  cleanup()
})

function renderPreview(controls: readonly ControlField[], componentName = "Aurora") {
  const user = userEvent.setup()
  render(<ComponentPreview Demo={Demo} componentName={componentName} controls={controls} />)
  return user
}

function params() {
  return screen.getByLabelText("参数").textContent ?? ""
}

function snippet() {
  return screen.getByLabelText("当前配置").textContent ?? ""
}

function flag(name: string, group?: ControlGroup): ControlField {
  const control = group
    ? { kind: "boolean" as const, value: false, group }
    : { kind: "boolean" as const, value: false }
  return { name, control }
}

test("滑块、开关、文本和选项改值后，demo 收到新值", async () => {
  const user = renderPreview([
    { name: "speed", defaultValue: "1", control: { kind: "range", value: 1, min: 0, max: 4, step: 1 } },
    { name: "loop", defaultValue: "false", control: { kind: "boolean", value: false } },
    { name: "label", defaultValue: '"Hi"', control: { kind: "text", value: "Hi" } },
    { name: "direction", defaultValue: '"left"', control: { kind: "select", value: "left", options: ["left", "right"] } },
  ])

  expect(params()).toBe('{"speed":1,"loop":false,"label":"Hi","direction":"left"}')
  expect(snippet()).toBe("<Aurora />")

  await user.click(screen.getByRole("slider", { name: "speed" }))
  await user.keyboard("{ArrowRight}")
  expect(snippet()).toBe("<Aurora speed={2} />")
  await waitFor(() => {
    expect(params()).toContain('"speed":2')
  })

  await user.click(screen.getByRole("switch", { name: "loop" }))
  expect(params()).toContain('"loop":true')
  expect(snippet()).toContain("loop={true}")

  const label = screen.getByRole("textbox", { name: "label" })
  await user.clear(label)
  await user.type(label, "Hello")
  expect(params()).toContain('"label":"Hello"')
  expect(snippet()).toContain('label="Hello"')

  await user.click(screen.getByRole("combobox", { name: "direction" }))
  await user.click(await screen.findByRole("option", { name: "right" }))
  expect(params()).toContain('"direction":"right"')
  expect(snippet()).toContain('direction="right"')
})

test("colors 可以一开始跟随主题，关掉之后才把调色板传给 demo", async () => {
  const user = renderPreview([
    { name: "colors", control: { kind: "colors", value: ["#ff0000", "#00ff00"], follow: true } },
  ])

  expect(params()).toBe("{}")
  expect(snippet()).toBe("<Aurora />")
  expect(screen.getByRole("switch", { name: "colors 跟随主题" })).toBeChecked()

  await user.click(screen.getByRole("switch", { name: "colors 跟随主题" }))
  expect(params()).toBe('{"colors":["#ff0000","#00ff00"]}')
  expect(snippet()).toBe('<Aurora colors={["#ff0000", "#00ff00"]} />')
})

test("colors 的数量固定，改一个颜色只改那一项", async () => {
  const user = renderPreview([
    { name: "colors", control: { kind: "colors", value: ["#ff0000", "#00ff00"] } },
  ])

  expect(params()).toBe('{"colors":["#ff0000","#00ff00"]}')
  expect(snippet()).toBe('<Aurora colors={["#ff0000", "#00ff00"]} />')
  expect(screen.getAllByRole("textbox", { name: /colors 颜色 \d+/ })).toHaveLength(2)

  const second = screen.getByRole("textbox", { name: "colors 颜色 2" })
  await user.clear(second)
  await user.type(second, "#0000ff")

  expect(screen.getAllByRole("textbox", { name: /colors 颜色 \d+/ })).toHaveLength(2)
  expect(snippet()).toBe('<Aurora colors={["#ff0000", "#0000ff"]} />')
  await waitFor(() => {
    expect(params()).toBe('{"colors":["#ff0000","#0000ff"]}')
  })
})

test("跟随主题时 demo 收不到颜色，关掉之后才收到", async () => {
  const user = renderPreview([
    { name: "color", control: { kind: "color" } },
    { name: "colors", control: { kind: "colors", value: ["#ff0000", "#00ff00"] } },
  ])

  expect(params()).toBe('{"colors":["#ff0000","#00ff00"]}')
  expect(snippet()).toBe('<Aurora colors={["#ff0000", "#00ff00"]} />')
  expect(screen.getByRole("switch", { name: "color 跟随主题" })).toBeChecked()

  await user.click(screen.getByRole("switch", { name: "color 跟随主题" }))
  expect(params()).toContain('"color":"#000000"')
  expect(snippet()).toContain('color="#000000"')

  await user.click(screen.getByRole("switch", { name: "color 跟随主题" }))
  expect(JSON.parse(params())).toEqual({ colors: ["#ff0000", "#00ff00"] })
  expect(snippet()).toBe('<Aurora colors={["#ff0000", "#00ff00"]} />')

  await user.click(screen.getByRole("switch", { name: "colors 跟随主题" }))
  expect(params()).toBe("{}")
  expect(snippet()).toBe("<Aurora />")

  await user.click(screen.getByRole("switch", { name: "colors 跟随主题" }))
  expect(params()).toBe('{"colors":["#ff0000","#00ff00"]}')
  expect(snippet()).toBe('<Aurora colors={["#ff0000", "#00ff00"]} />')
})

test("超过 6 个 Control 才分组，推断和显式 group 都生效", () => {
  const six = ["speed", "duration", "direction", "trigger", "size", "gap"].map((name) => flag(name))
  const { unmount } = render(<ComponentPreview Demo={Demo} componentName="Aurora" controls={six} />)
  expect(screen.queryByRole("heading", { name: "外观" })).not.toBeInTheDocument()
  expect(screen.queryByRole("heading", { name: "动画" })).not.toBeInTheDocument()
  expect(screen.queryByRole("heading", { name: "交互" })).not.toBeInTheDocument()
  unmount()

  render(
    <ComponentPreview
      Demo={Demo}
      componentName="Aurora"
      controls={[flag("speed", "交互"), flag("duration"), flag("direction"), flag("trigger"), flag("size"), flag("gap"), flag("note")]}
    />,
  )
  const motion = screen.getByRole("region", { name: "动画" })
  const interaction = screen.getByRole("region", { name: "交互" })
  const appearance = screen.getByRole("region", { name: "外观" })
  expect(within(motion).getByRole("switch", { name: "duration" })).toBeInTheDocument()
  expect(within(motion).getByRole("switch", { name: "direction" })).toBeInTheDocument()
  expect(within(motion).queryByRole("switch", { name: "speed" })).not.toBeInTheDocument()
  expect(within(interaction).getByRole("switch", { name: "speed" })).toBeInTheDocument()
  expect(within(interaction).getByRole("switch", { name: "trigger" })).toBeInTheDocument()
  expect(within(appearance).getByRole("switch", { name: "size" })).toBeInTheDocument()
  expect(within(appearance).getByRole("switch", { name: "note" })).toBeInTheDocument()
})

test("重放会重新挂载 demo，参数保持当前值", async () => {
  const user = renderPreview([{ name: "loop", control: { kind: "boolean", value: false } }])
  await user.click(screen.getByRole("switch", { name: "loop" }))
  expect(screen.getByLabelText("挂载")).toHaveTextContent("1")
  expect(params()).toBe('{"loop":true}')

  await user.click(screen.getByRole("button", { name: "重放" }))
  expect(screen.getByLabelText("挂载")).toHaveTextContent("2")
  expect(params()).toBe('{"loop":true}')
})

test("主题和底纹切换反映在预览容器上", async () => {
  const user = renderPreview([{ name: "loop", control: { kind: "boolean", value: false } }])
  expect(screen.getByRole("region", { name: "组件预览，主题 跟随站点，底纹 无" })).toBeInTheDocument()

  await user.click(screen.getByRole("radio", { name: "亮" }))
  expect(screen.getByRole("region", { name: "组件预览，主题 亮，底纹 无" })).toBeInTheDocument()

  await user.click(screen.getByRole("radio", { name: "棋盘格" }))
  expect(screen.getByRole("region", { name: "组件预览，主题 亮，底纹 棋盘格" })).toBeInTheDocument()

  await user.click(screen.getByRole("radio", { name: "暗" }))
  await user.click(screen.getByRole("radio", { name: "网格" }))
  expect(screen.getByRole("region", { name: "组件预览，主题 暗，底纹 网格" })).toBeInTheDocument()
})

test("重置恢复全部 Start value", async () => {
  const user = renderPreview([
    { name: "speed", defaultValue: "1", control: { kind: "range", value: 1, min: 0, max: 4, step: 1 } },
    { name: "loop", defaultValue: "true", control: { kind: "boolean", value: true } },
    { name: "color", control: { kind: "color" } },
    { name: "colors", control: { kind: "colors", value: ["#ff0000", "#00ff00"] } },
  ])

  await user.click(screen.getByRole("slider", { name: "speed" }))
  await user.keyboard("{ArrowRight}")
  await user.click(screen.getByRole("switch", { name: "loop" }))
  await user.click(screen.getByRole("switch", { name: "color 跟随主题" }))
  const second = screen.getByRole("textbox", { name: "colors 颜色 2" })
  await user.clear(second)
  await user.type(second, "#0000ff")
  await waitFor(() => {
    expect(params()).toContain('"speed":2')
    expect(params()).toContain('"colors":["#ff0000","#0000ff"]')
  })

  await user.click(screen.getByRole("button", { name: "重置" }))
  expect(params()).toBe('{"speed":1,"loop":true,"colors":["#ff0000","#00ff00"]}')
  expect(snippet()).toBe('<Aurora colors={["#ff0000", "#00ff00"]} />')
  expect(screen.getByRole("switch", { name: "color 跟随主题" })).toBeChecked()
  expect(second).toHaveValue("#00ff00")
  expect(screen.getByRole("textbox", { name: "colors 颜色 1" })).toHaveValue("#ff0000")
})

test("没有 Control 的 demo 也有重放、主题和底纹", async () => {
  const user = userEvent.setup()
  render(<ComponentPreview Demo={Demo} />)

  expect(screen.getByRole("button", { name: "重放" })).toBeInTheDocument()
  expect(screen.getByRole("radio", { name: "跟随站点" })).toBeChecked()
  expect(screen.getByRole("radio", { name: "无" })).toBeChecked()
  expect(screen.queryByRole("button", { name: "重置" })).not.toBeInTheDocument()
  expect(screen.queryByLabelText("当前配置")).not.toBeInTheDocument()

  await user.click(screen.getByRole("radio", { name: "暗" }))
  expect(screen.getByRole("region", { name: "组件预览，主题 暗，底纹 无" })).toBeInTheDocument()

  expect(screen.getByLabelText("挂载")).toHaveTextContent("1")
  await user.click(screen.getByRole("button", { name: "重放" }))
  expect(screen.getByLabelText("挂载")).toHaveTextContent("2")
})
