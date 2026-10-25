// @vitest-environment jsdom

import { afterEach, beforeAll, expect, test, vi } from "vitest"
import { cleanup, render, waitFor } from "@testing-library/react"
import "@testing-library/jest-dom/vitest"

import { getComponent } from "../catalog"
import { EntrancePresets } from "./entrance-presets"

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

function installMedia(reduced: boolean) {
  vi.stubGlobal("matchMedia", (query: string) => ({
    matches: reduced && query.includes("prefers-reduced-motion"),
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
  const entry = getComponent("entrance-presets")
  const found = entry?.props.find((item) => item.name === prop)
  if (!found?.control || !("value" in found.control)) throw new Error(prop)
  return found.control.value
}

beforeAll(() => {
  vi.stubGlobal("IntersectionObserver", IntersectingObserver)
})

afterEach(() => {
  cleanup()
  vi.stubGlobal("IntersectionObserver", IntersectingObserver)
})

test("控件起始值是长大、1 倍、0.7、从下方", () => {
  expect(start("preset")).toBe("grow")
  expect(start("pace")).toBe(1)
  expect(start("intensity")).toBe(0.7)
  expect(start("from")).toBe("up")
})

test("默认包住子元素，进入视口后播一次", async () => {
  installMedia(false)
  const view = render(
    <EntrancePresets>
      <p>任意一块内容</p>
    </EntrancePresets>,
  )
  const root = view.container.querySelector("[data-slot='entrance-presets']")
  expect(root).toHaveAttribute("data-preset", "grow")
  expect(root).toHaveAttribute("data-pace", "1")
  expect(root).toHaveAttribute("data-intensity", "0.7")
  expect(root).toHaveAttribute("data-from", "up")
  expect(root?.className).not.toContain("bg-card")
  await waitFor(() => expect(root).toHaveAttribute("data-state", "shown"))
  expect(view.getByText("任意一块内容")).toBeVisible()
})

test("还没进视口时保持等待，滑入方向写在属性上", () => {
  installMedia(false)
  vi.stubGlobal("IntersectionObserver", SilentObserver)
  const view = render(
    <EntrancePresets preset="slide" from="left" pace={1.5} intensity={0.4}>
      <p>从左边来</p>
    </EntrancePresets>,
  )
  const root = view.container.querySelector("[data-slot='entrance-presets']")
  expect(root).toHaveAttribute("data-state", "waiting")
  expect(root).toHaveAttribute("data-preset", "slide")
  expect(root).toHaveAttribute("data-from", "left")
  expect(root).toHaveAttribute("data-motion", "on")
})

test("减弱动效直接显示终态", () => {
  installMedia(true)
  const view = render(
    <EntrancePresets preset="spin">
      <p>已经在了</p>
    </EntrancePresets>,
  )
  const root = view.container.querySelector("[data-slot='entrance-presets']")
  expect(root).toHaveAttribute("data-motion", "off")
  expect(root).toHaveAttribute("data-state", "shown")
  expect(root).toHaveAttribute("data-preset", "spin")
  expect(view.getByText("已经在了")).toBeVisible()
})
