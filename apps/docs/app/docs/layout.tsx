import type { ReactNode } from "react"

import { SiteSidebar } from "@/components/site-sidebar"

function DocsLayout({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto flex w-full max-w-7xl">
      <SiteSidebar />
      <div className="min-w-0 flex-1 px-4 py-10 md:px-10">{children}</div>
    </div>
  )
}

export default DocsLayout
