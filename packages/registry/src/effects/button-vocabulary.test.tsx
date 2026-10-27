// @vitest-environment jsdom

import { afterEach, beforeEach, expect, test, vi } from "vitest"
import { cleanup, render, within } from "@testing-library/react"
import "@testing-library/jest-dom/vitest"

import { GooeyButton } from "./gooey-button"
import { NeonButton } from "./neon-button"


function installMatchMedia(reduce = false) {
  window.matchMedia = (query: string) =>
    ({
      matches: reduce && query.includes("prefers-reduced-motion"),
      media: query,
      onchange: null,
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
      addListener: () => {},
      removeListener: () => {},
    }) as unknown as MediaQueryList
}

function buttonOf(view: ReturnType<typeof render>) {
  return within(view.container).getByRole("button")
}

function htmlOf(view: ReturnType<typeof render>) {
  return buttonOf(view).outerHTML
}


beforeEach(() => {
  installMatchMedia(false)
})

afterEach(() => {
  cleanup()
  vi.useRealTimers()
  vi.restoreAllMocks()
})

test("canonical props match the previous render", () => {
  const pairs = [
                [render(<NeonButton>霓虹</NeonButton>), render(<NeonButton scale={1}>霓虹</NeonButton>)],
                      ] as const
  for (const [omit, start] of pairs) {
    expect(htmlOf(start)).toBe(htmlOf(omit))
  }

  const plain = render(<GooeyButton>粘</GooeyButton>)
  const same = render(<GooeyButton scale={1} intensity={1}>粘</GooeyButton>)
  expect(plain.container.querySelector("feGaussianBlur")?.getAttribute("stdDeviation")).toBe("6")
  expect(same.container.querySelector("feGaussianBlur")?.getAttribute("stdDeviation")).toBe("6")
  expect(same.container.querySelector("feColorMatrix")?.getAttribute("values")).toBe(
    plain.container.querySelector("feColorMatrix")?.getAttribute("values"),
  )
  expect(plain.container.querySelector(".size-8")?.className).toBe(same.container.querySelector(".size-8")?.className)
  expect(plain.container.querySelector("filter")?.getAttribute("x")).toBe("-80%")
  expect(plain.container.querySelector(".size-8")?.className).toContain("translate-x-[70%]")
})

test("new props change the effect", () => {
            
      
              
  const neon = render(<NeonButton scale={2}>霓虹</NeonButton>)
  expect(buttonOf(neon).className).toContain("shadow-[var(--glow-rest)]")
  expect(buttonOf(neon).getAttribute("style")).toContain("36px")
  expect(buttonOf(neon).getAttribute("style")).toContain("56px")

                
          
  const gooey = render(<GooeyButton scale={2} intensity={0.5}>粘</GooeyButton>)
  expect(gooey.container.querySelector("feGaussianBlur")?.getAttribute("stdDeviation")).toBe("12")
  expect(gooey.container.querySelector("feColorMatrix")?.getAttribute("values")).toContain("9 -3.5")

              
      })


test("render does not read window", () => {
  window.matchMedia = () => {
    throw new Error("window")
  }
        expect(() => render(<NeonButton>霓虹</NeonButton>)).not.toThrow()
      expect(() => render(<GooeyButton>粘</GooeyButton>)).not.toThrow()
      })
