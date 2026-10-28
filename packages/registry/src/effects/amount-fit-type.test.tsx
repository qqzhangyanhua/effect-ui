// @vitest-environment jsdom

import { act } from "react"
import { afterEach, beforeEach, expect, test, vi } from "vitest"
import { cleanup, fireEvent, render } from "@testing-library/react"
import "@testing-library/jest-dom/vitest"

import { getComponent } from "../catalog"
import { AmountFitType } from "./amount-fit-type"

class IntersectingObserver {
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
}

class SilentObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() {
    return []
  }
}

const queued = new Map<number, FrameRequestCallback>()
let nextFrame = 1

function installFrames() {
  queued.clear()
  nextFrame = 1
  vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => {
    const id = nextFrame
    nextFrame += 1
    queued.set(id, callback)
    return id
  })
  vi.stubGlobal("cancelAnimationFrame", (id: number) => {
    queued.delete(id)
  })
}

function drain(max: number) {
  for (let i = 0; i < max; i += 1) {
    const batch = [...queued.values()]
    queued.clear()
    if (batch.length === 0) return
    for (const callback of batch) callback(0)
  }
}

function installMedia(options: { reduced?: boolean } = {}) {
  vi.stubGlobal("matchMedia", (query: string) => ({
    matches: options.reduced === true && query.includes("prefers-reduced-motion"),
    media: query,
    addEventListener() {},
    removeEventListener() {},
    addListener() {},
    removeListener() {},
    dispatchEvent() {
      return false
    },
    onchange: null,
  }))
}

function start(prop: string) {
  const entry = getComponent("amount-fit-type")
  const found = entry?.props.find((item) => item.name === prop)
  if (!found?.control || !("value" in found.control)) throw new Error(prop)
  return found.control.value
}

function rootOf(container: HTMLElement) {
  const node = container.querySelector("[data-slot='amount-fit-type']")
  if (!(node instanceof HTMLElement)) throw new Error("missing amount")
  return node
}

beforeEach(() => {
  installMedia()
  vi.stubGlobal("IntersectionObserver", IntersectingObserver)
  installFrames()
})

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

test("金额控件起始值等于默认，短数字用满上限", () => {
  expect(getComponent("amount-fit-type")?.batch).toBe(70)
  expect(getComponent("amount-fit-type")?.effectCategory).toBe("text")
  expect(start("pace")).toBe(1)
  expect(start("intensity")).toBe(0.65)
  expect(start("currency")).toBe("$")
  expect(start("maxDigits")).toBe(8)
  const view = render(<AmountFitType />)
  const root = rootOf(view.container)
  expect(root).toHaveAttribute("data-ritual", "amount-fit")
  expect(root).toHaveAttribute("data-pace", "1")
  expect(root).toHaveAttribute("data-intensity", "0.65")
  expect(root).toHaveAttribute("data-currency", "$")
  expect(root).toHaveAttribute("data-max-digits", "8")
  expect(root).toHaveAttribute("data-digits", "")
  expect(root).toHaveAttribute("data-fit", "max")
  expect(root).toHaveAttribute("data-state", "idle")
  expect(root).toHaveAttribute("data-motion", "on")
  expect(root.className).toContain("motion-reduce:transition-none")
  expect(root.getAttribute("data-size")).toBe(root.getAttribute("data-max"))
  expect(view.getByRole("textbox", { name: "金额" })).toHaveTextContent("$0.00")
})

test("长数字缩小，清空后回到上限", () => {
  const onValueChange = vi.fn()
  const view = render(<AmountFitType onValueChange={onValueChange} />)
  const root = rootOf(view.container)
  const max = Number(root.getAttribute("data-max"))
  fireEvent.click(view.getByRole("button", { name: "填入长数字" }))
  expect(root.getAttribute("data-digits")).toBe("88888888")
  expect(Number(root.getAttribute("data-size"))).toBeLessThan(max)
  expect(root).toHaveAttribute("data-fit", "shrink")
  expect(onValueChange).toHaveBeenCalledWith("88888888")
  fireEvent.click(view.getByRole("button", { name: "清空" }))
  expect(root).toHaveAttribute("data-digits", "")
  expect(root).toHaveAttribute("data-fit", "max")
  expect(Number(root.getAttribute("data-size"))).toBe(max)
  expect(view.getByRole("textbox", { name: "金额" })).toHaveTextContent("$0.00")
})

test("键盘输入数字和退格，超过位数会被挡住", () => {
  const view = render(<AmountFitType maxDigits={4} />)
  const root = rootOf(view.container)
  const box = view.getByRole("textbox", { name: "金额" })
  fireEvent.keyDown(box, { key: "1" })
  fireEvent.keyDown(box, { key: "2" })
  expect(root).toHaveAttribute("data-digits", "12")
  expect(box).toHaveTextContent("$12")
  fireEvent.keyDown(box, { key: "Backspace" })
  expect(root).toHaveAttribute("data-digits", "1")
  fireEvent.click(view.getByRole("button", { name: "数字 9" }))
  fireEvent.click(view.getByRole("button", { name: "数字 9" }))
  fireEvent.click(view.getByRole("button", { name: "数字 9" }))
  fireEvent.click(view.getByRole("button", { name: "数字 9" }))
  expect(root.getAttribute("data-digits")?.length).toBe(4)
  fireEvent.click(view.getByRole("button", { name: "退格" }))
  expect(root.getAttribute("data-digits")?.length).toBe(3)
})

test("减弱动效瞬时改字号", () => {
  installMedia({ reduced: true })
  const view = render(<AmountFitType />)
  const root = rootOf(view.container)
  expect(root).toHaveAttribute("data-motion", "off")
  expect(root).toHaveAttribute("data-ease", "0")
  expect(root.className).toContain("motion-reduce:transition-none")
  const max = Number(root.getAttribute("data-max"))
  fireEvent.click(view.getByRole("button", { name: "填入长数字" }))
  expect(Number(root.getAttribute("data-size"))).toBeLessThan(max)
  expect(root).toHaveAttribute("data-state", "idle")
  expect(queued.size).toBe(0)
  fireEvent.click(view.getByRole("button", { name: "清空" }))
  expect(Number(root.getAttribute("data-size"))).toBe(max)
  expect(queued.size).toBe(0)
  act(() => drain(4))
  expect(queued.size).toBe(0)
})

test("货币符号跟着预设，离开视口不排帧", () => {
  vi.stubGlobal("IntersectionObserver", SilentObserver)
  const view = render(<AmountFitType currency="£" />)
  const root = rootOf(view.container)
  expect(root).toHaveAttribute("data-currency", "£")
  expect(root).toHaveAttribute("data-live", "off")
  expect(view.getByRole("textbox", { name: "金额" })).toHaveTextContent("£0.00")
  fireEvent.click(view.getByRole("button", { name: "数字 3" }))
  expect(root).toHaveAttribute("data-digits", "3")
  expect(root).toHaveAttribute("data-state", "idle")
  expect(queued.size).toBe(0)
})
