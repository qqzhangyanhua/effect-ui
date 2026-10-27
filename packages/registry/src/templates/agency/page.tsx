"use client"

import * as React from "react"

import { HeroParallaxWall } from "@/components/ui/hero-parallax-wall"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"

import { agencyContent } from "./content"
import { agencyTheme } from "./theme"

const CircularGallery = React.lazy(() =>
  import("@/components/ui/circular-gallery").then((mod) => ({ default: mod.CircularGallery })),
)

function AgencyTemplate() {
  const reduced = usePrefersReducedMotion()
  const gallery = agencyContent.gallery.map((item, index) => ({
    title: item.title,
    src: agencyContent.portraits[index % agencyContent.portraits.length] ?? "",
  }))

  return (
    <div style={agencyTheme} className="bg-background text-foreground">
      <HeroParallaxWall title={agencyContent.title} subtitle={agencyContent.subtitle} />
      <div className="px-6 py-16">
        <h2 className="font-display text-5xl tracking-tight">{agencyContent.manifesto}</h2>
      </div>
      {reduced ? (
        <div className="grid grid-cols-2 gap-3 px-6 md:grid-cols-4">
          {agencyContent.gallery.map((item) => (
            <div key={item.title} className="grid h-36 place-items-end rounded-xl bg-primary/30 p-3">
              {item.title}
            </div>
          ))}
        </div>
      ) : (
        <React.Suspense
          fallback={<div className="mx-6 h-56 rounded-xl bg-[linear-gradient(135deg,#4c1d95,#111827)]" />}
        >
          <CircularGallery items={gallery} className="mx-6" />
        </React.Suspense>
      )}
      <div className="flex gap-3 overflow-x-auto px-6 py-16">
        {agencyContent.portraits.map((src) => (
          <img key={src} src={src} alt="" className="h-48 w-20 shrink-0 rounded-md object-cover" />
        ))}
      </div>
      <p className="px-6 text-center text-sm tracking-[0.2em] text-muted-foreground">
        {agencyContent.gallery.map((item) => item.title).join("  ")}
      </p>
      <p className="px-6 py-12 text-center font-display text-5xl">AGENCY</p>
    </div>
  )
}

export { AgencyTemplate }
