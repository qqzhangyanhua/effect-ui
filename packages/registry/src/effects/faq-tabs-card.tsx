"use client"

// Copyright Spectrum UI (Made by Arihant)
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Modified by effect-ui: framer-motion 改为 motion/react，示例文案改为必填 tabs，颜色改为主题变量，减弱动效时页签和答案直接切换。
// Ported from Spectrum UI（Apache-2.0，Made by Arihant）— https://github.com/arihantcodes/spectrum-ui/blob/main/components/spectrumui/faq-tabs-card.tsx

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

import { ChevronDown } from "lucide-react"
import { AnimatePresence, motion } from "motion/react"
import { useState } from "react"

export interface FaqItem {
  question: string
  answer: string
}

export interface FaqTab {
  label: string
  faqs: FaqItem[]
}

export interface FAQTabsCardProps {
  tabs: FaqTab[]
  defaultTab?: number
  defaultOpenIndex?: number
  footerLabel?: string
  onFooterClick?: () => void
  className?: string
}

export function FAQTabsCard({
  tabs,
  defaultTab = 0,
  defaultOpenIndex = 0,
  footerLabel = "联系支持",
  onFooterClick,
  className,
}: FAQTabsCardProps) {
  const prefersReducedMotion = usePrefersReducedMotion()
  const safeDefault = tabs.length === 0 ? 0 : Math.min(Math.max(defaultTab, 0), tabs.length - 1)
  const [activeTab, setActiveTab] = useState(safeDefault)
  const [openIndex, setOpenIndex] = useState(defaultOpenIndex)
  const safeActive = tabs.length === 0 ? 0 : Math.min(Math.max(activeTab, 0), tabs.length - 1)
  const current = tabs[safeActive]
  const spring = prefersReducedMotion ? { duration: 0 } : { type: "spring" as const, bounce: 0.2, duration: 0.5 }

  return (
    <div data-reduced={prefersReducedMotion ? "true" : "false"} data-slot="faq-tabs-card" className={cn("flex w-full flex-col rounded-[26px] border border-border bg-card p-6 shadow-sm", className)}>
      <div role="tablist" className="flex h-9 items-center rounded-full bg-muted p-1">
        {tabs.map((tab, index) => {
          const active = index === safeActive
          return (
            <button
              key={tab.label}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => {
                setActiveTab(index)
                setOpenIndex(defaultOpenIndex)
              }}
              className="relative h-[27px] flex-1 rounded-full outline-none"
            >
              {active ? <motion.span layoutId="faq-tab-pill" className="absolute inset-0 rounded-full bg-card" transition={spring} /> : null}
              <span className={cn("relative z-10 text-sm font-medium", active ? "text-foreground" : "text-muted-foreground")}>{tab.label}</span>
            </button>
          )
        })}
      </div>
      <motion.div key={safeActive} initial={prefersReducedMotion ? false : { opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.18 }} className="mt-2 overflow-hidden rounded-[18px] border border-border">
          {current?.faqs.map((faq, index) => {
            const open = index === openIndex
            return (
              <div key={faq.question} className={cn(index > 0 && "border-t border-border", open && "bg-muted/50")}>
                <button type="button" onClick={() => setOpenIndex(open ? -1 : index)} aria-expanded={open} className="flex min-h-14 w-full items-start justify-between gap-4 p-4 text-left">
                  <span className="text-sm font-medium text-foreground">{faq.question}</span>
                  <motion.span animate={{ rotate: open ? 180 : 0 }} transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.25 }} className="flex shrink-0">
                    <ChevronDown className="h-4 w-4" />
                  </motion.span>
                </button>
                <AnimatePresence initial={false}>
                  {open ? (
                    <motion.div key="answer" initial={prefersReducedMotion ? false : { height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={prefersReducedMotion ? { opacity: 0 } : { height: 0, opacity: 0 }} transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.3 }} className="overflow-hidden">
                      <p className="px-4 pb-4 text-sm leading-5 text-foreground">{faq.answer}</p>
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </div>
            )
          })}
      </motion.div>
      <button type="button" onClick={onFooterClick} className="mt-6 flex h-[34px] w-full items-center justify-center rounded-full border border-border bg-card text-sm font-medium text-foreground hover:bg-muted">
        {footerLabel}
      </button>
    </div>
  )
}
