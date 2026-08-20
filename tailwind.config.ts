import type { Config } from "tailwindcss";
import { colors } from "./lib/theme";

/**
 * Tailwind v4 still reads this file when referenced from CSS (`@config`).
 * Color/type tokens also live in `app/globals.css` `@theme` so utilities
 * (`bg-ubs-red`, `tracking-header`, …) resolve consistently.
 */
const config = {
  theme: {
    extend: {
      colors: {
        "ubs-red": colors.ubsRed,
        positive: colors.positive,
        ink: colors.ink,
        border: colors.border,
        muted: colors.muted,
        faint: colors.faint,
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        sm: "2px",
        DEFAULT: "4px",
        md: "4px",
      },
      letterSpacing: {
        header: "0.14em",
        label: "0.08em",
      },
      fontSize: {
        "2xs": ["0.6875rem", { lineHeight: "1rem" }],
      },
    },
  },
} satisfies Config;

export default config;
