import { expect, test } from "vitest"

import { effectCategoryNames, purposeGroups } from "./catalog-layer"
import {
  componentCluster,
  components,
  effectCategoryLabels,
  getCatalogGroups,
  getComponent,
  purposeGroupLabels,
  relatedComponents,
  visibleComponents,
} from "./catalog"

function expectSectionOrder(keys: readonly string[], order: readonly string[]) {
  const ranks = keys.map((key) => order.indexOf(key))
  expect(ranks.every((rank) => rank >= 0)).toBe(true)
  expect([...ranks]).toEqual([...ranks].sort((a, b) => a - b))
}

test("按钮、输入和四个控件族各自只出现在对应分组，并且紧跟在组件分组后面", () => {
  const groups = getCatalogGroups()
  const keys = groups.map((group) => group.key)

  expect(keys).toEqual([
    "components",
    "button",
    "input",
    "checkbox",
    "radio",
    "select",
    "textarea",
    "effects",
    "sections",
    "templates",
    "hooks-libs",
  ])
  expect(keys).not.toContain("buttons")
  expect(keys).not.toContain("form")
  expect(keys).not.toContain("ui")

  const componentGroup = groups.find((group) => group.key === "components")
  const componentSectionKeys = componentGroup?.sections.map((section) => section.key) ?? []
  expectSectionOrder(componentSectionKeys, [...purposeGroups, "ungrouped"])
  for (const section of componentGroup?.sections ?? []) {
    const label = section.key === "ungrouped" ? "未分组" : purposeGroupLabels[section.key as keyof typeof purposeGroupLabels]
    expect(section.label).toBe(label)
    for (const item of section.items) {
      const purpose = item.purposeGroup
      const expected = purpose && (purposeGroups as readonly string[]).includes(purpose) ? purpose : "ungrouped"
      expect(section.key).toBe(expected)
    }
  }
  expect(componentGroup?.items.some((item) => componentCluster(item.name))).toBe(false)

  const effects = groups.find((group) => group.key === "effects")
  const effectSectionKeys = effects?.sections.map((section) => section.key) ?? []
  expectSectionOrder(effectSectionKeys, [...effectCategoryNames, "ungrouped"])
  expect(effectSectionKeys).toContain("text")
  for (const section of effects?.sections ?? []) {
    const label = section.key === "ungrouped" ? "未分组" : effectCategoryLabels[section.key as keyof typeof effectCategoryLabels]
    expect(section.label).toBe(label)
    for (const item of section.items) {
      const declared = item.effectCategory
      const expected = declared && (effectCategoryNames as readonly string[]).includes(declared) ? declared : "ungrouped"
      expect(section.key).toBe(expected)
    }
  }
  expect(effects?.items.some((item) => componentCluster(item.name))).toBe(false)

  expect(groups.find((group) => group.key === "sections")?.sections).toEqual([])
  expect(groups.find((group) => group.key === "sections")?.label).toBe("区块")
  expect(groups.find((group) => group.key === "templates")?.sections).toEqual([])
  expect(groups.find((group) => group.key === "templates")?.label).toBe("模板")
  expect(groups.find((group) => group.key === "hooks-libs")?.sections.map((section) => section.key)).toEqual(["hook", "lib"])
  expect(groups.find((group) => group.key === "hooks-libs")?.sections.map((section) => section.label)).toEqual(["Hook", "Lib"])

  expect(groups.find((group) => group.key === "topics")).toBeUndefined()

  const listed = new Set(groups.flatMap((group) => group.items.map((item) => item.name)))
  for (const item of components) expect(listed.has(item.name)).toBe(true)

  const button = groups.find((group) => group.key === "button")
  const input = groups.find((group) => group.key === "input")
  expect(button?.sections.map((section) => section.label)).toEqual(["基础", "动效"])
  expect(input?.sections.map((section) => section.label)).toEqual(["基础", "专用", "动效"])
  expect(button?.items[0]?.name).toBe("button-plus")
  expect(input?.items[0]?.name).toBe("input-plus")

  expect(groups.find((group) => group.key === "checkbox")?.items.map((item) => item.name)).toEqual([
    "checkbox-plus",
    "spring-check",
  ])
  expect(groups.find((group) => group.key === "radio")?.items.map((item) => item.name)).toEqual([
    "radio-plus",
    "jelly-radio",
  ])
  expect(groups.find((group) => group.key === "select")?.items.map((item) => item.name)).toEqual(["select-plus"])
  expect(groups.find((group) => group.key === "textarea")?.items.map((item) => item.name)).toEqual(["mention-textarea"])

  const familyKeys = new Set(["button", "input", "checkbox", "radio", "select", "textarea"])
  const clustered = new Map(
    groups.filter((group) => familyKeys.has(group.key)).map((group) => [group.key, new Set(group.items.map((item) => item.name))]),
  )
  for (const item of visibleComponents) {
    const cluster = componentCluster(item.name)
    if (!cluster) continue
    expect(clustered.get(cluster)?.has(item.name)).toBe(true)
    for (const [key, names] of clustered) {
      if (key !== cluster) expect(names.has(item.name)).toBe(false)
    }
  }

  const elsewhere = groups
    .filter((group) => !familyKeys.has(group.key) && group.key !== "topics")
    .flatMap((group) => group.items.map((item) => item.name))
  expect(elsewhere.some((name) => componentCluster(name))).toBe(false)
  for (const key of familyKeys) {
    expect(groups.find((group) => group.key === key)?.sections.some((section) => section.key === "other")).toBe(false)
  }
})

test("同类链接列出同组其他组件，家族分组不改写 Layer", () => {
  const related = relatedComponents("button-plus").map((item) => item.name)
  expect(related).toContain("fuse-button")
  expect(related).toContain("neon-button")
  expect(related).not.toContain("button-plus")
  expect(relatedComponents("card")).toEqual([])
  expect(relatedComponents("checkbox-plus").map((item) => item.name)).toEqual(["spring-check"])

  expect(getComponent("button-plus")).toMatchObject({ layer: "composite", purposeGroup: "form" })
  expect(getComponent("neon-button")).toMatchObject({ layer: "effect", effectCategory: "buttons" })
  expect(getComponent("checkbox-plus")).toMatchObject({ layer: "composite", purposeGroup: "form" })
  expect(getComponent("spring-check")).toMatchObject({ layer: "effect", effectCategory: "micro" })
})
