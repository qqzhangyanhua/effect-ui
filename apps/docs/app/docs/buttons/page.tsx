import type { Metadata } from "next"

import { FamilyGallery } from "@/components/family-gallery"

export const metadata: Metadata = {
  title: "按钮",
  description: "基础按钮和按钮动效在同一页里向下滚动查看。",
}

function ButtonsDocsPage() {
  return (
    <FamilyGallery
      cluster="button"
      title="按钮"
      description="基础按钮和按钮动效都在这一页。用上面的名单滚到某一个，页面向下是全部预览。"
    />
  )
}

export default ButtonsDocsPage
