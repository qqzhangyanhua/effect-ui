// @vitest-environment jsdom

import { afterEach, beforeAll, expect, test, vi } from "vitest"
import { cleanup, render, waitFor } from "@testing-library/react"
import "@testing-library/jest-dom/vitest"

import { TwistInCard } from "./twist-in-card"

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

beforeAll(() => {
  vi.stubGlobal("IntersectionObserver", IntersectingObserver)
})

afterEach(() => {
  cleanup()
})

test("默认控件是起始值，减弱动效直接停在终态", () => {
  installMedia(true)
  const view = render(
    <TwistInCard>
      <p>山脊路线</p>
    </TwistInCard>,
  )
  const card = view.container.querySelector("[data-slot='twist-in-card']")
  expect(card).toHaveAttribute("data-motion", "off")
  expect(card).toHaveStyle({ animationName: "none", animationDuration: "720ms", animationDelay: "0ms" })
  expect(card?.getAttribute("style")).toContain("--twist-y: 28px")
  expect(card?.getAttribute("style")).toContain("--twist-r: -8deg")
  expect(view.getByText("山脊路线")).toBeVisible()
})

test("进入视口后按 pace 播放一次", async () => {
  installMedia(false)
  const view = render(<TwistInCard pace={1} intensity={1} delay={0} />)
  const card = view.container.querySelector("[data-slot='twist-in-card']")
  await waitFor(() => expect(card).toHaveAttribute("data-motion", "on"))
  expect(card).toHaveStyle({ animationPlayState: "running", animationName: "twist-in-card" })
})
