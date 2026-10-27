// @vitest-environment jsdom

import { afterEach, beforeEach, expect, test, vi } from "vitest"
import { cleanup, render, screen } from "@testing-library/react"
import "@testing-library/jest-dom/vitest"

import { usePrefersReducedMotion } from "../hooks/use-prefers-reduced-motion"
import { textStyle } from "../lib/text-style"
import { cn } from "../lib/cn"

let reduceMotion = false
let mobile = false

function media(query: string) {
  return {
    matches: query.includes("prefers-reduced-motion") ? reduceMotion : query.includes("max-width") ? mobile : false,
    media: query,
    addEventListener() {},
    removeEventListener() {},
    addListener() {},
    removeListener() {},
    dispatchEvent() {
      return false
    },
  }
}

beforeEach(() => {
  reduceMotion = false
  mobile = false
  vi.stubGlobal("matchMedia", media)
  HTMLElement.prototype.hasPointerCapture = () => false
  HTMLElement.prototype.setPointerCapture = () => {}
  HTMLElement.prototype.releasePointerCapture = () => {}
  HTMLElement.prototype.scrollIntoView = () => {}
})

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

test("cn lets a later padding class win", () => {
  expect(cn("px-2", "px-4")).toBe("px-4")
})

test("text style writes only the fields it is given", () => {
  expect(textStyle(undefined, undefined, undefined, undefined, undefined)).toBeUndefined()
  expect(textStyle(undefined, 16, 600, 0.02, "center")).toMatchObject({
    fontSize: 16,
    fontWeight: 600,
    letterSpacing: "0.02em",
    textAlign: "center",
  })
})


test("use prefers reduced motion follows the media query", () => {
  reduceMotion = true
  function Probe() {
    return <p>{usePrefersReducedMotion() ? "减弱" : "正常"}</p>
  }
  render(<Probe />)
  expect(screen.getByText("减弱")).toBeInTheDocument()
})


