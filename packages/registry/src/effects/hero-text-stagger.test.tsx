// @vitest-environment jsdom

import { afterEach, beforeAll, expect, test, vi } from "vitest"
import { cleanup, render, waitFor } from "@testing-library/react"
import "@testing-library/jest-dom/vitest"

import { getComponent } from "../catalog"
import { HeroTextStagger, HeroTextStaggerCta, HeroTextStaggerSubtitle, HeroTextStaggerTitle } from "./hero-text-stagger"

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
  const entry = getComponent("hero-text-stagger")
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

test("控件起始值是 1 倍、80 毫秒和 0.75", () => {
  expect(start("pace")).toBe(1)
  expect(start("stagger")).toBe(80)
  expect(start("intensity")).toBe(0.75)
})

test("标题按词拆开，副文和行动按钮跟着出现", async () => {
  installMedia(false)
  const view = render(
    <HeroTextStagger title={["把光 留在", "第一眼"]} subtitle="句子随后站好" cta="往下看" />,
  )
  const root = view.container.querySelector("[data-slot='hero-text-stagger']")
  expect(root).toHaveAttribute("data-pace", "1")
  expect(root).toHaveAttribute("data-stagger", "80")
  expect(root).toHaveAttribute("data-intensity", "0.75")
  await waitFor(() => expect(root).toHaveAttribute("data-state", "shown"))
  expect(view.getByRole("heading", { name: /把光/ })).toBeInTheDocument()
  expect(view.getByText("留在")).toBeInTheDocument()
  expect(view.getByText("第一眼")).toBeInTheDocument()
  expect(view.getByText("句子随后站好")).toBeInTheDocument()
  expect(view.getByText("往下看")).toBeInTheDocument()
})

test("分槽标题和减弱动效都直接给出终态", () => {
  installMedia(true)
  const view = render(
    <HeroTextStagger>
      <HeroTextStaggerTitle>{"把光 留在"}</HeroTextStaggerTitle>
      <HeroTextStaggerSubtitle>副题</HeroTextStaggerSubtitle>
      <HeroTextStaggerCta>行动</HeroTextStaggerCta>
    </HeroTextStagger>,
  )
  const root = view.container.querySelector("[data-slot='hero-text-stagger']")
  expect(root).toHaveAttribute("data-motion", "off")
  expect(root).toHaveAttribute("data-state", "shown")
  expect(view.getByText("把光")).toBeVisible()
  expect(view.getByText("留在")).toBeVisible()
  expect(view.getByText("副题")).toBeVisible()
  expect(view.getByText("行动")).toBeVisible()
})

test("还没进视口时停在等待", () => {
  installMedia(false)
  vi.stubGlobal("IntersectionObserver", SilentObserver)
  const view = render(<HeroTextStagger title={["把光 留在"]} subtitle="还在路上" />)
  expect(view.container.querySelector("[data-slot='hero-text-stagger']")).toHaveAttribute("data-state", "waiting")
})
