"use client"

import { SplitText } from "@effect-ui/registry/effects/split-text"

export function HomeHeroTitle() {
  return (
    <h1 className="mt-4 text-4xl font-bold leading-[1.14] tracking-tight text-foreground sm:text-5xl lg:text-6xl">
      <SplitText by="word" text="特效和基础组件" />
      <br />
      <SplitText by="word" delay={0.1} text="放进同一套工具箱" />
    </h1>
  )
}
