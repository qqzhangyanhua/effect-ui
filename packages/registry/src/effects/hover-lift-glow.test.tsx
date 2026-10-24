// @vitest-environment jsdom

import { afterEach, expect, test, vi } from "vitest"
import { cleanup, fireEvent, render } from "@testing-library/react"
import "@testing-library/jest-dom/vitest"

import { HoverLiftGlow } from "./hover-lift-glow"

function installMedia(reducedOrOptions: boolean | { reduced?: boolean; coarse?: boolean }) {
  const options = typeof reducedOrOptions === "boolean" ? { reduced: reducedOrOptions } : reducedOrOptions
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

afterEach(cleanup)

test("默认抬起、光环和时长等于起始值，粗指针走按下缩放", () => {
  installMedia(false)
  const view = render(
    <HoverLiftGlow>
      <p>会员计划</p>
    </HoverLiftGlow>,
  )
  const card = view.container.querySelector("[data-slot='hover-lift-glow']")
  expect(card).toHaveAttribute("data-motion", "on")
  expect(card).toHaveStyle({ transitionDuration: "280ms" })
  expect(card?.getAttribute("style")).toContain("--lift: 8px")
  expect(card?.getAttribute("style")).toContain("var(--primary)")
  expect(card?.className).toContain("pointer-fine:hover:-translate-y-[var(--lift)]")
  expect(card?.className).toContain("pointer-coarse:active:scale-[0.985]")
  expect(card?.className).toContain("motion-reduce:transform-none")
  expect(view.getByText("会员计划")).toBeVisible()
})

test("鼠标移入会抬起并亮起光环", () => {
  installMedia(false)
  const view = render(<HoverLiftGlow />)
  const card = view.container.querySelector("[data-slot='hover-lift-glow']") as HTMLElement
  fireEvent.pointerEnter(card, { pointerType: "mouse" })
  expect(card).toHaveAttribute("data-raised", "true")
  expect(card.getAttribute("style")).toContain("translateY(-8px)")
  expect(card.getAttribute("style")).toContain("var(--primary)")
})

test("触碰不会靠悬停抬起", () => {
  installMedia({ coarse: true })
  const view = render(<HoverLiftGlow />)
  const card = view.container.querySelector("[data-slot='hover-lift-glow']") as HTMLElement
  fireEvent.pointerEnter(card, { pointerType: "touch" })
  expect(card).toHaveAttribute("data-raised", "false")
  fireEvent.pointerDown(card, { pointerType: "touch" })
  expect(card.getAttribute("style")).toContain("scale(0.985)")
})

test("减弱动效不再抬起", () => {
  installMedia(true)
  const view = render(<HoverLiftGlow />)
  const card = view.container.querySelector("[data-slot='hover-lift-glow']")
  expect(card).toHaveAttribute("data-motion", "off")
  expect(card).toHaveStyle({ transitionDuration: "0ms" })
  expect(card?.getAttribute("style")).toContain("--lift: 0px")
  expect(card?.className).not.toContain("pointer-fine:hover:-translate-y-[var(--lift)]")
})
