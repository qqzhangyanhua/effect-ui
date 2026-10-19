import { SiteNav } from "@/components/site-nav"

function SiteSidebar() {
  return (
    <aside className="hidden w-60 shrink-0 border-r bg-sidebar md:block">
      <div className="sticky top-14 h-[calc(100vh-3.5rem)] overflow-y-auto">
        <SiteNav />
      </div>
    </aside>
  )
}

export { SiteSidebar }
