// @vitest-environment jsdom

import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

import { afterEach, expect, test, vi } from "vitest"
import { act, cleanup, fireEvent, render } from "@testing-library/react"
import "@testing-library/jest-dom/vitest"

import { auditExemptions } from "../audit-exemptions"
import { getComponent } from "../catalog"

import {
  revealButtonSize,
  revealCenter,
  revealDuration,
  revealFill,
  revealRadius,
  revealStart,
  surfaceTokens,
  ThemeRevealToggle,
} from "./theme-reveal-toggle"

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

function rootOf(container: HTMLElement) {
  const node = container.querySelector("[data-slot='theme-reveal-toggle']")
  if (!(node instanceof HTMLElement)) throw new Error("missing theme-reveal-toggle")
  return node
}

function setStart(value: unknown) {
  Object.defineProperty(document, "startViewTransition", {
    configurable: true,
    writable: true,
    value,
  })
}

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
  Reflect.deleteProperty(document, "startViewTransition")
})

test("圆形揭示在接口可用且未减弱动效时交给 startViewTransition，否则立刻切换 dark", () => {
  expect(revealCenter({ left: 10, top: 20 }, { left: 30, top: 50, width: 40, height: 20 })).toEqual({ x: 40, y: 40 })
  expect(revealRadius(200, 100, 40, 40)).toBe(171)
  expect(revealStart(44)).toBe(22)
  expect(revealDuration(640)).toBe(640)
  expect(revealDuration(10)).toBe(240)
  expect(revealDuration(9000)).toBe(1400)
  expect(revealButtonSize(44)).toBe(44)
  expect(revealButtonSize(1)).toBe(28)
  expect(revealButtonSize(400)).toBe(72)
  expect(revealFill(undefined)).toBe("var(--primary)")
  expect(revealFill("  #336699 ")).toBe("#336699")
  expect(surfaceTokens(false)["--background"]).toBe("oklch(0.985 0.01 95)")
  expect(surfaceTokens(true)["--background"]).toBe("oklch(0.17 0.03 280)")
  expect(surfaceTokens(false)["--foreground"]).toBe("oklch(0.2 0.03 280)")
  expect(surfaceTokens(true)["--foreground"]).toBe("oklch(0.97 0.01 95)")

  installMedia(false)
  setStart(undefined)
  const hostClass = document.documentElement.className
  const hostStyle = document.documentElement.getAttribute("style")
  const immediate = render(<ThemeRevealToggle className="extra-surface" />)
  const immediateRoot = rootOf(immediate.container)
  expect(immediateRoot).toHaveClass("extra-surface")
  expect(immediateRoot).not.toHaveClass("dark")
  expect(immediateRoot.style.viewTransitionName).toBe("theme-reveal")
  expect(immediateRoot.style.viewTransitionName).not.toBe("root")
  expect(immediateRoot.style.getPropertyValue("--background").trim()).toBe("oklch(0.985 0.01 95)")
  fireEvent.click(immediate.getByRole("button", { name: "Switch to dark theme" }))
  expect(immediateRoot).toHaveClass("dark")
  expect(immediateRoot.style.getPropertyValue("--background").trim()).toBe("oklch(0.17 0.03 280)")
  expect(immediateRoot.style.getPropertyValue("--foreground").trim()).toBe("oklch(0.97 0.01 95)")
  expect(document.documentElement.className).toBe(hostClass)
  expect(document.documentElement.getAttribute("style")).toBe(hostStyle)
  immediate.unmount()

  installMedia(false)
  let update: (() => void) | undefined
  const start = vi.fn((callback?: () => void) => {
    update = callback
    return {
      finished: Promise.resolve(),
      ready: Promise.resolve(),
      updateCallbackDone: Promise.resolve(),
      skipTransition() {},
    }
  })
  setStart(start)
  const revealed = render(<ThemeRevealToggle />)
  const revealedRoot = rootOf(revealed.container)
  fireEvent.click(revealed.getByRole("button", { name: "Switch to dark theme" }))
  expect(start).toHaveBeenCalledTimes(1)
  expect(revealedRoot).not.toHaveClass("dark")
  act(() => {
    update?.()
  })
  expect(revealedRoot).toHaveClass("dark")
  expect(document.documentElement.className).toBe(hostClass)
  revealed.unmount()

  installMedia(true)
  const blocked = vi.fn()
  setStart(blocked)
  const reduced = render(<ThemeRevealToggle />)
  const reducedRoot = rootOf(reduced.container)
  fireEvent.click(reduced.getByRole("button", { name: "Switch to dark theme" }))
  expect(blocked).not.toHaveBeenCalled()
  expect(reducedRoot).toHaveClass("dark")
  reduced.unmount()

  installMedia(false)
  setStart(() => {
    throw new Error("view transition failed")
  })
  const failed = render(<ThemeRevealToggle />)
  const failedRoot = rootOf(failed.container)
  fireEvent.click(failed.getByRole("button", { name: "Switch to dark theme" }))
  expect(failedRoot).toHaveClass("dark")
  expect(document.documentElement.className).toBe(hostClass)
})

test("theme-reveal-toggle 登记在页面批次 93，默认预设等于起始值", () => {
  const entry = getComponent("theme-reveal-toggle")
  expect(entry?.batch).toBe(93)
  expect(entry?.layer).toBe("effect")
  expect(entry?.effectCategory).toBe("page")
  expect(entry?.source).toBe("original")
  expect(entry?.props.filter((prop) => prop.control).map((prop) => prop.name)).toEqual(["duration", "size", "color"])
  expect(auditExemptions.some((item) => item.name === "theme-reveal-toggle")).toBe(false)
  const preset = entry?.presets?.find((item) => item.name === "default")
  expect(preset?.values.duration).toBe(640)
  expect(preset?.values.size).toBe(44)
  expect(preset?.values.color).toBeUndefined()
  for (const prop of entry?.props ?? []) {
    if (!prop.control || !("value" in prop.control) || prop.control.value === undefined) continue
    expect(preset?.values[prop.name]).toBe(prop.control.value)
  }
  const source = fs.readFileSync(path.join(path.dirname(fileURLToPath(import.meta.url)), "theme-reveal-toggle.tsx"), "utf8")
  expect(source).toMatch(/usePrefersReducedMotion/)
  expect(source).toMatch(/theme-reveal/)
  expect(source).not.toMatch(/documentElement/)
  expect(source).not.toMatch(/viewTransitionName:\s*["']root["']/)
  expect(source).not.toMatch(/\bpace\b/)
})
