// @vitest-environment jsdom

import { MotionGlobalConfig } from "motion"
import { afterEach, beforeEach, expect, test, vi } from "vitest"
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react"
import "@testing-library/jest-dom/vitest"

MotionGlobalConfig.skipAnimations = true

import { CosmicButton } from "./cosmic-button"
import { FlickerReflectButton } from "./flicker-reflect-button"
import { FlyAroundButton } from "./fly-around-button"
import { GlowTrackButton } from "./glow-track-button"
import { NeumorphButton } from "./neumorph-button"
import { PrinterIconButton } from "./printer-icon-button"
import { ScrollCueButton } from "./scroll-cue-button"
import { SplitButton } from "./split-button"
import { StatefulButton } from "./stateful-button"
import { TiltSweepButton } from "./tilt-sweep-button"

let reduceMotion = false

function media(query: string) {
  return {
    matches: query.includes("prefers-reduced-motion") ? reduceMotion : false,
    media: query,
    addEventListener() {},
    removeEventListener() {},
    addListener() {},
    removeListener() {},
    dispatchEvent() {
      return false
    },
  }
}

beforeEach(() => {
  reduceMotion = false
  vi.stubGlobal("matchMedia", media)
  vi.stubGlobal(
    "IntersectionObserver",
    class {
      private readonly callback: IntersectionObserverCallback

      constructor(callback: IntersectionObserverCallback) {
        this.callback = callback
      }

      observe(target: Element) {
        this.callback([{ isIntersecting: true, intersectionRatio: 1, target } as IntersectionObserverEntry], this as unknown as IntersectionObserver)
      }

      unobserve() {}
      disconnect() {}
      takeRecords() {
        return []
      }
    },
  )
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  )
  HTMLElement.prototype.scrollIntoView = () => {}
})

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
  vi.useRealTimers()
})

function slot(container: HTMLElement, name: string) {
  const node = container.querySelector(`[data-slot="${name}"]`)
  expect(node).not.toBeNull()
  return node as HTMLElement
}

test("滚动提示点到目标", () => {
  const target = document.createElement("p")
  target.id = "scroll-cue-end"
  const scrollIntoView = vi.fn()
  target.scrollIntoView = scrollIntoView
  document.body.append(target)
  const view = render(<ScrollCueButton autoPlay label="Scroll" targetId="scroll-cue-end" />)
  const link = screen.getByRole("link", { name: "Scroll" })
  expect(link).toHaveAttribute("href", "#scroll-cue-end")
  expect(link).toHaveAttribute("data-autoplay", "true")
  fireEvent.click(link)
  expect(scrollIntoView).toHaveBeenCalled()
  expect(slot(view.container, "scroll-cue-button")).toHaveAttribute("data-reduced", "false")
  target.remove()
})

test("滚动提示在减弱动效下立刻滚动", () => {
  reduceMotion = true
  const target = document.createElement("p")
  target.id = "scroll-cue-end"
  const scrollIntoView = vi.fn()
  target.scrollIntoView = scrollIntoView
  document.body.append(target)
  const view = render(<ScrollCueButton autoPlay label="Scroll" targetId="scroll-cue-end" />)
  fireEvent.click(screen.getByRole("link", { name: "Scroll" }))
  expect(scrollIntoView).toHaveBeenCalledWith({ behavior: "auto" })
  expect(slot(view.container, "scroll-cue-button")).toHaveAttribute("data-reduced", "true")
  target.remove()
})

test("闪烁倒影显示按钮文字", () => {
  const view = render(<FlickerReflectButton flicker glowColor="#1f4c65">Button</FlickerReflectButton>)
  expect(screen.getByRole("button", { name: "Button" })).toBeInTheDocument()
  expect(slot(view.container, "flicker-reflect-button")).toHaveAttribute("data-reduced", "false")
})

test("闪烁倒影在减弱动效下仍显示文字", () => {
  reduceMotion = true
  const view = render(<FlickerReflectButton flicker glowColor="#1f4c65">Button</FlickerReflectButton>)
  expect(screen.getByRole("button", { name: "Button" })).toBeInTheDocument()
  expect(slot(view.container, "flicker-reflect-button")).toHaveAttribute("data-reduced", "true")
})

test("打印按钮用读屏名称响应点击", () => {
  const onClick = vi.fn()
  const view = render(<PrinterIconButton color="#00104b" label="打印" onClick={onClick} />)
  fireEvent.click(screen.getByRole("button", { name: "打印" }))
  expect(onClick).toHaveBeenCalledOnce()
  expect(slot(view.container, "printer-icon-button")).toHaveAttribute("data-reduced", "false")
})

test("打印按钮在减弱动效下仍能点击", () => {
  reduceMotion = true
  const onClick = vi.fn()
  const view = render(<PrinterIconButton color="#00104b" label="打印" onClick={onClick} />)
  fireEvent.click(screen.getByRole("button", { name: "打印" }))
  expect(onClick).toHaveBeenCalledOnce()
  expect(slot(view.container, "printer-icon-button")).toHaveAttribute("data-reduced", "true")
})

test("倾斜扫光显示按钮文字", () => {
  const view = render(
    <TiltSweepButton from="#99fff8" to="hsla(13, 63%, 73%, 1)">
      点我
    </TiltSweepButton>,
  )
  expect(screen.getByRole("button", { name: "点我" })).toBeInTheDocument()
  expect(slot(view.container, "tilt-sweep-button")).toHaveAttribute("data-reduced", "false")
})

test("倾斜扫光在减弱动效下仍显示文字", () => {
  reduceMotion = true
  const view = render(
    <TiltSweepButton from="#99fff8" to="hsla(13, 63%, 73%, 1)">
      点我
    </TiltSweepButton>,
  )
  expect(screen.getByRole("button", { name: "点我" })).toBeInTheDocument()
  expect(slot(view.container, "tilt-sweep-button")).toHaveAttribute("data-reduced", "true")
})

test("飞起图标按钮可以点击", () => {
  const onClick = vi.fn()
  const view = render(
    <FlyAroundButton icon={<span aria-hidden>↑</span>} onClick={onClick}>
      发送消息
    </FlyAroundButton>,
  )
  fireEvent.click(screen.getByRole("button", { name: "发送消息" }))
  expect(onClick).toHaveBeenCalledOnce()
  expect(slot(view.container, "fly-around-button")).toHaveAttribute("data-reduced", "false")
})

test("飞起图标按钮在减弱动效下仍能点击", () => {
  reduceMotion = true
  const onClick = vi.fn()
  const view = render(
    <FlyAroundButton icon={<span aria-hidden>↑</span>} onClick={onClick}>
      发送消息
    </FlyAroundButton>,
  )
  fireEvent.click(screen.getByRole("button", { name: "发送消息" }))
  expect(onClick).toHaveBeenCalledOnce()
  expect(slot(view.container, "fly-around-button")).toHaveAttribute("data-reduced", "true")
})

test("星图按钮是指向地址的链接", () => {
  const view = render(<CosmicButton href="#cosmic">进入星图</CosmicButton>)
  expect(screen.getByRole("link", { name: "进入星图" })).toHaveAttribute("href", "#cosmic")
  expect(slot(view.container, "cosmic-button")).toHaveAttribute("data-reduced", "false")
})

test("星图按钮在减弱动效下仍是链接", () => {
  reduceMotion = true
  const view = render(<CosmicButton href="#cosmic">进入星图</CosmicButton>)
  expect(screen.getByRole("link", { name: "进入星图" })).toHaveAttribute("href", "#cosmic")
  expect(slot(view.container, "cosmic-button")).toHaveAttribute("data-reduced", "true")
})

test("跟随光斑渲染成链接", () => {
  const view = render(<GlowTrackButton backgroundColor="#d1d1d1" glowColor="#FFAA81" href="#glow" text="跟着光走" textColor="#1c1917" />)
  expect(screen.getByRole("link", { name: "跟着光走" })).toHaveAttribute("href", "#glow")
  expect(slot(view.container, "glow-track-button")).toHaveAttribute("data-reduced", "false")
})

test("跟随光斑在减弱动效下仍是链接", () => {
  reduceMotion = true
  const view = render(<GlowTrackButton backgroundColor="#d1d1d1" glowColor="#FFAA81" href="#glow" text="跟着光走" textColor="#1c1917" />)
  expect(screen.getByRole("link", { name: "跟着光走" })).toHaveAttribute("href", "#glow")
  expect(slot(view.container, "glow-track-button")).toHaveAttribute("data-reduced", "true")
})

test("拟态按钮第一颗可点，加载中的那颗禁用", () => {
  const view = render(
    <div>
      <NeumorphButton buttonSize="medium" fullWidth={false} intent="primary">
        保存
      </NeumorphButton>
      <NeumorphButton intent="danger" loading>
        提交中
      </NeumorphButton>
    </div>,
  )
  expect(screen.getByRole("button", { name: "保存" })).toBeEnabled()
  expect(screen.getByRole("button", { name: "提交中" })).toBeDisabled()
  expect(slot(view.container, "neumorph-button")).toHaveAttribute("data-reduced", "false")
})

test("拟态按钮在减弱动效下仍区分加载", () => {
  reduceMotion = true
  const view = render(
    <div>
      <NeumorphButton buttonSize="medium" fullWidth={false} intent="primary">
        保存
      </NeumorphButton>
      <NeumorphButton intent="danger" loading>
        提交中
      </NeumorphButton>
    </div>,
  )
  expect(screen.getByRole("button", { name: "保存" })).toBeEnabled()
  expect(screen.getByRole("button", { name: "提交中" })).toBeDisabled()
  expect(slot(view.container, "neumorph-button")).toHaveAttribute("data-reduced", "true")
})

test("状态按钮兑现后进入成功", async () => {
  const view = render(
    <StatefulButton errorText="失败" onClick={() => Promise.resolve()} successText="完成">
      保存更改
    </StatefulButton>,
  )
  const button = screen.getByRole("button", { name: "保存更改" })
  expect(button).toHaveAttribute("data-state", "idle")
  await act(async () => {
    fireEvent.click(button)
  })
  expect(button).toHaveAttribute("data-state", "success")
  expect(button).toHaveTextContent("完成")
  expect(slot(view.container, "stateful-button")).toHaveAttribute("data-reduced", "false")
})

test("状态按钮在减弱动效下仍进入成功", async () => {
  reduceMotion = true
  const view = render(
    <StatefulButton errorText="失败" onClick={() => Promise.resolve()} successText="完成">
      保存更改
    </StatefulButton>,
  )
  const button = screen.getByRole("button", { name: "保存更改" })
  await act(async () => {
    fireEvent.click(button)
  })
  expect(button).toHaveAttribute("data-state", "success")
  expect(slot(view.container, "stateful-button")).toHaveAttribute("data-reduced", "true")
})

test("分裂按钮主操作会触发点击", () => {
  const onClick = vi.fn()
  const view = render(
    <SplitButton
      label="发送"
      actions={[
        { label: "定时发送", onSelect: () => undefined },
        { label: "丢弃草稿", destructive: true, onSelect: () => undefined },
      ]}
      onClick={onClick}
    />,
  )
  fireEvent.click(screen.getByRole("button", { name: "发送" }))
  expect(onClick).toHaveBeenCalledOnce()
  expect(slot(view.container, "split-button")).toHaveAttribute("data-reduced", "false")
})

test("分裂按钮在减弱动效下仍能点击", () => {
  reduceMotion = true
  const onClick = vi.fn()
  const view = render(
    <SplitButton
      label="发送"
      actions={[{ label: "定时发送", onSelect: () => undefined }]}
      onClick={onClick}
    />,
  )
  fireEvent.click(screen.getByRole("button", { name: "发送" }))
  expect(onClick).toHaveBeenCalledOnce()
  expect(slot(view.container, "split-button")).toHaveAttribute("data-reduced", "true")
})
