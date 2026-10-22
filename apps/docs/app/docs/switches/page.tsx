import type { Metadata } from "next"

import { FamilyGallery } from "@/components/family-gallery"

export const metadata: Metadata = {
  title: "开关",
  description: "基础开关、增强和动效在同一页里向下滚动查看。",
}

function SwitchesDocsPage() {
  return (
    <FamilyGallery
      cluster="switch"
      title="开关"
      description="基础开关、增强和动效都在这一页。用上面的名单滚到某一个，每一项都有预览、用法和源码。"
    />
  )
}

export default SwitchesDocsPage
