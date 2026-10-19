import Link from "next/link"

import { ComponentSearch } from "@/components/component-search"
import { MobileNav } from "@/components/mobile-nav"
import { ThemeToggle } from "@/components/theme-toggle"

function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-14 w-full max-w-7xl items-center justify-between gap-2 px-4">
        <div className="flex min-w-0 items-center gap-1">
          <MobileNav />
          <Link href="/" className="flex items-center gap-2 font-medium tracking-tight">
            <span className="grid size-6 shrink-0 place-items-center rounded-md bg-primary text-[11px] text-primary-foreground">
              e
            </span>
            effect-ui
          </Link>
        </div>
        <nav className="flex shrink-0 items-center gap-0.5 text-sm sm:gap-1">
          <ComponentSearch />
          <Link
            href="/docs"
            className="rounded-md px-2 py-1.5 text-muted-foreground transition-colors hover:text-foreground sm:px-3"
          >
            文档
          </Link>
          <Link
            href="/docs/button"
            className="hidden rounded-md px-3 py-1.5 text-muted-foreground transition-colors hover:text-foreground md:inline"
          >
            组件
          </Link>
          <a
            href="https://github.com/qqzhangyanhua/effect-ui"
            className="rounded-md px-2 py-1.5 text-muted-foreground transition-colors hover:text-foreground sm:px-3"
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
