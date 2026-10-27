"use client"

import { useState } from "react"
import { SelectPlus } from "../ui/select-plus"

const cities = [
  { value: "hangzhou", label: "杭州" },
  { value: "shanghai", label: "上海" },
  { value: "beijing", label: "北京" },
]

const tools = [
  { value: "motion", label: "Motion" },
  { value: "tailwind", label: "Tailwind" },
  { value: "radix", label: "Radix" },
  { value: "shiki", label: "Shiki" },
]

const grouped = [
  {
    label: "前端",
    options: [
      { value: "motion", label: "Motion" },
      { value: "tailwind", label: "Tailwind" },
    ],
  },
  {
    label: "工具",
    options: [
      { value: "git", label: "Git" },
      { value: "shiki", label: "Shiki", disabled: true },
    ],
  },
]

export function SelectPlusDemo() {
  const [city, setCity] = useState("hangzhou")
  const [stack, setStack] = useState(["motion", "tailwind", "radix"])
  const [tags, setTags] = useState(["registry"])
  return (
    <div className="grid max-w-md gap-3">
      <SelectPlus options={cities} value={city} onValueChange={setCity} allowClear />
      <SelectPlus showSearch options={cities} placeholder="搜索城市" />
      <SelectPlus
        className="max-w-48"
        mode="multiple"
        options={tools}
        value={stack}
        onValueChange={setStack}
        maxTagCount={2}
        allowClear
      />
      <SelectPlus mode="tags" options={tools} value={tags} onValueChange={setTags} placeholder="输入后回车" />
      <SelectPlus status="error" options={cities} placeholder="错误状态" />
      <SelectPlus status="warning" options={cities} placeholder="警告状态" />
      <SelectPlus options={grouped} renderOption={(option) => option.label} />
      <SelectPlus loading options={cities} placeholder="加载中" />
    </div>
  )
}
