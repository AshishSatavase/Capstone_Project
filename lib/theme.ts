import type { CSSProperties } from "react";

/**
 * Institutional design tokens (UBS-inspired).
 * CSS utilities are generated from the same values in `app/globals.css` `@theme`
 * and `tailwind.config.ts`. Import from here for Recharts / inline styles.
 */
export const colors = {
  ubsRed: "#EC0016",
  positive: "#0F9D58",
  ink: "#111111",
  black: "#000000",
  white: "#FFFFFF",
  border: "#E5E5E5",
  muted: "#666666",
  faint: "#9A9A9A",
} as const;

export const radii = {
  sm: 2,
  md: 4,
} as const;

export const chartPalette = {
  axis: colors.ink,
  grid: colors.border,
  tooltipBorder: colors.border,
  primary: colors.ink,
  accent: colors.ubsRed,
  positive: colors.positive,
  /** Neutral slices for multi-series charts — greyscale + red, no extra hues */
  slices: [
    colors.ink,
    colors.ubsRed,
    "#3D3D3D",
    "#6B6B6B",
    "#9A9A9A",
    "#C4C4C4",
    "#E5E5E5",
  ] as const,
} as const;

export const tooltipStyle: CSSProperties = {
  backgroundColor: colors.white,
  border: `1px solid ${colors.border}`,
  borderRadius: radii.sm,
  boxShadow: "0 4px 16px rgba(0, 0, 0, 0.06)",
  fontSize: 12,
  color: colors.ink,
  padding: "8px 10px",
};

export const axisTickStyle = {
  fill: colors.ink,
  fontSize: 11,
  fontFamily: "var(--font-inter), system-ui, sans-serif",
} as const;
