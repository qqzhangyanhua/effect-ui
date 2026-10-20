"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { ArrowUpRight } from "lucide-react"

import { ComponentSearch } from "@/components/component-search"
import { MobileNav } from "@/components/mobile-nav"
import { ThemeToggle } from "@/components/theme-toggle"
import { cn } from "@/lib/utils"

function SiteHeader() {
  const pathname = usePathname()
  const isHome = pathname === "/"

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-14 w-full max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-6 lg:gap-8">
          <div className="flex items-center gap-2">
            <MobileNav />
            <Link href="/" className="flex items-center gap-2.5 font-semibold tracking-tight text-foreground">
              <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-foreground text-background">
                <span className="size-2 rounded-full border-[1.5px] border-background" />
              </span>
              <span className="text-base font-bold tracking-tight">effect-ui</span>
            </Link>
          </div>

          <nav className="hidden items-center gap-6 text-sm md:flex">
            <Link
              href="/"
              className={cn(
                "relative py-4 text-sm transition-colors hover:text-foreground",
                isHome
                  ? "font-medium text-primary after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-primary"
                  : "text-muted-foreground"
              )}
            >
              首页
            </Link>
            <Link
              href="/docs/button"
              className={cn(
                "relative py-4 text-sm transition-colors hover:text-foreground",
                pathname.startsWith("/docs/")
                  ? "font-medium text-foreground"
                  : "text-muted-foreground"
              )}
            >
              组件
            </Link>
            <Link
              href="/docs"
              className={cn(
                "relative py-4 text-sm transition-colors hover:text-foreground",
                pathname === "/docs"
                  ? "font-medium text-foreground"
                  : "text-muted-foreground"
              )}
            >
              文档
            </Link>
            <Link
              href="/#showcase"
              className="py-4 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              示例
            </Link>
            <a
              href="https://github.com/qqzhangyanhua/effect-ui"
              className="inline-flex items-center gap-1 py-4 text-sm text-muted-foreground transition-colors hover:text-foreground"
              target="_blank"
              rel="noreferrer"
            >
              GitHub
              <ArrowUpRight className="size-3.5 opacity-70" />
            </a>
          </nav>
        </div>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <ComponentSearch />
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}

export { SiteHeader }
