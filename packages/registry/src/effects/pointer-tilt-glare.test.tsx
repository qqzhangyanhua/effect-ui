// @vitest-environment jsdom

import { afterEach, beforeAll, expect, test, vi } from "vitest"
import { cleanup, fireEvent, render, waitFor } from "@testing-library/react"
import "@testing-library/jest-dom/vitest"

import { PointerTiltGlare } from "./pointer-tilt-glare"

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

function installMedia(options: { reduced?: boolean; coarse?: boolean }) {
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

function box(node: HTMLElement) {
  node.getBoundingClientRect = () =>
    ({
      x: 0,
      y: 0,
      left: 0,
      top: 0,
      right: 200,
      bottom: 100,
      width: 200,
      height: 100,
      toJSON() {
        return {}
      },
    }) as DOMRect
}

beforeAll(() => {
  vi.stubGlobal("IntersectionObserver", IntersectingObserver)
})

afterEach(cleanup)

test("默认倾斜、眩光和速度等于起始值", async () => {
  installMedia({})
  const view = render(
    <PointerTiltGlare>
      <p>新季货架</p>
    </PointerTiltGlare>,
  )
  const card = view.container.querySelector("[data-slot='pointer-tilt-glare']") as HTMLElement
  await waitFor(() => expect(card).toHaveAttribute("data-motion", "on"))
  expect(card.getAttribute("style")).toContain("220ms")
  expect(card).toHaveStyle({ transform: "perspective(900px) rotateX(0deg) rotateY(0deg)" })
  const sheen = view.container.querySelector("[data-slot='pointer-tilt-glare-sheen']")
  expect(sheen).toHaveStyle({ opacity: "0" })
  expect(view.getByText("新季货架")).toBeVisible()
})

test("指针移动带动倾斜和眩光", async () => {
  installMedia({})
  const view = render(<PointerTiltGlare maxTilt={12} glare={0.55} speed={1} />)
  const card = view.container.querySelector("[data-slot='pointer-tilt-glare']") as HTMLElement
  await waitFor(() => expect(card).toHaveAttribute("data-motion", "on"))
  box(card)
  fireEvent.pointerMove(card, { clientX: 200, clientY: 0, pointerType: "mouse" })
  expect(card).toHaveStyle({ transform: "perspective(900px) rotateX(6deg) rotateY(6deg)" })
  const sheen = view.container.querySelector("[data-slot='pointer-tilt-glare-sheen']") as HTMLElement
  expect(sheen).toHaveStyle({ opacity: "0.55" })
  expect(sheen.getAttribute("style")).toContain("100% 0%")
})

test("粗指针不更新旋转", async () => {
  installMedia({ coarse: true })
  const view = render(<PointerTiltGlare />)
  const card = view.container.querySelector("[data-slot='pointer-tilt-glare']") as HTMLElement
  await waitFor(() => expect(card).toHaveAttribute("data-motion", "on"))
  box(card)
  fireEvent.pointerMove(card, { clientX: 200, clientY: 0, pointerType: "mouse" })
  expect(card).toHaveStyle({ transform: "perspective(900px) rotateX(0deg) rotateY(0deg)" })
  expect(view.container.querySelector("[data-slot='pointer-tilt-glare-sheen']")).toHaveStyle({ opacity: "0" })
})

test("减弱动效关闭倾斜和眩光", () => {
  installMedia({ reduced: true })
  const view = render(<PointerTiltGlare />)
  const card = view.container.querySelector("[data-slot='pointer-tilt-glare']") as HTMLElement
  expect(card).toHaveAttribute("data-motion", "off")
  expect(card).toHaveStyle({ transform: "none", transition: "none" })
  box(card)
  fireEvent.pointerMove(card, { clientX: 200, clientY: 0, pointerType: "mouse" })
  expect(card).toHaveStyle({ transform: "none" })
})
