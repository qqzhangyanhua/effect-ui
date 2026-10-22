import type { Metadata } from "next"

import { FamilyGallery } from "@/components/family-gallery"

export const metadata: Metadata = {
  title: "选择",
  description: "基础选择和增强选择在同一页里向下滚动查看。",
}

function SelectsDocsPage() {
  return (
    <FamilyGallery
      cluster="select"
      title="选择"
      description="基础选择和增强选择都在这一页。用上面的名单滚到某一个，每一项都有预览、用法和源码。"
    />
  )
}

export default SelectsDocsPage
