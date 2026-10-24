// @vitest-environment jsdom

import { afterEach, beforeAll, expect, test, vi } from "vitest"
import { cleanup, render, waitFor } from "@testing-library/react"
import "@testing-library/jest-dom/vitest"

import { batch63Components } from "../catalog-batch63"
import { MeshGlowBg } from "./mesh-glow-bg"

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
  const entry = batch63Components.find((item) => item.name === "mesh-glow-bg")
  const found = entry?.props.find((item) => item.name === prop)
  if (!found?.control || !("value" in found.control)) throw new Error(prop)
  return found.control.value
}

beforeAll(() => {
  vi.stubGlobal("IntersectionObserver", IntersectingObserver)
})

afterEach(() => {
  cleanup()
})

test("控件起始值是极光、0.65 和 1 倍速度", () => {
  expect(start("palette")).toBe("aurora")
  expect(start("intensity")).toBe(0.65)
  expect(start("pace")).toBe(1)
})

test("默认在视口里漂移，减弱动效停在静态光斑", async () => {
  installMedia(false)
  const moving = render(<MeshGlowBg />)
  const root = moving.container.querySelector("[data-slot='mesh-glow-bg']")
  const blob = moving.container.querySelector("[data-blob='mesh-glow-a']")
  expect(root).toHaveAttribute("data-palette", "aurora")
  expect(root?.getAttribute("style")).toContain("--mesh-travel: 38px")
  expect(root?.getAttribute("style")).toContain("--mesh-duration: 22000ms")
  await waitFor(() => expect(root).toHaveAttribute("data-motion", "on"))
  expect(blob).toHaveStyle({ animationName: "mesh-glow-a", animationPlayState: "running" })

  cleanup()
  installMedia(true)
  const still = render(<MeshGlowBg />)
  const reducedRoot = still.container.querySelector("[data-slot='mesh-glow-bg']")
  const reducedBlob = still.container.querySelector("[data-blob='mesh-glow-a']")
  expect(reducedRoot).toHaveAttribute("data-motion", "off")
  expect(reducedBlob).toHaveStyle({ animationName: "none" })
})

test("paused 或离开视口时停住，不把动画拆掉", async () => {
  installMedia(false)
  const paused = render(<MeshGlowBg paused />)
  const pausedBlob = paused.container.querySelector("[data-blob='mesh-glow-a']")
  await waitFor(() => expect(paused.container.querySelector("[data-slot='mesh-glow-bg']")).toHaveAttribute("data-motion", "paused"))
  expect(pausedBlob).toHaveStyle({ animationPlayState: "paused", animationName: "mesh-glow-a" })

  cleanup()
  vi.stubGlobal("IntersectionObserver", SilentObserver)
  const away = render(<MeshGlowBg />)
  await waitFor(() => expect(away.container.querySelector("[data-slot='mesh-glow-bg']")).toHaveAttribute("data-motion", "paused"))
  vi.stubGlobal("IntersectionObserver", IntersectingObserver)
})
