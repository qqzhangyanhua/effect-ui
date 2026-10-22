"use client"

// Ported from Meraki UI (MIT, (c) 2021 Khatab Wedaa) — https://github.com/merakiuilabs/merakiui/blob/main/components/email-templates/Verification.html , https://github.com/merakiuilabs/merakiui/blob/main/components/email-templates/Welcome.html and https://github.com/merakiuilabs/merakiui/blob/main/components/email-templates/Invite.html. Modified for effect-ui.

import { useRef } from "react"

import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"

export interface EmailAction {
  label: string
  href: string
}

export interface EmailLink {
  label: string
  href: string
  description?: string
}

export interface EmailTemplateProps {
  variant?: "verification" | "welcome" | "invite"
  brand: string
  title: string
  body: string
  cta: EmailAction
  code?: string
  links?: EmailLink[]
  footer?: string
  className?: string
}

const ink = "#3f3f46"
const muted = "#71717a"
const blue = "#2563eb"
const line = "#e4e4e7"

export function EmailTemplate({
  variant = "verification",
  brand,
  title,
  body,
  cta,
  code,
  links = [],
  footer,
  className,
}: EmailTemplateProps) {
  const ref = useRef<HTMLDivElement>(null)
  const reduced = usePrefersReducedMotion()
  const motionOn = useAnimationActive(ref)
  const year = new Date().getFullYear()
  const digits = (code ?? "").split("")

  return (
    <div
      className={className}
      data-motion={motionOn && !reduced ? "on" : "off"}
      data-reduced={reduced ? "true" : "false"}
      data-slot="email-template"
      data-variant={variant}
      ref={ref}
    >
      <table cellPadding={0} cellSpacing={0} role="presentation" style={{ width: "100%", maxWidth: 640, margin: "0 auto", background: "#ffffff", color: ink, fontFamily: "Arial, Helvetica, sans-serif" }}>
        <tbody>
          <tr>
            <td style={{ padding: "32px 24px 8px" }}>
              <p style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>{brand}</p>
            </td>
          </tr>
          <tr>
            <td style={{ padding: "16px 24px" }}>
              <h2 style={{ margin: "0 0 12px", fontSize: 20, fontWeight: 600, color: ink }}>{title}</h2>
              <p style={{ margin: 0, lineHeight: 1.7, color: muted }}>{body}</p>
              {variant === "verification" && digits.length > 0 ? (
                <table cellPadding={0} cellSpacing={0} role="presentation" style={{ marginTop: 16 }}>
                  <tbody>
                    <tr>
                      {digits.map((digit, index) => (
                        <td key={`${digit}-${index}`} style={{ paddingRight: 8 }}>
                          <div style={{ width: 40, height: 40, lineHeight: "40px", textAlign: "center", fontSize: 22, color: blue, border: `1px solid ${blue}`, borderRadius: 6 }}>{digit}</div>
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              ) : null}
              {variant === "welcome" && links.length > 0 ? (
                <table cellPadding={0} cellSpacing={0} role="presentation" style={{ width: "100%", marginTop: 8 }}>
                  <tbody>
                    {links.map((link) => (
                      <tr key={link.href}>
                        <td style={{ padding: "16px 0", borderTop: `1px solid ${line}` }}>
                          <a href={link.href} style={{ color: blue, textDecoration: "underline" }}>
                            {link.label}
                          </a>
                          {link.description ? <p style={{ margin: "8px 0 0", color: muted }}>{link.description}</p> : null}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : null}
              <p style={{ margin: "24px 0 0" }}>
                <a href={cta.href} style={{ display: "inline-block", padding: "10px 22px", background: blue, color: "#ffffff", textDecoration: "none", borderRadius: 8, fontSize: 14 }}>
                  {cta.label}
                </a>
              </p>
            </td>
          </tr>
          <tr>
            <td style={{ padding: "8px 24px 32px", color: muted, fontSize: 13, lineHeight: 1.6 }}>
              {footer ? <p style={{ margin: "0 0 8px" }}>{footer}</p> : null}
              <p style={{ margin: 0 }}>© {year} {brand}</p>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}
