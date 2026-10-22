// @vitest-environment jsdom

import path from "node:path"
import { fileURLToPath } from "node:url"

import { afterEach, beforeAll, expect, test } from "vitest"
import { cleanup, render, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import "@testing-library/jest-dom/vitest"

import { FamilyGallery } from "./family-gallery"

const docsDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")

beforeAll(() => {
  window.matchMedia = (query: string) =>
    ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
      addListener: () => {},
      removeListener: () => {},
    }) as unknown as MediaQueryList
  class ResizeObserverStub {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
  globalThis.ResizeObserver = ResizeObserverStub
  Element.prototype.scrollIntoView = () => {}
  if (!Element.prototype.hasPointerCapture) Element.prototype.hasPointerCapture = () => false
  if (!Element.prototype.setPointerCapture) Element.prototype.setPointerCapture = () => {}
  if (!Element.prototype.releasePointerCapture) Element.prototype.releasePointerCapture = () => {}
})

afterEach(() => {
  cleanup()
})

test("按钮总览的每一项可以打开用法和源码", async () => {
  const previous = process.cwd()
  process.chdir(docsDir)
  try {
    const view = render(
      await FamilyGallery({ cluster: "button", title: "按钮", description: "说明" }),
    )
    const section = view.container.querySelector("#pulse-button")
    expect(section).toBeTruthy()
    const scope = within(section as HTMLElement)
    const user = userEvent.setup()
    await user.click(scope.getByRole("tab", { name: "Code" }))
    expect(scope.getByRole("tab", { name: "用法" })).toBeVisible()
    expect(scope.getByRole("tab", { name: "源码" })).toBeVisible()
    await user.click(scope.getByRole("tab", { name: "源码" }))
    expect(section?.textContent).toContain("function PulseButton")
    await user.click(scope.getByRole("tab", { name: "用法" }))
    expect(section?.textContent).toContain("PulseButtonDemo")
  } finally {
    process.chdir(previous)
  }
}, 20000)
