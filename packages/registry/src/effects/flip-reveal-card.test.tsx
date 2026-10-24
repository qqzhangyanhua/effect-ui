// @vitest-environment jsdom

import { afterEach, expect, test, vi } from "vitest"
import { cleanup, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import "@testing-library/jest-dom/vitest"

import { FlipRevealCard } from "./flip-reveal-card"

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

afterEach(cleanup)

test("默认沿 Y 轴，时长和透视等于起始值", () => {
  installMedia(true)
  render(<FlipRevealCard front="封面" back="背面说明" />)
  const button = screen.getByRole("button")
  expect(button).toHaveAttribute("aria-pressed", "false")
  expect(button).toHaveAttribute("data-axis", "y")
  expect(button).toHaveAttribute("data-motion", "off")
  expect(button).toHaveStyle({ transform: "none", transition: "none" })
  expect(button.parentElement?.getAttribute("style") ?? "").not.toContain("perspective")
  expect(screen.getByText("封面")).toBeVisible()
  expect(screen.queryByText("背面说明")).not.toBeVisible()
})

test("Enter 翻转并切换 aria-pressed", async () => {
  installMedia(true)
  const user = userEvent.setup({ pointerEventsCheck: 0 })
  render(<FlipRevealCard front="封面" back="背面说明" />)
  const button = screen.getByRole("button")
  button.focus()
  await user.keyboard("{Enter}")
  expect(button).toHaveAttribute("aria-pressed", "true")
  expect(screen.getByText("背面说明")).toBeVisible()
  expect(screen.queryByText("封面")).not.toBeVisible()
})

test("Space 再翻回正面", async () => {
  installMedia(true)
  const user = userEvent.setup({ pointerEventsCheck: 0 })
  render(<FlipRevealCard front="封面" back="背面说明" axis="x" duration={560} perspective={1100} />)
  const button = screen.getByRole("button")
  expect(button).toHaveAttribute("data-axis", "x")
  button.focus()
  await user.keyboard(" ")
  expect(button).toHaveAttribute("aria-pressed", "true")
  await user.keyboard(" ")
  expect(button).toHaveAttribute("aria-pressed", "false")
  expect(screen.getByText("封面")).toBeVisible()
})

test("未减弱时用三维旋转", () => {
  installMedia(false)
  render(<FlipRevealCard front="封面" back="背面说明" duration={560} perspective={1100} axis="y" />)
  const button = screen.getByRole("button")
  expect(button).toHaveAttribute("data-motion", "on")
  expect(button).toHaveStyle({ transform: "rotateY(0deg)" })
  expect(button.getAttribute("style")).toContain("560ms")
  expect(button.parentElement).toHaveStyle({ perspective: "1100px" })
})
