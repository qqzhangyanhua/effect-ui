// @vitest-environment jsdom

import { afterEach, expect, test, vi } from "vitest"
import { cleanup, createEvent, fireEvent, render, screen } from "@testing-library/react"
import "@testing-library/jest-dom/vitest"

import { HoverOverlayReveal } from "./hover-overlay-reveal"

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

afterEach(cleanup)

test("遮罩透明度和方向使用起始值", () => {
  installMedia({ reduced: true })
  const view = render(<HoverOverlayReveal title="田野站点" href="#visit" />)
  const card = view.container.querySelector("[data-slot='hover-overlay-reveal']")
  const scrim = view.container.querySelector("[data-slot='hover-overlay-reveal-scrim']")
  expect(card).toHaveAttribute("data-from", "bottom")
  expect(card).toHaveAttribute("data-open", "false")
  expect(card).toHaveAttribute("data-motion", "off")
  expect(scrim?.getAttribute("style")).toContain("55%")
  expect(scrim).toHaveStyle({ transitionDuration: "0ms" })
  expect(screen.getByText("查看")).toBeInTheDocument()
})

test("粗指针第一次点开遮罩，第二次才跟随链接", () => {
  installMedia({ coarse: true })
  render(<HoverOverlayReveal title="田野站点" href="#visit" />)
  const link = screen.getByRole("link", { name: /田野站点/ })
  const first = createEvent.click(link)
  fireEvent(link, first)
  expect(first.defaultPrevented).toBe(true)
  expect(link).toHaveAttribute("data-open", "true")
  const second = createEvent.click(link)
  fireEvent(link, second)
  expect(second.defaultPrevented).toBe(false)
  expect(link).toHaveAttribute("data-open", "true")
})

test("没有链接时，粗指针再点一次收起", () => {
  installMedia({ coarse: true })
  render(<HoverOverlayReveal title="田野站点" />)
  const card = screen.getByRole("button", { name: /田野站点/ })
  fireEvent.click(card)
  expect(card).toHaveAttribute("data-open", "true")
  fireEvent.click(card)
  expect(card).toHaveAttribute("data-open", "false")
})

test("鼠标移入浮出遮罩，触碰不会", () => {
  installMedia({})
  const view = render(<HoverOverlayReveal title="田野站点" href="#visit" />)
  const link = screen.getByRole("link", { name: /田野站点/ })
  fireEvent.pointerEnter(link, { pointerType: "mouse" })
  expect(link).toHaveAttribute("data-revealed", "true")
  const scrim = view.container.querySelector("[data-slot='hover-overlay-reveal-scrim']")
  expect(scrim).toHaveStyle({ opacity: "1" })
  fireEvent.pointerLeave(link, { pointerType: "mouse" })
  expect(link).toHaveAttribute("data-revealed", "false")
})

test("细指针点击不靠开关遮罩", () => {
  installMedia({ coarse: false })
  render(<HoverOverlayReveal title="田野站点" href="#visit" />)
  const link = screen.getByRole("link", { name: /田野站点/ })
  const event = createEvent.click(link)
  fireEvent(link, event)
  expect(event.defaultPrevented).toBe(false)
  expect(link).toHaveAttribute("data-open", "false")
})
