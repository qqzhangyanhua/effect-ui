import type { Metadata } from "next"

import { FamilyGallery } from "@/components/family-gallery"

export const metadata: Metadata = {
  title: "输入",
  description: "文本输入和专用输入在同一页里向下滚动查看。",
}

function InputsDocsPage() {
  return (
    <FamilyGallery
      cluster="input"
      title="输入"
      description="文本输入和专用输入都在这一页。用上面的名单滚到某一个，页面向下是全部预览。"
    />
  )
}

export default InputsDocsPage
