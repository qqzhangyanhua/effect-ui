"use client"

import { useState } from "react"
import { Check, Copy, Terminal } from "lucide-react"

import { ShineBorder } from "@effect-ui/registry/effects/shine-border"
import { cn } from "@/lib/utils"

const commands = [
  {
    label: "pnpm",
    cmd: "pnpm dlx shadcn@latest add @effect-ui/spotlight-card",
  },
  {
    label: "npm",
    cmd: "npx shadcn@latest add @effect-ui/spotlight-card",
  },
  {
    label: "bun",
    cmd: "bunx --bun shadcn@latest add @effect-ui/spotlight-card",
  },
  {
    label: "yarn",
    cmd: "npx shadcn@latest add @effect-ui/spotlight-card",
  },
]

export function HomeTerminal() {
  const [selectedTab, setSelectedTab] = useState(0)
  const [copied, setCopied] = useState(false)

  const currentCmd = commands[selectedTab]?.cmd ?? ""

  const handleCopy = () => {
    navigator.clipboard.writeText(currentCmd)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <ShineBorder
      duration={12}
      shineColor="color-mix(in oklab, var(--primary) 50%, transparent)"
      className="relative mx-auto w-full max-w-3xl overflow-hidden rounded-2xl border-border/80 bg-transparent p-0 shadow-2xl"
    >
      <div className="overflow-hidden rounded-[inherit] bg-[#0d1117] text-slate-200">
      {/* Terminal Titlebar */}
      <div className="flex items-center justify-between border-b border-white/10 bg-white/5 px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <span className="size-3 rounded-full bg-[#ff5f56]" />
            <span className="size-3 rounded-full bg-[#ffbd2e]" />
            <span className="size-3 rounded-full bg-[#27c93f]" />
          </div>
          <div className="ml-2 flex items-center gap-1.5 text-xs text-slate-400">
            <Terminal className="size-3.5" />
            <span className="font-mono">bash</span>
          </div>
        </div>

        {/* Package manager tabs */}
        <div className="flex items-center rounded-lg bg-black/40 p-0.5 border border-white/10">
          {commands.map((tab, idx) => (
            <button
              key={tab.label}
              type="button"
              onClick={() => setSelectedTab(idx)}
              className={cn(
                "rounded-md px-2.5 py-1 text-xs font-mono transition-colors",
                selectedTab === idx
                  ? "bg-white/15 text-white font-medium"
                  : "text-slate-400 hover:text-slate-200"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Terminal Content */}
      <div className="flex items-center justify-between p-4 sm:p-5 font-mono text-xs sm:text-sm">
        <div className="flex items-center gap-3 overflow-x-auto text-slate-200">
          <span className="text-emerald-400 select-none">$</span>
          <span className="text-slate-100">{currentCmd}</span>
        </div>
        <button
          type="button"
          onClick={handleCopy}
          aria-label="复制代码"
          className="ml-4 flex shrink-0 items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs text-slate-300 transition-colors hover:bg-white/10 hover:text-white"
        >
          {copied ? (
            <>
              <Check className="size-3.5 text-emerald-400" />
              <span className="text-emerald-400">已复制</span>
            </>
          ) : (
            <>
              <Copy className="size-3.5" />
              <span>复制</span>
            </>
          )}
        </button>
      </div>
      </div>
    </ShineBorder>
  )
}
