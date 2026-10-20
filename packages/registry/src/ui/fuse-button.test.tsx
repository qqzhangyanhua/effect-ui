// @vitest-environment jsdom

import { afterEach, beforeAll, expect, test, vi } from "vitest"
import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import "@testing-library/jest-dom/vitest"

import { FuseButton } from "./fuse-button"

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
})

afterEach(() => {
  cleanup()
  vi.useRealTimers()
})

test("按住到 holdMs 才完成，提前松开不触发", async () => {
  vi.useFakeTimers()
  const onComplete = vi.fn()
  render(<FuseButton holdMs={500} onComplete={onComplete}>引爆</FuseButton>)
  const button = screen.getByRole("button", { name: "引爆" })

  fireEvent.pointerDown(button, { pointerId: 1, button: 0 })
  await vi.advanceTimersByTimeAsync(200)
  fireEvent.pointerUp(button, { pointerId: 1 })
  await vi.advanceTimersByTimeAsync(500)
  expect(onComplete).not.toHaveBeenCalled()

  fireEvent.pointerDown(button, { pointerId: 1, button: 0 })
  await vi.advanceTimersByTimeAsync(499)
  expect(onComplete).not.toHaveBeenCalled()
  await vi.advanceTimersByTimeAsync(1)
  expect(onComplete).toHaveBeenCalledTimes(1)
})

test("禁用时按住不完成", async () => {
  vi.useFakeTimers()
  const onComplete = vi.fn()
  render(
    <FuseButton holdMs={500} disabled onComplete={onComplete}>
      引爆
    </FuseButton>,
  )

  fireEvent.pointerDown(screen.getByRole("button", { name: "引爆" }), { pointerId: 1, button: 0 })
  await vi.advanceTimersByTimeAsync(500)
  expect(onComplete).not.toHaveBeenCalled()
})
