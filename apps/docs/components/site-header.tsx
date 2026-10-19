import Link from "next/link"

import { ComponentSearch } from "@/components/component-search"
import { ThemeToggle } from "@/components/theme-toggle"

function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-14 w-full max-w-7xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 font-medium tracking-tight">
          <span className="grid size-6 place-items-center rounded-md bg-primary text-[11px] text-primary-foreground">
            e
          </span>
          effect-ui
        </Link>
        <nav className="flex items-center gap-1 text-sm">
          <ComponentSearch />
          <Link
            href="/docs"
            className="rounded-md px-3 py-1.5 text-muted-foreground transition-colors hover:text-foreground"
          >
            文档
          </Link>
          <Link
            href="/docs/button"
            className="rounded-md px-3 py-1.5 text-muted-foreground transition-colors hover:text-foreground"
          >
            组件
          </Link>
          <a
            href="https://github.com/qqzhangyanhua/effect-ui"
            className="rounded-md px-3 py-1.5 text-muted-foreground transition-colors hover:text-foreground"
            target="_blank"
            rel="noreferrer"
          >
            GitHub
          </a>
          <ThemeToggle />
        </nav>
      </div>
    </header>
  )
}

export { SiteHeader }
