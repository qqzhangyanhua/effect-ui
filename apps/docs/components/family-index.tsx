"use client"

import { useEffect, useState } from "react"

export interface FamilyIndexItem {
  name: string
  title: string
  section: string
}

function sectionsOf(items: readonly FamilyIndexItem[]) {
  const sections: { label: string; items: FamilyIndexItem[] }[] = []
  for (const item of items) {
    const current = sections[sections.length - 1]
    if (current && current.label === item.section) current.items.push(item)
    else sections.push({ label: item.section, items: [item] })
  }
  return sections
}

function FamilyIndex({ items }: { items: readonly FamilyIndexItem[] }) {
  const [active, setActive] = useState(items[0]?.name ?? "")

  useEffect(() => {
    function scrollToHash() {
      const id = window.location.hash.replace(/^#/, "")
      if (!id) return
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" })
      setActive(id)
    }

    scrollToHash()
    window.addEventListener("hashchange", scrollToHash)
    return () => window.removeEventListener("hashchange", scrollToHash)
  }, [])

  function scrollToItem(name: string) {
    document.getElementById(name)?.scrollIntoView({ behavior: "smooth", block: "start" })
    window.history.replaceState(null, "", `#${name}`)
    setActive(name)
  }

  return (
    <nav aria-label="本页组件" className="max-h-56 overflow-y-auto rounded-xl border bg-background p-2">
      {sectionsOf(items).map((section) => (
        <div key={section.label}>
          <p className="px-2 pt-2 text-xs text-muted-foreground">{section.label}</p>
          <ul className="py-1">
            {section.items.map((item) => (
              <li key={item.name}>
                <a
                  href={`#${item.name}`}
                  aria-current={active === item.name ? "true" : undefined}
                  onClick={(event) => {
                    event.preventDefault()
                    scrollToItem(item.name)
                  }}
                  className={
                    active === item.name
                      ? "block rounded-md bg-accent px-2 py-1.5 text-sm"
                      : "block rounded-md px-2 py-1.5 text-sm text-muted-foreground hover:bg-accent hover:text-foreground"
                  }
                >
                  {item.title}
                </a>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </nav>
  )
}

export { FamilyIndex }
