// @vitest-environment jsdom

import { afterEach, beforeAll, expect, test, vi } from "vitest"
import { cleanup, fireEvent, render, waitFor } from "@testing-library/react"
import "@testing-library/jest-dom/vitest"

import { getComponent } from "../catalog"
import { LogoMarquee } from "./logo-marquee"

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
  const entry = getComponent("logo-marquee")
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

test("控件起始值是 1 倍、32 像素、向左，并且悬停可暂停", () => {
  expect(start("speed")).toBe(1)
  expect(start("gap")).toBe(32)
  expect(start("direction")).toBe("left")
  expect(start("pauseOnHover")).toBe(true)
})

test("标志不靠悬停就能读到，悬停和聚焦会暂停", async () => {
  installMedia(false)
  const view = render(<LogoMarquee />)
  const root = view.container.querySelector("[data-slot='logo-marquee']")
  const track = view.container.querySelector("[data-track='logos']")
  expect(view.getAllByText("北窗")).toHaveLength(2)
  expect(view.getAllByText("回声实验室")).toHaveLength(2)
  expect(root).toHaveAttribute("data-gap", "32")
  expect(root).toHaveAttribute("data-direction", "left")
  expect(root).toHaveAttribute("data-pause-on-hover", "true")
  await waitFor(() => expect(root).toHaveAttribute("data-motion", "on"))
  expect(track).toHaveStyle({ animationName: "logo-marquee-shift", animationPlayState: "running", animationDuration: "28000ms" })

  fireEvent.mouseEnter(root as HTMLElement)
  expect(root).toHaveAttribute("data-motion", "paused")
  expect(track).toHaveStyle({ animationPlayState: "paused" })
  fireEvent.mouseLeave(root as HTMLElement)
  expect(root).toHaveAttribute("data-motion", "on")

  fireEvent.focus(root as HTMLElement)
  expect(root).toHaveAttribute("data-motion", "paused")
  fireEvent.blur(root as HTMLElement)
  expect(root).toHaveAttribute("data-motion", "on")
})

test("关闭悬停暂停后，聚焦仍然可以停", async () => {
  installMedia(false)
  const view = render(<LogoMarquee pauseOnHover={false} direction="right" speed={2} />)
  const root = view.container.querySelector("[data-slot='logo-marquee']")
  const track = view.container.querySelector("[data-track='logos']")
  await waitFor(() => expect(root).toHaveAttribute("data-motion", "on"))
  expect(track).toHaveStyle({ animationDirection: "reverse", animationDuration: "14000ms" })
  fireEvent.mouseEnter(root as HTMLElement)
  expect(root).toHaveAttribute("data-motion", "on")
  fireEvent.focus(root as HTMLElement)
  expect(root).toHaveAttribute("data-motion", "paused")
})

test("减弱动效只排一行，不再循环", () => {
  installMedia(true)
  const view = render(<LogoMarquee />)
  const root = view.container.querySelector("[data-slot='logo-marquee']")
  const track = view.container.querySelector("[data-track='logos']")
  expect(root).toHaveAttribute("data-motion", "off")
  expect(view.getAllByText("北窗")).toHaveLength(1)
  expect(view.getAllByText("潮汐社")).toHaveLength(1)
  expect(view.container.querySelector("[data-clone='true']")).toBeNull()
  expect(track).toHaveStyle({ animationName: "none" })
})

test("离开视口时暂停循环", async () => {
  installMedia(false)
  vi.stubGlobal("IntersectionObserver", SilentObserver)
  const view = render(<LogoMarquee />)
  const root = view.container.querySelector("[data-slot='logo-marquee']")
  await waitFor(() => expect(root).toHaveAttribute("data-motion", "paused"))
  expect(view.getAllByText("青田").length).toBeGreaterThan(0)
})
