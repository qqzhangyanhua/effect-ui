import { expect, test } from "vitest"

import {
  componentCluster,
  getCatalogGroups,
  getComponentsByCategory,
  relatedComponents,
  visibleComponents,
} from "./catalog"

test("按钮、输入和六个控件族各自只出现在对应分组，并且紧跟在基础组件后面", () => {
  const groups = getCatalogGroups()
  const keys = groups.map((group) => group.key)
  const uiIndex = keys.indexOf("ui")

  expect(keys.slice(uiIndex, uiIndex + 9)).toEqual([
    "ui",
    "button",
    "input",
    "checkbox",
    "switch",
    "radio",
    "select",
    "textarea",
    "slider",
  ])
  expect(keys).not.toContain("buttons")
  expect(keys).not.toContain("form")

  const ui = groups.find((group) => group.key === "ui")
  const formNames = ui?.sections.find((section) => section.key === "form")?.items.map((item) => item.name) ?? []
  expect(formNames).toEqual(
    expect.arrayContaining(["label", "field", "form", "calendar", "date-picker", "toggle", "toggle-group", "image-cropper", "share-invite-panel"]),
  )
  expect(formNames).not.toContain("checkbox")
  expect(formNames).not.toContain("switch")
  expect(formNames).not.toContain("labeled-toggle")

  const button = groups.find((group) => group.key === "button")
  const input = groups.find((group) => group.key === "input")
  expect(button?.sections.map((section) => section.label)).toEqual(["基础", "动效"])
  expect(input?.sections.map((section) => section.label)).toEqual(["基础", "专用", "动效"])
  expect(button?.items[0]?.name).toBe("button")
  expect(input?.items[0]?.name).toBe("input")

  expect(groups.find((group) => group.key === "checkbox")?.items.map((item) => item.name)).toEqual([
    "checkbox",
    "checkbox-plus",
    "spring-check",
  ])
  expect(groups.find((group) => group.key === "switch")?.items.map((item) => item.name)).toEqual([
    "switch",
    "switch-plus",
    "squish-switch",
    "labeled-toggle",
  ])
  expect(groups.find((group) => group.key === "radio")?.items.map((item) => item.name)).toEqual([
    "radio-group",
    "radio-plus",
    "choicebox",
    "jelly-radio",
  ])
  expect(groups.find((group) => group.key === "select")?.items.map((item) => item.name)).toEqual([
    "select",
    "native-select",
    "combobox",
    "select-plus",
    "multi-select",
  ])
  expect(groups.find((group) => group.key === "textarea")?.items.map((item) => item.name)).toEqual([
    "textarea",
    "autosize-textarea",
    "mention-textarea",
  ])
  expect(groups.find((group) => group.key === "slider")?.items.map((item) => item.name)).toEqual([
    "slider",
    "dual-range-slider",
  ])

  const clustered = new Map(groups.filter((group) => group.key !== "ui").map((group) => [group.key, new Set(group.items.map((item) => item.name))]))
  for (const item of visibleComponents) {
    const cluster = componentCluster(item.name)
    if (!cluster) continue
    expect(clustered.get(cluster)?.has(item.name)).toBe(true)
    for (const [key, names] of clustered) {
      if (key !== cluster) expect(names.has(item.name)).toBe(false)
    }
  }

  const familyKeys = new Set(["button", "input", "checkbox", "switch", "radio", "select", "textarea", "slider"])
  const elsewhere = groups
    .filter((group) => !familyKeys.has(group.key))
    .flatMap((group) => group.items.map((item) => item.name))
  expect(elsewhere.some((name) => componentCluster(name))).toBe(false)
  for (const key of familyKeys) {
    expect(groups.find((group) => group.key === key)?.sections.some((section) => section.key === "other")).toBe(false)
  }
})

test("同类链接列出同组其他组件，类别分组仍保留原 category", () => {
  const related = relatedComponents("shimmer-button").map((item) => item.name)
  expect(related).toContain("button")
  expect(related).toContain("fuse-button")
  expect(related).not.toContain("shimmer-button")
  expect(relatedComponents("card")).toEqual([])
  expect(relatedComponents("checkbox").map((item) => item.name)).toEqual(["checkbox-plus", "spring-check"])
  expect(relatedComponents("switch").map((item) => item.name)).not.toContain("checkbox")

  const byCategory = getComponentsByCategory().flatMap((group) => group.items)
  expect(byCategory.find((item) => item.name === "button")?.category).toBe("ui")
  expect(byCategory.find((item) => item.name === "shimmer-button")?.category).toBe("buttons")
  expect(byCategory.find((item) => item.name === "prompt-input")?.category).toBe("ai")
  expect(byCategory.find((item) => item.name === "checkbox")?.category).toBe("ui")
  expect(byCategory.find((item) => item.name === "checkbox-plus")?.category).toBe("utility")
  expect(byCategory.find((item) => item.name === "spring-check")?.category).toBe("micro")
})
