import type { Metadata } from "next"

import { FamilyGallery } from "@/components/family-gallery"

export const metadata: Metadata = {
  title: "多行文本",
  description: "基础多行文本和增强输入在同一页里向下滚动查看。",
}

function TextareasDocsPage() {
  return (
    <FamilyGallery
      cluster="textarea"
      title="多行文本"
      description="基础多行文本和增强输入都在这一页。用上面的名单滚到某一个，每一项都有预览、用法和源码。"
    />
  )
}

export default TextareasDocsPage
