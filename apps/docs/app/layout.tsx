import type { Metadata } from "next"
import type { ReactNode } from "react"
import { Geist, Geist_Mono, Instrument_Serif } from "next/font/google"

import { AppChrome } from "@/components/app-chrome"
import { ThemeProvider } from "@/components/theme-provider"
import { getRegistryBaseUrl } from "@/lib/source"

import "./globals.css"

const sans = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
})

const mono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
})

const display = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-instrument",
})

export const metadata: Metadata = {
  metadataBase: new URL(getRegistryBaseUrl()),
  title: {
    default: "effect-ui",
    template: "%s · effect-ui",
  },
  description:
    "把 shadcn/ui 基础组件和开源 React 特效整合到同一套 registry 里，复制即可使用。",
}

function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body className={`${sans.variable} ${mono.variable} ${display.variable} min-h-svh`}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          <AppChrome>{children}</AppChrome>
        </ThemeProvider>
      </body>
    </html>
  )
}

export default RootLayout
