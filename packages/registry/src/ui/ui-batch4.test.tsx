// @vitest-environment jsdom

import { afterEach, beforeEach, expect, test, vi } from "vitest"
import { cleanup, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import "@testing-library/jest-dom/vitest"

import { TreeView } from "./tree-view"

beforeEach(() => {
  vi.stubGlobal("matchMedia", (query: string) => ({
    matches: false,
    media: query,
    addEventListener() {},
    removeEventListener() {},
    addListener() {},
    removeListener() {},
    dispatchEvent() {
      return false
    },
  }))
  document.elementFromPoint = () => null
  HTMLElement.prototype.hasPointerCapture = () => false
  HTMLElement.prototype.setPointerCapture = () => {}
  HTMLElement.prototype.releasePointerCapture = () => {}
  HTMLElement.prototype.scrollIntoView = () => {}
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  )
})

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})


test("tree view collapses a folder", async () => {
  const user = userEvent.setup()
  render(
    <TreeView
      nodes={[{ id: "docs", name: "文档", children: [{ id: "map", name: "海图" }] }]}
    />,
  )
  expect(screen.getByRole("button", { name: "海图" })).toBeInTheDocument()
  await user.click(screen.getByRole("button", { name: "文档" }))
  expect(screen.queryByRole("button", { name: "海图" })).not.toBeInTheDocument()
})


