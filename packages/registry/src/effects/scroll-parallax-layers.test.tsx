// @vitest-environment jsdom

import { afterEach, beforeAll, expect, test, vi } from "vitest"
import { cleanup, render, waitFor } from "@testing-library/react"
import "@testing-library/jest-dom/vitest"

import { getComponent } from "../catalog"
import { ScrollParallaxLayers, ScrollParallaxLayersBack, ScrollParallaxLayersFront, ScrollParallaxLayersMid } from "./scroll-parallax-layers"

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

function installMedia(reduced: boolean, coarse = false) {
  vi.stubGlobal("matchMedia", (query: string) => ({
    matches: (reduced && query.includes("prefers-reduced-motion")) || (coarse && query.includes("pointer: coarse")),
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
  const entry = getComponent("scroll-parallax-layers")
  const found = entry?.props.find((item) => item.name === prop)
  if (!found?.control || !("value" in found.control)) throw new Error(prop)
  return found.control.value
}

function shift(container: HTMLElement, layer: string) {
  const node = container.querySelector<HTMLElement>(`[data-layer='${layer}']`)
  const match = /translate3d\(([-\d.]+)px,\s*([-\d.]+)px/.exec(node?.style.transform ?? "")
  return { x: Number(match?.[1] ?? 0), y: Number(match?.[2] ?? 0), raw: node?.style.transform ?? "" }
}

beforeAll(() => {
  vi.stubGlobal("IntersectionObserver", IntersectingObserver)
})

afterEach(() => {
  cleanup()
  vi.stubGlobal("IntersectionObserver", IntersectingObserver)
})

test("控件起始值是 0.6、三层、向上", () => {
  expect(start("intensity")).toBe(0.6)
  expect(start("layers")).toBe(3)
  expect(start("direction")).toBe("up")
})

test("进入视口后前后景位移不同，两层时不渲染中景", async () => {
  installMedia(false)
  const view = render(
    <ScrollParallaxLayers>
      <ScrollParallaxLayersBack>远山</ScrollParallaxLayersBack>
      <ScrollParallaxLayersMid>中景</ScrollParallaxLayersMid>
      <ScrollParallaxLayersFront>前景</ScrollParallaxLayersFront>
    </ScrollParallaxLayers>,
  )
  const root = view.container.querySelector<HTMLElement>("[data-slot='scroll-parallax-layers']")
  expect(root).toHaveAttribute("data-layers", "3")
  expect(root).toHaveAttribute("data-direction", "up")
  expect(view.getByText("远山")).toBeInTheDocument()
  expect(view.getByText("中景")).toBeInTheDocument()
  await waitFor(() => expect(shift(view.container, "front").raw).toMatch(/translate3d\(/))
  const front = shift(view.container, "front")
  const back = shift(view.container, "back")
  expect(front.x).toBe(0)
  expect(back.x).toBe(0)
  expect(Math.abs(front.y)).toBeGreaterThan(Math.abs(back.y))

  cleanup()
  const two = render(<ScrollParallaxLayers layers={2} />)
  expect(two.container.querySelector("[data-layer='mid']")).toBeNull()
  expect(two.container.querySelector("[data-slot='scroll-parallax-layers']")).toHaveAttribute("data-layers", "2")
})

test("减弱动效和离开视口都没有位移", async () => {
  installMedia(true)
  const still = render(<ScrollParallaxLayers />)
  const root = still.container.querySelector("[data-slot='scroll-parallax-layers']")
  await waitFor(() => expect(root).toHaveAttribute("data-live", "true"))
  expect(root).toHaveAttribute("data-motion", "off")
  window.dispatchEvent(new Event("scroll"))
  expect(shift(still.container, "front").raw).toBe("")
  expect(shift(still.container, "back").raw).toBe("")

  cleanup()
  installMedia(false)
  vi.stubGlobal("IntersectionObserver", SilentObserver)
  const away = render(<ScrollParallaxLayers />)
  expect(away.container.querySelector("[data-slot='scroll-parallax-layers']")).toHaveAttribute("data-live", "false")
  window.dispatchEvent(new Event("scroll"))
  expect(shift(away.container, "front").raw).toBe("")
})

test("粗指针把同一方向的位移减半", async () => {
  installMedia(false, false)
  const fine = render(<ScrollParallaxLayers direction="left" />)
  await waitFor(() => expect(shift(fine.container, "front").raw).toMatch(/translate3d\(/))
  const fineShift = shift(fine.container, "front")
  expect(fineShift.y).toBe(0)
  expect(Math.abs(fineShift.x)).toBeGreaterThan(0)

  cleanup()
  installMedia(false, true)
  const coarse = render(<ScrollParallaxLayers direction="left" />)
  await waitFor(() => expect(coarse.container.querySelector("[data-slot='scroll-parallax-layers']")).toHaveAttribute("data-coarse", "true"))
  await waitFor(() => expect(shift(coarse.container, "front").raw).toMatch(/translate3d\(/))
  expect(Math.abs(shift(coarse.container, "front").x)).toBeCloseTo(Math.abs(fineShift.x) / 2, 4)
})
