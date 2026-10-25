// @vitest-environment jsdom

import { MotionGlobalConfig } from "motion"
import { afterEach, beforeEach, expect, test, vi } from "vitest"
import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import "@testing-library/jest-dom/vitest"

MotionGlobalConfig.skipAnimations = true

import { AIContextMeter } from "./ai-context-meter"
import { AIToolApproval, type ToolCall } from "./ai-tool-approval"
import { AnimatedBackground } from "./animated-background"
import { CoolMode } from "./cool-mode"
import { Disclosure, DisclosureContent, DisclosureTrigger } from "./disclosure"
import { FloatingPanel } from "./floating-panel"
import { LiquidGauge } from "./liquid-gauge"
import { PopoverForm } from "./popover-form"
import { RubberBandDrag } from "./rubber-band-drag"
import { SyncedTranscript } from "./synced-transcript"

let reduceMotion = false
const frames: FrameRequestCallback[] = []

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
  frames.length = 0
  HTMLElement.prototype.scrollTo = () => {}
  vi.stubGlobal("matchMedia", media)
  vi.stubGlobal(
    "IntersectionObserver",
    class {
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
  vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => {
    frames.push(callback)
    return frames.length
  })
  vi.stubGlobal("cancelAnimationFrame", () => {})
})

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

function slot(container: HTMLElement, name: string) {
  const node = container.querySelector(`[data-slot=${name}]`)
  expect(node).toBeTruthy()
  return node as HTMLElement
}

const call: ToolCall = {
  id: "1",
  tool: "bash",
  title: "Run a command",
  input: { command: "ls" },
  state: "approval-requested",
}

test("拖动橡皮筋节点会离开静止点", () => {
  const originalCtm = SVGSVGElement.prototype.getScreenCTM
  const originalCapture = Element.prototype.setPointerCapture
  class FakePoint {
    x: number
    y: number
    constructor(x = 0, y = 0) {
      this.x = x
      this.y = y
    }
    matrixTransform() {
      return this
    }
  }
  vi.stubGlobal("DOMPoint", FakePoint)
  SVGSVGElement.prototype.getScreenCTM = function getScreenCTM() {
    return { inverse() { return this } } as unknown as DOMMatrix
  }
  Element.prototype.setPointerCapture = () => {}
  try {
    render(<RubberBandDrag />)
    const node = screen.getByRole("button", { name: "拖拽节点" })
    expect(node).toHaveAttribute("cx", "280")
    fireEvent.pointerDown(node, { clientX: 300, clientY: 160, pointerId: 1 })
    fireEvent.pointerMove(node, { clientX: 360, clientY: 200, pointerId: 1 })
    expect(node.getAttribute("cx")).not.toBe("280")
  } finally {
    SVGSVGElement.prototype.getScreenCTM = originalCtm
    Element.prototype.setPointerCapture = originalCapture
    vi.unstubAllGlobals()
  }
})

test("减弱动效时松开橡皮筋不再排动画帧", () => {
  reduceMotion = true
  render(<RubberBandDrag />)
  fireEvent.pointerUp(screen.getByRole("button", { name: "拖拽节点" }))
  expect(frames).toHaveLength(0)
})

test("按住按钮会喷出粒子", () => {
  render(
    <CoolMode particle="✨">
      <button type="button">喷</button>
    </CoolMode>,
  )
  fireEvent.pointerDown(screen.getByRole("button", { name: "喷" }), { clientX: 20, clientY: 20 })
  expect(document.getElementById("effect-ui-cool-mode")?.childElementCount).toBeGreaterThan(0)
})

test("减弱动效时点击不产生粒子", () => {
  reduceMotion = true
  const view = render(
    <CoolMode particle="✨">
      <button type="button">喷</button>
    </CoolMode>,
  )
  fireEvent.pointerDown(screen.getByRole("button", { name: "喷" }), { clientX: 20, clientY: 20 })
  expect(slot(view.container, "cool-mode")).toHaveAttribute("data-reduced", "true")
  expect(document.getElementById("effect-ui-cool-mode")).toBeNull()
})

test("共享高亮跟着点击移动", () => {
  render(
    <AnimatedBackground defaultValue="one">
      <button type="button" data-id="one">其一</button>
      <button type="button" data-id="two">其二</button>
    </AnimatedBackground>,
  )
  fireEvent.click(screen.getByRole("button", { name: "其二" }))
  expect(screen.getByRole("button", { name: "其二" })).toHaveAttribute("data-checked", "true")
})

test("减弱动效时共享高亮直接停在选中项", () => {
  reduceMotion = true
  const view = render(
    <AnimatedBackground defaultValue="one">
      <button type="button" data-id="one">其一</button>
      <button type="button" data-id="two">其二</button>
    </AnimatedBackground>,
  )
  expect(slot(view.container, "animated-background")).toHaveAttribute("data-reduced", "true")
  expect(screen.getByRole("button", { name: "其一" })).toHaveAttribute("data-checked", "true")
})

test("折叠区可以展开", () => {
  render(
    <Disclosure>
      <DisclosureTrigger>展开说明</DisclosureTrigger>
      <DisclosureContent>
        <p>隐藏正文</p>
      </DisclosureContent>
    </Disclosure>,
  )
  fireEvent.click(screen.getByRole("button", { name: "展开说明" }))
  expect(screen.getByText("隐藏正文")).toBeInTheDocument()
})

test("减弱动效时折叠区立即展开", () => {
  reduceMotion = true
  const view = render(
    <Disclosure>
      <DisclosureTrigger>展开说明</DisclosureTrigger>
      <DisclosureContent>
        <p>隐藏正文</p>
      </DisclosureContent>
    </Disclosure>,
  )
  expect(slot(view.container, "disclosure")).toHaveAttribute("data-reduced", "true")
  fireEvent.click(screen.getByRole("button", { name: "展开说明" }))
  expect(screen.getByText("隐藏正文")).toBeInTheDocument()
})

test("表单按钮使用标题", () => {
  const view = render(<PopoverForm />)
  expect(screen.getByRole("button", { name: "留言" })).toBeInTheDocument()
  expect(slot(view.container, "popover-form").hasAttribute("data-reduced")).toBe(false)
})

test("减弱动效时表单按钮仍在", () => {
  reduceMotion = true
  const view = render(<PopoverForm label="留言" />)
  expect(slot(view.container, "popover-form")).toHaveAttribute("data-reduced", "true")
  expect(screen.getByRole("button", { name: "留言" })).toBeInTheDocument()
})

test("浮动面板可以打开", () => {
  render(
    <FloatingPanel button="打开面板" title="笔记">
      正文
    </FloatingPanel>,
  )
  fireEvent.click(screen.getByRole("button", { name: "打开面板" }))
  expect(screen.getByRole("dialog", { name: "笔记" })).toHaveTextContent("正文")
})

test("减弱动效时浮动面板标记为静止", () => {
  reduceMotion = true
  const view = render(
    <FloatingPanel button="打开面板" title="笔记">
      正文
    </FloatingPanel>,
  )
  expect(slot(view.container, "floating-panel")).toHaveAttribute("data-reduced", "true")
  expect(screen.getByRole("button", { name: "打开面板" })).toBeInTheDocument()
})

test("上下文用量显示模型名", () => {
  const view = render(<AIContextMeter />)
  expect(screen.getByText("Claude Opus")).toBeInTheDocument()
  expect(slot(view.container, "ai-context-meter")).toHaveAttribute("data-reduced", "false")
})

test("减弱动效时上下文用量仍显示模型名", () => {
  reduceMotion = true
  const view = render(<AIContextMeter model="Claude Opus" />)
  expect(slot(view.container, "ai-context-meter")).toHaveAttribute("data-reduced", "true")
  expect(screen.getByText("Claude Opus")).toBeInTheDocument()
})

test("工具批准可以拒绝", () => {
  const onRespond = vi.fn()
  render(<AIToolApproval calls={[call]} onRespond={onRespond} />)
  fireEvent.click(screen.getByRole("button", { name: "Deny" }))
  expect(onRespond).toHaveBeenCalledWith("1", false, false)
})

test("减弱动效时批准卡直接显示", () => {
  reduceMotion = true
  const view = render(<AIToolApproval calls={[call]} onRespond={() => {}} />)
  expect(slot(view.container, "ai-tool-approval")).toHaveAttribute("data-reduced", "true")
  expect(screen.getByText("Run a command")).toBeInTheDocument()
})

test("点击转录句子会跳到那一句", () => {
  render(
    <SyncedTranscript
      segments={[
        { speaker: "林", start: 0.2, end: 1.2, text: "第一句" },
        { speaker: "周", start: 2, end: 3, text: "第二句" },
      ]}
      title="逐词"
    />,
  )
  fireEvent.click(screen.getByRole("button", { name: /第二句/ }))
  expect(screen.getByRole("slider")).toHaveAttribute("aria-valuenow", "2")
})

test("减弱动效时转录不再平滑滚动", () => {
  reduceMotion = true
  const view = render(
    <SyncedTranscript
      segments={[{ speaker: "林", start: 0.2, end: 1.2, text: "第一句" }]}
      title="逐词"
    />,
  )
  expect(slot(view.container, "synced-transcript")).toHaveAttribute("data-reduced", "true")
  expect(screen.getByText("逐词")).toBeInTheDocument()
})

test("液位计显示当前读数", () => {
  const view = render(<LiquidGauge label="存储" />)
  expect(screen.getByRole("slider", { name: "存储" })).toHaveAttribute("aria-valuenow", "72")
  expect(slot(view.container, "liquid-gauge")).toHaveAttribute("data-reduced", "false")
})

test("减弱动效时液面停在目标高度", () => {
  reduceMotion = true
  const view = render(<LiquidGauge label="存储" />)
  expect(slot(view.container, "liquid-gauge")).toHaveAttribute("data-reduced", "true")
  expect(screen.getByRole("slider", { name: "存储" })).toHaveAttribute("aria-valuenow", "72")
})
