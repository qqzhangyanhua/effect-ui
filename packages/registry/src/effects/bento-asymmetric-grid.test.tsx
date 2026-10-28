// @vitest-environment jsdom

import { afterEach, beforeEach, expect, test, vi } from "vitest"
import { cleanup, fireEvent, render, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import "@testing-library/jest-dom/vitest"

import { getComponent } from "../catalog"
import { BentoAsymmetricGrid } from "./bento-asymmetric-grid"

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

function installMedia(options: { reduced?: boolean; coarse?: boolean } = {}) {
  vi.stubGlobal("matchMedia", (query: string) => ({
    matches:
      (options.reduced === true && query.includes("prefers-reduced-motion")) ||
      (options.coarse === true && query.includes("pointer: coarse")),
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
  const entry = getComponent("bento-asymmetric-grid")
  const found = entry?.props.find((item) => item.name === prop)
  if (!found?.control || !("value" in found.control)) throw new Error(prop)
  return found.control.value
}

beforeEach(() => {
  installMedia()
  vi.stubGlobal("IntersectionObserver", IntersectingObserver)
})

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

test("不等分网格控件起始值等于默认", async () => {
  expect(start("gap")).toBe(12)
  expect(start("intensity")).toBe(0.65)
  expect(start("pace")).toBe(1)
  expect(start("radius")).toBe(20)
  const view = render(<BentoAsymmetricGrid />)
  const root = view.container.querySelector("[data-slot='bento-asymmetric-grid']")
  expect(root).toHaveAttribute("data-gap", "12")
  expect(root).toHaveAttribute("data-intensity", "0.65")
  expect(root).toHaveAttribute("data-pace", "1")
  expect(root).toHaveAttribute("data-radius", "20")
  expect(root).toHaveAttribute("data-layout", "asymmetric")
  expect(root).toHaveAttribute("data-state", "idle")
  expect(root).toHaveAttribute("data-count", "5")
  expect(root?.querySelectorAll("[data-span='2']")).toHaveLength(1)
  expect(root?.querySelectorAll("[data-span='1']")).toHaveLength(4)
  await waitFor(() => expect(root).toHaveAttribute("data-live", "on"))
})

test("聚焦时当前格放大，邻居压暗，Tab 可以走到下一格", async () => {
  const view = render(<BentoAsymmetricGrid />)
  const cells = view.getAllByRole("button")
  expect(cells).toHaveLength(5)
  const user = userEvent.setup()
  await user.tab()
  expect(cells[0]).toHaveFocus()
  const root = view.container.querySelector("[data-slot='bento-asymmetric-grid']")
  expect(root).toHaveAttribute("data-state", "focused")
  expect(root).toHaveAttribute("data-index", "0")
  expect(cells[0]).toHaveAttribute("data-emphasis", "on")
  expect(cells[0]?.style.transform).toContain("scale(1.052)")
  expect(cells[1]).toHaveAttribute("data-dim", "on")
  expect(Number(cells[1]?.style.opacity)).toBeLessThan(1)
  await user.tab()
  expect(cells[1]).toHaveFocus()
  expect(root).toHaveAttribute("data-index", "1")
  expect(cells[1]).toHaveAttribute("data-emphasis", "on")
  expect(cells[0]).toHaveAttribute("data-dim", "on")
})

test("细指针离开后回到 resting，粗指针靠点击而不是悬停", () => {
  const fine = render(<BentoAsymmetricGrid />)
  const fineRoot = fine.container.querySelector("[data-slot='bento-asymmetric-grid']")
  const fineCell = fine.getAllByRole("button")[2]
  fireEvent.pointerEnter(fineCell as HTMLElement, { pointerType: "mouse" })
  expect(fineRoot).toHaveAttribute("data-state", "focused")
  expect(fineRoot).toHaveAttribute("data-index", "2")
  fireEvent.pointerLeave(fineCell as HTMLElement, { pointerType: "mouse" })
  expect(fineRoot).toHaveAttribute("data-state", "resting")
  expect(fineRoot).toHaveAttribute("data-index", "")
  fine.unmount()

  installMedia({ coarse: true })
  const view = render(<BentoAsymmetricGrid />)
  const root = view.container.querySelector("[data-slot='bento-asymmetric-grid']")
  const cell = view.getAllByRole("button")[0]
  expect(root).toHaveAttribute("data-pointer", "coarse")
  fireEvent.pointerEnter(cell as HTMLElement, { pointerType: "mouse" })
  expect(root).toHaveAttribute("data-state", "idle")
  fireEvent.click(cell as HTMLElement)
  expect(root).toHaveAttribute("data-state", "focused")
  expect(root).toHaveAttribute("data-index", "0")
  expect(cell).toHaveAttribute("data-emphasis", "on")
  fireEvent.click(cell as HTMLElement)
  expect(root).toHaveAttribute("data-state", "resting")
  expect(cell).toHaveAttribute("data-emphasis", "off")
})

test("减弱动效只有静止网格和焦点环，不再缩放压暗", () => {
  installMedia({ reduced: true })
  const view = render(<BentoAsymmetricGrid />)
  const root = view.container.querySelector("[data-slot='bento-asymmetric-grid']")
  const cells = view.getAllByRole("button")
  expect(root).toHaveAttribute("data-motion", "off")
  expect(cells[0]?.className).toContain("motion-reduce:transform-none")
  fireEvent.focus(cells[0] as HTMLElement)
  expect(root).toHaveAttribute("data-state", "focused")
  expect(cells[0]).toHaveAttribute("data-emphasis", "off")
  expect(cells[0]?.style.transform).toBe("none")
  for (const cell of cells) expect(cell).toHaveAttribute("data-dim", "off")
})
