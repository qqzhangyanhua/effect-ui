"use client"

import type { ReactNode } from "react"
import { usePathname } from "next/navigation"

import { SiteHeader } from "@/components/site-header"

function AppChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const preview = pathname.startsWith("/preview/")

  return (
    <div className={preview ? "min-h-svh" : "flex min-h-svh flex-col"}>
      {preview ? null : <SiteHeader />}
      <div className={preview ? undefined : "flex-1"}>{children}</div>
    </div>
  )
}

export { AppChrome }
