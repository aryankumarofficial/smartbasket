import type { TailwindConfig } from "react-email"
import { pixelBasedPreset } from "react-email"

/**
 * Hex approximations of SmartBasket UI tokens from `packages/ui` globals
 * (primary oklch rose/coral, neutral surfaces). Email clients need hex/srgb.
 */
export const brandColors = {
  background: "#FAFAFA",
  surface: "#FFFFFF",
  foreground: "#171717",
  muted: "#737373",
  primary: "#D63D52",
  primaryForeground: "#FFF7F7",
  border: "#E5E5E5",
  accent: "#F4F4F5",
} as const

export const emailTailwindConfig = {
  presets: [pixelBasedPreset],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["Space Grotesk", "Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      colors: {
        brand: {
          bg: brandColors.background,
          surface: brandColors.surface,
          fg: brandColors.foreground,
          muted: brandColors.muted,
          primary: brandColors.primary,
          onPrimary: brandColors.primaryForeground,
          border: brandColors.border,
          accent: brandColors.accent,
        },
      },
    },
  },
} satisfies TailwindConfig

export function appBaseUrl() {
  return (
    process.env.NEXT_PUBLIC_APP_URL ??
    process.env.APP_URL ??
    "http://localhost:3000"
  ).replace(/\/$/, "")
}
