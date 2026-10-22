import type { Metadata } from "next"

import { FamilyGallery } from "@/components/family-gallery"

export const metadata: Metadata = {
  title: "滑块",
  description: "基础滑块和范围滑块在同一页里向下滚动查看。",
}

function SlidersDocsPage() {
  return (
    <FamilyGallery
      cluster="slider"
      title="滑块"
      description="基础滑块和范围滑块都在这一页。用上面的名单滚到某一个，每一项都有预览、用法和源码。"
    />
  )
}

export default SlidersDocsPage
