// @vitest-environment jsdom

import { afterEach, beforeEach, expect, test, vi } from "vitest"
import { cleanup, fireEvent, render } from "@testing-library/react"
import "@testing-library/jest-dom/vitest"

import { getComponent } from "../catalog"
import { PageCurlTurn } from "./page-curl-turn"

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
  const entry = getComponent("page-curl-turn")
  const found = entry?.props.find((item) => item.name === prop)
  if (!found?.control || !("value" in found.control)) throw new Error(prop)
  return found.control.value
}

function drag(handle: Element, from: { x: number; y: number }, to: { x: number; y: number }, release: boolean) {
  fireEvent.pointerDown(handle, { button: 0, pointerId: 4, clientX: from.x, clientY: from.y })
  fireEvent.pointerMove(handle, { pointerId: 4, clientX: to.x, clientY: to.y })
  if (release) fireEvent.pointerUp(handle, { pointerId: 4, clientX: to.x, clientY: to.y })
}

beforeEach(() => {
  installMedia()
})

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

test("翻页控件起始值等于默认", () => {
  expect(start("threshold")).toBe(0.42)
  expect(start("pace")).toBe(1)
  expect(start("curl")).toBe(36)
  const view = render(<PageCurlTurn />)
  const root = view.container.querySelector("[data-slot='page-curl-turn']")
  expect(root).toHaveAttribute("data-threshold", "0.42")
  expect(root).toHaveAttribute("data-pace", "1")
  expect(root).toHaveAttribute("data-curl", "36")
  expect(root).toHaveAttribute("data-page", "0")
  expect(root).toHaveAttribute("data-state", "rest")
  expect(view.getByRole("heading", { name: "晨页" })).toBeInTheDocument()
  expect(view.getByRole("button", { name: "Turn page" })).toBeInTheDocument()
})

test("拖过阈值才翻页，没过则回到原页", () => {
  const onTurn = vi.fn()
  const view = render(<PageCurlTurn onTurn={onTurn} />)
  const root = view.container.querySelector("[data-slot='page-curl-turn']") as HTMLElement
  const handle = root.querySelector("[data-curl-handle]") as HTMLElement
  drag(handle, { x: 200, y: 200 }, { x: 190, y: 190 }, false)
  expect(root).toHaveAttribute("data-state", "curling")
  expect(Number(root.getAttribute("data-progress"))).toBeLessThan(0.42)
  fireEvent.pointerUp(handle, { pointerId: 4, clientX: 190, clientY: 190 })
  expect(onTurn).not.toHaveBeenCalled()
  expect(root).toHaveAttribute("data-page", "0")
  expect(root).toHaveAttribute("data-state", "rest")
  drag(handle, { x: 200, y: 200 }, { x: 100, y: 100 }, true)
  expect(onTurn).toHaveBeenCalledTimes(1)
  expect(onTurn).toHaveBeenCalledWith(1)
  expect(root).toHaveAttribute("data-page", "1")
  expect(root).toHaveAttribute("data-state", "turned")
  expect(view.getByRole("heading", { name: "午页" })).toBeInTheDocument()
})

test("阈值更高时，同样的拖动不会翻页", () => {
  const onTurn = vi.fn()
  const held = render(<PageCurlTurn threshold={0.9} onTurn={onTurn} />)
  const handle = held.container.querySelector("[data-curl-handle]") as HTMLElement
  drag(handle, { x: 200, y: 200 }, { x: 150, y: 150 }, true)
  expect(onTurn).not.toHaveBeenCalled()
  expect(held.container.querySelector("[data-slot='page-curl-turn']")).toHaveAttribute("data-page", "0")
  held.unmount()
  const loose = render(<PageCurlTurn threshold={0.2} onTurn={onTurn} />)
  drag(loose.container.querySelector("[data-curl-handle]") as HTMLElement, { x: 200, y: 200 }, { x: 150, y: 150 }, true)
  expect(onTurn).toHaveBeenCalledTimes(1)
  expect(onTurn).toHaveBeenCalledWith(1)
})

test("键盘和 Turn page 可以翻页，最后一页不再往后", () => {
  const onTurn = vi.fn()
  const view = render(<PageCurlTurn onTurn={onTurn} curl={48} />)
  const root = view.container.querySelector("[data-slot='page-curl-turn']") as HTMLElement
  expect(root).toHaveAttribute("data-curl", "48")
  fireEvent.keyDown(root, { key: "ArrowRight" })
  expect(root).toHaveAttribute("data-page", "1")
  fireEvent.keyDown(root, { key: "ArrowLeft" })
  expect(root).toHaveAttribute("data-page", "0")
  fireEvent.keyDown(root, { key: "Enter" })
  expect(root).toHaveAttribute("data-page", "1")
  fireEvent.click(view.getByRole("button", { name: "Turn page" }))
  expect(root).toHaveAttribute("data-page", "2")
  expect(view.getByRole("heading", { name: "夜页" })).toBeInTheDocument()
  fireEvent.click(view.getByRole("button", { name: "Turn page" }))
  fireEvent.keyDown(root, { key: "ArrowRight" })
  expect(root).toHaveAttribute("data-page", "2")
  expect(onTurn.mock.calls.map((call) => call[0])).toEqual([1, 0, 1, 2])
  fireEvent.click(view.getByRole("button", { name: "Previous page" }))
  expect(root).toHaveAttribute("data-page", "1")
  expect(view.getByRole("tab", { name: "第 2 页" })).toHaveAttribute("aria-selected", "true")
})

test("减弱动效没有卷角，按钮立刻换页", () => {
  installMedia({ reduced: true })
  const onTurn = vi.fn()
  const view = render(<PageCurlTurn onTurn={onTurn} pace={1.4} />)
  const root = view.container.querySelector("[data-slot='page-curl-turn']") as HTMLElement
  const face = root.querySelector("[data-face]") as HTMLElement
  expect(root).toHaveAttribute("data-motion", "off")
  expect(root).toHaveAttribute("data-curl-motion", "off")
  expect(root).toHaveAttribute("data-pace", "1.4")
  expect(root.querySelector("[data-curl-handle]")).toBeNull()
  expect(face.style.clipPath).toBe("")
  fireEvent.click(view.getByRole("button", { name: "Turn page" }))
  expect(onTurn).toHaveBeenCalledTimes(1)
  expect(onTurn).toHaveBeenCalledWith(1)
  expect(root).toHaveAttribute("data-page", "1")
  expect(root).toHaveAttribute("data-state", "turned")
  expect(root).toHaveAttribute("data-progress", "0.00")
  expect(face.style.clipPath).toBe("")
  expect(view.getByRole("heading", { name: "午页" })).toBeInTheDocument()
})
