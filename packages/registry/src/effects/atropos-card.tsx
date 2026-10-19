"use client"

import * as React from "react"
import Atropos from "atropos/react"

import { cn } from "@/lib/utils"

export interface AtroposCardProps {
  className?: string
  title?: string
  subtitle?: string
  children?: React.ReactNode
}

function AtroposCard({ className, title = "Atropos", subtitle = "多层 3D 视差", children }: AtroposCardProps) {
  return (
    <div className={cn("w-full max-w-sm", className)}>
      <style>{`
        .atropos{position:relative;display:block;perspective:1200px}
        .atropos-scale,.atropos-rotate{width:100%;height:100%;transform-style:preserve-3d;display:block}
        .atropos-rotate{position:relative}
        .atropos-inner{width:100%;height:100%;position:relative;overflow:hidden;transform-style:preserve-3d;display:block}
        .atropos-shadow,.atropos-highlight{position:absolute;pointer-events:none;display:block;opacity:0}
        .atropos-shadow{z-index:-1;background:#000;inset:0;filter:blur(30px)}
        .atropos-highlight{left:-50%;top:-50%;width:200%;height:200%;background-image:radial-gradient(circle at 50%,rgba(255,255,255,.25),transparent 50%);z-index:1}
      `}</style>
      <Atropos className="overflow-hidden rounded-2xl" shadow highlight rotateTouch="scroll-y">
        <div
          data-atropos-offset="-8"
          className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,#7c3aed55,transparent_40%),linear-gradient(135deg,#0f172a,#1e1b4b)]"
        />
        <div data-atropos-offset="-2" className="absolute inset-6 rounded-xl border border-white/10 bg-white/5" />
        <div data-atropos-offset="6" className="relative z-10 p-8">
          <p className="text-xs tracking-[0.3em] text-cyan-200 uppercase">{subtitle}</p>
          <h3 className="mt-2 font-display text-3xl text-white">{title}</h3>
          <div className="mt-4 text-sm text-white/75">{children ?? "移动指针，图层前后错开。"}</div>
        </div>
      </Atropos>
    </div>
  )
}

export { AtroposCard }
