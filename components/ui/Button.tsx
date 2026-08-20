import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const variants = {
  primary:
    "bg-ubs-red text-white hover:bg-[#c90012] disabled:bg-ubs-red/40",
  buy: "bg-ubs-red text-white hover:bg-[#c90012] disabled:bg-ubs-red/40",
  sell: "bg-ink text-white hover:bg-black disabled:bg-ink/40",
  secondary:
    "bg-white text-ink border border-ink hover:bg-ink hover:text-white disabled:border-border disabled:text-faint",
  ghost:
    "bg-transparent text-ink hover:bg-black/[0.04] disabled:text-faint",
  outline:
    "bg-white text-ink border border-border hover:border-ink disabled:text-faint",
} as const;

const sizes = {
  sm: "h-7 px-2.5 text-2xs tracking-label uppercase font-semibold",
  md: "h-8 px-3.5 text-xs tracking-label uppercase font-semibold",
} as const;

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
  loading?: boolean;
};

export function Button({
  className,
  variant = "primary",
  size = "md",
  loading = false,
  disabled,
  children,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={cn(
        "inline-flex items-center justify-center gap-1.5 rounded-sm transition-colors cursor-pointer disabled:cursor-not-allowed",
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    >
      {loading ? "Working…" : children}
    </button>
  );
}
