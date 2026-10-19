"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import type { ComponentMeta } from "@effect-ui/registry/catalog"
import { getComponentsByCategory, uiSubgroupsOf } from "@effect-ui/registry/catalog"

function NavLinks({
  items,
  pathname,
  onSelectCurrent,
}: {
  items: readonly ComponentMeta[]
  pathname: string
  onSelectCurrent?: () => void
}) {
  return (
    <ul className="space-y-0.5">
      {items.map((item) => {
        const isActive = pathname === `/docs/${item.name}`
        return (
          <li key={item.name}>
            <Link
              href={`/docs/${item.name}`}
              aria-current={isActive ? "page" : undefined}
              onClick={() => {
                if (isActive) onSelectCurrent?.()
              }}
              className={
                isActive
                  ? "block rounded-md bg-sidebar-accent px-2 py-1.5 text-sm text-sidebar-accent-foreground"
                  : "block rounded-md px-2 py-1.5 text-sm text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              }
            >
              {item.title}
            </Link>
          </li>
        )
      })}
    </ul>
  )
}

function SiteNav({ onSelectCurrent }: { onSelectCurrent?: () => void }) {
  const pathname = usePathname()
  const groups = getComponentsByCategory()

  return (
    <div className="px-3 py-6">
      <Link
        href="/docs"
        onClick={() => {
          if (pathname === "/docs") onSelectCurrent?.()
        }}
        className="mb-4 block px-2 text-xs font-medium tracking-[0.16em] text-muted-foreground uppercase"
      >
        开始
      </Link>
      {groups.map((group) => (
        <div key={group.category} className="mb-6">
          <p className="px-2 pb-2 text-xs font-medium tracking-[0.16em] text-muted-foreground uppercase">
            {group.label}
          </p>
          {group.category === "ui" ? (
            <div className="space-y-3">
              {uiSubgroupsOf(group.items).map((section) => (
                <div key={section.subgroup}>
                  <p className="px-2 pb-1 text-xs font-medium text-muted-foreground">
                    {section.label}
                  </p>
                  <NavLinks
                    items={section.items}
                    pathname={pathname}
                    onSelectCurrent={onSelectCurrent}
                  />
                </div>
              ))}
            </div>
          ) : (
            <NavLinks
              items={group.items}
              pathname={pathname}
              onSelectCurrent={onSelectCurrent}
            />
          )}
        </div>
      ))}
    </div>
  )
}

export { SiteNav }
