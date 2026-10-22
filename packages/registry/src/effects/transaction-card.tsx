"use client"

// Ported from Uiverse galaxy（MIT，(c) 2023 Uiverse.io, author Admin12121）— https://github.com/uiverse-io/galaxy/blob/main/Cards/Admin12121_plastic-goose-38.html. Modified for effect-ui.

import { useRef, type ButtonHTMLAttributes, type ReactNode } from "react"

import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export interface TransactionCardProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label?: ReactNode
  amount?: ReactNode
}

export function TransactionCard({ label = "新的交易", amount = "¥", className, ...props }: TransactionCardProps) {
  const ref = useRef<HTMLButtonElement>(null)
  const reduced = usePrefersReducedMotion()
  const motionOn = useAnimationActive(ref)
  const moving = motionOn && !reduced

  return (
    <button
      {...props}
      ref={ref}
      className={cn("relative flex h-[120px] w-[460px] max-w-full cursor-pointer overflow-hidden rounded-md border-0 bg-white p-0 text-left text-[#222]", className)}
      data-motion={moving ? "on" : "off"}
      data-reduced={reduced ? "true" : "false"}
      data-slot="transaction-card"
      type="button"
    >
      <style>
        {`[data-slot="transaction-card"]{transition:.3s ease-in-out}
[data-slot="transaction-card"][data-motion="on"]:hover{transform:scale(1.03);width:220px}
[data-slot="transaction-card"][data-motion="on"]:hover [data-part="stage"]{width:100%}
[data-slot="transaction-card"][data-motion="on"]:hover [data-part="card"]{animation:transaction-card-slide-top 1.2s cubic-bezier(.645,.045,.355,1) both}
[data-slot="transaction-card"][data-motion="on"]:hover [data-part="post"]{animation:transaction-card-slide-post 1s cubic-bezier(.165,.84,.44,1) both}
[data-slot="transaction-card"][data-motion="on"]:hover [data-part="amount"]{animation:transaction-card-fade-in .3s 1s backwards}
[data-slot="transaction-card"][data-motion="off"] [data-part="card"]{position:relative;top:auto}
[data-slot="transaction-card"][data-motion="off"] [data-part="post"]{position:relative;top:auto;bottom:auto}
@keyframes transaction-card-slide-top{0%{transform:translateY(0)}50%,60%{transform:translateY(-70px) rotate(90deg)}100%{transform:translateY(-8px) rotate(90deg)}}
@keyframes transaction-card-slide-post{50%{transform:translateY(0)}100%{transform:translateY(-70px)}}
@keyframes transaction-card-fade-in{0%{opacity:0;transform:translateY(-5px)}100%{opacity:1;transform:translateY(0)}}
@media (max-width:480px){[data-slot="transaction-card"]{transform:scale(.7);transform-origin:left center}[data-slot="transaction-card"][data-motion="on"]:hover{transform:scale(.74)}}`}
      </style>
      <span className="relative flex h-[120px] w-[130px] shrink-0 items-center justify-center overflow-hidden rounded bg-[#5de2a3] transition-[width] duration-300" data-part="stage">
        <span className="absolute z-10 flex h-[46px] w-[70px] flex-col items-center rounded-md bg-[#c7ffbc] shadow-[9px_9px_9px_-2px_rgba(77,200,143,0.72)]" data-part="card">
          <span className="mt-[7px] h-[13px] w-[65px] rounded-sm bg-[#80ea69]" />
          <span className="mt-2.5 ml-[-30px] h-2 w-2 rotate-90 rounded-full bg-[#379e1f] shadow-[0_-10px_0_0_#26850e,0_10px_0_0_#56be3e]" />
        </span>
        <span className="absolute top-[120px] bottom-2.5 z-[11] h-[75px] w-[63px] overflow-hidden rounded-md bg-[#dddde0]" data-part="post">
          <span className="absolute top-2 right-2 h-[9px] w-[47px] rounded-b bg-[#545354] before:absolute before:top-[-8px] before:h-[9px] before:w-[47px] before:bg-[#757375] before:content-['']" />
          <span className="absolute top-[22px] right-2 flex h-[23px] w-[47px] items-center justify-center rounded-sm bg-white text-base text-[#4b953b]" data-part="amount">
            {amount}
          </span>
          <span className="absolute top-[52px] left-[25px] h-3 w-3 rotate-90 rounded-sm bg-[#838183] shadow-[0_-18px_0_0_#838183,0_18px_0_0_#838183]" />
          <span className="absolute top-[68px] left-[25px] h-3 w-3 rotate-90 rounded-sm bg-[#aaa9ab] shadow-[0_-18px_0_0_#aaa9ab,0_18px_0_0_#aaa9ab]" />
        </span>
      </span>
      <span className="flex h-full min-w-0 flex-1 items-center justify-between overflow-hidden px-5 whitespace-nowrap transition-colors hover:bg-[#f9f7f9]">
        <span className="text-[23px]">{label}</span>
        <svg aria-hidden="true" className="mr-1 size-5 shrink-0" viewBox="0 0 451.846 451.847">
          <path
            d="M345.441 248.292L151.154 442.573c-12.359 12.365-32.397 12.365-44.75 0-12.354-12.354-12.354-32.391 0-44.744L278.318 225.92 106.409 54.017c-12.354-12.359-12.354-32.394 0-44.748 12.354-12.359 32.391-12.359 44.75 0l194.287 194.284c6.177 6.18 9.262 14.271 9.262 22.366 0 8.099-3.091 16.196-9.267 22.373z"
            fill="#cfcfcf"
          />
        </svg>
      </span>
    </button>
  )
}
