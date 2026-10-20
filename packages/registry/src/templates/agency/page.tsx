"use client"

import * as React from "react"

import { HeroParallaxWall } from "@/components/ui/hero-parallax-wall"
import { ImageTrail } from "@/components/ui/image-trail"
import { ScrollTypography } from "@/components/ui/scroll-typography"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"

import { agencyContent } from "./content"
import { agencyTheme } from "./theme"

const CircularGallery = React.lazy(() =>
  import("@/components/ui/circular-gallery").then((mod) => ({ default: mod.CircularGallery })),
)
const SplashCursor = React.lazy(() =>
  import("@/components/ui/splash-cursor").then((mod) => ({ default: mod.SplashCursor })),
)
const FooterInteractiveWordmark = React.lazy(() =>
  import("@/components/ui/footer-interactive-wordmark").then((mod) => ({
    default: mod.FooterInteractiveWordmark,
  })),
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
        <ScrollTypography text={agencyContent.manifesto} className="text-5xl" />
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
      <div className="px-6 py-16">
        <ImageTrail images={[...agencyContent.portraits]} className="h-48" />
      </div>
      {reduced ? null : (
        <React.Suspense fallback={null}>
          <SplashCursor className="mx-6" />
        </React.Suspense>
      )}
      {reduced ? (
        <p className="px-6 py-12 text-center font-display text-5xl">AGENCY</p>
      ) : (
        <React.Suspense fallback={null}>
          <FooterInteractiveWordmark word="AGENCY" />
        </React.Suspense>
      )}
    </div>
  )
}

export { AgencyTemplate }
