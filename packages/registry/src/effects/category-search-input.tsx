"use client"

// Ported from Flowbite (MIT, (c) 2023 Bergside Inc.) — https://github.com/themesberg/flowbite/blob/main/content/forms/search-input.md. Modified for effect-ui.

import { useId, useRef, type FormHTMLAttributes } from "react"
import { Search } from "lucide-react"

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export interface CategorySearchValue {
  category: string
  query: string
}

export interface CategorySearchInputProps extends Omit<FormHTMLAttributes<HTMLFormElement>, "onSubmit"> {
  categories: readonly { value: string; label: string }[]
  value: CategorySearchValue
  onValueChange?: (value: CategorySearchValue) => void
  onSearch?: (value: CategorySearchValue) => void
}

export function CategorySearchInput({
  categories,
  value,
  onValueChange,
  onSearch,
  className,
  ...props
}: CategorySearchInputProps) {
  const ref = useRef<HTMLFormElement>(null)
  const reduced = usePrefersReducedMotion()
  const categoryId = useId()
  const queryId = useId()

  return (
    <form
      {...props}
      ref={ref}
      className={cn("w-full max-w-2xl", className)}
      data-reduced={reduced ? "true" : "false"}
      data-slot="category-search-input"
      onSubmit={(event) => {
        event.preventDefault()
        onSearch?.(value)
      }}
      role="search"
    >
      <div className={cn("flex rounded-md shadow-sm", reduced ? "transition-none" : "transition-colors")}>
        <label className="sr-only" htmlFor={categoryId}>
          分类
        </label>
        <select
          className="shrink-0 rounded-s-md border border-border bg-muted px-3 py-2.5 text-sm text-foreground"
          id={categoryId}
          onChange={(event) => onValueChange?.({ ...value, category: event.target.value })}
          value={value.category}
        >
          {categories.map((category) => (
            <option key={category.value} value={category.value}>
              {category.label}
            </option>
          ))}
        </select>
        <label className="sr-only" htmlFor={queryId}>
          搜索
        </label>
        <input
          className="min-w-0 flex-1 border-y border-border bg-muted px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground"
          id={queryId}
          onChange={(event) => onValueChange?.({ ...value, query: event.target.value })}
          onKeyDown={(event) => {
            if (event.key === "Escape") onValueChange?.({ ...value, query: "" })
          }}
          placeholder="搜索"
          type="search"
          value={value.query}
        />
        <button className="inline-flex items-center gap-1.5 rounded-e-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground" type="submit">
          <Search aria-hidden="true" className="size-4" />
          搜索
        </button>
      </div>
    </form>
  )
}
