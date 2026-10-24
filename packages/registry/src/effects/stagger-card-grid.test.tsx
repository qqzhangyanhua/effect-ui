// @vitest-environment jsdom

import { afterEach, beforeAll, expect, test, vi } from "vitest"
import { cleanup, render } from "@testing-library/react"
import "@testing-library/jest-dom/vitest"

import { StaggerCardGrid } from "./stagger-card-grid"

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

const labels = ["清晨", "午后", "黄昏", "海岸"]

beforeAll(() => {
  vi.stubGlobal("IntersectionObserver", IntersectingObserver)
})

afterEach(cleanup)

test("减弱动效一次显示全部卡片，默认列数和位移生效", () => {
  installMedia(true)
  const view = render(
    <StaggerCardGrid>
      {labels.map((label) => (
        <p key={label}>{label}</p>
      ))}
    </StaggerCardGrid>,
  )
  const grid = view.container.querySelector("[data-slot='stagger-card-grid']")
  expect(grid).toHaveAttribute("data-motion", "off")
  expect(grid).toHaveAttribute("data-columns", "3")
  expect(grid).toHaveStyle({ gridTemplateColumns: "repeat(3, minmax(0, 1fr))" })
  const items = view.container.querySelectorAll("[data-slot='stagger-card-grid-item']")
  expect(items[0]).toHaveAttribute("data-delay", "0")
  expect(items[1]).toHaveAttribute("data-delay", "52")
  expect(items[2]).toHaveAttribute("data-delay", "104")
  expect(items[0]).toHaveStyle({ animationName: "none" })
  expect(items[0]?.getAttribute("style")).toContain("--stagger-y: 18px")
  for (const label of labels) expect(view.getByText(label)).toBeVisible()
})

test("列数改变列方向的错开", () => {
  installMedia(true)
  const view = render(
    <StaggerCardGrid columns={2} stagger={0.08} pace={1} intensity={1}>
      {labels.map((label) => (
        <p key={label}>{label}</p>
      ))}
    </StaggerCardGrid>,
  )
  const items = view.container.querySelectorAll("[data-slot='stagger-card-grid-item']")
  expect(view.container.querySelector("[data-slot='stagger-card-grid']")).toHaveAttribute("data-columns", "2")
  expect(items[1]).toHaveAttribute("data-delay", "52")
  expect(items[2]).toHaveAttribute("data-delay", "80")
})
