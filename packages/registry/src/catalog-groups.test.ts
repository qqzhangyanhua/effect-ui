import { expect, test } from "vitest"

import { effectCategoryNames, purposeGroups } from "./catalog-layer"
import {
  categoryLabels,
  componentCluster,
  components,
  getCatalogGroups,
  getComponentsByCategory,
  relatedComponents,
  subgroupLabels,
  visibleComponents,
} from "./catalog"

const aiTopicNames = [
  "prompt-input",
  "chat-message",
  "siri-orb",
  "ai-voice",
  "ai-citations",
  "ai-token-alternatives",
  "response-stream",
  "thinking-bar",
  "chain-of-thought",
  "reasoning",
  "source",
  "tool",
  "system-message",
  "feedback-bar",
  "prompt-suggestion",
  "generated-image",
  "expandable-chat",
  "chat-message-list",
  "agent-intro-sequence",
]

function expectSectionOrder(keys: readonly string[], order: readonly string[]) {
  const ranks = keys.map((key) => order.indexOf(key))
  expect(ranks.every((rank) => rank >= 0)).toBe(true)
  expect([...ranks]).toEqual([...ranks].sort((a, b) => a - b))
}

test("按钮、输入和六个控件族各自只出现在对应分组，并且紧跟在组件分组后面", () => {
  const groups = getCatalogGroups()
  const keys = groups.map((group) => group.key)

  expect(keys).toEqual([
    "components",
    "button",
    "input",
    "checkbox",
    "switch",
    "radio",
    "select",
    "textarea",
    "slider",
    "effects",
    "sections",
    "templates",
    "topics",
    "hooks-libs",
  ])
  expect(keys).not.toContain("buttons")
  expect(keys).not.toContain("form")
  expect(keys).not.toContain("ui")

  const componentGroup = groups.find((group) => group.key === "components")
  const componentSectionKeys = componentGroup?.sections.map((section) => section.key) ?? []
  expectSectionOrder(componentSectionKeys, [...purposeGroups, "ungrouped"])
  for (const section of componentGroup?.sections ?? []) {
    const label = section.key === "ungrouped" ? "未分组" : subgroupLabels[section.key as keyof typeof subgroupLabels]
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
    const label = section.key === "ungrouped" ? "未分组" : categoryLabels[section.key as keyof typeof categoryLabels]
    expect(section.label).toBe(label)
    for (const item of section.items) {
      const declared = item.effectCategory
      const expected =
        declared && (effectCategoryNames as readonly string[]).includes(declared)
          ? declared
          : (effectCategoryNames as readonly string[]).includes(item.category)
            ? item.category
            : "ungrouped"
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

  const topics = groups.find((group) => group.key === "topics")
  expect(topics?.label).toBe("专题")
  expect(topics?.sections.map((section) => section.key)).toEqual(["ai"])
  expect(topics?.sections.map((section) => section.label)).toEqual(["AI"])
  expect(topics?.sections[0]?.items.map((item) => item.name)).toEqual(aiTopicNames)
  expect(aiTopicNames.filter((name) => componentCluster(name))).toEqual(["prompt-input"])
  expect(componentCluster("prompt-input")).toBe("input")
  for (const name of aiTopicNames) {
    if (name === "prompt-input") continue
    expect(componentCluster(name)).toBeUndefined()
  }

  const listed = new Set(groups.flatMap((group) => group.items.map((item) => item.name)))
  for (const item of components) expect(listed.has(item.name)).toBe(true)

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
    "halo-switch",
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

  const familyKeys = new Set(["button", "input", "checkbox", "switch", "radio", "select", "textarea", "slider"])
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
