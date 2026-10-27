import type { ComponentType } from "react"

import * as effectDemos from "./effect-demos"
import * as effectDemos2 from "./effect-demos-2"

import * as effectDemos6 from "./effect-demos-6"
import * as effectDemos7 from "./effect-demos-7"
import * as effectDemos8 from "./effect-demos-8"
import * as effectDemos9 from "./effect-demos-9"
import * as effectDemos10 from "./effect-demos-10"
import * as effectDemos11 from "./effect-demos-11"
import * as effectDemos13 from "./effect-demos-13"
import * as effectDemos14 from "./effect-demos-14"
import * as effectDemos15 from "./effect-demos-15"
import * as effectDemos16 from "./effect-demos-16"
import * as effectDemos17 from "./effect-demos-17"
import * as effectDemos18 from "./effect-demos-18"
import * as effectDemos19 from "./effect-demos-19"
import * as effectDemos20 from "./effect-demos-20"
import * as effectDemos21 from "./effect-demos-21"
import * as effectDemos22 from "./effect-demos-22"
import * as effectDemos23 from "./effect-demos-23"
import * as effectDemos24 from "./effect-demos-24"

import * as effectDemos37 from "./effect-demos-37"

import * as effectDemos48 from "./effect-demos-48"
import * as effectDemos49 from "./effect-demos-49"
import * as effectDemos50 from "./effect-demos-50"
import * as effectDemos51 from "./effect-demos-51"
import * as effectDemos52 from "./effect-demos-52"

import * as effectDemos64 from "./effect-demos-64"
import * as effectDemos65 from "./effect-demos-65"
import * as effectDemos66 from "./effect-demos-66"

import * as uiDemos3 from "./ui-demos-3"
import * as uiDemos4 from "./ui-demos-4"
import * as uiDemos5 from "./ui-demos-5"
import * as uiDemos6 from "./ui-demos-6"

const demoMap: Record<string, ComponentType> = {
  "aurora-background": effectDemos.AuroraBackgroundDemo,
  "cursor-follow": effectDemos21.CursorFollowDemo,
  "glass-card": effectDemos.GlassCardDemo,
  "neon-button": effectDemos.NeonButtonDemo,
  spinner: effectDemos.SpinnerDemo,
  reveal: effectDemos.RevealDemo,
  parallax: effectDemos20.ParallaxDemo,
  "text-rotate": effectDemos2.TextRotateDemo,
  "wave-background": effectDemos2.WaveBackgroundDemo,
  "noise-gradient": effectDemos2.NoiseGradientDemo,
  "globe-sphere": effectDemos2.GlobeSphereDemo,
  "cursor-trail": effectDemos21.CursorTrailDemo,
  "perspective-card": effectDemos2.PerspectiveCardDemo,
  "gooey-button": effectDemos2.GooeyButtonDemo,
  "floating-navbar": effectDemos2.FloatingNavbarDemo,
  "select-plus": uiDemos3.SelectPlusDemo,
  "button-plus": uiDemos6.ButtonPlusDemo,
  "input-plus": uiDemos6.InputPlusDemo,
  "checkbox-plus": uiDemos6.CheckboxPlusDemo,
  "radio-plus": uiDemos6.RadioPlusDemo,
  "tree-view": uiDemos4.TreeViewDemo,
  "infinite-scroll": uiDemos5.InfiniteScrollDemo,
  "password-strength": uiDemos5.PasswordStrengthDemo,
  "currency-input": uiDemos5.CurrencyInputDemo,
  "lamp-heading": effectDemos6.LampHeadingDemo,
  "tracing-beam": effectDemos6.TracingBeamDemo,
  "container-scroll-3d": effectDemos6.ContainerScroll3DDemo,
  "circular-gallery": effectDemos6.CircularGalleryDemo,
  "glowing-edge": effectDemos6.GlowingEdgeDemo,
  "scroll-image-sequence": effectDemos6.ScrollImageSequenceDemo,
  "pixel-transition": effectDemos6.PixelTransitionDemo,
  "evervault-card": effectDemos7.EvervaultCardDemo,
  "letter-glitch-wall": effectDemos7.LetterGlitchWallDemo,
  "target-cursor": effectDemos7.TargetCursorDemo,
  lightning: effectDemos7.LightningDemo,
  iridescence: effectDemos7.IridescenceDemo,
  silk: effectDemos7.SilkDemo,
  "hero-shader": effectDemos8.HeroShaderDemo,
  "hero-product-mockup": effectDemos8.HeroProductMockupDemo,
  "hero-kinetic-text": effectDemos8.HeroKineticTextDemo,
  "hero-ai-prompt": effectDemos8.HeroAiPromptDemo,
  "hero-parallax-wall": effectDemos8.HeroParallaxWallDemo,
  "footer-giant-wordmark": effectDemos8.FooterGiantWordmarkDemo,
  "section-logo-cloud": effectDemos8.SectionLogoCloudDemo,
  "section-animated-bento": effectDemos8.SectionAnimatedBentoDemo,
  "apple-cards-carousel": effectDemos9.AppleCardsCarouselDemo,
  "agency-template": effectDemos9.AgencyTemplateDemo,
  "hero-annotated-showcase": effectDemos10.HeroAnnotatedShowcaseDemo,
  "hero-wave-mask-gallery": effectDemos10.HeroWaveMaskGalleryDemo,
  "hero-inline-mascot": effectDemos10.HeroInlineMascotDemo,
  "hero-orbit-nodes": effectDemos10.HeroOrbitNodesDemo,
  "hero-swirl-avatars": effectDemos10.HeroSwirlAvatarsDemo,
  "footer-dot-matrix-wordmark": effectDemos10.FooterDotMatrixWordmarkDemo,
  "footer-social-marquee": effectDemos10.FooterSocialMarqueeDemo,
  "section-stats-cornered": effectDemos10.SectionStatsCorneredDemo,
  "section-stats-blob": effectDemos10.SectionStatsBlobDemo,
  "section-dotted-feature-tabs": effectDemos10.SectionDottedFeatureTabsDemo,
  "cta-ribbon-swoosh": effectDemos10.CtaRibbonSwooshDemo,
  "section-testimonial-split": effectDemos10.SectionTestimonialSplitDemo,
  "view-transition-gallery": effectDemos11.ViewTransitionGalleryDemo,
  "scroll-timeline-reveal": effectDemos11.ScrollTimelineRevealDemo,
  "hero-scroll-zoom": effectDemos11.HeroScrollZoomDemo,
  "section-horizontal-scroll": effectDemos11.SectionHorizontalScrollDemo,
  "intro-preloader": effectDemos11.IntroPreloaderDemo,
  "keycap-3d": effectDemos11.Keycap3DDemo,
  "infinite-canvas-gallery": effectDemos11.InfiniteCanvasGalleryDemo,
  "liquid-glass-tabbar": effectDemos11.LiquidGlassTabbarDemo,
  "dither-gradient": effectDemos11.DitherGradientDemo,
  "anchor-popover": effectDemos11.AnchorPopoverDemo,
  "jelly-radio": uiDemos6.JellyRadioDemo,
  "spring-check": uiDemos6.SpringCheckDemo,
  "peek-rating": uiDemos6.PeekRatingDemo,
  "slide-to-confirm": uiDemos6.SlideToConfirmDemo,
  "swipe-row": uiDemos6.SwipeRowDemo,
  "fuse-button": uiDemos6.FuseButtonDemo,
  "pulse-heart": uiDemos6.PulseHeartDemo,
  "lattice-loader": uiDemos6.LatticeLoaderDemo,
  "warm-tooltip": uiDemos6.WarmTooltipDemo,
  "text-pressure": effectDemos13.TextPressureDemo,
  "true-focus": effectDemos13.TrueFocusDemo,
  "split-flap-text": effectDemos13.SplitFlapTextDemo,
  "curved-loop": effectDemos13.CurvedLoopDemo,
  "fuzzy-text": effectDemos13.FuzzyTextDemo,
  "electric-border": effectDemos13.ElectricBorderDemo,
  "sticker-peel": effectDemos13.StickerPeelDemo,
  "click-spark": effectDemos13.ClickSparkDemo,
  "glare-hover": effectDemos13.GlareHoverDemo,
  "card-swap": effectDemos13.CardSwapDemo,
  "flowing-menu": effectDemos13.FlowingMenuDemo,
  "dome-gallery": effectDemos13.DomeGalleryDemo,
  "light-rays": effectDemos13.LightRaysDemo,
  "hyperspeed": effectDemos13.HyperspeedDemo,
  "vortex-background": effectDemos14.VortexBackgroundDemo,
  "beams-collision": effectDemos14.BeamsCollisionDemo,
  "placeholder-vanish-input": effectDemos14.PlaceholderVanishInputDemo,
  "link-preview": effectDemos14.LinkPreviewDemo,
  "avatar-group-tooltip": effectDemos14.AvatarGroupTooltipDemo,
  "shuffle-grid-hero": effectDemos14.ShuffleGridHeroDemo,
  "sortable-list": effectDemos14.SortableListDemo,
  "kpi-sparkline-card": effectDemos14.KpiSparklineCardDemo,
  "cookie-consent": effectDemos14.CookieConsentDemo,
  "countdown-timer": effectDemos14.CountdownTimerDemo,
  "diff-viewer": effectDemos14.DiffViewerDemo,
  "ghost-trail-text": effectDemos15.GhostTrailTextDemo,
  "gravity-image-trail": effectDemos15.GravityImageTrailDemo,
  "sticky-grid-scroll": effectDemos15.StickyGridScrollDemo,
  "svg-mask-scroll-transition": effectDemos15.SvgMaskScrollTransitionDemo,
  "macbook-scroll": effectDemos15.MacbookScrollDemo,
  "json-viewer": effectDemos15.JsonViewerDemo,
  "heatmap-calendar": effectDemos15.HeatmapCalendarDemo,
  "text-generate": effectDemos15.TextGenerateDemo,
  "resource-search-hero": effectDemos15.ResourceSearchHeroDemo,
  "loom-threads-marquee": effectDemos16.LoomThreadsMarqueeDemo,
  "hologram-card": effectDemos16.HologramCardDemo,
  "scroll-3d-image-rotate": effectDemos16.Scroll3dImageRotateDemo,
  "thumbnail-flow-path": effectDemos16.ThumbnailFlowPathDemo,
  "sea-waves-background": effectDemos16.SeaWavesBackgroundDemo,
  "galaxy-spiral": effectDemos17.GalaxySpiralDemo,
  "proximity-scale-grid": effectDemos17.ProximityScaleGridDemo,
  "polaroid-scroll-stack": effectDemos17.PolaroidScrollStackDemo,
  "scroll-svg-graph": effectDemos17.ScrollSvgGraphDemo,
  "petal-dissolve-text": effectDemos17.PetalDissolveTextDemo,
  "data-tunnel": effectDemos17.DataTunnelDemo,
  "signature-pad": effectDemos17.SignaturePadDemo,
  "reaction-bar": effectDemos17.ReactionBarDemo,
  "image-tube-scroll": effectDemos18.ImageTubeScrollDemo,
  "depth-fog-gallery": effectDemos18.DepthFogGalleryDemo,
  "fireworks-show": effectDemos18.FireworksShowDemo,
  "wobble-line-cursor": effectDemos18.WobbleLineCursorDemo,
  "telescope-zoom-scroll": effectDemos18.TelescopeZoomScrollDemo,
  "curved-scrollbar": effectDemos18.CurvedScrollbarDemo,
  "particle-hourglass": effectDemos18.ParticleHourglassDemo,
  "invoice-preview": effectDemos18.InvoicePreviewDemo,
  "shortcuts-dialog": effectDemos18.ShortcutsDialogDemo,
  "pricing-calculator": effectDemos18.PricingCalculatorDemo,
  "plan-compare-table": effectDemos18.PlanCompareTableDemo,
  "mention-textarea": effectDemos18.MentionTextareaDemo,
  "timezone-clock": effectDemos18.TimezoneClockDemo,
  "liquid-morph-slideshow": effectDemos19.LiquidMorphSlideshowDemo,
  "wavefield-neon": effectDemos19.WavefieldNeonDemo,
  "text-3d-scroll": effectDemos19.Text3dScrollDemo,
  "audio-spectrum": effectDemos19.AudioSpectrumDemo,
  "singularity": effectDemos19.SingularityDemo,
  "credit-card-form": effectDemos19.CreditCardFormDemo,
  "coupon-input": effectDemos19.CouponInputDemo,
  "gantt-timeline": effectDemos19.GanttTimelineDemo,
  "org-chart": effectDemos19.OrgChartDemo,
  "lenticular-card": effectDemos22.LenticularCardDemo,
  "card-beam-scanner": effectDemos22.CardBeamScannerDemo,
  "repetition-image-hover": effectDemos22.RepetitionImageHoverDemo,
  "hyperspace-text": effectDemos22.HyperspaceTextDemo,
  "tiled-swirl-loader": effectDemos22.TiledSwirlLoaderDemo,
  "keyhole-scroll-reveal": effectDemos22.KeyholeScrollRevealDemo,
  "rubber-band-drag": effectDemos22.RubberBandDragDemo,
  "uptime-bars": effectDemos22.UptimeBarsDemo,
  "status-page": effectDemos22.StatusPageDemo,
  "integrations-directory": effectDemos22.IntegrationsDirectoryDemo,
  "api-key-manager": effectDemos22.ApiKeyManagerDemo,
  "help-center-index": effectDemos22.HelpCenterIndexDemo,
  "active-sessions-list": effectDemos23.ActiveSessionsListDemo,
  "feedback-widget": effectDemos24.FeedbackWidgetDemo,
  "folder-float": effectDemos37.FolderFloatDemo,
  "card-toss-stack": effectDemos48.CardTossStackDemo,
  "sticky-note-board": effectDemos48.StickyNoteBoardDemo,
  "tag-jar": effectDemos49.TagJarDemo,
  "coin-jar": effectDemos49.CoinJarDemo,
  "ball-pit": effectDemos49.BallPitDemo,
  "lanyard-badge": effectDemos50.LanyardBadgeDemo,
  "jelly-button": effectDemos50.JellyButtonDemo,
  "spring-drawer": effectDemos50.SpringDrawerDemo,
  "magnet-chips": effectDemos51.MagnetChipsDemo,
  "folder-stack": effectDemos51.FolderStackDemo,
  "physics-dropzone": effectDemos51.PhysicsDropzoneDemo,
  "upload-orbit": effectDemos52.UploadOrbitDemo,
  "empty-state-scene": effectDemos52.EmptyStateSceneDemo,
  "reaction-tray": effectDemos52.ReactionTrayDemo,
  "twist-in-card": effectDemos64.TwistInCardDemo,
  "hover-lift-glow": effectDemos64.HoverLiftGlowDemo,
  "flip-reveal-card": effectDemos64.FlipRevealCardDemo,
  "hover-overlay-reveal": effectDemos64.HoverOverlayRevealDemo,
  "pointer-tilt-glare": effectDemos64.PointerTiltGlareDemo,
  "mesh-glow-bg": effectDemos65.MeshGlowBgDemo,
  "hero-text-stagger": effectDemos65.HeroTextStaggerDemo,
  "scroll-parallax-layers": effectDemos65.ScrollParallaxLayersDemo,
  "shared-layout-expand": effectDemos65.SharedLayoutExpandDemo,
  "logo-marquee": effectDemos65.LogoMarqueeDemo,
  "entrance-presets": effectDemos65.EntrancePresetsDemo,
  "space-jump-hero": effectDemos66.SpaceJumpHeroDemo,
  "scroll-split-reveal": effectDemos66.ScrollSplitRevealDemo,
  "slice-shift-text": effectDemos66.SliceShiftTextDemo,
  "radial-hotspot-labels": effectDemos66.RadialHotspotLabelsDemo,
  "spotlight-focus-blur": effectDemos66.SpotlightFocusBlurDemo,
  "drag-rate-tiles": effectDemos66.DragRateTilesDemo,
}

export const demoNames: readonly string[] = Object.keys(demoMap)

export function getDemo(name: string): ComponentType | undefined {
  return demoMap[name]
}
