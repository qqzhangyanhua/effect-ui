import { expect, test } from "vitest"

import {
  componentCluster,
  getCatalogGroups,
  getComponentsByCategory,
  relatedComponents,
  visibleComponents,
} from "./catalog"

test("按钮和输入各自只出现在对应分组，并且紧跟在基础组件后面", () => {
  const groups = getCatalogGroups()
  const keys = groups.map((group) => group.key)
  const uiIndex = keys.indexOf("ui")

  expect(keys[uiIndex + 1]).toBe("button")
  expect(keys[uiIndex + 2]).toBe("input")
  expect(keys).not.toContain("buttons")

  const button = groups.find((group) => group.key === "button")
  const input = groups.find((group) => group.key === "input")
  expect(button?.sections.map((section) => section.label)).toEqual(["基础", "动效"])
  expect(input?.sections.map((section) => section.label)).toEqual(["基础", "专用", "动效"])
  expect(button?.items[0]?.name).toBe("button")
  expect(input?.items[0]?.name).toBe("input")

  const buttonNames = new Set(button?.items.map((item) => item.name))
  const inputNames = new Set(input?.items.map((item) => item.name))
  expect(buttonNames.has("fuse-button")).toBe(true)
  expect(buttonNames.has("shimmer-button")).toBe(true)
  expect(buttonNames.has("button-plus")).toBe(true)
  expect(inputNames.has("prompt-input")).toBe(true)
  expect(inputNames.has("coupon-input")).toBe(true)
  expect(inputNames.has("placeholder-vanish-input")).toBe(true)

  for (const item of visibleComponents) {
    const cluster = componentCluster(item.name)
    if (cluster === "button") {
      expect(buttonNames.has(item.name)).toBe(true)
      expect(inputNames.has(item.name)).toBe(false)
    } else if (cluster === "input") {
      expect(inputNames.has(item.name)).toBe(true)
      expect(buttonNames.has(item.name)).toBe(false)
    }
  }

  const elsewhere = groups
    .filter((group) => group.key !== "button" && group.key !== "input")
    .flatMap((group) => group.items.map((item) => item.name))
  expect(elsewhere.some((name) => componentCluster(name))).toBe(false)
  expect(button?.sections.some((section) => section.key === "other")).toBe(false)
  expect(input?.sections.some((section) => section.key === "other")).toBe(false)
})

test("同类链接列出同组其他组件，类别分组仍保留原 category", () => {
  const related = relatedComponents("shimmer-button").map((item) => item.name)
  expect(related).toContain("button")
  expect(related).toContain("fuse-button")
  expect(related).not.toContain("shimmer-button")
  expect(relatedComponents("card")).toEqual([])

  const byCategory = getComponentsByCategory().flatMap((group) => group.items)
  expect(byCategory.find((item) => item.name === "button")?.category).toBe("ui")
  expect(byCategory.find((item) => item.name === "shimmer-button")?.category).toBe("buttons")
  expect(byCategory.find((item) => item.name === "prompt-input")?.category).toBe("ai")
})
