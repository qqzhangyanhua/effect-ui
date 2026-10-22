"use client"

import { ThemeProvider as NextThemesProvider } from "next-themes"
import type { ComponentProps } from "react"

// next-themes 的防闪烁脚本只在服务端 HTML 里执行。React 19 在客户端新建可执行的
// <script> 时会报错，所以客户端把它标成数据块（不会执行，也不影响服务端输出）。
const clientScriptProps = { type: "application/json" } as const

function ThemeProvider({ children, scriptProps, ...props }: ComponentProps<typeof NextThemesProvider>) {
  return (
    <NextThemesProvider
      scriptProps={typeof window === "undefined" ? scriptProps : { ...scriptProps, ...clientScriptProps }}
      {...props}
    >
      {children}
    </NextThemesProvider>
  )
}

export { ThemeProvider }
